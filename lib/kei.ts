// ── Kie.ai Complete Model Library ─────────────────────────────────────────────
// 40+ models: images, video, audio, utilities.
// Base URL: https://api.kie.ai  |  Docs: https://docs.kie.ai
// Auth: Authorization: Bearer KIE_API_KEY
//
// ★★★ = most popular / best results for viral marketing
// ★★  = strong choice for specific use cases
// ★   = niche / specialist use
//
// QUICK PICKS:
//   Best image (marketing)  → kieFluxKontext()   ★★★ edit+generate, brand-safe
//   Best image (quality)    → kieNanaBananaPro() ★★★ Gemini 3.0, 4K, text-perfect
//   Best image (fast)       → kieGptImage()       ★★★ ChatGPT 4o, understands context
//   Best video (TikTok)     → kieSeedance2()      ★★★ 15s, 1080p, audio, I2V
//   Best video (fast)       → kieRunway()         ★★★ Runway Gen-4 Turbo, ~1 min
//   Best video (cinematic)  → kieKling3()         ★★★ Kling 3.0 pro, 1080p, multi-shot
//   Best video (Google)     → kieVeo3()           ★★  1080p 16:9, native audio
//   Background music        → kieSuno()           ★★★ Suno V5, 8 min tracks
//   Voiceover               → kieElevenLabsTTS()  ★★★ 70+ languages

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

// Generic task creator for models that use /api/v1/jobs/createTask
async function kieTask(model: string, input: Record<string, any>, callbackUrl?: string): Promise<string> {
  const data = await kiePost('/api/v1/jobs/createTask', { model, input, callBackUrl: callbackUrl });
  return data.taskId;
}

// ── Task status (shared by ALL models) ────────────────────────────────────────

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
      const p = typeof data.resultJson === 'string' ? JSON.parse(data.resultJson) : data.resultJson;
      urls = p.resultUrls ?? (p.url ? [p.url] : []);
    } catch {}
  }
  return { taskId: data.taskId, state: data.state, urls, failMsg: data.failMsg, costMs: data.costTime };
}

export async function kiePoll(taskId: string, maxMinutes = 5): Promise<string> {
  for (let i = 0; i < maxMinutes * 12; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const t = await kieGetTask(taskId);
    if (t.state === 'success') {
      if (!t.urls[0]) throw new Error(`Kie task ${taskId}: success but no URL`);
      return t.urls[0];
    }
    if (t.state === 'fail') throw new Error(`Kie task ${taskId} failed: ${t.failMsg ?? 'unknown'}`);
  }
  throw new Error(`Kie task ${taskId} timed out after ${maxMinutes}min`);
}

// ── Utilities ──────────────────────────────────────────────────────────────────

export async function kieGetCredits(): Promise<number> {
  const data = await kieGet('/api/v1/chat/credit');
  return data.balance ?? 0;
}

export async function kieDownloadUrl(url: string): Promise<string> {
  const data = await kiePost('/api/v1/common/download-url', { url });
  return data.downloadUrl;
}

export async function kieUploadBase64(buffer: Buffer, mimeType: string, filename?: string): Promise<string> {
  const data = await kiePost('/api/v1/files/upload-base64', {
    file:     buffer.toString('base64'),
    mimeType,
    filename: filename ?? `upload.${mimeType.split('/')[1]}`,
  });
  return data.fileUrl;
}

// ── Shared result types ────────────────────────────────────────────────────────

export interface KieImageResult { taskId: string; url: string }
export interface KieVideoResult { taskId: string; url: string; duration: number }

async function resolveTask(taskId: string, callbackUrl?: string, duration = 0): Promise<KieVideoResult> {
  if (callbackUrl) return { taskId, url: '', duration };
  const url = await kiePoll(taskId);
  return { taskId, url, duration };
}

