// ── Kie.ai Wrapper ─────────────────────────────────────────────────────────────
// Visual generation via Kie.ai. Env: KIE_API_KEY, KIE_BASE_URL.
// Uses async callback pattern — pass callbackUrl to receive results via webhook.

const KIE_BASE = process.env.KIE_BASE_URL ?? '';

async function kieRequest(method: 'GET' | 'POST', path: string, body?: object): Promise<any> {
  const res = await fetch(`${KIE_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kie.ai error (${method} ${path}): ${res.status} ${err}`);
  }

  return res.json();
}

export interface KieGenerationResult {
  id: string;
  status: 'submitted' | 'processing' | 'succeed' | 'failed';
  url?: string;
}

// Trigger a generation — Kie.ai calls callbackUrl when done
export async function kieGenerate(opts: {
  prompt: string;
  imageUrl?: string;
  type?: 'image' | 'video';
  aspectRatio?: '1:1' | '9:16' | '16:9' | '4:5';
  duration?: number;
  callbackUrl?: string;
}): Promise<KieGenerationResult> {
  const res = await kieRequest('POST', '/api/v1/generate', {
    prompt:       opts.prompt,
    image_url:    opts.imageUrl,
    type:         opts.type ?? 'image',
    aspect_ratio: opts.aspectRatio ?? '1:1',
    duration:     opts.duration,
    callBackUrl:  opts.callbackUrl,
  });

  return {
    id:     res.id ?? res.task_id,
    status: res.status ?? 'submitted',
    url:    res.url ?? res.output_url,
  };
}

// Poll for result (when not using callback)
export async function kieGetResult(id: string): Promise<KieGenerationResult> {
  const res = await kieRequest('GET', `/api/v1/tasks/${id}`);
  return {
    id,
    status: res.status ?? res.task_status,
    url:    res.url ?? res.output_url ?? res.task_result?.url,
  };
}

// Poll until done (max 3 min)
export async function kiePollUntilDone(id: string): Promise<string> {
  for (let i = 0; i < 36; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const result = await kieGetResult(id);
    if (result.status === 'succeed' && result.url) return result.url;
    if (result.status === 'failed') throw new Error(`Kie.ai task ${id} failed`);
  }
  throw new Error(`Kie.ai task ${id} timed out after 3 minutes`);
}
