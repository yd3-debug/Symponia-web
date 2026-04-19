import { NextResponse } from 'next/server';
import { getCampaign, getResearchReport } from '@/lib/airtable';
import { runResearchAgent } from '@/lib/agents/research-agent';

export async function POST(req: Request) {
  const userId = 'default';
  try {
    const { campaignId, refresh } = await req.json();
    const campaign = await getCampaign(campaignId);
    if (campaign.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Return cached research unless caller explicitly wants a refresh
    if (!refresh) {
      const stored = await getResearchReport(campaignId);
      if (stored?.trendingTopics) {
        try {
          const research = {
            trendingTopics:     JSON.parse(stored.trendingTopics),
            redditInsights:     JSON.parse(stored.redditInsights),
            seoKeywords:        JSON.parse(stored.seoKeywords),
            competitorAnalysis: JSON.parse(stored.competitorAnalysis),
            summary:            `Research complete for ${campaign.brandName}.`,
          };
          return NextResponse.json({ research, cached: true });
        } catch {
          // parse error — fall through to re-run
        }
      }
    }

    const research = await runResearchAgent(campaign);
    return NextResponse.json({ research });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
