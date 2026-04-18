// ── Research Agent ─────────────────────────────────────────────────────────────
// Uses Exa.ai to mine Reddit, web, and competitor content.
// Returns structured JSON with trending topics, Reddit insights, SEO keywords,
// and competitor analysis. Saves results to Airtable Research Reports table.

import Anthropic from '@anthropic-ai/sdk';
import { runResearch } from '../exa';
import { createResearchReport, type Campaign } from '../airtable';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a world-class digital marketing researcher specialising in content intelligence.
You receive raw research data from Exa.ai and synthesise it into actionable insights.
Your job: find what is ACTUALLY trending, what pain points the audience has, and which content angles have viral potential.
Always return valid JSON. Be specific, not generic.`;

export interface ResearchOutput {
  trendingTopics: Array<{
    topic: string;
    why: string;
    contentAngle: string;
    viralPotential: 'High' | 'Medium' | 'Low';
    source: string;
  }>;
  redditInsights: Array<{
    painPoint: string;
    audienceQuote: string;
    contentOpportunity: string;
  }>;
  seoKeywords: Array<{
    keyword: string;
    searchIntent: string;
    difficulty: 'Low' | 'Medium' | 'High';
    opportunity: 'High' | 'Medium' | 'Low';
  }>;
  competitorAnalysis: Array<{
    competitor: string;
    strength: string;
    gap: string;
    opportunity: string;
  }>;
  summary: string;
}

export async function runResearchAgent(campaign: Campaign): Promise<ResearchOutput> {
  // Step 1: Pull raw data from Exa
  const raw = await runResearch({
    niche: campaign.productOrService,
    targetAudience: campaign.targetAudience,
    competitors: campaign.competitors,
    platforms: campaign.platforms,
  });

  // Step 2: Claude synthesises raw data into structured insights
  const userMessage = `
Campaign Brief:
- Brand: ${campaign.brandName}
- Product/Service: ${campaign.productOrService}
- Target Audience: ${campaign.targetAudience}
- Platforms: ${campaign.platforms.join(', ')}
- Goal: ${campaign.goal}
- Competitors: ${campaign.competitors ?? 'none provided'}

Raw Research Data:
TRENDING TOPICS:
${raw.trendingTopics.map(t => `- ${t.topic}: ${t.snippet}`).join('\n')}

REDDIT INSIGHTS:
${raw.redditInsights.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

SEO SIGNALS:
${raw.seoKeywords.slice(0, 10).map(k => `- "${k.keyword}": ${k.context}`).join('\n')}

COMPETITOR CONTENT:
${raw.competitorInsights.map(c => `- ${c.name}: "${c.headline}" — ${c.snippet}`).join('\n')}

Synthesise this into actionable marketing intelligence. Return ONLY valid JSON:
{
  "trendingTopics": [
    { "topic": "", "why": "", "contentAngle": "", "viralPotential": "High|Medium|Low", "source": "" }
  ],
  "redditInsights": [
    { "painPoint": "", "audienceQuote": "", "contentOpportunity": "" }
  ],
  "seoKeywords": [
    { "keyword": "", "searchIntent": "", "difficulty": "Low|Medium|High", "opportunity": "High|Medium|Low" }
  ],
  "competitorAnalysis": [
    { "competitor": "", "strength": "", "gap": "", "opportunity": "" }
  ],
  "summary": "2-3 sentence strategic summary"
}

Return 5 trending topics, 4 Reddit insights, 10 SEO keywords, and all competitor data found.`;

  const msg = await claude.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const rawText = (msg.content[0] as any).text;
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Research agent returned no valid JSON');

  const output: ResearchOutput = JSON.parse(match[0]);

  // Step 3: Save to Airtable
  if (campaign.id) {
    await createResearchReport({
      campaignId:         campaign.id,
      trendingTopics:     JSON.stringify(output.trendingTopics),
      redditInsights:     JSON.stringify(output.redditInsights),
      seoKeywords:        JSON.stringify(output.seoKeywords),
      competitorAnalysis: JSON.stringify(output.competitorAnalysis),
      rawExaResults:      JSON.stringify(raw.raw.slice(0, 20)), // cap size
    });
  }

  return output;
}