async function resolveImageTask(taskId: string, callbackUrl?: string): Promise<KieImageResult> {
  if (callbackUrl) return { taskId, url: '' };
  const url = await kiePoll(taskId, 3);
  return { taskId, url };
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

// ── ★★★ Flux Kontext (Black Forest Labs) ──────────────────────────────────────
// Best for: Brand image editing, product on background, consistent style edits.
// Killer feature: inputImage param = edit existing images precisely.
// Supports: 21:9, 16:9, 4:3, 1:1, 3:4, 9:16

export async function kieFluxKontext(opts: {
  prompt:       string;
  inputImage?:  string;        // URL — triggers edit mode
  model?:       'flux-kontext-pro' | 'flux-kontext-max';
  aspectRatio?: '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16';
  outputFormat?: 'jpeg' | 'png';
  callbackUrl?: string;
}): Promise<KieImageResult> {
  const data = await kiePost('/api/v1/flux/kontext/generate', {
    prompt:             opts.prompt,
    model:              opts.model        ?? 'flux-kontext-pro',
    aspect_ratio:       opts.aspectRatio  ?? '1:1',
    outputFormat:       opts.outputFormat ?? 'jpeg',
    inputImage:         opts.inputImage,
    enableTranslation:  true,
    promptUpsampling:   true,
    callBackUrl:        opts.callbackUrl,
  });
  return resolveImageTask(data.taskId, opts.callbackUrl);
}

// ── ★★★ GPT-Image-1 / 4o Image (OpenAI) ──────────────────────────────────────
// Best for: Marketing visuals that need deep brand context understanding.
// Natural language prompt understanding. Size: 1:1, 3:2, 2:3.

export async function kieGptImage(opts: {
  prompt:        string;
  size?:         '1:1' | '3:2' | '2:3';
  nVariants?:    1 | 2 | 4;
  quality?:      'standard' | 'hd';
  callbackUrl?:  string;
}): Promise<KieImageResult> {
  const data = await kiePost('/api/v1/gpt-image/generate', {
    prompt:      opts.prompt,
    size:        opts.size      ?? '1:1',
    nVariants:   opts.nVariants ?? 1,
    quality:     opts.quality   ?? 'standard',
    isEnhance:   true,
    callBackUrl: opts.callbackUrl,
  });
  return resolveImageTask(data.taskId, opts.callbackUrl);
}

// ── ★★★ Nano Banana Pro (Gemini 3.0 Pro) ──────────────────────────────────────
// Best for: 4K marketing assets, perfect text rendering, complex brand scenes.
// Accepts up to 8 reference images. 1K/2K/4K output.

export async function kieNanaBananaPro(opts: {
  prompt:         string;
  referenceUrls?: string[];    // up to 8 images for style/product consistency
  aspectRatio?:   '1:1' | '2:3' | '3:2' | '4:3' | '16:9' | '9:16';
  resolution?:    '1K' | '2K' | '4K';
  outputFormat?:  'PNG' | 'JPG';
  callbackUrl?:   string;
}): Promise<KieImageResult> {
  const taskId = await kieTask('nano-banana-pro', {
    prompt:        opts.prompt,
    image_input:   opts.referenceUrls,
    aspect_ratio:  opts.aspectRatio ?? '1:1',
    resolution:    opts.resolution  ?? '2K',
    output_format: opts.outputFormat ?? 'JPG',
    nsfw_checker:  false,
  }, opts.callbackUrl);
  return resolveImageTask(taskId, opts.callbackUrl);
}

// ── ★★ Seedream 4.5 (ByteDance) ───────────────────────────────────────────────
// Best for: 4K product visuals, consistent lighting, bilingual text in image.
// Edit variant accepts up to 10 reference images.

export async function kieSeedream(opts: {
  prompt:         string;
  referenceUrls?: string[];
  imageSize?:     'square' | 'portrait_4_3' | 'portrait_9_16' | 'landscape_16_9';
  resolution?:    '1K' | '2K' | '4K';
  model?:         'seedream-4.5' | 'seedream-4.5-edit' | 'seedream-4.0';
  seed?:          number;
  callbackUrl?:   string;
}): Promise<KieImageResult> {
  const taskId = await kieTask(opts.model ?? 'seedream-4.5', {
    prompt:           opts.prompt,
    image_urls:       opts.referenceUrls,
    image_size:       opts.imageSize   ?? 'square',
    image_resolution: opts.resolution  ?? '2K',
    max_images:       1,
    seed:             opts.seed,
    nsfw_checker:     false,
  }, opts.callbackUrl);
  return resolveImageTask(taskId, opts.callbackUrl);
}

// ── ★★ Ideogram V3 ────────────────────────────────────────────────────────────
// Best for: Text-in-image (logos, quote cards, announcement graphics, overlays).
// The #1 model for readable text inside images.

export async function kieIdeogram(opts: {
  prompt:         string;
  mode?:          'text-to-image' | 'image-edit' | 'remix' | 'reframe';
  referenceUrl?:  string;
  aspectRatio?:   '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  style?:         string;
  negativePrompt?: string;
  callbackUrl?:   string;
}): Promise<KieImageResult> {
  const taskId = await kieTask(`ideogram/v3/${opts.mode ?? 'text-to-image'}`, {
    prompt:          opts.prompt,
    image_url:       opts.referenceUrl,
    aspect_ratio:    opts.aspectRatio ?? '1:1',
    style:           opts.style,
    negative_prompt: opts.negativePrompt,
  }, opts.callbackUrl);
  return resolveImageTask(taskId, opts.callbackUrl);
}

// ── ★★ Qwen Image 2.0 (Alibaba) ───────────────────────────────────────────────
// Best for: Infographics, slides, posters, structured layouts, readable text.
// Leaderboard: #3 text-to-image, #2 image edit on AI Arena.

export async function kieQwenImage(opts: {
  prompt:       string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  callbackUrl?: string;
}): Promise<KieImageResult> {
  const taskId = await kieTask('qwen-image-2.0', {
    prompt:       opts.prompt,
    aspect_ratio: opts.aspectRatio ?? '1:1',
    nsfw_checker: false,
  }, opts.callbackUrl);
  return resolveImageTask(taskId, opts.callbackUrl);
}

// ── ★ Z-Image (Tongyi-MAI) ────────────────────────────────────────────────────
// Best for: Photorealistic product/lifestyle, fast turbo mode.

export async function kieZImage(opts: {
  prompt:       string;
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  callbackUrl?: string;
}): Promise<KieImageResult> {
  const taskId = await kieTask('z-image', {
    prompt:       opts.prompt,
    aspect_ratio: opts.aspectRatio ?? '1:1',
    nsfw_checker: false,
  }, opts.callbackUrl);
  return resolveImageTask(taskId, opts.callbackUrl);
}

// ── ★ Grok Imagine (xAI) ──────────────────────────────────────────────────────
// Best for: Fast concept exploration, expressive/artistic styles.

export async function kieGrokImage(opts: {
  prompt:       string;
  aspectRatio?: '2:3' | '3:2' | '1:1' | '16:9' | '9:16';
  pro?:         boolean;
  callbackUrl?: string;
}): Promise<KieImageResult> {
  const taskId = await kieTask('grok-imagine/text-to-image', {
    prompt:       opts.prompt,
    aspect_ratio: opts.aspectRatio ?? '1:1',
    enable_pro:   opts.pro ?? false,
    nsfw_checker: false,
  }, opts.callbackUrl);
  return resolveImageTask(taskId, opts.callbackUrl);
}

// ── ★ Midjourney ──────────────────────────────────────────────────────────────
// Best for: Highly stylised, art-driven aesthetics, imaginative brand visuals.

export async function kieMidjourney(opts: {
  prompt:       string;
  version?:     'v7' | 'v1';
  callbackUrl?: string;
}): Promise<KieImageResult> {
  const taskId = await kieTask(`midjourney/${opts.version ?? 'v7'}`, {
    prompt: opts.prompt,
  }, opts.callbackUrl);
  return resolveImageTask(taskId, opts.callbackUrl);
}

// ── Image utilities ────────────────────────────────────────────────────────────

export async function kieUpscaleImage(opts: { url: string; model?: 'recraft' | 'topaz'; imageType?: 'portrait' | 'product' | 'illustration' | 'ai-art' }): Promise<KieImageResult> {
  const taskId = await kieTask(opts.model === 'topaz' ? 'topaz/image-upscale' : 'recraft/crisp-upscale', {
    image_url:  opts.url,
    image_type: opts.imageType ?? 'product',
  });
  return resolveImageTask(taskId);
}

export async function kieRemoveBackground(opts: { url: string }): Promise<KieImageResult> {
  const taskId = await kieTask('recraft/remove-background', { image_url: opts.url });
  return resolveImageTask(taskId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

// ── ★★★ Seedance 2 (ByteDance) ────────────────────────────────────────────────
// Best for: TikTok, Instagram Reels. 1080p, up to 15s, native audio, I2V.
// first_frame_url = your brand image → on-brand consistent video every time.

export async function kieSeedance2(opts: {
  prompt:           string;
  firstFrameUrl?:   string;    // brand image as first frame (image-to-video)
  lastFrameUrl?:    string;
  referenceImages?: string[];  // up to 3 style references
  aspectRatio?:     '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
  resolution?:      '480p' | '720p' | '1080p';
  duration?:        number;    // 4–15 seconds
  generateAudio?:   boolean;
  callbackUrl?:     string;
}): Promise<KieVideoResult> {
  const duration = Math.max(4, Math.min(15, opts.duration ?? 8));
  const input: Record<string, any> = {
    prompt:          opts.prompt,
    resolution:      opts.resolution   ?? '1080p',
    aspect_ratio:    opts.aspectRatio  ?? '9:16',
    duration,
    generate_audio:  opts.generateAudio ?? true,
    nsfw_checker:    false,
    web_search:      false,
  };
  if (opts.firstFrameUrl)   input.first_frame_url      = opts.firstFrameUrl;
  if (opts.lastFrameUrl)    input.last_frame_url       = opts.lastFrameUrl;
  if (opts.referenceImages) input.reference_image_urls = opts.referenceImages;
  const taskId = await kieTask('bytedance/seedance-2', input, opts.callbackUrl);
  return resolveTask(taskId, opts.callbackUrl, duration);
}

// ── ★★★ Kling 3.0 (Kuaishou) ─────────────────────────────────────────────────
// Best for: Premium marketing clips, multi-shot sequences, product hero videos.
// pro mode = 1080p. Supports element references (logos, products in shots).

export async function kieKling3(opts: {
  prompt:          string;
  imageUrls?:      string[];   // first/last frame references
  aspectRatio?:    '16:9' | '9:16' | '1:1';
  duration?:       number;     // 3–15 seconds
  mode?:           'std' | 'pro';
  sound?:          boolean;
  multiShots?:     boolean;
  elementRefs?:    string[];   // product/logo element images (2–4 each)
  callbackUrl?:    string;
}): Promise<KieVideoResult> {
  const duration = Math.max(3, Math.min(15, opts.duration ?? 8));
  const taskId = await kieTask('kling-3.0/video', {
    prompt:          opts.prompt,
    image_urls:      opts.imageUrls,
    aspect_ratio:    opts.aspectRatio ?? '9:16',
    duration,
    mode:            opts.mode     ?? 'pro',
    sound:           opts.sound    ?? true,
    multi_shots:     opts.multiShots ?? false,
    kling_elements:  opts.elementRefs,
    nsfw_checker:    false,
  }, opts.callbackUrl);
  return resolveTask(taskId, opts.callbackUrl, duration);
}

// ── ★★★ Runway Gen-4 Turbo ────────────────────────────────────────────────────
// Best for: YouTube, LinkedIn. ~1 min generation. 5 or 10 seconds. Fast.
// Note: 10s videos cannot use 1080p.

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
    quality:     duration === 10 ? '720p' : (opts.quality ?? '1080p'),
    callBackUrl: opts.callbackUrl,
  });
  return resolveTask(data.taskId, opts.callbackUrl, duration);
}

