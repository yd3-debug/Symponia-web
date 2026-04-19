// ── Kie.ai Callback Webhook ────────────────────────────────────────────────────
// Kie.ai POSTs here when a generation task completes (success or fail).
// Updates Supabase job → realtime pushes new status to dashboard UI instantly.
// Must return 200 within 15s. Idempotent — same taskId may arrive 3+ times.

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, updateJobStatus } from '@/lib/supabase';
import type { KieState } from '@/lib/kei';

interface KieCallback {
  taskId:     string;
  state:      KieState;
  model?:     string;
  resultJson?: string | { resultUrls?: string[]; url?: string };
  failCode?:  number;
  failMsg?:   string;
}

function extractUrl(resultJson: KieCallback['resultJson']): string | undefined {
  if (!resultJson) return undefined;
  try {
    const parsed = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
    return parsed.resultUrls?.[0] ?? parsed.url ?? undefined;
  } catch { return undefined; }
}

export async function POST(req: NextRequest) {
  let body: KieCallback;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { taskId, state, resultJson, failMsg } = body;
  if (!taskId || !state) return NextResponse.json({ ok: false, error: 'Missing taskId or state' }, { status: 400 });

  const supabase = createSupabaseServerClient();

  // Find the Supabase job that corresponds to this Kie task
  const { data: jobs } = await (supabase as any)
    .from('generation_jobs')
    .select('id, status')
    .eq('kie_task_id', taskId)
    .limit(1);

  const job = jobs?.[0] as { id: string; status: string } | undefined;
  if (!job) {
    // Unknown task — may be a retry for an already-deleted job, ignore gracefully
    return NextResponse.json({ ok: true, note: 'task not found, ignored' });
  }

  // Skip if already in a terminal state (idempotency)
  if (job.status === 'done' || job.status === 'failed') {
    return NextResponse.json({ ok: true, note: 'already terminal' });
  }

  const assetUrl = extractUrl(resultJson);
  const newStatus = state === 'success' ? 'done' : state === 'fail' ? 'failed' : 'processing';

  await updateJobStatus(job.id, {
    status:    newStatus,
    asset_url: assetUrl,
    error:     state === 'fail' ? (failMsg ?? 'Generation failed') : undefined,
  });

  return NextResponse.json({ ok: true });
}
