// ── /api/dashboard/generate ───────────────────────────────────────────────────
// Triggers the marketing team agent run (via n8n webhook or directly).
// Called by the dashboard "Generate" button.

import { NextRequest, NextResponse } from 'next/server';

const DASHBOARD_PASS  = process.env.DASHBOARD_PASSWORD;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

function checkAuth(req: NextRequest): boolean {
  if (!DASHBOARD_PASS) return true;
  const token = req.headers.get('x-dashboard-token');
  return token === DASHBOARD_PASS;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { platform = 'all', type = 'auto', topic = '' } = body;

  // If n8n is configured → forward to n8n webhook (non-blocking)
  if (N8N_WEBHOOK_URL) {
    try {
      fetch(`${N8N_WEBHOOK_URL}/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ platform, type, topic }),
      }).catch(() => {});

      return NextResponse.json({ ok: true, method: 'n8n', message: 'Agent team triggered via n8n' });
    } catch {
      // Fall through to direct message if n8n fails
    }
  }

  // No n8n → return instructions for CLI
  return NextResponse.json({
    ok: false,
    method: 'cli',
    message: 'n8n not configured. Run agents via CLI:',
    command: `npm run manager -- --platform=${platform} --type=${type}${topic ? ` --topic="${topic}"` : ''}`,
  });
}

// ── /api/dashboard/generate/schedule (POST) ────────────────────────────────────
// Schedules an approved post via Blotato through n8n

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { recordId, scheduledAt } = await req.json();
  if (!recordId || !scheduledAt) {
    return NextResponse.json({ error: 'recordId and scheduledAt required' }, { status: 400 });
  }

  if (N8N_WEBHOOK_URL) {
    try {
      const res = await fetch(`${N8N_WEBHOOK_URL}/schedule`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ recordId, scheduledAt }),
      });
      const data = await res.json();
      return NextResponse.json({ ok: true, ...data });
    } catch (err) {
      return NextResponse.json({ error: 'n8n schedule failed' }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: false, message: 'n8n not configured' });
}
