// ── /api/dashboard/generate ───────────────────────────────────────────────────
// Triggers the marketing team agent run via n8n webhook.
// Returns { message, agents[] } so the Brief Orchestrator can show "Routed to:" tags.

import { NextRequest, NextResponse } from 'next/server';

const DASHBOARD_USER   = process.env.DASHBOARD_USERNAME ?? 'admin';
const DASHBOARD_PASS   = process.env.DASHBOARD_PASSWORD;
const N8N_WEBHOOK_URL  = process.env.N8N_WEBHOOK_URL;
const N8N_SCHEDULE_URL = process.env.N8N_SCHEDULE_URL;

function checkAuth(req: NextRequest): boolean {
  if (!DASHBOARD_PASS) return true;
  const token = req.headers.get('x-dashboard-token') ?? '';
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const colonIdx = decoded.indexOf(':');
    if (colonIdx === -1) return false;
    const user = decoded.slice(0, colonIdx);
    const pass = decoded.slice(colonIdx + 1);
    return user === DASHBOARD_USER && pass === DASHBOARD_PASS;
  } catch {
    return false;
  }
}

// Determine which agents are activated based on platform selection
function resolveAgents(platform: string): string[] {
  const always  = ['orchestrator', 'trends', 'copywriter', 'visual'];
  const byPlat: Record<string, string[]> = {
    instagram: ['instagram'],
    tiktok:    ['tiktok', 'video'],
    linkedin:  ['linkedin'],
    all:       ['instagram', 'tiktok', 'linkedin', 'video'],
  };
  return [...always, ...(byPlat[platform] ?? byPlat['all'])];
}

// Human-readable message from the Orchestrator
function orchestratorMessage(platform: string, command: string, topic: string): string {
  const plat = platform === 'all' ? 'all platforms' : platform.charAt(0).toUpperCase() + platform.slice(1);
  const subject = topic || command || 'the requested topic';
  const agents = resolveAgents(platform);

  const agentList = agents
    .filter(a => !['orchestrator', 'trends', 'copywriter', 'visual'].includes(a))
    .map(a => a.charAt(0).toUpperCase() + a.slice(1))
    .join(', ');

  return [
    `Briefing the team for ${plat}.`,
    `Trend Researcher is scanning for live signals around "${subject}".`,
    `Routing to: ${agentList || plat} Specialist${agents.length > 1 ? 's' : ''}.`,
    `Copywriter and Visual Director will refine the output before it reaches your queue.`,
    `Manager will score everything — minimum 6.0/10 to approve. Content will appear in your queue shortly.`,
  ].join(' ');
}

// ── POST: trigger agent team ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const command  = (body.command  ?? '').trim();
  const platform = (body.platform ?? 'all').trim();
  const type     = (body.type     ?? 'auto').trim();

  // Extract topic from command if not provided explicitly
  const topic = (body.topic ?? command).trim();

  const agents = resolveAgents(platform);

  if (N8N_WEBHOOK_URL) {
    // Fire n8n — non-blocking so dashboard doesn't wait for the full pipeline
    fetch(N8N_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ platform, type, topic, command }),
    }).catch(() => {});

    return NextResponse.json({
      ok:      true,
      method:  'n8n',
      message: orchestratorMessage(platform, command, topic),
      agents,
    });
  }

  // n8n not configured
  return NextResponse.json({
    ok:      false,
    method:  'cli',
    message: 'n8n not configured — run agents via CLI.',
    agents:  [],
    command: `npm run manager -- --platform=${platform} --type=${type}${topic ? ` --topic="${topic}"` : ''}`,
  });
}

// ── PUT: schedule an approved post via Blotato through n8n ────────────────────
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { recordId, scheduledAt } = await req.json();
  if (!recordId || !scheduledAt) {
    return NextResponse.json({ error: 'recordId and scheduledAt required' }, { status: 400 });
  }

  const scheduleUrl = N8N_SCHEDULE_URL || N8N_WEBHOOK_URL;
  if (!scheduleUrl) {
    return NextResponse.json({ ok: false, message: 'n8n not configured' });
  }

  try {
    const res  = await fetch(scheduleUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ recordId, scheduledAt }),
    });
    const data = await res.json();
    return NextResponse.json({ ok: true, ...data });
  } catch {
    return NextResponse.json({ error: 'n8n schedule failed' }, { status: 502 });
  }
}