// ── ★★★ Hailuo 02 (Minimax) ──────────────────────────────────────────────────
// Best for: Realistic physics, advanced camera moves (pans, zooms, tracking).
// Strong prompt adherence. 1080p. 6 or 10 seconds.

export async function kieHailuo(opts: {
  prompt:          string;
  imageUrl?:       string;
  endImageUrl?:    string;
  duration?:       6 | 10;
  mode?:           'pro' | 'standard';
  callbackUrl?:    string;
}): Promise<KieVideoResult> {
  const duration = opts.duration ?? 6;
  const model = `hailuo-02/${opts.mode ?? 'pro'}/image-to-video`;
  const taskId = await kieTask(model, {
    prompt:            opts.prompt,
    image_url:         opts.imageUrl,
    end_image_url:     opts.endImageUrl,
    duration,
    prompt_optimizer:  true,
    nsfw_checker:      false,
  }, opts.callbackUrl);
  return resolveTask(taskId, opts.callbackUrl, duration);
}

// ── ★★ Wan 2.7 (Alibaba) ─────────────────────────────────────────────────────
// Best for: Character-driven storytelling, lip sync, multi-shot 1080p.
// T2V, I2V, R2V (reference-based), Video Edit. Up to 15 seconds.

export async function kieWan(opts: {
  prompt:       string;
  imageUrl?:    string;
  duration?:    5 | 10 | 15;
  resolution?:  '720p' | '1080p';
  model?:       'wan-2.7' | 'wan-2.6' | 'wan-2.5';
  callbackUrl?: string;
}): Promise<KieVideoResult> {
  const duration = opts.duration ?? 10;
  const taskId = await kieTask(opts.model ?? 'wan-2.7', {
    prompt:      opts.prompt,
    image_url:   opts.imageUrl,
    duration,
    resolution:  opts.resolution ?? '1080p',
  }, opts.callbackUrl);
  return resolveTask(taskId, opts.callbackUrl, duration);
}

