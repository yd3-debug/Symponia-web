// ── Kie.ai Wrapper ─────────────────────────────────────────────────────────────
// Full model library for images, videos, and utilities.
// Docs: https://docs.kie.ai  |  Models: https://kie.ai/market
//
// POPULARITY GUIDE (based on usage patterns & capabilities):
//   Images  ★★★ GPT-Image-1     — best for marketing, understands brand context
//           ★★★ Flux Pro Ultra  — best photorealism, exact dimensions
//           ★★  Ideogram v3     — best text-in-image (logos, quotes, overlays)
//           ★   Grok Imagine    — fast, good for concepts
//   Videos  ★★★ Seedance 2      — best quality, 15s, 1080p, audio, image-to-video
//           ★★★ Runway Gen-4 T  — fastest (~1 min), great for LinkedIn/YouTube
//           ★★  Veo 3.1         — Google quality, 1080p 16:9, no image-to-video
//           ★   Luma Ray 1.6    — good motion, image-to-video
//
// Default strategy:
//   TikTok / Reels  → Seedance 2 (9:16, 8s, audio on)
//   YouTube         → Runway Gen-4 Turbo (16:9, 10s, fast)
//   LinkedIn        → Seedance 2 (16:9, 8s, professional prompt)
//   All images      → GPT-Image-1 (quality) or Flux Ultra (exact size)

const KIE_BASE = (process.env.KIE_BASE_URL ?? 'https://api.kie.ai').replace(/\/$/, '');

// ── HTTP helpers ───────────────────────────────────────────────────────────────

async function kiePost(path: string, body: object): Promise<any> {
  const res = await fetch(`${KIE_BASE}${path}`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${process.env.KIE_API_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
    signal:  AbortSignal.timeout(30000),
  });
  const json = await res.json();
  if (!res.ok || json.code !== 200) throw new Error(`Kie.ai ${path}: ${json.msg ?? res.status}`);
  return json.data;
}

async function kieGet(path: string): Promise<any> {
  const res = await fetch(`${KIE_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.KIE_API_KEY}` },
    signal:  AbortSignal.timeout(15000),
  });
  const json = await res.json();
  if (!res.ok || json.code !== 200) throw new Error(`Kie.ai ${path}: ${json.msg ?? res.status}`);
  return json.data;
}

// ── Task status (shared by all models) ────────────────────────────────────────

export type KieState = 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';

export interface KieTask {
  taskId:   string;
  state:    KieState;
  urls:     string[];
  failMsg?: string;
  costMs?:  number;
}

export async function kieGetTask(taskId: string): Promise<KieTask> {
  const data = await kieGet(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);

  let urls: string[] = [];
  if (data.resultJson) {
    try {
      const parsed = typeof data.resultJson === 'string' ? JSON.parse(data.resultJson) : data.resultJson;
      urls = parsed.resultUrls ?? (parsed.url ? [parsed.url] : []);
    } catch {}
  }

  return {
    taskId:  data.taskId,
    state:   data.state,
    urls,
    failMsg: data.failMsg ?? undefined,
    costMs:  data.costTime ?? undefined,
  };
}

// Poll until success/fail — 5s interval, up to 5 minutes
export async function kiePoll(taskId: string, maxMinutes = 5): Promise<string> {
  const maxAttempts = maxMinutes * 12;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const task = await kieGetTask(taskId);
    if (task.state === 'success') {
      if (!task.urls[0]) throw new Error(`Kie task ${taskId}: success but no URL returned`);
      return task.urls[0];
    }
    if (task.state === 'fail') throw new Error(`Kie task ${taskId} failed: ${task.failMsg ?? 'unknown'}`);
  }
  throw new Error(`Kie task ${taskId} timed out after ${maxMinutes} minutes`);
}

// ── Account ────────────────────────────────────────────────────────────────────

export async function kieGetCredits(): Promise<number> {
  const data = await kieGet('/api/v1/chat/credit');
  return data.balance ?? 0;
}

// ── ★★★ IMAGE: GPT-Image-1 (ChatGPT 4o) ──────────────────────────────────────
// Best for: marketing visuals, brand context, product shots, lifestyle scenes.
// Understands nuanced prompts. Size limited to 1:1, 3:2, 2:3.

export interface KieImageResult {
  taskId: string;
  url:    string;
}

export async function kieGptImage(opts: {
  prompt:        string;
  size?:         '1:1' | '3:2' | '2:3';
  nVariants?:    1 | 2 | 4;
  referenceUrl?: string;   // for image editing / style transfer
  callbackUrl?:  string;
}): Promise<KieImageResult> {
  const body: Record<string, any> = {
    prompt:      opts.prompt,
    size:        opts.size      ?? '1:1',
    nVariants:   opts.nVariants ?? 1,
    isEnhance:   true,
    callBackUrl: opts.callbackUrl,
  };
  if (opts.referenceUrl) body.maskUrl = opts.referenceUrl;

  const data  = await kiePost('/api/v1/gpt-image/generate', body);
  const taskId = data.taskId;
  if (opts.callbackUrl) return { taskId, url: '' };
  const url = await kiePoll(taskId, 3);
  return { taskId, url };
}

// ── ★★ IMAGE: Nano Banana / General playground ─────────────────────────────────
// Best for: concept art, creative campaigns, stylised brand visuals.
// Supports model-specific parameters.

