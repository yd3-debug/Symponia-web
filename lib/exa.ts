// ── Exa.ai Wrapper ─────────────────────────────────────────────────────────────
// All Exa.ai search calls go through here. Used by the research agent.

const EXA_BASE = 'https://api.exa.ai';

interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  publishedDate?: string;
  author?: string;
  score: number;
  text?: string;
  highlights?: string[];
}

interface ExaResponse {
  results: ExaSearchResult[];
  autopromptString?: string;
}

async function exaSearch(
  query: string,
  options: {
    numResults?: number;
    type?: 'neural' | 'keyword' | 'auto';
    useAutoprompt?: boolean;
    startPublishedDate?: string;
    includeDomains?: string[];
    excludeDomains?: string[];
    contents?: { text?: boolean; highlights?: { numSentences?: number; highlightsPerUrl?: number } };
  } = {},
): Promise<ExaResponse> {
  const res = await fetch(`${EXA_BASE}/search`, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.EXA_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      numResults: options.numResults ?? 10,
      type: options.type ?? 'auto',
      useAutoprompt: options.useAutoprompt ?? true,
      startPublishedDate: options.startPublishedDate,
      includeDomains: options.includeDomains,
      excludeDomains: options.excludeDomains,
      contents: options.contents ?? { text: true, highlights: { numSentences: 3, highlightsPerUrl: 3 } },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Exa search failed: ${res.status} ${err}`);
  }

  return res.json();
}

// ── Research-specific search helpers ──────────────────────────────────────────

// Get recent date string for filtering (past N days)
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export interface RedditInsight {
  title: string;
  url: string;
  snippet: string;
  score: number;
}

export interface TrendingTopic {
  topic: string;
  url: string;
  snippet: string;
  relevanceScore: number;
}

export interface SeoKeyword {
  keyword: string;
  context: string;
  source: string;
}

export interface CompetitorInsight {
  name: string;
  url: string;
  headline: string;
  snippet: string;
}

export interface ExaResearchResult {
  trendingTopics: TrendingTopic[];
  redditInsights: RedditInsight[];
  seoKeywords: SeoKeyword[];
  competitorInsights: CompetitorInsight[];
  raw: ExaSearchResult[];
}

export async function runResearch(opts: {
  niche: string;
  targetAudience: string;
  competitors?: string;
  platforms: string[];
}): Promise<ExaResearchResult> {
  const { niche, targetAudience, competitors, platforms } = opts;

  const [trendRes, redditRes, competitorRes] = await Promise.allSettled([
    // Trending content in niche
    exaSearch(`trending ${niche} content ${platforms.join(' ')} marketing 2025`, {
      numResults: 8,
      startPublishedDate: daysAgo(14),
      contents: { highlights: { numSentences: 3, highlightsPerUrl: 2 } },
    }),
    // Reddit discussions
    exaSearch(`site:reddit.com ${niche} ${targetAudience}`, {
      numResults: 8,
      includeDomains: ['reddit.com'],
      startPublishedDate: daysAgo(30),
    }),
    // Competitor content (if any)
    competitors
      ? exaSearch(`${competitors} marketing strategy content ${niche}`, { numResults: 6, startPublishedDate: daysAgo(30) })
      : Promise.resolve({ results: [] } as ExaResponse),
  ]);

  const trends = trendRes.status === 'fulfilled' ? trendRes.value.results : [];
  const reddit = redditRes.status === 'fulfilled' ? redditRes.value.results : [];
  const comp   = competitorRes.status === 'fulfilled' ? competitorRes.value.results : [];

  // Extract keywords from highlights
  const keywords: SeoKeyword[] = [];
  [...trends, ...reddit].forEach(r => {
    (r.highlights ?? []).forEach(h => {
      const words = h.match(/\b[a-zA-Z]{5,}\b/g) ?? [];
      const unique = [...new Set(words)].slice(0, 3);
      unique.forEach(kw => keywords.push({ keyword: kw.toLowerCase(), context: h, source: r.url }));
    });
  });

  return {
    trendingTopics: trends.map(r => ({
      topic: r.title,
      url: r.url,
      snippet: r.highlights?.[0] ?? r.text?.slice(0, 200) ?? '',
      relevanceScore: Math.round(r.score * 100),
    })),
    redditInsights: reddit.map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.highlights?.[0] ?? r.text?.slice(0, 200) ?? '',
      score: Math.round(r.score * 100),
    })),
    seoKeywords: [...new Map(keywords.map(k => [k.keyword, k])).values()].slice(0, 20),
    competitorInsights: comp.map(r => ({
      name: new URL(r.url).hostname.replace('www.', ''),
      url: r.url,
      headline: r.title,
      snippet: r.highlights?.[0] ?? r.text?.slice(0, 200) ?? '',
    })),
    raw: [...trends, ...reddit, ...comp],
  };
}
