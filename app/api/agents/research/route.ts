import { NextResponse } from 'next/server';
import { getCampaign } from '@/lib/airtable';
import { runResearchAgent } from '@/lib/agents/research-agent';

export async function POST(req: Request) {
  const userId = 'default';

  try {
    const { campaignId } = await req.json();
    const campaign = await getCampaign(campaignId);
    if (campaign.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const research = await runResearchAgent(campaign);
    return NextResponse.json({ research });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