// ── ★★ Veo 3.1 (Google) ───────────────────────────────────────────────────────
// Best for: Cinematic 16:9 YouTube hero content. 1080p. Native audio.
// Text-to-video only (no I2V). Extended duration beyond 8s.

export async function kieVeo3(opts: {
  prompt:       string;
  model?:       'veo3' | 'veo3_fast' | 'veo3_quality';
  resolution?:  '720p' | '1080p' | '4K';
  ratio?:       '16:9' | '9:16';
  callbackUrl?: string;
}): Promise<KieVideoResult> {
  const data = await kiePost('/api/v1/veo3/generate', {
    prompt:      opts.prompt,
    model:       opts.model      ?? 'veo3_fast',
    resolution:  opts.resolution ?? '1080p',
    ratio:       opts.ratio      ?? '16:9',
    callBackUrl: opts.callbackUrl,
  });
  return resolveTask(data.taskId, opts.callbackUrl, 8);
}

// ── ★★ Sora 2 (OpenAI) ────────────────────────────────────────────────────────
// Best for: Creative storytelling, multi-scene storyboards (up to 25s).
// 60% cheaper than OpenAI direct. T2V + I2V. Native audio 10–15s.

export async function kieSora2(opts: {
  prompt:       string;
  imageUrl?:    string;
  model?:       'sora-2' | 'sora-2-pro' | 'sora-2-pro-hd' | 'sora-2-storyboard';
  duration?:    10 | 15 | 25;
  callbackUrl?: string;
}): Promise<KieVideoResult> {
  const duration = opts.duration ?? 10;
  const taskId = await kieTask(opts.model ?? 'sora-2', {
    prompt:    opts.prompt,
    image_url: opts.imageUrl,
    duration,
  }, opts.callbackUrl);
  return resolveTask(taskId, opts.callbackUrl, duration);
}

