// ── TikTok Marketing Agent ────────────────────────────────────────────────────
// Symponia's TikTok specialist. Masters hooks, scripts, sound strategy, virality.
// Usage: ts-node agents/tiktok-agent.ts [--type reel|text-video|screen-recording|series]

import { callClaude, loadPrompt, loadBrandContext, parseJsonOutput, ContentOutput } from './base-agent';
import { createRecord } from '../services/airtable';
import { generateForTikTok } from '../services/kie-ai';

// ── Content type options ──────────────────────────────────────────────────────

type TikTokContentType = 'reel' | 'text-video' | 'screen-recording' | 'duet-setup' | 'series' | 'auto';

const CONTENT_TYPE_PROMPTS: Record<string, string> = {
  reel: `Generate a TikTok video concept for Symponia. This must stop the scroll in the first 0.5 seconds.
Format: face-to-camera OR b-roll with voice-over OR screen recording.
Provide a full timestamped script (aim for 45–60 seconds).
Include the exact first 3 seconds in maximum detail (visual + audio + text overlay simultaneously).`,

  'text-video': `Generate a text-only TikTok for Symponia — no voice, just text on screen with ambient sound.
These perform extremely well for philosophical content in the Jungian/shadow niche.
Create 6–10 text beats that appear sequentially. Each beat is one short, resonant line.
Suggest a specific ambient sound type (eerie, minimal, cinematic drone, etc.).`,

  'screen-recording': `Generate a TikTok concept based on screen recording the Symponia app in use.
This is a "social proof" format: "I tried this AI oracle and it said..."
Script a voice-over that makes the viewer need to see what the oracle says.
The hook must create maximum curiosity about the oracle's specific response.`,

  'duet-setup': `Generate a TikTok concept designed to be duetted or stitched.
End the video with a question or incomplete statement that invites response.
Example angle: "Tell me your 7th animal and I'll interpret your shadow — duet me."
This format compounds reach through user-generated responses.`,

  series: `Generate a TikTok series concept for Symponia — a multi-part story.
Design: Part 1 of at least 3 parts. Each part ends with a cliffhanger or open question.
Topic options: "I'm using Symponia every day for 30 days", "Reading strangers' shadow animals",
"Deep dive into [specific animal] archetype across 5 videos".
Return Part 1's full script and briefly outline Parts 2–3.`,

  auto: `Generate the highest-impact TikTok content for Symponia right now.
Choose the format that leverages current TikTok trends most effectively.
Consider: what is trending in the self-knowledge, psychology, and philosophy niches right now?
Justify your format and trend choice in the notes field.`,
};

// ── Agent run ─────────────────────────────────────────────────────────────────

export async function runTikTokAgent(
  contentType: TikTokContentType = 'auto',
  topic?: string
): Promise<ContentOutput> {
  const systemPrompt = [
    loadPrompt('tiktok.md'),
    '\n\n---\n\n## Symponia Brand Context\n\n',
    loadBrandContext(),
  ].join('');

  const userMessage = [
    CONTENT_TYPE_PROMPTS[contentType],
    topic ? `\n\nFocus on this specific topic or angle: ${topic}` : '',
    '\n\nReturn your output as a JSON object exactly matching the format specified in your system prompt.',
    '\nDo not add any explanation outside the JSON block.',
    '\nFor the "script" field, use timestamp format: [0:00] Action/line. [0:03] Next beat. etc.',
  ].join('');

  console.log(`[TikTok Agent] Generating ${contentType} content…`);
  const raw = await callClaude(systemPrompt, userMessage);
  const output = parseJsonOutput(raw);

  console.log(`[TikTok Agent] Hook: "${output.hook}"`);
  console.log(`[TikTok Agent] Viral score: ${output.viralScore}/10`);
  console.log(`[TikTok Agent] Trend: ${output.trendReference}`);
  if (output.seriesPotential) console.log(`[TikTok Agent] Series potential: YES`);

  return output;
}

// ── Full pipeline: generate content + thumbnail + save to Airtable ────────────

export async function tiktokPipeline(
  contentType: TikTokContentType = 'auto',
  topic?: string
): Promise<string> {
  // 1. Generate content
  const content = await runTikTokAgent(contentType, topic);

  // 2. Save to Airtable (status: generating)
  const record = await createRecord({
    platform:      'tiktok',
    contentType:   content.contentType as any,
    agent:         'TikTok Agent',
    hook:          content.hook,
    caption:       content.caption,
    hashtags:      content.hashtags,
    script:        content.script,
    visualPrompt:  content.visualPrompt,
    trendReference: content.trendReference,
    viralScore:    content.viralScore,
    notes:         [
      content.notes,
      content.soundSuggestion ? `Sound: ${content.soundSuggestion}` : '',
      content.textOverlays?.length ? `Text overlays: ${content.textOverlays.join(' | ')}` : '',
      content.seriesPotential ? 'SERIES POTENTIAL: YES' : '',
    ].filter(Boolean).join('\n'),
    status:        'generating',
  });

  const id = record.id!;
  console.log(`[TikTok Agent] Saved draft → Airtable ID: ${id}`);

  // 3. Generate thumbnail/first-frame visual via Kie.ai
  console.log(`[TikTok Agent] Generating thumbnail with Kie.ai…`);
  try {
    const visual = await generateForTikTok(content.visualPrompt);
    const imageUrl = visual.imageUrls?.[0];

    const { markReadyForReview } = await import('../services/airtable');
    await markReadyForReview(id, imageUrl);
    console.log(`[TikTok Agent] Thumbnail ready → ${imageUrl}`);
    console.log(`[TikTok Agent] Status: review ✓`);
  } catch (err) {
    const { updateRecord } = await import('../services/airtable');
    await updateRecord(id, { status: 'review', notes: `Thumbnail generation failed: ${(err as Error).message}` });
    console.warn(`[TikTok Agent] Thumbnail generation failed, saved without image`);
  }

  return id;
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const typeFlag = args.find(a => a.startsWith('--type='))?.split('=')[1] as TikTokContentType;
  const topicFlag = args.find(a => a.startsWith('--topic='))?.split('=')[1];

  tiktokPipeline(typeFlag ?? 'auto', topicFlag)
    .then(id => console.log(`\n✓ Done. Airtable record: ${id}`))
    .catch(console.error);
}
