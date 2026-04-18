// ── SEO Agent ──────────────────────────────────────────────────────────────────
// Scores and optimises all generated content pieces.
// Returns score, keywords found, readability, and optimised copy.
// Updates Airtable Content Pieces with SEO scores.

import Anthropic from '@anthropic-ai/sdk';
import { updateContentPiece } from '../airtable';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert SEO strategist specialising in social media content optimisation.
You analyse content for search intent alignment, keyword density, readability, and platform SEO factors.
You give actionable, specific improvements — not generic advice.
Always return valid JSON.`;

export interface SeoResult {
  contentPieceId?: string;
  seoScore: number;               // 1-100
  primaryKeywordFound: boolean;
  secondaryKeywords: string[];
  readabilityScore: number;       // 1-100
  improvements: string[];         // specific actionable items
  optimisedVersion: string;       // rewritten copy
  platformSeoTips: string[];      // platform-specific SEO advice
}

export async function scoreSeoForPiece(opts: {
  contentPieceId?: string;
  platform: string;
  contentBody: string;
  hashtags?: string;
  targetKeywords: string[];
}): Promise<SeoResult> {
  const { contentPieceId, platform, contentBody, hashtags, targetKeywords } = opts;

  const msg = await claude.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Analyse this ${platform} content for SEO effectiveness.

Content Body:
${contentBody}

${hashtags ? `Hashtags: ${hashtags}` : ''}

Target Keywords to check for: ${targetKeywords.join(', ')}

Score it and provide an optimised version. Return ONLY valid JSON:
{
  "seoScore": 75,
  "primaryKeywordFound": true,
  "secondaryKeywords": ["keyword1", "keyword2"],
  "readabilityScore": 82,
  "improvements": [
    "Add primary keyword in first 30 words",
    "Include a question to boost engagement signals"
  ],
  "optimisedVersion": "Full rewritten version with SEO improvements applied",
  "platformSeoTips": [
    "${platform}-specific tip 1",
    "${platform}-specific tip 2"
  ]
}`,
    }],
  });

  const rawText = (msg.content[0] as any).text;
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('SEO agent returned no JSON');

  const result: SeoResult = { ...JSON.parse(match[0]), contentPieceId };

  // Update Airtable if we have a piece ID
  if (contentPieceId) {
    try {
      await updateContentPiece(contentPieceId, {
        seoScore: result.seoScore,
        seoNotes: [
          `Score: ${result.seoScore}/100 | Readability: ${result.readabilityScore}/100`,
          `Keywords found: ${result.secondaryKeywords.join(', ')}`,
          `Improvements: ${result.improvements.join('; ')}`,
        ].join('\n'),
      });
    } catch {
      // Non-fatal — SEO scoring still returns even if Airtable update fails
    }
  }

  return result;
}

export async function runSeoAgent(
  pieces: Array<{ id?: string; platform: string; body: string; hashtags?: string }>,
  targetKeywords: string[],
): Promise<SeoResult[]> {
  const results: SeoResult[] = [];

  for (const piece of pieces) {
    try {
      const result = await scoreSeoForPiece({
        contentPieceId: piece.id,
        platform: piece.platform,
        contentBody: piece.body,
        hashtags: piece.hashtags,
        targetKeywords,
      });
      results.push(result);
    } catch (err) {
      console.error(`[SEO Agent] Failed for ${piece.platform}:`, err);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  return results;
}
