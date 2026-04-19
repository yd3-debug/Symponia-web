import { NextResponse } from 'next/server';
import { getCampaign, getResearchReport, getContentIdeas } from '@/lib/airtable';
import { runStrategyAgent } from '@/lib/agents/strategy-agent';
import type { ResearchOutput } from '@/lib/agents/research-agent';

export async function POST(req: Request) {
  const userId = 'default';
  try {
    const { campaignId, research, refresh } = await req.json();
    const campaign = await getCampaign(campaignId);
    if (campaign.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Return cached ideas unless caller wants a refresh
    if (!refresh) {
      const cached = await getContentIdeas(campaignId);
      if (cached.length > 0) {
        const ideas = cached.map(idea => ({
          title:               idea.ideaTitle,
          angle:               idea.angleAndHook,
          hook:                idea.angleAndHook,
          bestPlatform:        idea.bestPlatform,
          contentFormat:       idea.contentFormat,
          engagementPotential: idea.engagementPotential,
          engagementReason:    '',
          trendingScore:       idea.trendingScore,
          trendingReason:      '',
        }));
        return NextResponse.json({ ideas, cached: true });
      }
    }

    // Build research data
    let researchData: ResearchOutput = research;
    if (!researchData) {
      const stored = await getResearchReport(campaignId);
      if (!stored) return NextResponse.json({ error: 'Run research first.' }, { status: 400 });
      researchData = {
        trendingTopics:     JSON.parse(stored.trendingTopics),
        redditInsights:     JSON.parse(stored.redditInsights),
        seoKeywords:        JSON.parse(stored.seoKeywords),
        competitorAnalysis: JSON.parse(stored.competitorAnalysis),
        summary:            '',
      } as ResearchOutput;
    }

    const ideas = await runStrategyAgent(campaign, researchData);
    return NextResponse.json({ ideas });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
