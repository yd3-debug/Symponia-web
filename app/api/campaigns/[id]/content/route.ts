import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCampaign, getContentPieces, updateContentPiece } from '@/lib/airtable';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const campaign = await getCampaign(params.id);
  if (!campaign || campaign.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const pieces = await getContentPieces(params.id);
  return NextResponse.json({ pieces });
}
