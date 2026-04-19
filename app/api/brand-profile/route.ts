import { NextRequest, NextResponse } from 'next/server';
import { getBrandProfile, upsertBrandProfile } from '@/lib/airtable';

export async function GET() {
  const userId = 'default';

  const profile = await getBrandProfile(userId);
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const userId = 'default';

  const body = await req.json();
  const profile = await upsertBrandProfile({ ...body, userId });
  return NextResponse.json({ profile });
}
