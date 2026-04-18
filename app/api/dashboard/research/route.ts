// ── /api/dashboard/research ───────────────────────────────────────────────────
// Calls Exa.ai + Claude directly — bypasses n8n to avoid proxy timeouts.
// n8n's reverse proxy has a ~60s inactivity timeout; Exa+Claude takes ~15-25s.
// Uses raw fetch (no SDK) so no extra npm dependencies are required.

import { NextRequest, NextResponse } from 'next/server';

const DASHBOARD_USER = process.env.DASHBOARD_USERNAME ?? 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_PASSWORD;
const EXA_BASE       = 'https://api.exa.ai';
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

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

async function exaSearch(query: string, opts: {
  numResults?: number;
  includeDomains?: string[];
  startPublishedDate?: string;
}): Promise<Array<{ title: string; url: string; snippet: string }>> {
  const res = await fetch(`${EXA_BASE}/search`, {
    method:  'POST',
    headers: { 'x-api-key': process.env.EXA_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      numResults:         opts.numResults ?? 8,
      type:               'auto',
      useAutoprompt:      true,
      startPublishedDate: opts.startPublishedDate,
      includeDomains:     opts.includeDomains,
      contents: { highlights: { numSentences: 3, highlightsPerUrl: 2 } },
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({
    title:   r.title ?? '',
    url:     r.url   ?? '',
    snippet: r.highlights?.[0] ?? r.text?.slice(0, 200) ?? '',
  }));
}

async function askClaude(prompt: string): Promise<string> {
  const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
    method:  'POST',
    headers: {
      'x-api-key':         process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'Content-Type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 2000,
      messages:   [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(40000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const topic    = (body.topic    ?? '').trim();
  const platform = (body.platform ?? 'all').trim();
  if (!topic) return NextResponse.json({ error: 'topic required' }, { status: 400 });

  const platformLabel = platform === 'all' ? 'social media' : platform;

  // Parallel Exa searches
  const [trendRes, redditRes, newsRes] = await Promise.allSettled([
    exaSearch(`trending ${topic} ${platformLabel} content strategy 2025`, {
      numResults: 8, startPublishedDate: daysAgo(14),
    }),
    exaSearch(`site:reddit.com ${topic}`, {
      numResults: 8, includeDomains: ['reddit.com'], startPublishedDate: daysAgo(30),
    }),
    exaSearch(`${topic} news viral marketing ${new Date().getFullYear()}`, {
      numResults: 6, startPublishedDate: daysAgo(7),
    }),
  ]);

  const trends = trendRes.status  === 'fulfilled' ? trendRes.value  : [];
  const reddit = redditRes.status === 'fulfilled' ? redditRes.value : [];
  const news   = newsRes.status   === 'fulfilled' ? newsRes.value   : [];

  const subreddits = [...new Set(
    reddit.map(r => {
      const m = r.url.match(/reddit\.com\/r\/([^/]+)/);
      return m ? `r/${m[1]}` : null;
    }).filter(Boolean)
  )].slice(0, 6) as string[];

  const prompt = `You are a world-class social media strategist. Analyse this research data and return a JSON object with actionable marketing intelligence.

TOPIC: "${topic}"
PLATFORM: ${platform === 'all' ? 'All platforms (Instagram, TikTok, LinkedIn)' : platform}

TRENDING CONTENT (last 14 days):
${trends.map((t, i) => `${i + 1}. "${t.title}" — ${t.snippet}`).join('\n') || 'No data'}

REDDIT DISCUSSIONS (last 30 days):
${reddit.map((r, i) => `${i + 1}. "${r.title}" — ${r.snippet}`).join('\n') || 'No data'}

RECENT NEWS:
${news.map((n, i) => `${i + 1}. "${n.title}" — ${n.snippet}`).join('\n') || 'No data'}

Return ONLY this JSON object (no markdown, no extra text):
{
  "trendingAngle": "The single best content angle for this topic right now — specific, punchy, 10-15 words",
  "timingWindow": "Best days and times to post (e.g. 'Tue-Thu, 9am-11am and 6pm-8pm EST')",
  "hashtags": "8-12 hashtags separated by spaces starting with #",
  "summary": "2-3 sentence analysis of why this topic is trending and what angle has the most potential",
  "bestFormat": "Best content format (e.g. 'Short-form video (60-90s)', 'Carousel', 'Long-form post')",
  "trendStatus": "rising|peaked|saturated|evergreen",
  "hookPatterns": ["3-4 proven hook templates for this topic e.g. 'The secret about X nobody tells you'"],
  "emotionalTrigger": "Primary emotional trigger driving engagement (e.g. 'Fear of missing out', 'Aspiration')",
  "contentGap": "What's missing in current content about this topic — the opportunity",
  "competitorBlindSpot": "What competitors are NOT covering that the audience wants",
  "viralMechanism": "Why content about this topic goes viral — the psychological driver",
  "winningFormat": "The specific format winning right now with an example",
  "topAngles": ["5 specific content angle ideas, each 1 sentence"],
  "algoTopSignals": "What the algorithm rewards for this topic right now",
  "algoFormatWinner": "Which content format the algorithm is boosting most",
  "algoHashtagRule": "Hashtag strategy for maximum reach",
  "algoHookTiming": "How long the hook needs to be to retain viewers / readers",
  "algoPeakTimes": "Exact peak posting times for maximum algorithm boost",
  "algoAvoid": "What to avoid that kills reach for this topic",
  "algoSeoNote": "SEO / search optimisation tip for this topic"
}`;

  let result: any;
  try {
    const raw   = await askClaude(prompt);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Claude returned no JSON');
    result = JSON.parse(match[0]);
  } catch (e: any) {
    return NextResponse.json({ error: `Research synthesis failed: ${e.message}` }, { status: 502 });
  }

  return NextResponse.json({
    ok:              true,
    topic,
    platform,
    totalSources:    trends.length + reddit.length + news.length,
    rankedPostCount: reddit.length,
    avgVelocity:     Math.min(reddit.length * 12 + trends.length * 8, 100),
    topRedditTitles: reddit.slice(0, 5).map(r => r.title),
    topSubreddits:   subreddits,
    searchQuery:     topic,
    ...result,
  });
}
