// ── fal.ai Wrapper ─────────────────────────────────────────────────────────────
// All fal.ai image and video generation calls go through here.
// Models: Flux Pro 1.1 Ultra (images), Kling v2 Master (videos).

import { PLATFORM_SPECS, type PlatformSpecKey } from './platform-specs';

const FAL_BASE = 'https://fal.run';

async function falPost(model: string, input: Record<string, any>): Promise<any> {
  const res = await fetch(`${FAL_BASE}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${process.env.FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
    signal: AbortSignal.timeout(120000), // 2 min for video generation
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`fal.ai error (${model}): ${res.status} ${err}`);
  }

  return res.json();
}

// ── Image generation ──────────────────────────────────────────────────────────
// Primary: Flux Pro 1.1 Ultra — sharper, more photorealistic, better colors.
// With reference: flux-pro/v1.1-ultra supports image_prompt_strength natively.

export interface FalImageResult {
  url: string;
  width: number;
  height: number;
  platformSpecKey: PlatformSpecKey;
}

export async function generateImage(opts: {
  prompt: string;
  platformSpecKey: PlatformSpecKey;
  referenceImageUrl?: string;
  referenceStrength?: number; // 0–1, default 0.65
}): Promise<FalImageResult> {
  const spec = PLATFORM_SPECS[opts.platformSpecKey];

  const input: Record<string, any> = {
    prompt: opts.prompt,
    image_size: { width: spec.width, height: spec.height },
    num_images: 1,
    output_format: 'jpeg',
    safety_tolerance: '5',
    raw: true, // photorealistic mode
  };

  if (opts.referenceImageUrl) {
    input.image_prompt = opts.referenceImageUrl;
    input.image_prompt_strength = opts.referenceStrength ?? 0.65;
  }

  const result = await falPost('fal-ai/flux-pro/v1.1-ultra', input);

  const image = Array.isArray(result.images) ? result.images[0] : result.image;
  if (!image?.url) throw new Error(`fal.ai returned no image URL for ${opts.platformSpecKey}`);

  return { url: image.url, width: spec.width, height: spec.height, platformSpecKey: opts.platformSpecKey };
}

export async function generateImagesForPlatforms(opts: {
  prompt: string;
  platformSpecKeys: PlatformSpecKey[];
  referenceImageUrl?: string;
}): Promise<FalImageResult[]> {
  const results = await Promise.allSettled(
    opts.platformSpecKeys.map(key =>
      generateImage({ prompt: opts.prompt, platformSpecKey: key, referenceImageUrl: opts.referenceImageUrl }),
    ),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<FalImageResult> => r.status === 'fulfilled')
    .map(r => r.value);
}

// ── Video generation ──────────────────────────────────────────────────────────
// Primary: Kling v2 Master via fal.ai — cinematic, 1080p, most realistic motion.
// Fallback: Minimax Hailuo (faster, good for TikTok-style rapid cuts).

export interface FalVideoResult {
  url: string;
  width: number;
  height: number;
  duration: number;
  platformSpecKey: PlatformSpecKey;
  model: string;
}

export async function generateVideo(opts: {
  imageUrl: string;
  platformSpecKey: PlatformSpecKey;
  motionPrompt: string;
  duration?: number;
}): Promise<FalVideoResult> {
  const spec = PLATFORM_SPECS[opts.platformSpecKey];
  if (spec.format !== 'video') throw new Error(`${opts.platformSpecKey} is not a video spec`);

  const targetDuration = opts.duration ?? 5;
  const klingDuration  = targetDuration <= 5 ? '5' : '10';

  // Kling v2 Master: cinematic quality, ideal for viral social content
  const model = 'fal-ai/kling-video/v2/master/image-to-video';
  const input: Record<string, any> = {
    image_url:    opts.imageUrl,
    prompt:       opts.motionPrompt,
    duration:     klingDuration,
    aspect_ratio: spec.ratio,
  };

  let result: any;
  try {
    result = await falPost(model, input);
  } catch {
    // Fallback to Minimax Hailuo if Kling is unavailable
    result = await falPost('fal-ai/minimax/video-01', {
      first_frame_image: opts.imageUrl,
      prompt:            opts.motionPrompt,
    });
  }

  const videoUrl = result.video?.url ?? result.url;
  if (!videoUrl) throw new Error(`fal.ai returned no video URL for ${opts.platformSpecKey}`);

  return {
    url:             videoUrl,
    width:           spec.width,
    height:          spec.height,
    duration:        parseInt(klingDuration),
    platformSpecKey: opts.platformSpecKey,
    model,
  };
}

export async function generateVideosForPlatforms(opts: {
  imageUrl: string;
  motionPrompt: string;
  platformSpecKeys: PlatformSpecKey[];
}): Promise<FalVideoResult[]> {
  const results: FalVideoResult[] = [];

  for (const key of opts.platformSpecKeys) {
    const spec = PLATFORM_SPECS[key];
    if (spec.format !== 'video') continue;

    try {
      const video = await generateVideo({
        imageUrl:    opts.imageUrl,
        platformSpecKey: key,
        motionPrompt: opts.motionPrompt,
        duration:    5,
      });
      results.push(video);
    } catch (err) {
      console.error(`[fal] Video failed for ${key}:`, err);
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  return results;
}

// ── Prompt builders ────────────────────────────────────────────────────────────

// Platform-aware image prompt optimised for scroll-stopping marketing visuals
export function buildImagePrompt(opts: {
  platformSpecKey: PlatformSpecKey;
  contentMessage: string;
  brandTone: string;
  visualStyle?: string;
}): string {
  const spec = PLATFORM_SPECS[opts.platformSpecKey];

  const platformGuidance: Record<string, string> = {
    instagram_feed_square:    'eye-catching lifestyle shot, perfect square composition, vibrant colors, Instagram aesthetic',
    instagram_feed_portrait:  'editorial portrait framing, 4:5 ratio, premium feel, fashion-forward',
    instagram_story:          'full-screen vertical, bold colors, designed for 9:16 swipe-up moment',
    instagram_reels_cover:    'dynamic vertical thumbnail, high contrast, face or product prominent',
    tiktok_video_cover:       'vertical thumbnail built for Gen Z — raw, authentic, high-energy',
    linkedin_landscape:       'clean professional scene, natural light, aspirational workplace or brand moment',
    linkedin_portrait:        'confident portrait or product hero, corporate premium aesthetic',
    twitter_landscape:        'bold horizontal composition, punchy visual with clear focal point',
    youtube_short_cover:      'vertical thumbnail, expressive face or bold product, Netflix-level composition',
    youtube_thumbnail:        'high-contrast 16:9 thumbnail, text safe zones clear, face + emotion + brand',
    facebook_feed:            'warm lifestyle photography, family or community feel, Facebook-native',
    pinterest_pin:            'tall editorial pin, aspirational aesthetic, white space for text overlay',
  };

  const guidance = platformGuidance[opts.platformSpecKey] ?? `optimised for ${spec.label}`;

  return [
    `Scroll-stopping marketing visual: ${guidance}.`,
    `Subject / message: ${opts.contentMessage}.`,
    `Brand tone: ${opts.brandTone}.`,
    opts.visualStyle ? `Visual style: ${opts.visualStyle}.` : '',
    'Photorealistic, ultra-high quality, professional photography or CGI.',
    'No text, no logos, no watermarks. Leave clean space for copy overlay.',
    'Shot on medium format, perfect exposure, cinematic color grade.',
  ].filter(Boolean).join(' ');
}

// Platform-specific motion designed to maximise retention and replays
export function buildMotionPrompt(tone: string, platform: string): string {
  const motionMap: Record<string, string> = {
    TikTok:    'quick zoom burst, energetic parallax layers, punchy 24fps feel — stops the scroll',
    Instagram: 'smooth cinematic zoom-in, gentle light leak, Ken Burns with depth — premium feel',
    LinkedIn:  'slow confident push-in, subtle depth-of-field shift, authoritative and calm',
    YouTube:   'dramatic wide reveal, steady dolly pull-back, then slow push toward subject',
    Facebook:  'warm gentle float, lifestyle camera movement, relaxed and inviting',
    Pinterest: 'slow vertical pan upward, airy aesthetic, graceful transitions',
  };
  const motion = motionMap[platform] ?? 'smooth cinematic motion, slow atmospheric zoom';
  return `${motion}. Tone: ${tone.toLowerCase()}. 30fps, buttery smooth, no shake, ambient particle light.`;
}
