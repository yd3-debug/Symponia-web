// ── /api/dashboard/login ─────────────────────────────────────────────────────
// Validates username + password, returns a session token on success.

import { NextRequest, NextResponse } from 'next/server';

const VALID_USER = process.env.DASHBOARD_USERNAME ?? 'admin';
const VALID_PASS = process.env.DASHBOARD_PASSWORD;

export async function POST(req: NextRequest) {
  if (!VALID_PASS) {
    // No password configured — open in dev mode, return a dummy token
    return NextResponse.json({ ok: true, token: 'dev' });
  }

  const { username, password } = await req.json();

  if (username === VALID_USER && password === VALID_PASS) {
    // Token is simply username:password — verified server-side on every request
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return NextResponse.json({ ok: true, token });
  }

  return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
}