export async function kiePlaygroundImage(opts: {
  model:         string;   // e.g. 'ideogram/v3', 'grok/imagine', 'flux/pro-ultra'
  prompt:        string;
  size?:         string;   // e.g. 'landscape_16_9', 'square', 'portrait_9_16'
  extra?:        Record<string, any>;
  callbackUrl?:  string;
}): Promise<KieImageResult> {
  const data = await kiePost('/api/v1/playground/createTask', {
    model:       opts.model,
    prompt:      opts.prompt,
    size:        opts.size   ?? 'square',
    ...opts.extra,
    callBackUrl: opts.callbackUrl,
  });
  const taskId = data.taskId;
  if (opts.callbackUrl) return { taskId, url: '' };
  const url = await kiePoll(taskId, 3);
  return { taskId, url };
}

// ── ★★★ VIDEO: Seedance 2 ─────────────────────────────────────────────────────
// Best for: TikTok, Reels, LinkedIn. 1080p, up to 15s, generates audio.
// first_frame_url → image-to-video for brand consistency.
// Most popular for social media marketing content.

export interface KieVideoResult {
  taskId:   string;
  url:      string;
  duration: number;
}

export async function kieSeedance2(opts: {
  prompt:          string;
  firstFrameUrl?:  string;   // ← your generated brand image as first frame
  lastFrameUrl?:   string;
  referenceImages?: string[]; // up to 3, for style consistency
  aspectRatio?:    '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
  resolution?:     '480p' | '720p' | '1080p';
  duration?:       number;   // 4–15 seconds
  generateAudio?:  boolean;  // background music / ambient sound
  callbackUrl?:    string;
}): Promise<KieVideoResult> {
  const duration = Math.max(4, Math.min(15, opts.duration ?? 8));

  const input: Record<string, any> = {
    prompt:         opts.prompt,
    resolution:     opts.resolution  ?? '1080p',
    aspect_ratio:   opts.aspectRatio ?? '9:16',
    duration,
    generate_audio: opts.generateAudio ?? true,
    nsfw_checker:   false,
    web_search:     false,
  };
  if (opts.firstFrameUrl)   input.first_frame_url     = opts.firstFrameUrl;
  if (opts.lastFrameUrl)    input.last_frame_url      = opts.lastFrameUrl;
  if (opts.referenceImages) input.reference_image_urls = opts.referenceImages;

  const data   = await kiePost('/api/v1/jobs/createTask', { model: 'bytedance/seedance-2', input, callBackUrl: opts.callbackUrl });
  const taskId = data.taskId;
  if (opts.callbackUrl) return { taskId, url: '', duration };
  const url = await kiePoll(taskId);
  return { taskId, url, duration };
}

// ── ★★★ VIDEO: Runway Gen-4 Turbo ─────────────────────────────────────────────
// Best for: YouTube, LinkedIn. Generates in ~1 minute (5x faster than standard).
// 5 or 10 seconds. Consistent subjects across shots.

export async function kieRunway(opts: {
  prompt:       string;
  imageUrl?:    string;
  duration?:    5 | 10;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  quality?:     '720p' | '1080p';
  callbackUrl?: string;
}): Promise<KieVideoResult> {
  const duration = opts.duration ?? 5;
  const data = await kiePost('/api/v1/runway/generate', {
    prompt:      opts.prompt,
    imageUrl:    opts.imageUrl,
    duration,
    aspectRatio: opts.aspectRatio ?? '9:16',
    quality:     opts.quality     ?? '1080p',
    callBackUrl: opts.callbackUrl,
  });
  const taskId = data.taskId;
  if (opts.callbackUrl) return { taskId, url: '', duration };
  const url = await kiePoll(taskId, 3);
  return { taskId, url, duration };
}

// ── ★★ VIDEO: Veo 3.1 (Google) ────────────────────────────────────────────────
// Best for: cinematic 16:9 content, YouTube hero videos.
// No image-to-video — text-to-video only. 1080p HD.

export async function kieVeo(opts: {
  prompt:       string;
  model?:       'veo3' | 'veo3_fast';
  callbackUrl?: string;
}): Promise<KieVideoResult> {
  const data = await kiePost('/api/v1/veo/generate', {
    prompt:      opts.prompt,
    model:       opts.model      ?? 'veo3_fast',
    aspect_ratio: '16:9',
    callBackUrl: opts.callbackUrl,
  });
  const taskId = data.taskId;
  if (opts.callbackUrl) return { taskId, url: '', duration: 8 };
  const url = await kiePoll(taskId);
  return { taskId, url, duration: 8 };
}

// ── ★ VIDEO: Runway Aleph ──────────────────────────────────────────────────────
// Best for: transforming existing video (lighting, camera angle, environment).

export async function kieRunwayAleph(opts: {
  prompt:       string;
  videoUrl:     string;
  callbackUrl?: string;
}): Promise<KieVideoResult> {
  const data = await kiePost('/api/v1/runway/generate-aleph', {
    prompt:      opts.prompt,
    video_url:   opts.videoUrl,
    callBackUrl: opts.callbackUrl,
  });
  const taskId = data.taskId;
  if (opts.callbackUrl) return { taskId, url: '', duration: 0 };
  const url = await kiePoll(taskId, 3);
  return { taskId, url, duration: 0 };
}

// ── File upload (for reference images/videos) ──────────────────────────────────
// Upload local buffer → get Kie.ai hosted URL → use as firstFrameUrl / imageUrl.
// Uploaded files expire after 3 days.

export async function kieUploadFile(opts: {
  buffer:      Buffer;
  mimeType:    string;
  filename?:   string;
}): Promise<string> {
  const base64  = opts.buffer.toString('base64');
  const data    = await kiePost('/api/v1/files/upload-base64', {
    file:     base64,
    mimeType: opts.mimeType,
    filename: opts.filename ?? `upload.${opts.mimeType.split('/')[1]}`,
  });
  return data.fileUrl;
}
