// ── Scheduler Agent ────────────────────────────────────────────────────────────
// Pushes approved content pieces to Blotato for scheduling.
// Selects correct asset (image or video) per platform.
// Updates Airtable Content Calendar with Blotato post IDs and publish status.

import { schedulePost, SUGGESTED_TIMES, type BlotPlatform, type BlotMediaType } from '../blotato';
import { createCalendarEntry, updateCalendarEntry, getContentPieces, approveContentPiece } from '../airtable';
import type { Campaign, ContentPiece } from '../airtable';
import type { PlatformSpecKey } from '../platform-specs';
import { PLATFORM_SPECS } from '../platform-specs';
import { addDays, format, setHours, setMinutes } from 'date-fns';

// ── Platform name → Blotato platform key ─────────────────────────────────────

const PLATFORM_MAP: Record<string, BlotPlatform> = {
  Instagram:  'instagram',
  LinkedIn:   'linkedin',
  'Twitter/X': 'twitter',
  TikTok:     'tiktok',
  Facebook:   'facebook',
  YouTube:    'youtube',
  Pinterest:  'pinterest',
};

// ── Media type logic ──────────────────────────────────────────────────────────

function getMediaType(piece: ContentPiece): BlotMediaType {
  if (piece.generatedVideoUrls) {
    const videos = JSON.parse(piece.generatedVideoUrls) as Array<{ platformSpecKey: PlatformSpecKey }>;
    if (videos.some(v => PLATFORM_SPECS[v.platformSpecKey]?.format === 'video')) {
      const key = videos[0].platformSpecKey as PlatformSpecKey;
      if (key.includes('reel') || key.includes('tiktok') || key.includes('short')) return 'reel';
      if (key.includes('story')) return 'story';
      return 'video';
    }
  }
  const images = piece.generatedImageUrls ? JSON.parse(piece.generatedImageUrls) : [];
  if (images.length > 1) return 'carousel';
  return 'image';
}

function getBestAssetUrl(piece: ContentPiece, platform: string): string | null {
  // Prefer video for video platforms
  const videoSpecKeys: PlatformSpecKey[] = ['instagram_reels', 'instagram_story', 'tiktok', 'youtube_short', 'facebook_story', 'linkedin_video'];

  if (piece.generatedVideoUrls) {
    const videos: Array<{ platformSpecKey: PlatformSpecKey; url: string }> = JSON.parse(piece.generatedVideoUrls);
    const match = videos.find(v => {
      const spec = PLATFORM_SPECS[v.platformSpecKey];
      return videoSpecKeys.includes(v.platformSpecKey) && spec.format === 'video';
    });
    if (match) return match.url;
  }

  if (piece.generatedImageUrls) {
    const images: Array<{ url: string }> = JSON.parse(piece.generatedImageUrls);
    if (images.length > 0) return images[0].url;
  }

  return null;
}

// ── Schedule suggested time for a platform ────────────────────────────────────

function nextSuggestedSlot(platform: string, daysFromNow: number): Date {
  const times = SUGGESTED_TIMES[platform] ?? ['09:00'];
  const timeStr = times[daysFromNow % times.length];
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = addDays(new Date(), daysFromNow + 1);
  return setMinutes(setHours(date, hours), minutes);
}

// ── Public API ─────────────────────────────────────────────────────────────────

export interface ScheduleResult {
  contentPieceId: string;
  platform: string;
  blobataPostId: string;
  scheduledAt: string;
  assetUrl: string;
  status: 'scheduled' | 'failed';
  error?: string;
}

export async function scheduleApprovedContent(opts: {
  campaign: Campaign;
  contentPieceIds: string[];
}): Promise<ScheduleResult[]> {
  const { campaign } = opts;
  const results: ScheduleResult[] = [];

  // Fetch all content pieces for this campaign
  const allPieces = await getContentPieces(campaign.id!);
  const approvedPieces = allPieces.filter(
    p => opts.contentPieceIds.includes(p.id!) && p.status === 'Approved',
  );

  let dayOffset = 0;
  for (const piece of approvedPieces) {
    const blotPlatform = PLATFORM_MAP[piece.platform];
    if (!blotPlatform) continue;

    const assetUrl = getBestAssetUrl(piece, piece.platform);
    if (!assetUrl) {
      results.push({
        contentPieceId: piece.id!,
        platform: piece.platform,
        blobataPostId: '',
        scheduledAt: '',
        assetUrl: '',
        status: 'failed',
        error: 'No asset URL found',
      });
      continue;
    }

    const scheduledAt = nextSuggestedSlot(piece.platform, dayOffset);
    dayOffset++;

    try {
      const blotResult = await schedulePost({
        platform: blotPlatform,
        caption: piece.contentBody,
        mediaUrls: [assetUrl],
        mediaType: getMediaType(piece),
        scheduledAt,
        hashtags: piece.hashtags,
      });

      // Save to Content Calendar
      const calEntry = await createCalendarEntry({
        contentPieceId: piece.id!,
        campaignId:     campaign.id!,
        platform:       piece.platform,
        scheduledDate:  scheduledAt.toISOString(),
        blobataPostId:  blotResult.id,
        assetUrl,
        assetType:      assetUrl.includes('.mp4') ? 'Video' : 'Image',
        publishStatus:  'Queued',
      });

      results.push({
        contentPieceId: piece.id!,
        platform: piece.platform,
        blobataPostId: blotResult.id,
        scheduledAt: scheduledAt.toISOString(),
        assetUrl,
        status: 'scheduled',
      });
    } catch (err) {
      results.push({
        contentPieceId: piece.id!,
        platform: piece.platform,
        blobataPostId: '',
        scheduledAt: scheduledAt.toISOString(),
        assetUrl,
        status: 'failed',
        error: (err as Error).message,
      });
    }

    await new Promise(r => setTimeout(r, 500));
  }

  return results;
}
