// ── Instagram Marketing Agent ─────────────────────────────────────────────────
// Symponia's Instagram specialist. Knows hooks, carousels, Reels, hashtags.
// Usage: ts-node agents/instagram-agent.ts [--type reel|carousel|static|story]

import { callClaude, loadPrompt, loadBrandContext, parseJsonOutput, ContentOutput } from './base-agent';
import { createRecord } from '../services/airtable';
import { generateForInstagramReel, generateForInstagramCarousel } from '../services/kie-ai';

// ── Content type options ──────────────────────────────────────────────────────

type InstagramContentType = 'reel' | 'carousel' | 'static' | 'story' | 'auto';

const CONTENT_TYPE_PROMPTS: Record<string, string> = {
  reel: `Generate a Reels concept for Symponia. This must stop the scroll in under 1 second.
Focus on: animal archetype reveal OR shadow work insight OR app experience POV.
Return a full timestamped script (first 60 seconds).`,

  carousel: `Generate a carousel post concept for Symponia. This must earn saves and shares.
7–10 slides maximum. The first slide is the hook. The last slide is the CTA.
Content pillar options: shadow work explainer, philosophical insight, animal archetype breakdown, "nobody tells you" format.
Return slide-by-slide copy.`,

  static: `Generate a single-image post for Symponia. Minimal text, maximum resonance.
This is a quote card or single striking line — it should feel like something worth sending to one specific person.
Return the quote/text and the visual direction.`,

  story: `Generate an interactive Story sequence for Symponia.
Include: an opening frame, a poll or question sticker, and a closing frame.
Purpose: community engagement with existing followers.`,

  auto: `Generate the highest-impact Instagram content for Symponia right now.
Choose the format (reel, carousel, static, or story) that you believe will perform best given current trends.
Justify your format choice in the notes field.`,
};

// ── Agent run ─────────────────────────────────────────────────────────────────

export async function runInstagramAgent(
  contentType: InstagramContentType = 'auto',
  topic?: string
): Promise<ContentOutput> {
  const systemPrompt = [
    loadPrompt('instagram.md'),
    '\n\n---\n\n## Symponia Brand Context\n\n',
    loadBrandContext(),
  ].join('');

  const userMessage = [
    CONTENT_TYPE_PROMPTS[contentType],
    topic ? `\n\nFocus on this specific topic or angle: ${topic}` : '',
    '\n\nReturn your output as a JSON object exactly matching the format specified in your system prompt.',
    '\nDo not add any explanation outside the JSON block.',
  ].join('');

  console.log(`[Instagram Agent] Generating ${contentType} content…`);
  const raw = await callClaude(systemPrompt, userMessage);
  const output = parseJsonOutput(raw);

  console.log(`[Instagram Agent] Hook: "${output.hook}"`);
  console.log(`[Instagram Agent] Viral score: ${output.viralScore}/10`);
  console.log(`[Instagram Agent] Trend: ${output.trendReference}`);

  return output;
}

// ── Full pipeline: generate content + visual + save to Airtable ───────────────

export async function instagramPipeline(
  contentType: InstagramContentType = 'auto',
  topic?: string
): Promise<string> {
  // 1. Generate content
  const content = await runInstagramAgent(contentType, topic);
  const resolvedType = content.contentType as any;

  // 2. Save to Airtable (status: generating)
  const record = await createRecord({
    platform:      'instagram',
    contentType:   resolvedType,
    agent:         'Instagram Agent',
    hook:          content.hook,
    caption:       content.caption,
    hashtags:      content.hashtags,
    script:        content.script,
    slides:        content.slides ? JSON.stringify(content.slides) : undefined,
    visualPrompt:  content.visualPrompt,
    trendReference: content.trendReference,
    viralScore:    content.viralScore,
    notes:         content.notes,
    status:        'generating',
  });

  const id = record.id!;
  console.log(`[Instagram Agent] Saved draft → Airtable ID: ${id}`);

  // 3. Generate visual via Kie.ai
  console.log(`[Instagram Agent] Generating visual with Kie.ai…`);
  try {
    const visual = resolvedType === 'carousel'
      ? await generateForInstagramCarousel(content.visualPrompt)
      : await generateForInstagramReel(content.visualPrompt);

    const imageUrl = visual.imageUrls?.[0];

    // 4. Update Airtable: mark ready for review
    const { updateRecord, markReadyForReview } = await import('../services/airtable');
    await markReadyForReview(id, imageUrl);
    console.log(`[Instagram Agent] Visual ready → ${imageUrl}`);
    console.log(`[Instagram Agent] Status: review ✓`);
  } catch (err) {
    const { updateRecord } = await import('../services/airtable');
    await updateRecord(id, { status: 'review', notes: `Visual generation failed: ${(err as Error).message}\n\n${record.notes}` });
    console.warn(`[Instagram Agent] Visual generation failed, saved without image`);
  }

  return id;
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const typeFlag = args.find(a => a.startsWith('--type='))?.split('=')[1] as InstagramContentType;
  const topicFlag = args.find(a => a.startsWith('--topic='))?.split('=')[1];

  instagramPipeline(typeFlag ?? 'auto', topicFlag)
    .then(id => console.log(`\n✓ Done. Airtable record: ${id}`))
    .catch(console.error);
}
