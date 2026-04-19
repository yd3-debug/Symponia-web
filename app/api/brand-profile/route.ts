import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getBrandProfile, upsertBrandProfile } from '@/lib/airtable';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await getBrandProfile(userId);
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const profile = await upsertBrandProfile({ ...body, userId });
  return NextResponse.json({ profile });
}
