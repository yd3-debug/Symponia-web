// ── Content Agent ──────────────────────────────────────────────────────────────
// Generates platform-specific copy for all selected platforms.
// Streams output via ReadableStream for real-time typewriter UI.
// Saves each piece to Airtable Content Pieces table.

import Anthropic from '@anthropic-ai/sdk';
import { createContentPiece, type Campaign, type ContentPiece } from '../airtable';
import type { StrategyIdea } from './strategy-agent';
import type { ResearchOutput } from './research-agent';
import { PERSONAS, PLATFORM_AGENT } from './personas';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface PlatformContent {
  platform: string;
  contentType: string;
  body: string;
  hashtags: string;
  seoAltText?: string;
  additionalFields?: Record<string, string | string[]>;
}

export interface ContentOutput {
  pieces: PlatformContent[];
}

function platformPrompt(platform: string, idea: StrategyIdea, campaign: Campaign): string {
  const baseContext = `
Brand: ${campaign.brandName}
Product/Service: ${campaign.productOrService}
Target Audience: ${campaign.targetAudience}
Tone: ${campaign.tone}
Content Idea: ${idea.title}
Angle: ${idea.angle}
Hook: ${idea.hook}`;

  const prompts: Record<string, string> = {
    Instagram: `${baseContext}

Generate Instagram content. Return JSON:
{
  "caption": "150-300 chars, hook first, CTA at end",
  "hashtags": "15-20 relevant tags starting with #",
  "storyCopy": ["slide 1 text", "slide 2 text", "slide 3 text", "slide 4 text", "slide 5 text"],
  "reelScript15s": "15 second script",
  "reelScript30s": "30 second script",
  "reelScript60s": "60 second script",
  "seoAltText": "descriptive alt text"
}`,
    'Twitter/X': `${baseContext}

Generate Twitter/X content. Return JSON:
{
  "hookTweet": "under 280 chars, high engagement",
  "thread": ["tweet 1", "tweet 2", "tweet 3", "tweet 4", "tweet 5", "tweet 6"],
  "engagementVariant": "question format tweet under 280 chars"
}`,
    LinkedIn: `${baseContext}

Generate LinkedIn content. Return JSON:
{
  "longFormPost": "500-800 words, thought leadership format with line breaks for readability",
  "shortPost": "150-200 words, punchy professional",
  "headlineOptions": ["option 1", "option 2", "option 3"],
  "bestPostingTime": "e.g. Tuesday 8am"
}`,
    TikTok: `${baseContext}

Generate TikTok content. Return JSON:
{
  "script15s": "15 second script with timestamps [0:00] format",
  "script30s": "30 second script with timestamps",
  "script60s": "60 second script with timestamps",
  "hookLine": "exact first 3 seconds of speech",
  "textOverlayCopy": ["overlay 1", "overlay 2", "overlay 3"],
  "soundSuggestion": "trending sound type or specific suggestion"
}`,
    Facebook: `${baseContext}

Generate Facebook content. Return JSON:
{
  "postCopy": "conversational Facebook post, 100-200 words",
  "adCopyVariant": "ad copy version for boosted post"
}`,
    YouTube: `${baseContext}

Generate YouTube content. Return JSON:
{
  "shortScript30s": "30 second YouTube Short script",
  "shortScript60s": "60 second YouTube Short script",
  "thumbnailTextOptions": ["option 1", "option 2", "option 3"],
  "description": "video description with keywords"
}`,
    Pinterest: `${baseContext}

Generate Pinterest content. Return JSON:
{
  "pinTitle": "SEO-optimised title under 100 chars",
  "pinDescription": "keyword-rich description 200-500 chars",
  "boardSuggestion": "which board this fits best"
}`,
  };

  return prompts[platform] ?? prompts['Instagram'];
}

export async function generatePlatformContent(
  campaign: Campaign,
  idea: StrategyIdea,
  platform: string,
  research: ResearchOutput,
): Promise<PlatformContent> {
  const prompt = platformPrompt(platform, idea, campaign);
  const agentId = PLATFORM_AGENT[platform] ?? 'zoe';
  const persona = PERSONAS[agentId];

  const msg = await claude.messages.create({
    model: persona.model,
    max_tokens: persona.maxTokens,
    system: persona.systemPrompt,
    messages: [{
      role: 'user',
      content: `${prompt}\n\nRelevant SEO keywords to weave in naturally: ${research.seoKeywords.filter(k => k.opportunity === 'High').slice(0, 5).map(k => k.keyword).join(', ')}`,
    }],
  });

  const rawText = (msg.content[0] as any).text;
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Content agent returned no JSON for ${platform}`);

  const parsed = JSON.parse(match[0]);

  // Map to ContentPiece format
  const contentBody = parsed.caption ?? parsed.hookTweet ?? parsed.longFormPost ?? parsed.postCopy ?? parsed.pinTitle ?? parsed.script30s ?? '';
  const hashtags = parsed.hashtags ?? '';

  return {
    platform,
    contentType: platform === 'LinkedIn' ? 'Article' : platform === 'Twitter/X' ? 'Thread' : 'Caption',
    body: contentBody,
    hashtags,
    seoAltText: parsed.seoAltText,
    additionalFields: parsed,
  };
}

// Generate content for all platforms and save to Airtable
export async function runContentAgent(
  campaign: Campaign,
  idea: StrategyIdea,
  research: ResearchOutput,
): Promise<PlatformContent[]> {
  const pieces: PlatformContent[] = [];

  for (const platform of campaign.platforms) {
    try {
      const content = await generatePlatformContent(campaign, idea, platform, research);
      pieces.push(content);

      // Save to Airtable — contentBody stores the full JSON so scripts/slides are preserved
      if (campaign.id) {
        await createContentPiece({
          campaignId:    campaign.id,
          platform:      platform as any,
          contentType:   content.contentType as any,
          contentBody:   JSON.stringify(content.additionalFields ?? { body: content.body }),
          hashtags:      content.hashtags,
          visualDirection: JSON.stringify({ platform, tone: campaign.tone, style: 'brand-aligned' }),
          status:        'Draft',
        });
      }
    } catch (err) {
      console.error(`[Content Agent] Failed for ${platform}:`, err);
    }

    // Pause between platforms
    await new Promise(r => setTimeout(r, 1000));
  }

  return pieces;
}

// Streaming version for real-time UI typewriter effect
export async function streamPlatformContent(
  campaign: Campaign,
  idea: StrategyIdea,
  platform: string,
): Promise<ReadableStream> {
  const prompt = platformPrompt(platform, idea, campaign);
  const agentId = PLATFORM_AGENT[platform] ?? 'zoe';
  const persona = PERSONAS[agentId];

  const stream = await claude.messages.stream({
    model: persona.model,
    max_tokens: persona.maxTokens,
    system: persona.systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });
}