// ── ★ Kling 2.5 Turbo (Kuaishou) ─────────────────────────────────────────────
// Best for: Cost-effective I2V, social media, fluid motion. 5 or 10 seconds.

export async function kieKling25(opts: {
  prompt:          string;
  imageUrl?:       string;
  tailImageUrl?:   string;
  duration?:       5 | 10;
  aspectRatio?:    '16:9' | '9:16' | '1:1';
  negativePrompt?: string;
  callbackUrl?:    string;
}): Promise<KieVideoResult> {
  const duration = opts.duration ?? 5;
  const model = opts.imageUrl ? 'kling-2.5-turbo/image-to-video' : 'kling-2.5-turbo/text-to-video';
  const taskId = await kieTask(model, {
    prompt:          opts.prompt,
    image_url:       opts.imageUrl,
    tail_image_url:  opts.tailImageUrl,
    duration,
    aspect_ratio:    opts.aspectRatio   ?? '9:16',
    negative_prompt: opts.negativePrompt,
    cfg_scale:       0.5,
    nsfw_checker:    false,
  }, opts.callbackUrl);
  return resolveTask(taskId, opts.callbackUrl, duration);
}

// ── ★ Runway Aleph ────────────────────────────────────────────────────────────
// Best for: Transforming existing video (relighting, scene edits, VFX, camera angles).

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
  return resolveTask(data.taskId, opts.callbackUrl, 0);
}

// ── ★ Grok Video (xAI) ────────────────────────────────────────────────────────
// Best for: Quick concept videos, character animation, synchronized audio.

export async function kieGrokVideo(opts: {
  prompt:       string;
  imageUrl?:    string;
  mode?:        'text-to-video' | 'image-to-video';
  callbackUrl?: string;
}): Promise<KieVideoResult> {
  const model = opts.imageUrl ? 'grok-imagine/image-to-video' : 'grok-imagine/text-to-video';
  const taskId = await kieTask(model, {
    prompt:    opts.prompt,
    image_url: opts.imageUrl,
  }, opts.callbackUrl);
  return resolveTask(taskId, opts.callbackUrl, 8);
}

