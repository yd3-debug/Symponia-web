// ── Kie.ai Wrapper ─────────────────────────────────────────────────────────────
// Model marketplace API. Primary use: video generation via Seedance 2.
// Endpoints: POST /api/v1/jobs/createTask — GET /api/v1/jobs/recordInfo

const KIE_BASE = process.env.KIE_BASE_URL ?? 'https://api.kie.ai';

async function kieRequest(method: 'GET' | 'POST', path: string, body?: object): Promise<any> {
  const url = method === 'GET' && body
    ? `${KIE_BASE}${path}?${new URLSearchParams(body as any)}`
    : `${KIE_BASE}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: method === 'POST' && body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kie.ai error (${method} ${path}): ${res.status} ${err}`);
  }

  const json = await res.json();
  if (json.code !== 200) throw new Error(`Kie.ai API error: ${json.msg ?? json.code}`);
  return json.data;
}

// ── Task management ────────────────────────────────────────────────────────────

export interface KieTaskResult {
  taskId: string;
  state:  'waiting' | 'success' | 'fail';
  urls:   string[];
  failMsg?: string;
}

export async function kieCreateTask(opts: {
  model: string;
  input: Record<string, any>;
  callbackUrl?: string;
}): Promise<string> {
  const data = await kieRequest('POST', '/api/v1/jobs/createTask', {
    model:       opts.model,
    input:       opts.input,
    callBackUrl: opts.callbackUrl,
  });
  return data.taskId;
}

export async function kieGetTask(taskId: string): Promise<KieTaskResult> {
  const data = await kieRequest('GET', `/api/v1/jobs/recordInfo?taskId=${taskId}`);

  let urls: string[] = [];
  if (data.resultJson) {
    try {
      const parsed = JSON.parse(data.resultJson);
      urls = parsed.resultUrls ?? [];
    } catch {}
  }

  return { taskId: data.taskId, state: data.state, urls, failMsg: data.failMsg ?? undefined };
}

// Poll until state = success or fail (max 5 min, 5s interval)
export async function kiePoll(taskId: string): Promise<string> {
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const task = await kieGetTask(taskId);
    if (task.state === 'success') {
      if (!task.urls[0]) throw new Error(`Kie.ai task ${taskId} succeeded but returned no URL`);
      return task.urls[0];
    }
    if (task.state === 'fail') throw new Error(`Kie.ai task ${taskId} failed: ${task.failMsg ?? 'unknown'}`);
  }
  throw new Error(`Kie.ai task ${taskId} timed out after 5 minutes`);
}

// ── Seedance 2 video generation ───────────────────────────────────────────────
// Best-in-class for social media: 1080p, up to 15s, generates audio, accepts
// reference images for image-to-video (brand consistency).

export interface KieVideoResult {
  url:      string;
  taskId:   string;
  duration: number;
}

export async function generateKieVideo(opts: {
  prompt:            string;
  referenceImageUrl?: string;   // first-frame / style reference
  referenceVideoUrl?: string;   // motion style reference
  aspectRatio?:      '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  resolution?:       '480p' | '720p' | '1080p';
  duration?:         number;    // 4–15 seconds
  generateAudio?:    boolean;   // background music/ambient sound
  callbackUrl?:      string;
}): Promise<KieVideoResult> {
  const duration = Math.max(4, Math.min(15, opts.duration ?? 8));

  const input: Record<string, any> = {
    prompt:           opts.prompt,
    resolution:       opts.resolution       ?? '1080p',
    aspect_ratio:     opts.aspectRatio      ?? '9:16',
    duration,
    generate_audio:   opts.generateAudio    ?? true,
    nsfw_checker:     false,
    web_search:       false,
  };

  if (opts.referenceImageUrl) input.reference_image_urls = [opts.referenceImageUrl];
  if (opts.referenceVideoUrl) input.reference_video_urls = [opts.referenceVideoUrl];

  const taskId = await kieCreateTask({
    model:       'bytedance/seedance-2',
    input,
    callbackUrl: opts.callbackUrl,
  });

  // If callback provided, caller handles the result; just return taskId
  if (opts.callbackUrl) return { url: '', taskId, duration };

  const url = await kiePoll(taskId);
  return { url, taskId, duration };
}
