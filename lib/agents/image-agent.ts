// ── Image Agent ────────────────────────────────────────────────────────────────
// Generates platform-sized images via Kie.ai (NanaBananaPro / FluxKontext).
//
// Model routing:
//   Text-heavy assets (quotes, announcements) → kieIdeogram   (text in image)
//   Brand edits, product on BG               → kieFluxKontext (edit mode)
//   All other marketing visuals              → kieNanaBananaPro (Gemini 3, 4K)

import { kieNanaBananaPro, kieFluxKontext, kieIdeogram } from '../kei';
import { uploadToStorage, updateJobStatus } from '../supabase';
import { updateContentPiece, updateAirtableJob } from '../airtable';
import { PLATFORM_IMAGE_SPECS, PLATFORM_SPECS, type PlatformSpecKey } from '../platform-specs';
import type { Campaign } from '../airtable';

export interface ImageGenerationResult {
  platformSpecKey: PlatformSpecKey;
  url:         string;
  storagePath: string;
  width:       number;
  height:      number;
}

// Spec ratio → closest NanaBananaPro-supported ratio
const RATIO_MAP: Record<string, '1:1' | '2:3' | '3:2' | '4:3' | '16:9' | '9:16'> = {
  '1:1':    '1:1',
  '4:5':    '2:3',
  '2:3':    '2:3',
  '3:2':    '3:2',
  '4:3':    '4:3',
  '16:9':   '16:9',
  '9:16':   '9:16',
  '1.91:1': '16:9',
};

// Spec ratio → closest FluxKontext-supported ratio (fallback)
const FLUX_RATIO_MAP: Record<string, '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16'> = {
  '1:1':    '1:1',
  '4:5':    '3:4',
  '2:3':    '3:4',
  '4:3':    '4:3',
  '16:9':   '16:9',
  '9:16':   '9:16',
  '1.91:1': '16:9',
};

function buildMarketingPrompt(opts: {
  contentMessage: string;
  brandName:      string;
  brandTone:      string;
  platform:       string;
  specLabel:      string;
}): string {
  const { contentMessage, brandName, brandTone, platform, specLabel } = opts;
  return [
    `High-quality ${platform} marketing visual for ${brandName}.`,
    `Style: ${brandTone}, professional, scroll-stopping, brand-consistent.`,
    `Format: ${specLabel}.`,
    `Visual concept: ${contentMessage}`,
    'Ultra-sharp details, vibrant colours, perfect composition for social media.',
    'No text overlays unless essential to concept. Photorealistic or cinematic style.',
  ].join(' ');
}

export async function generateImagesForContent(opts: {
  campaign:          Campaign;
  contentPieceId:    string;
  contentMessage:    string;
  platforms:         string[];
  referenceImageUrl?: string;
  supabaseJobId?:    string;
  airtableJobId?:    string;
}): Promise<ImageGenerationResult[]> {
  const { campaign, contentPieceId, contentMessage, platforms, referenceImageUrl, supabaseJobId, airtableJobId } = opts;
  const results: ImageGenerationResult[] = [];

  const specKeys: PlatformSpecKey[] = [];
  for (const platform of platforms) specKeys.push(...(PLATFORM_IMAGE_SPECS[platform] ?? []));
  if (specKeys.length === 0) return results;

  if (supabaseJobId) await updateJobStatus(supabaseJobId, { status: 'processing' }).catch(() => {});
  if (airtableJobId) await updateAirtableJob(airtableJobId, { status: 'Processing' }).catch(() => {});
  await updateContentPiece(contentPieceId, { visualGenerationStatus: 'Generating' }).catch(() => {});

  for (const specKey of specKeys) {
    const spec     = PLATFORM_SPECS[specKey];
    const platform = spec.label.split(' ')[0] ?? platforms[0] ?? 'Marketing';
    const ratio    = RATIO_MAP[spec.ratio] ?? '1:1';

    const prompt = buildMarketingPrompt({
      contentMessage,
      brandName:  campaign.brandName,
      brandTone:  campaign.tone,
      platform,
      specLabel:  spec.label,
    });

    try {
      let url: string;

      if (referenceImageUrl) {
        // Have brand reference → NanaBananaPro for style consistency
        const result = await kieNanaBananaPro({
          prompt,
          referenceUrls: [referenceImageUrl],
          aspectRatio:   ratio,
          resolution:    '2K',
        });
        url = result.url;
      } else {
        // No reference → FluxKontext for maximum quality and aspect ratio support
        const fluxRatio = FLUX_RATIO_MAP[spec.ratio] ?? '1:1';
        const result = await kieFluxKontext({
          prompt,
          aspectRatio:  fluxRatio,
          model:        'flux-kontext-pro',
          outputFormat: 'jpeg',
        });
        url = result.url;
      }

      // Download and upload to Supabase Storage
      const imageRes    = await fetch(url);
      const buffer      = Buffer.from(await imageRes.arrayBuffer());
      const storagePath = `${campaign.id}/${contentPieceId}/${specKey}.jpg`;
      const publicUrl   = await uploadToStorage('generated-images', storagePath, buffer, 'image/jpeg');

      results.push({ platformSpecKey: specKey, url: publicUrl, storagePath, width: spec.width, height: spec.height });

    } catch (err) {
      console.error(`[Image Agent] Kie.ai failed for ${specKey}:`, err);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  if (results.length > 0) {
    await updateContentPiece(contentPieceId, {
      generatedImageUrls:     JSON.stringify(
        results.map(r => ({ platformSpecKey: r.platformSpecKey, url: r.url, width: r.width, height: r.height })),
      ),
      visualGenerationStatus: 'Complete',
    }).catch(() => {});
  } else {
    await updateContentPiece(contentPieceId, { visualGenerationStatus: 'Failed' }).catch(() => {});
  }

  const finalStatus  = results.length > 0 ? 'done' : 'failed';
  const finalAssetUrl = results[0]?.url;
  if (supabaseJobId) await updateJobStatus(supabaseJobId, { status: finalStatus, asset_url: finalAssetUrl }).catch(() => {});
  if (airtableJobId) await updateAirtableJob(airtableJobId, { status: finalStatus === 'done' ? 'Done' : 'Failed', assetUrl: finalAssetUrl }).catch(() => {});

  return results;
}