// ── Video utilities ────────────────────────────────────────────────────────────

export async function kieUpscaleVideo(opts: { url: string }): Promise<KieVideoResult> {
  const taskId = await kieTask('topaz/video-upscale', { video_url: opts.url });
  return resolveTask(taskId, undefined, 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

// ── ★★★ Suno Music ────────────────────────────────────────────────────────────
// Best for: Background music for videos, brand jingles, viral audio hooks.
// V5: up to 8 min tracks, superior musicality.

export interface SunoResult { taskId: string; audioUrl: string; coverUrl?: string }

export async function kieSuno(opts: {
  prompt:       string;
  style?:       string;      // e.g. 'upbeat electronic pop' or 'cinematic orchestral'
  title?:       string;
  model?:       'V3_5' | 'V4' | 'V4_5' | 'V5' | 'V5_5';
  instrumental?: boolean;    // true = no vocals
  callbackUrl?: string;
}): Promise<SunoResult> {
  const data = await kiePost('/api/v1/generate', {
    prompt:       opts.prompt,
    style:        opts.style,
    title:        opts.title,
    model:        opts.model       ?? 'V5',
    customMode:   !!(opts.style || opts.title),
    instrumental: opts.instrumental ?? true,
    callBackUrl:  opts.callbackUrl,
  });

  if (opts.callbackUrl) return { taskId: data.taskId, audioUrl: '' };

  // Suno has its own status endpoint
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const status = await kieGet(`/api/v1/generate/record-info?taskId=${data.taskId}`);
    if (status.status === 'SUCCESS') {
      return { taskId: data.taskId, audioUrl: status.audioUrl ?? status.url ?? '', coverUrl: status.coverUrl };
    }
    if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'SENSITIVE_WORD_ERROR'].includes(status.status)) {
      throw new Error(`Suno failed: ${status.status}`);
    }
  }
  throw new Error('Suno timed out');
}

// Extend an existing Suno track
export async function kieSunoExtend(opts: { taskId: string; prompt?: string }): Promise<SunoResult> {
  const data = await kiePost('/api/v1/generate/extend', { taskId: opts.taskId, prompt: opts.prompt });
  return { taskId: data.taskId, audioUrl: '' };
}

// ── ★★★ ElevenLabs Text-to-Speech ─────────────────────────────────────────────
// Best for: Voiceovers, narration, ad scripts. 70+ languages.

export interface TtsResult { taskId: string; audioUrl: string }

export async function kieElevenLabsTTS(opts: {
  text:         string;
  voiceId?:     string;   // ElevenLabs voice ID
  language?:    string;   // e.g. 'en', 'es', 'fr'
  callbackUrl?: string;
}): Promise<TtsResult> {
  const data = await kiePost('/api/v1/elevenlabs-tts', {
    text:        opts.text,
    voice_id:    opts.voiceId,
    language:    opts.language ?? 'en',
    callBackUrl: opts.callbackUrl,
  });
  if (opts.callbackUrl) return { taskId: data.taskId, audioUrl: '' };
  const url = await kiePoll(data.taskId, 2);
  return { taskId: data.taskId, audioUrl: url };
}

// ── ★★ ElevenLabs Speech-to-Text ──────────────────────────────────────────────
// Best for: Transcribing recorded content, captions, multi-speaker diarization.

export async function kieTranscribe(opts: { audioUrl: string; language?: string }): Promise<{ transcript: string }> {
  const data = await kiePost('/api/v1/elevenlabs-stt', {
    audio_url: opts.audioUrl,
    language:  opts.language ?? 'en',
  });
  return { transcript: data.transcript ?? data.text ?? '' };
}

// ── ★★ ElevenLabs Sound Effects ───────────────────────────────────────────────
// Best for: 30-second royalty-free sound effects at 48 kHz.

export async function kieSoundEffect(opts: { prompt: string; duration?: number }): Promise<{ audioUrl: string }> {
  const data = await kiePost('/api/v1/elevenlabs-sound-effect', {
    prompt:   opts.prompt,
    duration: Math.min(30, opts.duration ?? 5),
  });
  const url = await kiePoll(data.taskId, 2);
  return { audioUrl: url };
}
