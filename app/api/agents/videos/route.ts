import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCampaign } from '@/lib/airtable';
import { generateVideosForContent } from '@/lib/agents/video-agent';
import { createGenerationJob } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { campaignId, contentPieceId, sourceImageUrl, contentMessage, provider } = await req.json();
    const campaign = await getCampaign(campaignId);
    if (campaign.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const job = await createGenerationJob({
      user_id:          userId,
      campaign_id:      campaignId,
      content_piece_id: contentPieceId,
      job_type:         'video',
      platform_spec_key: 'multi',
      status:           'queued',
    });

    generateVideosForContent({
      campaign,
      contentPieceId,
      sourceImageUrl,
      contentMessage,
      platforms: campaign.platforms,
      provider: provider ?? 'fal',
      supabaseJobId: job.id,
    }).catch(err => console.error('[Video Route] Background generation failed:', err));

    return NextResponse.json({ jobId: job.id, status: 'queued' });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
