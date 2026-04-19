// ── Platform Specs ─────────────────────────────────────────────────────────────
// Single source of truth for all platform dimensions and format rules.
// Import this everywhere — never hardcode ratios or dimensions.

export const PLATFORM_SPECS = {
  instagram_feed_square: {
    label: 'Instagram Feed (Square)',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    format: 'image' as const,
    notes: 'Safe default for feed posts',
  },
  instagram_feed_portrait: {
    label: 'Instagram Feed (Portrait)',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    format: 'image' as const,
    notes: 'Best reach on feed',
  },
  instagram_reels: {
    label: 'Instagram Reels',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    format: 'video' as const,
    durations: [15, 30, 60],
    notes: 'Full screen vertical',
  },
  instagram_story: {
    label: 'Instagram Story',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    format: 'video' as const,
    durations: [15],
    notes: 'Disappears after 24h',
  },
  tiktok: {
    label: 'TikTok',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    format: 'video' as const,
    durations: [15, 30, 60],
    notes: 'Primary TikTok format',
  },
  twitter_landscape: {
    label: 'Twitter/X (Landscape)',
    ratio: '16:9',
    width: 1600,
    height: 900,
    format: 'image' as const,
    notes: 'Standard in-feed image',
  },
  twitter_square: {
    label: 'Twitter/X (Square)',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    format: 'image' as const,
    notes: 'Also works well in feed',
  },
  linkedin_landscape: {
    label: 'LinkedIn (Landscape)',
    ratio: '1.91:1',
    width: 1200,
    height: 627,
    format: 'image' as const,
    notes: 'Standard LinkedIn post',
  },
  linkedin_portrait: {
    label: 'LinkedIn (Portrait)',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    format: 'image' as const,
    notes: 'Higher engagement',
  },
  linkedin_video: {
    label: 'LinkedIn Video',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    format: 'video' as const,
    durations: [30],
    notes: 'Square video performs best',
  },
  facebook_feed: {
    label: 'Facebook Feed',
    ratio: '1.91:1',
    width: 1200,
    height: 630,
    format: 'image' as const,
    notes: 'Standard feed post',
  },
  facebook_story: {
    label: 'Facebook Story',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    format: 'video' as const,
    durations: [15],
    notes: 'Full screen story',
  },
  youtube_short: {
    label: 'YouTube Short',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    format: 'video' as const,
    durations: [30, 60],
    notes: 'Under 60s vertical',
  },
  youtube_thumbnail: {
    label: 'YouTube Thumbnail',
    ratio: '16:9',
    width: 1280,
    height: 720,
    format: 'image' as const,
    notes: 'Standard thumbnail',
  },
  pinterest: {
    label: 'Pinterest',
    ratio: '2:3',
    width: 1000,
    height: 1500,
    format: 'image' as const,
    notes: 'Best performing pin size',
  },
} as const;

export type PlatformSpecKey = keyof typeof PLATFORM_SPECS;
export type PlatformSpec = (typeof PLATFORM_SPECS)[PlatformSpecKey];

// Platform → which spec keys to use for images
export const PLATFORM_IMAGE_SPECS: Record<string, PlatformSpecKey[]> = {
  Instagram:  ['instagram_feed_square', 'instagram_feed_portrait'],
  'Twitter/X': ['twitter_landscape', 'twitter_square'],
  LinkedIn:   ['linkedin_landscape', 'linkedin_portrait'],
  Facebook:   ['facebook_feed'],
  Pinterest:  ['pinterest'],
  YouTube:    ['youtube_thumbnail'],
  TikTok:     [],
};

// Platform → which spec keys to use for video
export const PLATFORM_VIDEO_SPECS: Record<string, PlatformSpecKey[]> = {
  Instagram:  ['instagram_reels', 'instagram_story'],
  TikTok:     ['tiktok'],
  LinkedIn:   ['linkedin_video'],
  Facebook:   ['facebook_story'],
  YouTube:    ['youtube_short'],
  'Twitter/X': [],
  Pinterest:  [],
};

// Colour per platform (for badges, tabs, etc.)
export const PLATFORM_COLORS: Record<string, string> = {
  Instagram:  '#E1306C',
  LinkedIn:   '#0077B5',
  'Twitter/X': '#1DA1F2',
  TikTok:     '#010101',
  Facebook:   '#1877F2',
  YouTube:    '#FF0000',
  Pinterest:  '#E60023',
};
