import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

// Clerk webhook: sync new users to Supabase
export async function POST(req: Request) {
  const payload = await req.json();
  const { type, data } = payload;

  if (type === 'user.created') {
    const supabase = createSupabaseServerClient();
    await supabase.from('users').upsert({
      clerk_id: data.id,
      email:    data.email_addresses?.[0]?.email_address ?? '',
    }, { onConflict: 'clerk_id' });
  }

  return NextResponse.json({ received: true });
}
