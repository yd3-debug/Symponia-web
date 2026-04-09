// ── LinkedIn Marketing Agent ──────────────────────────────────────────────────
// Symponia's LinkedIn specialist. Masters hooks, professional framing, document posts.
// Usage: ts-node agents/linkedin-agent.ts [--type short|medium|long|document]

import { callClaude, loadPrompt, loadBrandContext, parseJsonOutput, ContentOutput } from './base-agent';
import { createRecord } from '../services/airtable';
import { generateForLinkedIn } from '../services/kie-ai';

// ── Content type options ──────────────────────────────────────────────────────

type LinkedInContentType = 'short-post' | 'medium-post' | 'long-post' | 'document-carousel' | 'auto';

const CONTENT_TYPE_PROMPTS: Record<string, string> = {
  'short-post': `Generate a short LinkedIn post for Symponia (under 300 characters).
The entire message must land in 2 lines. Maximum impact, minimum words.
This is for when a single observation deserves to stand alone.
No hashtags needed. No CTA needed. Just the line.`,

  'medium-post': `Generate a medium-length LinkedIn post for Symponia (300–800 characters).
Hook line (before "...more") must be irresistible to a reflective professional.
3–4 short paragraphs with clear white space between them.
End with a question that naturally invites a substantive comment.
Remember: NO external links in the post body — put the app link in the first comment.`,

  'long-post': `Generate a long-form LinkedIn post for Symponia (800–1500 characters).
This is the format for deep insight — leadership shadow, self-awareness as competitive edge,
Jungian psychology for professionals.
Structure: strong hook → personal or observed story → core insight → application → close.
Remember: LinkedIn penalises external links in post body — generate a "firstComment" with the app link and CTA.`,

  'document-carousel': `Generate a LinkedIn document/PDF carousel for Symponia.
10–12 slides. Maximum text per slide: 2–3 short lines.
First slide = the hook (same rules as any LinkedIn hook — must survive alone).
Last slide = CTA with app direction.
Content angle options: "The 7 animals and what each reveals", "Shadow work for leaders",
"Why the AI that listens beats the AI that answers", "The self-awareness gap in high performers".
Return each slide as a separate entry in the "slides" array.`,

  auto: `Generate the highest-impact LinkedIn content for Symponia right now.
Choose the format that will generate the most substantive engagement from professional audiences.
Consider: thought leaders, senior professionals, coaches, psychologists, people in transition.
Justify your format choice in the notes field.`,
};

// ── Agent run ─────────────────────────────────────────────────────────────────

export async function runLinkedInAgent(
  contentType: LinkedInContentType = 'auto',
  topic?: string
): Promise<ContentOutput> {
  const systemPrompt = [
    loadPrompt('linkedin.md'),
    '\n\n---\n\n## Symponia Brand Context\n\n',
    loadBrandContext(),
  ].join('');

  const userMessage = [
    CONTENT_TYPE_PROMPTS[contentType],
    topic ? `\n\nFocus on this specific topic or angle: ${topic}` : '',
    '\n\nReturn your output as a JSON object exactly matching the format specified in your system prompt.',
    '\nDo not add any explanation outside the JSON block.',
    '\nFor LinkedIn: the "hook" field = ONLY the first line (what appears before "...more").',
    '\nThe "post" field = the complete post text (including the hook line at the top).',
    '\nThe "firstComment" field = the pinned comment with the app link and a brief CTA.',
  ].join('');

  console.log(`[LinkedIn Agent] Generating ${contentType} content…`);
  const raw = await callClaude(systemPrompt, userMessage);
  const output = parseJsonOutput(raw);

  console.log(`[LinkedIn Agent] Hook: "${output.hook}"`);
  console.log(`[LinkedIn Agent] Viral score: ${output.viralScore}/10`);
  console.log(`[LinkedIn Agent] Trend: ${output.trendReference}`);

  return output;
}

// ── Full pipeline: generate content + visual + save to Airtable ───────────────

export async function linkedinPipeline(
  contentType: LinkedInContentType = 'auto',
  topic?: string
): Promise<string> {
  // 1. Generate content
  const content = await runLinkedInAgent(contentType, topic);

  // For LinkedIn, "post" contains the full text; fall back to caption if post is missing
  const fullPost = (content as any).post ?? content.caption;

  // 2. Save to Airtable
  const record = await createRecord({
    platform:      'linkedin',
    contentType:   content.contentType as any,
    agent:         'LinkedIn Agent',
    hook:          content.hook,
    caption:       fullPost,
    hashtags:      content.hashtags,
    slides:        content.slides ? JSON.stringify(content.slides) : undefined,
    visualPrompt:  content.visualPrompt,
    firstComment:  content.firstComment,
    trendReference: content.trendReference,
    viralScore:    content.viralScore,
    notes:         [(content as any).postingNote, content.notes].filter(Boolean).join('\n'),
    status:        'generating',
  });

  const id = record.id!;
  console.log(`[LinkedIn Agent] Saved draft → Airtable ID: ${id}`);

  // 3. Generate visual via Kie.ai (only for posts with images; carousels use slide design)
  if (content.contentType !== 'document-carousel') {
    console.log(`[LinkedIn Agent] Generating visual with Kie.ai…`);
    try {
      const visual = await generateForLinkedIn(content.visualPrompt);
      const imageUrl = visual.imageUrls?.[0];

      const { markReadyForReview } = await import('../services/airtable');
      await markReadyForReview(id, imageUrl);
      console.log(`[LinkedIn Agent] Visual ready → ${imageUrl}`);
      console.log(`[LinkedIn Agent] Status: review ✓`);
    } catch (err) {
      const { updateRecord } = await import('../services/airtable');
      await updateRecord(id, { status: 'review', notes: `Visual generation failed: ${(err as Error).message}` });
      console.warn(`[LinkedIn Agent] Visual generation failed, saved without image`);
    }
  } else {
    // Document carousels don't need Kie.ai — mark ready for design
    const { updateRecord } = await import('../services/airtable');
    await updateRecord(id, { status: 'review', notes: `Document carousel — design slides manually or use Canva.\n\n${record.notes}` });
    console.log(`[LinkedIn Agent] Document carousel → design slides and attach PDF`);
    console.log(`[LinkedIn Agent] Status: review ✓`);
  }

  return id;
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const typeFlag = args.find(a => a.startsWith('--type='))?.split('=')[1] as LinkedInContentType;
  const topicFlag = args.find(a => a.startsWith('--topic='))?.split('=')[1];

  linkedinPipeline(typeFlag ?? 'auto', topicFlag)
    .then(id => console.log(`\n✓ Done. Airtable record: ${id}`))
    .catch(console.error);
}
