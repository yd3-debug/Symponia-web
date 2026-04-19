// ── Strategy Agent ─────────────────────────────────────────────────────────────
// Takes the research report + campaign brief and generates exactly 5 content ideas.
// Each idea is scored, platform-tagged, and format-assigned.
// Saves all 5 ideas to Airtable Content Ideas table.

import Anthropic from '@anthropic-ai/sdk';
import { createContentIdeas, type Campaign, type ContentIdea } from '../airtable';
import type { ResearchOutput } from './research-agent';
import { PERSONAS } from './personas';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MARCO = PERSONAS.marco;

export interface StrategyIdea {
  title: string;
  angle: string;
  hook: string;
  bestPlatform: string;
  contentFormat: string;
  engagementPotential: 'High' | 'Medium' | 'Low';
  engagementReason: string;
  trendingScore: number;
  trendingReason: string;
}

export async function runStrategyAgent(
  campaign: Campaign,
  research: ResearchOutput,
): Promise<StrategyIdea[]> {
  const userMessage = `
Campaign Brief:
- Brand: ${campaign.brandName}
- Product/Service: ${campaign.productOrService}
- Target Audience: ${campaign.targetAudience}
- Platforms: ${campaign.platforms.join(', ')}
- Goal: ${campaign.goal}
- Tone: ${campaign.tone}
- Posting Frequency: ${campaign.postingFrequency}

Research Intelligence:
TOP TRENDING TOPICS:
${research.trendingTopics.slice(0, 3).map(t => `- ${t.topic}: ${t.contentAngle} (${t.viralPotential} potential)`).join('\n')}

AUDIENCE PAIN POINTS (Reddit):
${research.redditInsights.slice(0, 3).map(r => `- "${r.audienceQuote}" → Opportunity: ${r.contentOpportunity}`).join('\n')}

HIGH-OPPORTUNITY SEO KEYWORDS:
${research.seoKeywords.filter(k => k.opportunity === 'High').slice(0, 5).map(k => `- "${k.keyword}" (${k.searchIntent})`).join('\n')}

${research.competitorAnalysis.length > 0 ? `COMPETITOR GAPS TO EXPLOIT:\n${research.competitorAnalysis.map(c => `- ${c.competitor}: Gap = ${c.gap}, Opportunity = ${c.opportunity}`).join('\n')}` : ''}

Research Summary: ${research.summary}

Generate EXACTLY 5 content ideas. Each must be highly specific to this brand, not generic.
Return ONLY valid JSON array:
[
  {
    "title": "Short compelling idea title",
    "angle": "The specific angle or perspective that makes this unique (2-3 sentences)",
    "hook": "The exact first line/hook that would stop someone mid-scroll",
    "bestPlatform": "Instagram|LinkedIn|Twitter/X|TikTok|Facebook|YouTube|Pinterest",
    "contentFormat": "Carousel|Reel|Thread|Article|Story|Video",
    "engagementPotential": "High|Medium|Low",
    "engagementReason": "Why this will get high engagement (be specific)",
    "trendingScore": 8,
    "trendingReason": "What trending signal this taps into"
  }
]

Make idea 1 the highest viral potential. Vary platforms and formats across the 5 ideas.`;

  const msg = await claude.messages.create({
    model: MARCO.model,
    max_tokens: MARCO.maxTokens,
    system: MARCO.systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const rawText = (msg.content[0] as any).text;
  const match = rawText.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Strategy agent returned no valid JSON array');

  const ideas: StrategyIdea[] = JSON.parse(match[0]);
  if (ideas.length !== 5) throw new Error(`Strategy agent returned ${ideas.length} ideas, expected 5`);

  // Save to Airtable
  if (campaign.id) {
    const airtableIdeas: Omit<ContentIdea, 'id' | 'campaignId'>[] = ideas.map(idea => ({
      ideaTitle:          idea.title,
      angleAndHook:       `${idea.angle}\n\nHook: ${idea.hook}`,
      bestPlatform:       idea.bestPlatform as any,
      contentFormat:      idea.contentFormat as any,
      engagementPotential: idea.engagementPotential,
      trendingScore:      idea.trendingScore,
      notes:              `Engagement reason: ${idea.engagementReason}\nTrending: ${idea.trendingReason}`,
      selected:           false,
    }));

    await createContentIdeas(campaign.id, airtableIdeas);
  }

  return ideas;
}
