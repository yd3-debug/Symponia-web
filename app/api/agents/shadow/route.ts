import { NextResponse } from 'next/server';
import { getCampaign } from '@/lib/airtable';
import { runShadowAgent } from '@/lib/agents/shadow-agent';

export async function POST(req: Request) {
  try {
    const { campaignId, platform, contentBody } = await req.json();
    if (!campaignId || !platform || !contentBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const campaign = await getCampaign(campaignId);
    const shadowWork = await runShadowAgent(campaign, platform, contentBody);
    return NextResponse.json({ shadowWork });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
