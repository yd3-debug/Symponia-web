// ── /api/dashboard/research ───────────────────────────────────────────────────
// Calls Claude directly for trend research. Skipping Exa avoids proxy timeouts
// caused by chaining multiple slow external API calls (Exa ~10s + Claude ~15s
// would exceed the CDN inactivity limit). Claude alone responds in 5-10s.

import { NextRequest, NextResponse } from 'next/server';

const DASHBOARD_USER = process.env.DASHBOARD_USERNAME ?? 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_PASSWORD;
const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';

function checkAuth(req: NextRequest): boolean {
  if (!DASHBOARD_PASS) return true;
  const token = req.headers.get('x-dashboard-token') ?? '';
  try {
    const decoded  = Buffer.from(token, 'base64').toString('utf8');
    const colonIdx = decoded.indexOf(':');
    if (colonIdx === -1) return false;
    return decoded.slice(0, colonIdx) === DASHBOARD_USER && decoded.slice(colonIdx + 1) === DASHBOARD_PASS;
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const topic    = (body.topic    ?? '').trim();
  const platform = (body.platform ?? 'all').trim();
  if (!topic) return NextResponse.json({ error: 'topic required' }, { status: 400 });

  const platformLabel = platform === 'all'
    ? 'all platforms (Instagram, TikTok, LinkedIn)'
    : platform;

  const today = new Date().toISOString().split('T')[0];

  const prompt = `You are a world-class social media strategist with deep knowledge of current trends, algorithms, and viral content patterns. Today is ${today}.

Analyse this topic and return actionable marketing intelligence for a content creator.

TOPIC: "${topic}"
PLATFORM: ${platformLabel}

Return ONLY a valid JSON object — no markdown, no explanation, just the JSON:
{
  "trendingAngle": "The single sharpest content angle for this topic right now — specific and punchy, 10-15 words",
  "timingWindow": "Best days and times to post (e.g. 'Tue–Thu, 9–11am and 6–8pm local time')",
  "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10",
  "summary": "2-3 sentence analysis of why this topic has content potential and what angle wins",
  "bestFormat": "Best content format right now (e.g. 'Short-form video 60–90s', 'Carousel 5–7 slides', 'Long-form post')",
  "trendStatus": "rising",
  "hookPatterns": [
    "Hook template 1 for this topic",
    "Hook template 2 for this topic",
    "Hook template 3 for this topic"
  ],
  "emotionalTrigger": "Primary emotional trigger driving engagement for this topic",
  "contentGap": "What is missing in current content about this topic — the untapped opportunity",
  "competitorBlindSpot": "What most creators are NOT covering that the audience wants",
  "viralMechanism": "Why content about this topic goes viral — the psychological driver",
  "winningFormat": "The specific format winning right now with a concrete example",
  "topAngles": [
    "Angle idea 1 — one sentence",
    "Angle idea 2 — one sentence",
    "Angle idea 3 — one sentence",
    "Angle idea 4 — one sentence",
    "Angle idea 5 — one sentence"
  ],
  "algoTopSignals": "What the algorithm rewards for content on this topic right now",
  "algoFormatWinner": "Which content format the algorithm is boosting most for this topic",
  "algoHashtagRule": "Hashtag strategy for maximum reach on this platform",
  "algoHookTiming": "How long the hook must be to retain viewers or readers",
  "algoPeakTimes": "Exact peak posting times for maximum algorithmic boost",
  "algoAvoid": "What kills reach for this type of content — avoid these",
  "algoSeoNote": "SEO or search optimisation tip specific to this topic"
}

trendStatus must be one of: rising, peaked, saturated, evergreen`;

  try {
    const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
      method:  'POST',
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'Content-Type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 1500,
        messages:   [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Claude API error: ${res.status} ${err}` }, { status: 502 });
    }

    const data  = await res.json();
    const raw   = data.content?.[0]?.text ?? '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: 'No JSON in Claude response' }, { status: 502 });

    const result = JSON.parse(match[0]);

    return NextResponse.json({
      ok:              true,
      topic,
      platform,
      totalSources:    0,
      rankedPostCount: 0,
      avgVelocity:     0,
      topRedditTitles: [],
      topSubreddits:   [],
      searchQuery:     topic,
      ...result,
    });
  } catch (e: any) {
    return NextResponse.json({ error: `Research failed: ${e.message}` }, { status: 502 });
  }
}
