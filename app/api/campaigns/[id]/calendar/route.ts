import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCampaign, getCalendarEntries } from '@/lib/airtable';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign || campaign.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const entries = await getCalendarEntries(id);
  return NextResponse.json({ entries });
}
