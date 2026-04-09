#!/usr/bin/env ts-node
// ── Manager Agent ─────────────────────────────────────────────────────────────
// The brain of the marketing team. Runs first, briefs each platform agent,
// receives their output, scores and critiques it, then saves approved content
// to Airtable. Platform agents do NOT save to Airtable — only the Manager does.
//
// Flow:
//   1. Manager runs Trend Researcher → gets live trend brief
//   2. Manager generates a "mission brief" per platform using those trends
//   3. Each platform agent generates content against that brief
//   4. Agents return output to Manager (never saving directly)
//   5. Manager scores each piece, requests revisions if below threshold
//   6. Manager saves approved content to Airtable → triggers Kie.ai visual

import Anthropic from '@anthropic-ai/sdk';
import { callClaude, loadPrompt, loadBrandContext, parseJsonOutput, ContentOutput } from './base-agent';
import { compileTrendBrief, formatBriefForAgent, TrendBrief } from './trend-researcher';
import { runInstagramAgent } from './instagram-agent';
import { runTikTokAgent }    from './tiktok-agent';
import { runLinkedInAgent }  from './linkedin-agent';
import { createRecord, markGenerating, markReadyForReview, updateRecord } from '../services/airtable';
import { generateForInstagramReel, generateForInstagramCarousel, generateForTikTok, generateForLinkedIn } from '../services/kie-ai';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AgentReport {
  agent:    'instagram' | 'tiktok' | 'linkedin';
  content:  ContentOutput;
  raw:      string;
}

export interface ManagerReview {
  score:          number;    // 0–10
  approved:       boolean;
  critique:       string;
  revisionBrief?: string;    // if not approved — what to fix
  strengths:      string[];
  weaknesses:     string[];
}

export interface ManagerRun {
  trendBrief:  TrendBrief;
  reports:     AgentReport[];
  reviews:     Record<string, ManagerReview>;
  savedIds:    Record<string, string>;   // agent → Airtable record ID
}

// ── Manager system prompt ─────────────────────────────────────────────────────

const MANAGER_SYSTEM_PROMPT = `You are the Creative Director of Symponia's marketing team.

You manage three specialist agents:
- Instagram Agent: visual-first, Reels + carousels, scroll-stopping hooks
- TikTok Agent: video scripts, 3-second hooks, trending sounds and formats
- LinkedIn Agent: professional framing, thought leadership, substantive engagement

Your job is to:
1. Review content each agent produces against the live trend brief you were given
2. Score it rigorously (1–10)
3. Approve if score ≥ 7. Request revision if score < 7.
4. When requesting revision: give a precise, actionable brief — not vague feedback

Symponia's brand voice: quiet, certain, philosophical. Not a wellness app. Not a chatbot. A presence.
Never approve content that uses: exclamation marks, words like "amazing/game-changer/must-have", generic self-help language.
Never approve a hook that wouldn't stop a scroll in under 1 second.
Never approve content that doesn't leverage the current trend signals in the brief.

Be demanding. A 7 is the floor, not the ceiling. The goal is content that actually goes viral.`;

// ── Step 1: Generate platform mission briefs ──────────────────────────────────

async function generateMissionBrief(
  platform: 'instagram' | 'tiktok' | 'linkedin',
  trendBrief: TrendBrief,
  contentType?: string,
  topic?: string
): Promise<string> {
  const trendSection = formatBriefForAgent(trendBrief, platform);

  const msg = `Based on the live trend brief below, write a precise mission brief for the ${platform} agent.
The brief should tell the agent EXACTLY what to create: format, angle, hook direction, and which trends to leverage.
${topic ? `The content must focus on this topic: ${topic}` : ''}
${contentType && contentType !== 'auto' ? `Content type: ${contentType}` : 'Choose the best format based on what is trending.'}

${trendSection}

Return a concise mission brief (3–5 sentences) that gives the ${platform} agent clear direction.
Do not return JSON — just the brief text.`;

  return callClaude(MANAGER_SYSTEM_PROMPT, msg);
}

// ── Step 2: Review agent output ───────────────────────────────────────────────

async function reviewAgentOutput(
  report: AgentReport,
  trendBrief: TrendBrief,
  missionBrief: string
): Promise<ManagerReview> {
  const trendSection = formatBriefForAgent(trendBrief, report.agent);

  const msg = `Review this ${report.agent} content submission from my marketing team.

MISSION BRIEF I gave them:
${missionBrief}

LIVE TREND CONTEXT:
${trendSection}

THEIR SUBMISSION:
Hook: ${report.content.hook}
Caption/Post: ${report.content.caption}
Content Type: ${report.content.contentType}
${report.content.script ? `Script:\n${report.content.script}` : ''}
${report.content.slides?.length ? `Slides: ${report.content.slides.join(' | ')}` : ''}
Visual Prompt: ${report.content.visualPrompt}
Trend they referenced: ${report.content.trendReference}
Their self-score: ${report.content.viralScore}/10

Score this 1–10. Approve if ≥ 7. Be demanding.
Return ONLY valid JSON:
{
  "score": 8,
  "approved": true,
  "critique": "One paragraph assessment",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"],
  "revisionBrief": "If not approved: exactly what to change and how. Be specific."
}`;

  try {
    const raw = await callClaude(MANAGER_SYSTEM_PROMPT, msg);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const review = JSON.parse(match[0]);
      return {
        score:         review.score ?? 5,
        approved:      review.approved ?? false,
        critique:      review.critique ?? '',
        strengths:     review.strengths ?? [],
        weaknesses:    review.weaknesses ?? [],
        revisionBrief: review.revisionBrief,
      };
    }
  } catch {}

  return { score: 5, approved: false, critique: 'Review parse failed', strengths: [], weaknesses: ['Could not parse review'] };
}

