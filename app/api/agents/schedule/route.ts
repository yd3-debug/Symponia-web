import { NextResponse } from 'next/server';
import { getCampaign } from '@/lib/airtable';
import { scheduleApprovedContent } from '@/lib/agents/scheduler-agent';

export async function POST(req: Request) {
  const userId = 'default';

  try {
    const { campaignId, contentPieceIds } = await req.json();
    const campaign = await getCampaign(campaignId);
    if (campaign.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const results = await scheduleApprovedContent({ campaign, contentPieceIds });
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
