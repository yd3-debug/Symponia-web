// ── Video Agent ────────────────────────────────────────────────────────────────
// Generates platform video clips via Kie.ai (default) or fal.ai.
//
// Model routing:
//   TikTok, Instagram Reels → Seedance 2 (9:16, 8s, audio)       ★ most viral
//   YouTube, LinkedIn       → Runway Gen-4 Turbo (16:9, 10s, fast)
//   Fallback                → fal.ai Kling v2 Master
//
// Callback URL is preferred over polling — Kie.ai POSTs result to our webhook.

import { generateVideo, buildMotionPrompt }           from '../fal';
import { kieSeedance2, kieRunway }                    from '../kei';
import { uploadToStorage, updateJobStatus }            from '../supabase';
import { updateContentPiece, updateAirtableJob }       from '../airtable';
import { PLATFORM_VIDEO_SPECS, PLATFORM_SPECS, type PlatformSpecKey } from '../platform-specs';
import type { Campaign } from '../airtable';

export type VideoProvider = 'kie' | 'fal';

export interface VideoGenerationResult {
  platformSpecKey: PlatformSpecKey;
  url:         string;
  storagePath: string;
  width:       number;
  height:      number;
  duration:    number;
  provider:    VideoProvider;
  model:       string;
}

// Platform-to-model routing
const VERTICAL_PLATFORMS = new Set(['TikTok', 'Instagram', 'Facebook', 'Pinterest']);

function pickModel(platform: string): 'seedance2' | 'runway' {
  return VERTICAL_PLATFORMS.has(platform) ? 'seedance2' : 'runway';
}

const ASPECT_MAP: Record<string, '16:9' | '9:16' | '1:1' | '4:3' | '3:4'> = {
  '16:9': '16:9', '9:16': '9:16', '1:1': '1:1', '4:3': '4:3', '3:4': '3:4',
};

export async function generateVideosForContent(opts: {
  campaign:        Campaign;
  contentPieceId:  string;
  sourceImageUrl:  string;   // static image → first frame of video
  contentMessage:  string;
  platforms:       string[];
  provider?:       VideoProvider;
  callbackBase?:   string;   // e.g. https://yourdomain.com — enables callback mode
  supabaseJobId?:  string;
  airtableJobId?:  string;
}): Promise<VideoGenerationResult[]> {
  const {
    campaign, contentPieceId, sourceImageUrl, contentMessage,
    platforms, supabaseJobId, airtableJobId,
  } = opts;
  const provider = opts.provider ?? 'kie';
  const results: VideoGenerationResult[] = [];

  const specKeys: PlatformSpecKey[] = [];
  for (const platform of platforms) specKeys.push(...(PLATFORM_VIDEO_SPECS[platform] ?? []));
  if (specKeys.length === 0) return results;

  if (supabaseJobId) await updateJobStatus(supabaseJobId, { status: 'processing' }).catch(() => {});
  if (airtableJobId) await updateAirtableJob(airtableJobId, { status: 'Processing' }).catch(() => {});

  for (const specKey of specKeys) {
    const spec = PLATFORM_SPECS[specKey];
    if (spec.format !== 'video') continue;

    const motionPrompt = buildMotionPrompt(campaign.tone, platforms[0] ?? 'Instagram');
    const fullPrompt   = `${motionPrompt}. ${contentMessage}`;
    const ratio        = ASPECT_MAP[spec.ratio] ?? '9:16';
    const callbackUrl  = opts.callbackBase
      ? `${opts.callbackBase}/api/webhooks/kie`
      : undefined;

    try {
      let videoUrl: string;
      let duration: number;
      let model: string;

      if (provider === 'kie') {
        const kieModel = pickModel(platforms[0] ?? 'Instagram');

        if (kieModel === 'seedance2') {
          model = 'kie/seedance-2';
          const result = await kieSeedance2({
            prompt:         fullPrompt,
            firstFrameUrl:  sourceImageUrl,
            aspectRatio:    ratio,
            resolution:     '1080p',
            duration:       8,
            generateAudio:  true,
            callbackUrl,
          });
          videoUrl = result.url;
          duration = result.duration;
        } else {
          model = 'kie/runway-gen4-turbo';
          const result = await kieRunway({
            prompt:       fullPrompt,
            imageUrl:     sourceImageUrl,
            duration:     10,
            aspectRatio:  ratio,
            quality:      '1080p',
            callbackUrl,
          });
          videoUrl = result.url;
          duration = result.duration;
        }

        // Callback mode — Kie.ai will POST result to our webhook; nothing to upload yet
        if (callbackUrl) {
          if (supabaseJobId) {
            await updateJobStatus(supabaseJobId, { status: 'processing' }).catch(() => {});
          }
          continue;
        }
      } else {
        model = 'fal/kling-v2-master';
        const result = await generateVideo({
          imageUrl:        sourceImageUrl,
          platformSpecKey: specKey,
          motionPrompt:    fullPrompt,
          duration:        8,
        });
        videoUrl = result.url;
        duration = result.duration;
      }

      // Download and upload to Supabase Storage
      const res         = await fetch(videoUrl);
      const buffer      = Buffer.from(await res.arrayBuffer());
      const storagePath = `${campaign.id}/${contentPieceId}/${specKey}_${duration}s.mp4`;
      const publicUrl   = await uploadToStorage('generated-videos', storagePath, buffer, 'video/mp4');

      results.push({ platformSpecKey: specKey, url: publicUrl, storagePath, width: spec.width, height: spec.height, duration, provider, model });

    } catch (err) {
      console.error(`[Video Agent] ${provider} failed for ${specKey}:`, err);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  if (results.length > 0) {
    await updateContentPiece(contentPieceId, {
      generatedVideoUrls: JSON.stringify(
        results.map(r => ({ platformSpecKey: r.platformSpecKey, url: r.url, width: r.width, height: r.height, duration: r.duration })),
      ),
    }).catch(() => {});
  }

  const finalStatus = results.length > 0 ? 'done' : 'failed';
  if (supabaseJobId) await updateJobStatus(supabaseJobId, { status: finalStatus, asset_url: results[0]?.url }).catch(() => {});
  if (airtableJobId) await updateAirtableJob(airtableJobId, { status: finalStatus === 'done' ? 'Done' : 'Failed', assetUrl: results[0]?.url }).catch(() => {});

  return results;
}