// ── Step 3: Request revision from agent ───────────────────────────────────────

async function requestRevision(
  agent: 'instagram' | 'tiktok' | 'linkedin',
  review: ManagerReview,
  trendBrief: TrendBrief,
  originalContent: ContentOutput
): Promise<ContentOutput> {
  const { loadPrompt, loadBrandContext, callClaude: cc, parseJsonOutput: parse } = await import('./base-agent');

  const systemPrompt = [
    loadPrompt(`${agent}.md`),
    '\n\n---\n\n## Symponia Brand Context\n\n',
    loadBrandContext(),
    '\n\n---\n\n',
    formatBriefForAgent(trendBrief, agent),
  ].join('');

  const userMessage = `Your Creative Director has reviewed your submission and is requesting a revision.

YOUR ORIGINAL SUBMISSION:
Hook: ${originalContent.hook}
Caption: ${originalContent.caption}

DIRECTOR'S CRITIQUE (score: ${review.score}/10):
${review.critique}

WEAKNESSES IDENTIFIED:
${review.weaknesses.map(w => `• ${w}`).join('\n')}

REVISION BRIEF — what you must fix:
${review.revisionBrief}

Submit a revised version. Address every weakness. The hook must be stronger.
Return ONLY a JSON object in your standard output format.`;

  console.log(`[Manager] Requesting revision from ${agent} agent…`);
  const raw = await cc(systemPrompt, userMessage);
  return parse(raw);
}

// ── Step 4: Save approved content to Airtable + trigger Kie.ai ───────────────

async function saveAndGenerateVisual(
  agent: 'instagram' | 'tiktok' | 'linkedin',
  content: ContentOutput,
  review: ManagerReview,
  trendBrief: TrendBrief
): Promise<string> {
  // Save to Airtable
  const record = await createRecord({
    platform:       agent,
    contentType:    content.contentType as any,
    agent:          `${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`,
    hook:           content.hook,
    caption:        (content as any).post ?? content.caption,
    hashtags:       content.hashtags,
    script:         content.script,
    slides:         content.slides ? JSON.stringify(content.slides) : undefined,
    visualPrompt:   content.visualPrompt,
    firstComment:   content.firstComment,
    trendReference: content.trendReference,
    viralScore:     content.viralScore,
    notes: [
      `Manager review — Score: ${review.score}/10`,
      `Strengths: ${review.strengths.join(', ')}`,
      `Director's note: ${review.critique}`,
      `---`,
      `Trend brief: ${trendBrief.global.summary}`,
      content.notes,
    ].filter(Boolean).join('\n'),
    status: 'generating',
  });

  const id = record.id!;
  console.log(`[Manager] Saved → Airtable: ${id}`);

  // Trigger Kie.ai visual generation
  try {
    let visual;
    if (agent === 'instagram') {
      visual = content.contentType === 'carousel'
        ? await generateForInstagramCarousel(content.visualPrompt)
        : await generateForInstagramReel(content.visualPrompt);
    } else if (agent === 'tiktok') {
      visual = await generateForTikTok(content.visualPrompt);
    } else {
      visual = content.contentType !== 'document-carousel'
        ? await generateForLinkedIn(content.visualPrompt)
        : null;
    }

    if (visual) {
      await markReadyForReview(id, visual.imageUrls?.[0], visual.videoUrl);
      console.log(`[Manager] Visual ready → ${visual.imageUrls?.[0] ?? visual.videoUrl ?? 'no URL yet'}`);
    } else {
      await updateRecord(id, { status: 'review' });
      console.log(`[Manager] No visual (doc carousel) → marked for review`);
    }
  } catch (err) {
    await updateRecord(id, { status: 'review', notes: record.notes + `\nVisual gen failed: ${(err as Error).message}` });
    console.warn(`[Manager] Visual generation failed — saved without image`);
  }

  return id;
}

// ── Orchestrate full run ───────────────────────────────────────────────────────

