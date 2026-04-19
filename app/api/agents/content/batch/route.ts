// ── Batch Content Generation ───────────────────────────────────────────────────
// Runs content generation for multiple ideas × all campaign platforms.
// Fire-and-forget: returns immediately, generation runs in background.

import { NextResponse } from 'next/server';
import { getCampaign, getResearchReport, updateCampaignStatus } from '@/lib/airtable';
import { runContentAgent } from '@/lib/agents/content-agent';
import type { StrategyIdea } from '@/lib/agents/strategy-agent';
import type { ResearchOutput } from '@/lib/agents/research-agent';

export async function POST(req: Request) {
  try {
    const { campaignId, ideas }: { campaignId: string; ideas: StrategyIdea[] } = await req.json();
    if (!campaignId || !ideas?.length) {
      return NextResponse.json({ error: 'Missing campaignId or ideas' }, { status: 400 });
    }

    const campaign = await getCampaign(campaignId);

    const stored = await getResearchReport(campaignId);
    if (!stored) return NextResponse.json({ error: 'Run research first.' }, { status: 400 });

    const research: ResearchOutput = {
      trendingTopics:     JSON.parse(stored.trendingTopics),
      redditInsights:     JSON.parse(stored.redditInsights),
      seoKeywords:        JSON.parse(stored.seoKeywords),
      competitorAnalysis: JSON.parse(stored.competitorAnalysis),
      summary:            '',
    } as ResearchOutput;

    // Fire-and-forget: run in background, don't block response
    (async () => {
      try {
        for (const idea of ideas) {
          await runContentAgent(campaign, idea, research);
        }
        await updateCampaignStatus(campaignId, 'Content');
      } catch (err) {
        console.error('[Batch Content] Background error:', err);
      }
    })();

    return NextResponse.json({ status: 'started', count: ideas.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
