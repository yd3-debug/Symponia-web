import { NextResponse } from 'next/server';
import { getCampaign, getResearchReport } from '@/lib/airtable';
import { streamPlatformContent } from '@/lib/agents/content-agent';
import type { StrategyIdea } from '@/lib/agents/strategy-agent';
import type { ResearchOutput } from '@/lib/agents/research-agent';

// Streaming endpoint — returns Server-Sent Events
export async function POST(req: Request) {
  const userId = 'default';

  const { campaignId, idea, platform }: { campaignId: string; idea: StrategyIdea; platform: string } = await req.json();
  const campaign = await getCampaign(campaignId);
  if (campaign.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const contentStream = await streamPlatformContent(campaign, idea, platform);
  return new Response(contentStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
