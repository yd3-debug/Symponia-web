// ── Director Agent ─────────────────────────────────────────────────────────────
// The master orchestrator. Receives the full campaign brief and coordinates
// all sub-agents in the correct order. Handles errors from any sub-agent
// gracefully and reports progress via a callback.

import { updateCampaignStatus, type Campaign } from '../airtable';
import { runResearchAgent, type ResearchOutput } from './research-agent';
import { runStrategyAgent, type StrategyIdea } from './strategy-agent';
import { runContentAgent, type PlatformContent } from './content-agent';
import { runSeoAgent, type SeoResult } from './seo-agent';
import { PERSONAS } from './personas';

const ARC = PERSONAS.arc;

export type DirectorPhase =
  | 'research'
  | 'strategy'
  | 'content'
  | 'seo'
  | 'complete'
  | 'error';

export interface DirectorProgress {
  phase: DirectorPhase;
  message: string;
  data?: any;
}

export interface DirectorResult {
  campaign: Campaign;
  research: ResearchOutput;
  ideas: StrategyIdea[];
  content: PlatformContent[];
  seo: SeoResult[];
}

export async function runDirectorAgent(
  campaign: Campaign,
  onProgress?: (progress: DirectorProgress) => void,
): Promise<DirectorResult> {
  const emit = (phase: DirectorPhase, message: string, data?: any) => {
    onProgress?.({ phase, message, data });
  };

  // ── Phase 1: Research ─────────────────────────────────────────────────────

  emit('research', `${ARC.name} → ARIA: Scanning Reddit, web, and competitors via Exa.ai…`);
  await updateCampaignStatus(campaign.id!, 'Research').catch(() => {});

  let research: ResearchOutput;
  try {
    research = await runResearchAgent(campaign);
    emit('research', `Found ${research.trendingTopics.length} trending topics and ${research.seoKeywords.length} SEO opportunities.`, research);
  } catch (err) {
    emit('error', `Research phase failed: ${(err as Error).message}`);
    throw err;
  }

  // ── Phase 2: Strategy ─────────────────────────────────────────────────────

  emit('strategy', `${ARC.name} → MARCO: Generating 5 campaign ideas…`);
  await updateCampaignStatus(campaign.id!, 'Ideas').catch(() => {});

  let ideas: StrategyIdea[];
  try {
    ideas = await runStrategyAgent(campaign, research);
    emit('strategy', `Generated ${ideas.length} content ideas.`, ideas);
  } catch (err) {
    emit('error', `Strategy phase failed: ${(err as Error).message}`);
    throw err;
  }

  // ── Phase 3: Content (auto-select highest scoring idea) ───────────────────

  emit('content', `${ARC.name} → Platform Specialists: Writing content for all platforms…`);
  await updateCampaignStatus(campaign.id!, 'Content').catch(() => {});

  const topIdea = ideas.reduce((best, idea) => idea.trendingScore > best.trendingScore ? idea : best, ideas[0]);

  let content: PlatformContent[];
  try {
    content = await runContentAgent(campaign, topIdea, research);
    emit('content', `Generated content for ${content.length} platforms.`, content);
  } catch (err) {
    emit('error', `Content phase failed: ${(err as Error).message}`);
    throw err;
  }

  // ── Phase 4: SEO Scoring ──────────────────────────────────────────────────

  emit('seo', `${ARC.name} → REX: Scoring and optimising all content for SEO…`);

  let seo: SeoResult[];
  try {
    const targetKeywords = research.seoKeywords.filter(k => k.opportunity === 'High').map(k => k.keyword);
    seo = await runSeoAgent(
      content.map(c => ({ platform: c.platform, body: c.body, hashtags: c.hashtags })),
      targetKeywords,
    );
    const avgScore = Math.round(seo.reduce((s, r) => s + r.seoScore, 0) / seo.length);
    emit('seo', `Average SEO score: ${avgScore}/100.`, seo);
  } catch (err) {
    // SEO is non-fatal
    console.error('[Director] SEO phase failed:', err);
    seo = [];
  }

  // ── Complete ──────────────────────────────────────────────────────────────

  await updateCampaignStatus(campaign.id!, 'Visuals').catch(() => {});
  emit('complete', 'Campaign brief complete. Ready for visual generation.');

  return { campaign, research, ideas, content, seo };
}
