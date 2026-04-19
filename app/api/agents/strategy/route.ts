import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCampaign, getResearchReport } from '@/lib/airtable';
import { runStrategyAgent } from '@/lib/agents/strategy-agent';
import type { ResearchOutput } from '@/lib/agents/research-agent';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { campaignId, research } = await req.json();
    const campaign = await getCampaign(campaignId);
    if (campaign.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Allow research to be passed directly or fetched from Airtable
    let researchData: ResearchOutput = research;
    if (!researchData) {
      const stored = await getResearchReport(campaignId);
      if (!stored) return NextResponse.json({ error: 'No research report found. Run research first.' }, { status: 400 });
      researchData = {
        trendingTopics:     JSON.parse(stored.trendingTopics),
        redditInsights:     JSON.parse(stored.redditInsights),
        seoKeywords:        JSON.parse(stored.seoKeywords),
        competitorAnalysis: JSON.parse(stored.competitorAnalysis),
      } as ResearchOutput;
    }

    const ideas = await runStrategyAgent(campaign, researchData);
    return NextResponse.json({ ideas });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
