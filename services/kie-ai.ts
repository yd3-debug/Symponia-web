// ── Kie.ai Service ────────────────────────────────────────────────────────────
// Handles image and video generation via Kie.ai API
// Docs: https://kie.ai/docs (verify endpoints in your account dashboard)

import dotenv from 'dotenv';
dotenv.config();

const KIE_API_KEY  = process.env.KIE_API_KEY!;
const KIE_BASE_URL = process.env.KIE_BASE_URL || 'https://api.kie.ai/v1';

// ── Types ─────────────────────────────────────────────────────────────────────

export type KieAspectRatio = '9:16' | '1:1' | '4:5' | '16:9';
export type KieModel = 'flux-pro' | 'flux-dev' | 'sd3' | 'midjourney-style';
export type KieVideoModel = 'kling-pro' | 'wan-pro' | 'hailuo';

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: KieAspectRatio;
  model?: KieModel;
  stylePreset?: string;
  numImages?: number;
}

export interface VideoGenerationRequest {
  prompt: string;
  imageUrl?: string;         // optional: use an image as the first frame
  aspectRatio?: KieAspectRatio;
  model?: KieVideoModel;
  duration?: 5 | 10;        // seconds
  motionStrength?: number;   // 0–1
}

export interface KieGenerationResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrls?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

// ── Symponia-specific default settings ────────────────────────────────────────

const SYMPONIA_NEGATIVE_PROMPT =
  'bright colors, cheerful, cute, cartoon, stock photo, generic, watermark, text, ' +
  'busy background, neon, garish, low quality, blurry, pixelated';

const PLATFORM_ASPECT: Record<string, KieAspectRatio> = {
  instagram_reel:     '9:16',
  instagram_carousel: '1:1',
  instagram_static:   '4:5',
  tiktok:             '9:16',
  linkedin:           '4:5',
};

// ── Core API helpers ──────────────────────────────────────────────────────────

async function kieRequest(endpoint: string, body: object): Promise<any> {
  const res = await fetch(`${KIE_BASE_URL}${endpoint}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${KIE_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kie.ai API error ${res.status}: ${err}`);
  }

  return res.json();
}

async function kieGet(endpoint: string): Promise<any> {
  const res = await fetch(`${KIE_BASE_URL}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${KIE_API_KEY}` },
  });

  if (!res.ok) throw new Error(`Kie.ai GET error ${res.status}`);
  return res.json();
}

// ── Image generation ──────────────────────────────────────────────────────────

export async function generateImage(req: ImageGenerationRequest): Promise<KieGenerationResult> {
  const data = await kieRequest('/images/generate', {
    prompt:          req.prompt,
    negative_prompt: req.negativePrompt ?? SYMPONIA_NEGATIVE_PROMPT,
    aspect_ratio:    req.aspectRatio ?? '9:16',
    model:           req.model ?? 'flux-pro',
    style_preset:    req.stylePreset,
    num_images:      req.numImages ?? 1,
  });

  return {
    jobId:  data.job_id ?? data.id,
    status: data.status ?? 'pending',
    imageUrls: data.image_urls ?? data.images,
  };
}

// ── Video generation ──────────────────────────────────────────────────────────

export async function generateVideo(req: VideoGenerationRequest): Promise<KieGenerationResult> {
  const data = await kieRequest('/videos/generate', {
    prompt:          req.prompt,
    image_url:       req.imageUrl,
    aspect_ratio:    req.aspectRatio ?? '9:16',
    model:           req.model ?? 'kling-pro',
    duration:        req.duration ?? 5,
    motion_strength: req.motionStrength ?? 0.5,
  });

  return {
    jobId:  data.job_id ?? data.id,
    status: data.status ?? 'pending',
  };
}

// ── Poll until complete ───────────────────────────────────────────────────────

export async function pollUntilComplete(
  jobId: string,
  type: 'image' | 'video' = 'image',
  maxWaitMs = 180_000,
  intervalMs = 4_000
): Promise<KieGenerationResult> {
  const endpoint = type === 'image' ? `/images/jobs/${jobId}` : `/videos/jobs/${jobId}`;
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    const data = await kieGet(endpoint);
    const status = data.status;

    if (status === 'completed') {
      return {
        jobId,
        status: 'completed',
        imageUrls:    data.image_urls ?? data.images,
        videoUrl:     data.video_url  ?? data.video,
        thumbnailUrl: data.thumbnail_url,
      };
    }

    if (status === 'failed') {
      return { jobId, status: 'failed', error: data.error ?? 'Generation failed' };
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }

  return { jobId, status: 'failed', error: `Timed out after ${maxWaitMs / 1000}s` };
}

// ── High-level helpers for each platform ─────────────────────────────────────

export async function generateForInstagramReel(prompt: string): Promise<KieGenerationResult> {
  const job = await generateImage({ prompt, aspectRatio: '9:16', model: 'flux-pro' });
  return pollUntilComplete(job.jobId, 'image');
}

export async function generateForInstagramCarousel(prompt: string): Promise<KieGenerationResult> {
  const job = await generateImage({ prompt, aspectRatio: '1:1', model: 'flux-pro', numImages: 1 });
  return pollUntilComplete(job.jobId, 'image');
}

export async function generateForTikTok(prompt: string): Promise<KieGenerationResult> {
  const job = await generateImage({ prompt, aspectRatio: '9:16', model: 'flux-pro' });
  return pollUntilComplete(job.jobId, 'image');
}

export async function generateForLinkedIn(prompt: string): Promise<KieGenerationResult> {
  const job = await generateImage({ prompt, aspectRatio: '4:5', model: 'flux-pro' });
  return pollUntilComplete(job.jobId, 'image');
}

// ── Animate a still image → short video ──────────────────────────────────────
// Great for turning a generated image into a TikTok or Reel asset

export async function animateImage(imageUrl: string, prompt: string): Promise<KieGenerationResult> {
  const job = await generateVideo({
    prompt,
    imageUrl,
    model:          'kling-pro',
    duration:       5,
    motionStrength: 0.5,
  });
  return pollUntilComplete(job.jobId, 'video');
}
