// ── Video Agent ────────────────────────────────────────────────────────────────
// Generates platform video clips via Kie.ai Seedance 2 (default) or fal.ai.
// Seedance 2: 1080p, up to 15s, generates audio, accepts reference images.
// Output: MP4, uploaded to Supabase Storage, Airtable updated.

import { generateVideo, buildMotionPrompt }   from '../fal';
import { generateKieVideo }                    from '../kei';
import { uploadToStorage, updateJobStatus }    from '../supabase';
import { updateContentPiece, updateAirtableJob } from '../airtable';
import { PLATFORM_VIDEO_SPECS, PLATFORM_SPECS, type PlatformSpecKey } from '../platform-specs';
import type { Campaign } from '../airtable';

export type VideoProvider = 'kie' | 'fal' | 'kling';

export interface VideoGenerationResult {
  platformSpecKey: PlatformSpecKey;
  url:      string;
  storagePath: string;
  width:    number;
  height:   number;
  duration: number;
  provider: VideoProvider;
}

// Platform → Seedance 2 aspect ratio
const ASPECT_MAP: Record<string, '16:9' | '9:16' | '1:1' | '4:3' | '3:4'> = {
  '16:9': '16:9',
  '9:16': '9:16',
  '1:1':  '1:1',
  '4:3':  '4:3',
  '3:4':  '3:4',
};

export async function generateVideosForContent(opts: {
  campaign:        Campaign;
  contentPieceId:  string;
  sourceImageUrl:  string;   // static image from image agent → first-frame reference
  contentMessage:  string;
  platforms:       string[];
  provider?:       VideoProvider;
  supabaseJobId?:  string;
  airtableJobId?:  string;
}): Promise<VideoGenerationResult[]> {
  const {
    campaign, contentPieceId, sourceImageUrl, contentMessage,
    platforms, supabaseJobId, airtableJobId,
  } = opts;
  const provider = opts.provider ?? 'kie';
  const results: VideoGenerationResult[] = [];

  // Collect video specs for selected platforms
  const specKeys: PlatformSpecKey[] = [];
  for (const platform of platforms) {
    specKeys.push(...(PLATFORM_VIDEO_SPECS[platform] ?? []));
  }
  if (specKeys.length === 0) return results;

  if (supabaseJobId) await updateJobStatus(supabaseJobId, { status: 'processing' }).catch(() => {});
  if (airtableJobId) await updateAirtableJob(airtableJobId, { status: 'Processing' }).catch(() => {});

  for (const specKey of specKeys) {
    const spec = PLATFORM_SPECS[specKey];
    if (spec.format !== 'video') continue;

    const motionPrompt = buildMotionPrompt(campaign.tone, platforms[0] ?? 'Instagram');
    const fullPrompt   = `${motionPrompt} — ${contentMessage}`;

    try {
      let videoUrl: string;
      let duration: number;

      if (provider === 'kie') {
        const ratio = ASPECT_MAP[spec.ratio] ?? '9:16';
        // 8s default — good for Reels/TikTok; capped at 15 (Seedance 2 max)
        const dur = Math.min((spec as any).duration ?? 8, 15);

        const result = await generateKieVideo({
          prompt:             fullPrompt,
          referenceImageUrl:  sourceImageUrl,
          aspectRatio:        ratio,
          resolution:         '1080p',
          duration:           dur,
          generateAudio:      true,
        });
        videoUrl = result.url;
        duration = result.duration;

      } else if (provider === 'fal') {
        const result = await generateVideo({
          imageUrl:        sourceImageUrl,
          platformSpecKey: specKey,
          motionPrompt:    fullPrompt,
          duration:        (spec as any).duration ?? 8,
        });
        videoUrl = result.url;
        duration = result.duration;

      } else {
        // kling direct API fallback
        const { generateKlingVideo } = await import('../kling');
        const aspectParts = spec.ratio.split(':');
        const ar = `${aspectParts[0]}:${aspectParts[1]}` as '9:16' | '16:9' | '1:1';
        const result = await generateKlingVideo({
          prompt:      fullPrompt,
          imageUrl:    sourceImageUrl,
          aspectRatio: ar,
          duration:    10,
          mode:        'pro',
        });
        videoUrl = result.url;
        duration = result.duration;
      }

      // Download and upload to Supabase Storage
      const videoRes  = await fetch(videoUrl);
      const buffer    = Buffer.from(await videoRes.arrayBuffer());
      const storagePath = `${campaign.id}/${contentPieceId}/${specKey}_${duration}s.mp4`;
      const publicUrl = await uploadToStorage('generated-videos', storagePath, buffer, 'video/mp4');

      results.push({ platformSpecKey: specKey, url: publicUrl, storagePath, width: spec.width, height: spec.height, duration, provider });

    } catch (err) {
      console.error(`[Video Agent] ${provider} failed for ${specKey}:`, err);
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  // Update Airtable
  if (results.length > 0) {
    await updateContentPiece(contentPieceId, {
      generatedVideoUrls: JSON.stringify(
        results.map(r => ({ platformSpecKey: r.platformSpecKey, url: r.url, width: r.width, height: r.height, duration: r.duration })),
      ),
    }).catch(() => {});
  }

  const finalStatus   = results.length > 0 ? 'done' : 'failed';
  const finalAssetUrl = results[0]?.url;
  if (supabaseJobId) await updateJobStatus(supabaseJobId, { status: finalStatus, asset_url: finalAssetUrl }).catch(() => {});
  if (airtableJobId) await updateAirtableJob(airtableJobId, { status: finalStatus === 'done' ? 'Done' : 'Failed', assetUrl: finalAssetUrl }).catch(() => {});

  return results;
}
