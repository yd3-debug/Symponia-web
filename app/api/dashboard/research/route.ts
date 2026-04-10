// ── /api/dashboard/research ───────────────────────────────────────────────────
// Calls n8n /webhook/research synchronously and returns agent findings.
// Used by the Research tab to show trend data before committing to generation.

import { NextRequest, NextResponse } from 'next/server';

const DASHBOARD_USER = process.env.DASHBOARD_USERNAME ?? 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_PASSWORD;
const N8N_RESEARCH_URL = process.env.N8N_RESEARCH_URL
  ?? (process.env.N8N_WEBHOOK_URL ?? '').replace('/webhook/generate', '/webhook/research');

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

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const topic    = (body.topic    ?? '').trim();
  const platform = (body.platform ?? 'all').trim();

  if (!topic) return NextResponse.json({ error: 'topic required' }, { status: 400 });

  if (!N8N_RESEARCH_URL || N8N_RESEARCH_URL.endsWith('/webhook/')) {
    return NextResponse.json({ error: 'Research webhook not configured' }, { status: 503 });
  }

  try {
    const res = await fetch(N8N_RESEARCH_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ topic, platform, command: topic }),
      signal:  AbortSignal.timeout(25000),   // 25s max
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Research failed' }, { status: 502 });
  }
}
