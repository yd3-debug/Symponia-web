// ── /api/dashboard/upload ─────────────────────────────────────────────────────
// Accepts multipart form-data with a single "file" field.
// Saves to /public/uploads/ and returns the public URL.
// NOTE: On Netlify/Vercel, wire UPLOAD_BASE_URL env var to your CDN or
//       replace this handler with Vercel Blob / Cloudinary upload.

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DASHBOARD_USER = process.env.DASHBOARD_USERNAME ?? 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_PASSWORD;
const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL ?? '';          // e.g. https://yourdomain.com
const MAX_BYTES       = 8 * 1024 * 1024;                           // 8 MB hard cap

function checkAuth(req: NextRequest): boolean {
  if (!DASHBOARD_PASS) return true;
  const token = req.headers.get('x-dashboard-token') ?? '';
  try {
    const decoded  = Buffer.from(token, 'base64').toString('utf8');
    const colonIdx = decoded.indexOf(':');
    if (colonIdx === -1) return false;
    return decoded.slice(0, colonIdx) === DASHBOARD_USER && decoded.slice(colonIdx + 1) === DASHBOARD_PASS;
  } catch { return false; }
}

function safeName(original: string): string {
  const ts  = Date.now();
  const ext = original.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() ?? 'jpg';
  return `${ts}.${ext}`;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }); }

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are accepted' }, { status: 415 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 8 MB limit' }, { status: 413 });
  }

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const name   = safeName(file.name);

  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(join(uploadsDir, name), buffer);

  const base = UPLOAD_BASE_URL.replace(/\/$/, '');
  const url  = `${base}/uploads/${name}`;

  return NextResponse.json({ ok: true, url, name });
}
