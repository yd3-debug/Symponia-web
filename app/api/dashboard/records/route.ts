// ── /api/dashboard/records ────────────────────────────────────────────────────
// Server-side Airtable proxy — keeps API key out of the browser.
// Supports GET (list/filter) and PATCH (update status, approve, reject).

import { NextRequest, NextResponse } from 'next/server';

const BASE_ID    = process.env.AIRTABLE_BASE_ID!;
const API_KEY    = process.env.AIRTABLE_API_KEY!;
const TABLE_NAME = process.env.AIRTABLE_TABLE ?? 'Marketing Queue';
const AIR_BASE   = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

const DASHBOARD_USER = process.env.DASHBOARD_USERNAME ?? 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_PASSWORD;

function airHeaders() {
  return {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type':  'application/json',
  };
}

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

// ── GET: list records, optionally filtered by status and/or platform ───────────
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!BASE_ID || !API_KEY) {
    return NextResponse.json({ error: 'Airtable not configured' }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const status   = searchParams.get('status');
  const platform = searchParams.get('platform');

  let formula = '';
  if (status && status !== 'all')       formula = `{Status} = "${status}"`;
  if (platform && platform !== 'all')   {
    const platF = `{Platform} = "${platform}"`;
    formula = formula ? `AND(${formula}, ${platF})` : platF;
  }

  const query = [
    formula ? `filterByFormula=${encodeURIComponent(formula)}` : '',
    'sort[0][field]=Generated%20At',
    'sort[0][direction]=desc',
    'maxRecords=100',
  ].filter(Boolean).join('&');

  const res = await fetch(`${AIR_BASE}?${query}`, { headers: airHeaders() });

  if (!res.ok) {
    const err = await res.text();
    // Never forward Airtable 401 as 401 — would log user out of dashboard
    return NextResponse.json({ error: err, records: [] }, { status: 200 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

// ── PATCH: update a record (approve, reject, schedule, etc.) ──────────────────
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, fields } = await req.json();
  if (!id || !fields) return NextResponse.json({ error: 'id and fields required' }, { status: 400 });

  const res = await fetch(`${AIR_BASE}/${id}`, {
    method:  'PATCH',
    headers: airHeaders(),
    body:    JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
