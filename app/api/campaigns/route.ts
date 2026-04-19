import { NextResponse } from 'next/server';
import { createCampaign, getCampaignsByUser } from '@/lib/airtable';

export async function GET() {
  const userId = 'default';

  try {
    const campaigns = await getCampaignsByUser(userId);
    return NextResponse.json({ campaigns });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = 'default';

  try {
    const body = await req.json();
    const campaign = await createCampaign({ ...body, userId, status: 'Brief' });
    return NextResponse.json({ campaign });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
