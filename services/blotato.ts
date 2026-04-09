// ── Blotato Service ───────────────────────────────────────────────────────────
// Handles scheduling and publishing to Instagram, TikTok, and LinkedIn
// Docs: https://app.blotato.com/api-docs (check your Blotato account for your base URL)

import dotenv from 'dotenv';
dotenv.config();

const BLOTATO_API_KEY  = process.env.BLOTATO_API_KEY!;
const BLOTATO_BASE_URL = process.env.BLOTATO_BASE_URL || 'https://api.blotato.com/v1';

// ── Account IDs (fill in your connected account IDs from Blotato dashboard) ──

const ACCOUNTS = {
  instagram: process.env.BLOTATO_INSTAGRAM_ACCOUNT_ID!,
  tiktok:    process.env.BLOTATO_TIKTOK_ACCOUNT_ID!,
  linkedin:  process.env.BLOTATO_LINKEDIN_ACCOUNT_ID!,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type BlotPlatform = 'instagram' | 'tiktok' | 'linkedin';
export type BlotMediaType = 'image' | 'video' | 'carousel' | 'reel' | 'story';
export type BlotStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface BlotPost {
  platform: BlotPlatform;
  caption: string;
  mediaUrls: string[];           // hosted image or video URLs
  mediaType: BlotMediaType;
  scheduledAt?: Date;            // omit to post immediately
  hashtags?: string;             // appended to caption or in first comment
  firstComment?: string;         // LinkedIn: use for links
  coverImageUrl?: string;        // TikTok/Reels: thumbnail
}

export interface BlotResult {
  postId: string;
  platform: BlotPlatform;
  status: BlotStatus;
  scheduledAt?: string;
  publishedAt?: string;
  url?: string;                  // public post URL once published
  error?: string;
}

// ── Core API helper ───────────────────────────────────────────────────────────

async function blotRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: object
): Promise<any> {
  const res = await fetch(`${BLOTATO_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${BLOTATO_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Blotato API error ${res.status}: ${err}`);
  }

  return method === 'DELETE' ? null : res.json();
}

// ── Schedule a post ───────────────────────────────────────────────────────────

export async function schedulePost(post: BlotPost): Promise<BlotResult> {
  const accountId = ACCOUNTS[post.platform];
  if (!accountId) throw new Error(`No Blotato account configured for ${post.platform}`);

  const caption = post.hashtags
    ? `${post.caption}\n\n${post.hashtags}`
    : post.caption;

  const data = await blotRequest('POST', '/posts', {
    account_id:   accountId,
    platform:     post.platform,
    caption,
    media_urls:   post.mediaUrls,
    media_type:   post.mediaType,
    scheduled_at: post.scheduledAt?.toISOString(),
    first_comment: post.firstComment,
    cover_image:  post.coverImageUrl,
  });

  return {
    postId:      data.id,
    platform:    post.platform,
    status:      data.status,
    scheduledAt: data.scheduled_at,
  };
}

// ── Publish immediately ───────────────────────────────────────────────────────

export async function publishNow(post: BlotPost): Promise<BlotResult> {
  return schedulePost({ ...post, scheduledAt: undefined });
}

// ── Get post status ───────────────────────────────────────────────────────────

export async function getPostStatus(postId: string): Promise<BlotResult> {
  const data = await blotRequest('GET', `/posts/${postId}`);
  return {
    postId:      data.id,
    platform:    data.platform,
    status:      data.status,
    scheduledAt: data.scheduled_at,
    publishedAt: data.published_at,
    url:         data.post_url,
    error:       data.error_message,
  };
}

// ── Update scheduled time ─────────────────────────────────────────────────────

export async function reschedulePost(postId: string, newTime: Date): Promise<BlotResult> {
  const data = await blotRequest('PATCH', `/posts/${postId}`, {
    scheduled_at: newTime.toISOString(),
  });
  return { postId: data.id, platform: data.platform, status: data.status, scheduledAt: data.scheduled_at };
}

// ── Cancel/delete a scheduled post ───────────────────────────────────────────

export async function cancelPost(postId: string): Promise<void> {
  await blotRequest('DELETE', `/posts/${postId}`);
}

// ── Platform-specific helpers ─────────────────────────────────────────────────

export async function scheduleInstagramReel(opts: {
  videoUrl: string;
  coverUrl?: string;
  caption: string;
  hashtags: string;
  scheduledAt: Date;
}): Promise<BlotResult> {
  return schedulePost({
    platform:      'instagram',
    mediaType:     'reel',
    mediaUrls:     [opts.videoUrl],
    coverImageUrl: opts.coverUrl,
    caption:       opts.caption,
    hashtags:      opts.hashtags,
    scheduledAt:   opts.scheduledAt,
  });
}

export async function scheduleInstagramCarousel(opts: {
  imageUrls: string[];
  caption: string;
  hashtags: string;
  scheduledAt: Date;
}): Promise<BlotResult> {
  return schedulePost({
    platform:    'instagram',
    mediaType:   'carousel',
    mediaUrls:   opts.imageUrls,
    caption:     opts.caption,
    hashtags:    opts.hashtags,
    scheduledAt: opts.scheduledAt,
  });
}

export async function scheduleTikTok(opts: {
  videoUrl: string;
  coverUrl?: string;
  caption: string;
  hashtags: string;
  scheduledAt: Date;
}): Promise<BlotResult> {
  return schedulePost({
    platform:      'tiktok',
    mediaType:     'video',
    mediaUrls:     [opts.videoUrl],
    coverImageUrl: opts.coverUrl,
    caption:       opts.caption,
    hashtags:      opts.hashtags,
    scheduledAt:   opts.scheduledAt,
  });
}

export async function scheduleLinkedInPost(opts: {
  imageUrl?: string;
  caption: string;
  firstComment?: string;
  scheduledAt: Date;
}): Promise<BlotResult> {
  return schedulePost({
    platform:     'linkedin',
    mediaType:    opts.imageUrl ? 'image' : 'image',
    mediaUrls:    opts.imageUrl ? [opts.imageUrl] : [],
    caption:      opts.caption,
    firstComment: opts.firstComment,
    scheduledAt:  opts.scheduledAt,
  });
}