export async function runManagerAndTeam(opts: {
  platforms?: ('instagram' | 'tiktok' | 'linkedin')[];
  contentType?: string;
  topic?: string;
  maxRevisions?: number;
}): Promise<ManagerRun> {
  const {
    platforms   = ['instagram', 'tiktok', 'linkedin'],
    contentType = 'auto',
    topic,
    maxRevisions = 1,
  } = opts;

  console.log('\n' + '═'.repeat(56));
  console.log('   ◈  Symponia Manager Agent');
  console.log('═'.repeat(56));
  if (topic) console.log(`   Topic: ${topic}`);
  console.log(`   Platforms: ${platforms.join(', ')}`);

  // ── Phase 1: Trend research ─────────────────────────────────────────────────
  console.log('\n[Phase 1] Trend Research\n' + '─'.repeat(40));
  const trendBrief = await compileTrendBrief();

  const result: ManagerRun = {
    trendBrief,
    reports:  [],
    reviews:  {},
    savedIds: {},
  };

  // ── Phase 2: Brief + generate per platform (sequentially to respect rate limits)
  for (const platform of platforms) {
    console.log(`\n[Phase 2] Briefing ${platform} agent\n` + '─'.repeat(40));

    // Manager generates mission brief
    const missionBrief = await generateMissionBrief(platform, trendBrief, contentType, topic);
    console.log(`[Manager → ${platform}] Brief: "${missionBrief.slice(0, 100)}…"`);

    // Inject trend brief into the platform agent's context via topic override
    const enrichedTopic = [
      topic ?? '',
      `\n\nYOUR MISSION BRIEF FROM THE CREATIVE DIRECTOR:\n${missionBrief}`,
      `\n\n${formatBriefForAgent(trendBrief, platform)}`,
    ].join('');

    // ── Phase 3: Agent generates ──────────────────────────────────────────────
    console.log(`\n[Phase 3] ${platform} agent generating…`);
    let content: ContentOutput;

    try {
      if (platform === 'instagram') {
        content = await runInstagramAgent(contentType as any, enrichedTopic);
      } else if (platform === 'tiktok') {
        content = await runTikTokAgent(contentType as any, enrichedTopic);
      } else {
        content = await runLinkedInAgent(contentType as any, enrichedTopic);
      }
    } catch (err) {
      console.error(`[Manager] ${platform} agent failed:`, (err as Error).message);
      continue;
    }

    const report: AgentReport = { agent: platform, content, raw: '' };
    result.reports.push(report);

    // ── Phase 4: Manager reviews ──────────────────────────────────────────────
    console.log(`\n[Phase 4] Manager reviewing ${platform} output…`);
    let review = await reviewAgentOutput(report, trendBrief, missionBrief);
    console.log(`[Manager] Score: ${review.score}/10 — ${review.approved ? '✓ Approved' : '✗ Revision needed'}`);
    console.log(`[Manager] ${review.critique.slice(0, 100)}…`);

    // ── Phase 5: Revision loop ────────────────────────────────────────────────
    let revisions = 0;
    while (!review.approved && revisions < maxRevisions) {
      revisions++;
      console.log(`\n[Phase 5] Revision ${revisions}/${maxRevisions} for ${platform}…`);
      const revised = await requestRevision(platform, review, trendBrief, content);
      report.content = revised;
      review = await reviewAgentOutput({ ...report, content: revised }, trendBrief, missionBrief);
      console.log(`[Manager] Revised score: ${review.score}/10 — ${review.approved ? '✓ Approved' : '✗ Still needs work'}`);
    }

    // ── Phase 6: Save approved content ───────────────────────────────────────
    if (review.approved || review.score >= 6) {
      console.log(`\n[Phase 6] Saving ${platform} to Airtable + generating visual…`);
      const id = await saveAndGenerateVisual(platform, report.content, review, trendBrief);
      result.savedIds[platform] = id;
    } else {
      console.warn(`[Manager] ${platform} content below threshold (${review.score}/10) — not saved. Try again with a different topic.`);
    }

    result.reviews[platform] = review;

    // Rate limit pause between platforms
    if (platforms.indexOf(platform) < platforms.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  // ── Final report ──────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(56));
  console.log('   ◈  Manager Run Complete\n');
  for (const platform of platforms) {
    const review = result.reviews[platform];
    const id     = result.savedIds[platform];
    if (review) {
      console.log(`   ${platform.padEnd(12)} Score: ${review.score}/10  ${review.approved ? '✓' : '✗'}  ${id ? `→ ${id}` : 'Not saved'}`);
    }
  }
  console.log('\n   Trend keywords: ' + trendBrief.global.keywords.slice(0, 4).join(', '));
  console.log('   → Review approved content in your dashboard.\n');

  return result;
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const get  = (flag: string) => args.find(a => a.startsWith(`--${flag}=`))?.split('=').slice(1).join('=');

  const platformArg = get('platform');
  const platforms   = platformArg === 'all' || !platformArg
    ? ['instagram', 'tiktok', 'linkedin'] as const
    : [platformArg] as any;

  runManagerAndTeam({
    platforms,
    contentType: get('type') ?? 'auto',
    topic:       get('topic'),
    maxRevisions: parseInt(get('revisions') ?? '1'),
  }).catch(console.error);
}
