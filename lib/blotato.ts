// ── Blotato Wrapper ────────────────────────────────────────────────────────────
// All Blotato scheduling calls go through here. Never call Blotato directly.

const BLOTATO_BASE = process.env.BLOTATO_BASE_URL ?? 'https://api.blotato.com/v1';

export type BlotPlatform = 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'facebook' | 'youtube' | 'pinterest';
export type BlotMediaType = 'image' | 'video' | 'carousel' | 'reel' | 'story';
export type BlotStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface BlotPost {
  platform: BlotPlatform;
  caption: string;
  mediaUrls: string[];
  mediaType: BlotMediaType;
  scheduledAt?: Date;
  hashtags?: string;
  firstComment?: string;
  accountId?: string;
}

export interface BlotPostResult {
  id: string;
  status: BlotStatus;
  scheduledAt?: string;
  platform: BlotPlatform;
  error?: string;
}

// Platform → account ID from env
const ACCOUNT_IDS: Record<string, string | undefined> = {
  instagram: process.env.BLOTATO_INSTAGRAM_ACCOUNT_ID,
  tiktok:    process.env.BLOTATO_TIKTOK_ACCOUNT_ID,
  linkedin:  process.env.BLOTATO_LINKEDIN_ACCOUNT_ID,
  twitter:   process.env.BLOTATO_TWITTER_ACCOUNT_ID,
  facebook:  process.env.BLOTATO_FACEBOOK_ACCOUNT_ID,
  youtube:   process.env.BLOTATO_YOUTUBE_ACCOUNT_ID,
  pinterest: process.env.BLOTATO_PINTEREST_ACCOUNT_ID,
};

async function blotRequest(method: 'GET' | 'POST' | 'DELETE' | 'PATCH', path: string, body?: object): Promise<any> {
  const res = await fetch(`${BLOTATO_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.BLOTATO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Blotato error (${method} ${path}): ${res.status} ${err}`);
  }

  return res.status === 204 ? null : res.json();
}

export async function schedulePost(post: BlotPost): Promise<BlotPostResult> {
  const accountId = post.accountId ?? ACCOUNT_IDS[post.platform];

  const body: Record<string, any> = {
    platform:   post.platform,
    caption:    post.hashtags ? `${post.caption}\n\n${post.hashtags}` : post.caption,
    media_urls: post.mediaUrls,
    media_type: post.mediaType,
    account_id: accountId,
  };

  if (post.scheduledAt) body.scheduled_at = post.scheduledAt.toISOString();
  if (post.firstComment) body.first_comment = post.firstComment;

  const res = await blotRequest('POST', '/posts', body);
  return {
    id:          res.id ?? res.post_id,
    status:      res.status ?? (post.scheduledAt ? 'scheduled' : 'draft'),
    scheduledAt: res.scheduled_at,
    platform:    post.platform,
  };
}

export async function scheduleBatch(posts: BlotPost[]): Promise<BlotPostResult[]> {
  const results: BlotPostResult[] = [];
  for (const post of posts) {
    try {
      const result = await schedulePost(post);
      results.push(result);
    } catch (err) {
      results.push({
        id: '',
        status: 'failed',
        platform: post.platform,
        error: (err as Error).message,
      });
    }
    // Rate limit pause between posts
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

export async function deletePost(id: string): Promise<void> {
  await blotRequest('DELETE', `/posts/${id}`);
}

export async function getPostStatus(id: string): Promise<BlotPostResult> {
  const res = await blotRequest('GET', `/posts/${id}`);
  return {
    id:          res.id,
    status:      res.status,
    scheduledAt: res.scheduled_at,
    platform:    res.platform,
  };
}

// ── Suggested posting times per platform ──────────────────────────────────────

export const SUGGESTED_TIMES: Record<string, string[]> = {
  Instagram:  ['09:00', '12:00', '19:00'],
  LinkedIn:   ['08:00', '12:00'],
  'Twitter/X': ['08:00', '12:00', '17:00'],
  TikTok:     ['07:00', '09:00', '19:00'],
  Facebook:   ['09:00', '13:00'],
  YouTube:    ['14:00', '17:00'],
  Pinterest:  ['20:00', '21:00'],
};
