// ── Kling AI Wrapper ───────────────────────────────────────────────────────────
// High-quality video generation via Kling AI API.
// Used as the premium video option alongside fal.ai LTX.

const KLING_BASE = 'https://api.klingai.com/v1';

interface KlingVideoRequest {
  model_name?: string;
  prompt: string;
  negative_prompt?: string;
  image?: string;          // base64 or URL for image-to-video
  duration?: '5' | '10';  // seconds
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  mode?: 'std' | 'pro';
}

interface KlingVideoResponse {
  code: number;
  message: string;
  data: {
    task_id: string;
    task_status: string;
  };
}

interface KlingTaskResult {
  code: number;
  data: {
    task_id: string;
    task_status: 'submitted' | 'processing' | 'succeed' | 'failed';
    task_result?: {
      videos?: Array<{ id: string; url: string; duration: string }>;
    };
    task_status_msg?: string;
  };
}

async function klingRequest(method: 'GET' | 'POST', path: string, body?: object): Promise<any> {
  const res = await fetch(`${KLING_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.KLING_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kling API error: ${res.status} ${err}`);
  }

  return res.json();
}

// Poll until task is done (max 3 minutes)
async function pollKlingTask(taskId: string, isImageToVideo: boolean): Promise<string> {
  const endpoint = isImageToVideo
    ? `/videos/image2video/${taskId}`
    : `/videos/text2video/${taskId}`;

  const maxAttempts = 36; // 36 × 5s = 3 minutes
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const result: KlingTaskResult = await klingRequest('GET', endpoint);

    if (result.data.task_status === 'succeed') {
      const url = result.data.task_result?.videos?.[0]?.url;
      if (!url) throw new Error('Kling task succeeded but no video URL returned');
      return url;
    }

    if (result.data.task_status === 'failed') {
      throw new Error(`Kling task failed: ${result.data.task_status_msg ?? 'unknown error'}`);
    }
  }

  throw new Error('Kling video generation timed out after 3 minutes');
}

// ── Public API ─────────────────────────────────────────────────────────────────

export interface KlingVideoResult {
  url: string;
  taskId: string;
  duration: number;
}

export async function generateKlingVideo(opts: {
  prompt: string;
  imageUrl?: string;         // for image-to-video
  aspectRatio?: '16:9' | '9:16' | '1:1';
  duration?: 5 | 10;
  mode?: 'std' | 'pro';
}): Promise<KlingVideoResult> {
  const isImageToVideo = !!opts.imageUrl;
  const endpoint = isImageToVideo ? '/videos/image2video' : '/videos/text2video';

  const body: KlingVideoRequest = {
    model_name: 'kling-v2-master',
    prompt: opts.prompt,
    negative_prompt: 'blurry, low quality, distorted, text, watermark',
    aspect_ratio: opts.aspectRatio ?? '9:16',
    duration: String(opts.duration ?? 5) as '5' | '10',
    mode: opts.mode ?? 'std',
  };

  if (opts.imageUrl) body.image = opts.imageUrl;

  const response: KlingVideoResponse = await klingRequest('POST', endpoint, body);
  if (response.code !== 0) {
    throw new Error(`Kling task creation failed: ${response.message}`);
  }

  const taskId = response.data.task_id;
  const url = await pollKlingTask(taskId, isImageToVideo);

  return { url, taskId, duration: opts.duration ?? 5 };
}
