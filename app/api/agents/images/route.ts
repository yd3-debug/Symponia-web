import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCampaign } from '@/lib/airtable';
import { generateImagesForContent } from '@/lib/agents/image-agent';
import { createGenerationJob } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { campaignId, contentPieceId, contentMessage, referenceImageUrl } = await req.json();
    const campaign = await getCampaign(campaignId);
    if (campaign.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Create Supabase generation job
    const job = await createGenerationJob({
      user_id:          userId,
      campaign_id:      campaignId,
      content_piece_id: contentPieceId,
      job_type:         'image',
      platform_spec_key: 'multi',
      status:           'queued',
    });

    // Run in background (don't await — return job ID immediately for Realtime tracking)
    generateImagesForContent({
      campaign,
      contentPieceId,
      contentMessage,
      platforms: campaign.platforms,
      referenceImageUrl,
      supabaseJobId: job.id,
    }).catch(err => console.error('[Image Route] Background generation failed:', err));

    return NextResponse.json({ jobId: job.id, status: 'queued' });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
