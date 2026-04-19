import { NextResponse } from 'next/server';
import { uploadToStorage } from '@/lib/supabase';

export async function POST(req: Request) {
  const userId = 'default';

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const campaignId = formData.get('campaignId') as string;
    const bucket = (formData.get('bucket') as string) || 'reference-images';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    const allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowed.includes(ext)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });

    const path = `${userId}/${campaignId ?? 'brand'}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToStorage(bucket as any, path, buffer, file.type);

    return NextResponse.json({ url, path });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
