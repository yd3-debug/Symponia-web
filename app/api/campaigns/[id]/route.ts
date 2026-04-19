import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCampaign, updateCampaign } from '@/lib/airtable';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const campaign = await getCampaign(params.id);
    if (campaign.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ campaign });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const campaign = await updateCampaign(params.id, body);
    return NextResponse.json({ campaign });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
