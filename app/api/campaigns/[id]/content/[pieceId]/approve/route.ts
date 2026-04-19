import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCampaign, updateContentPiece } from '@/lib/airtable';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; pieceId: string } },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const campaign = await getCampaign(params.id);
  if (!campaign || campaign.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const piece = await updateContentPiece(params.pieceId, {
    status: 'Approved',
    approvedAt: new Date().toISOString(),
  });

  return NextResponse.json({ piece });
}
