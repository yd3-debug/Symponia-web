import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Payments not configured yet.' }, { status: 503 });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' });

    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/credits?cancelled=true`,
      metadata: { source: 'symponia_web' },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
