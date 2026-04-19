import { NextRequest, NextResponse } from 'next/server';
import { getCampaign, getContentPieces, updateContentPiece } from '@/lib/airtable';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = 'default';

  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign || campaign.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const pieces = await getContentPieces(id);
  return NextResponse.json({ pieces });
}
