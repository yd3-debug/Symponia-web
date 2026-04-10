'use client';

import { PageShell } from '@/components/PageShell';
import { motion } from 'framer-motion';
import React from 'react';

const C = {
  bg: '#08061c', bgCard: 'rgba(255,255,255,0.03)',
  fg: '#eae6f8', sub: '#cac4e0', dim: '#a89ec8',
  cyan: '#5ce8d0', violet: '#a78bfa',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.13)',
  heading: "var(--font-cormorant), 'Georgia', serif",
  body: "var(--font-inter), 'Helvetica Neue', sans-serif",
};

const PACKS = [
  {
    id: 'free',
    name: 'New arrivals',
    tokens: 10,
    price: 'Free',
    desc: 'Experience the oracle.',
    detail: '10 free readings to begin',
    accent: C.dim,
    popular: false,
  },
  {
    id: 'starter',
    name: 'Tokens',
    tokens: 50,
    price: '£4.99',
    desc: 'Yours to keep, forever.',
    detail: '~100 messages · never expire',
    accent: C.cyan,
    popular: false,
  },
  {
    id: 'deeper',
    name: 'Tokens',
    tokens: 150,
    price: '£9.99',
    desc: 'Yours to keep, forever.',
    detail: '~300 messages · never expire',
    accent: C.cyan,
    popular: true,
  },
  {
    id: 'monthly',
    name: 'Monthly',
    tokens: 350,
    price: '£12.99',
    desc: '350 tokens per month. Unused tokens reset at renewal.',
    detail: 'per month · cancel anytime',
    accent: C.violet,
    popular: false,
  },
];

function PricingCard({ pack }: { pack: typeof PACKS[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'relative',
        borderRadius: 22,
        border: `0.5px solid ${pack.popular ? pack.accent + '50' : C.border}`,
        background: pack.popular ? `rgba(92,232,208,0.04)` : C.bgCard,
        backdropFilter: 'blur(12px)',
        padding: '36px 32px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {pack.popular && (
        <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 12px', borderRadius: 100, background: C.cyan, color: C.bg, fontFamily: C.body, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Most popular
        </div>
      )}
      <div style={{ position: 'absolute', inset: '0 0 auto 0', height: '0.5px', background: pack.popular ? pack.accent + '60' : C.borderStrong }} />

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: C.body, fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: pack.accent, marginBottom: 8 }}>{pack.name}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: C.heading, fontSize: '3rem', fontWeight: 300, color: C.fg, lineHeight: 1 }}>{pack.price}</span>
        </div>
        <p style={{ fontFamily: C.body, fontSize: '0.78rem', fontWeight: 300, color: C.dim }}>{pack.detail}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderTop: `0.5px solid ${C.border}`, borderBottom: `0.5px solid ${C.border}` }}>
          {pack.tokens !== null ? (
            <>
              <span style={{ fontFamily: C.heading, fontSize: '2rem', fontWeight: 300, color: pack.accent }}>{pack.tokens}</span>
              <span style={{ fontFamily: C.body, fontSize: '0.75rem', fontWeight: 300, color: C.dim, letterSpacing: '0.08em' }}>tokens</span>
            </>
          ) : null}
        </div>
        <p style={{ fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, color: C.sub, marginTop: 14, lineHeight: 1.7 }}>{pack.desc}</p>
      </div>

      <div style={{ width: '100%', padding: '14px', borderRadius: 100, border: `0.5px solid ${C.border}`, background: 'rgba(255,255,255,0.02)', color: C.dim, fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, letterSpacing: '0.08em', textAlign: 'center', marginTop: 'auto' }}>
        Available in the app
      </div>
    </motion.div>
  );
}

export default function CreditsPage() {
  return (
    <PageShell>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 28px 120px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontFamily: C.body, fontSize: '0.7rem', letterSpacing: '0.22em', color: C.cyan, textTransform: 'uppercase', marginBottom: 16 }}>Pricing</p>
          <h1 style={{ fontFamily: C.heading, fontWeight: 300, fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: C.fg, marginBottom: 20, lineHeight: 1.1 }}>
            Choose your depth
          </h1>
          <p style={{ fontFamily: C.body, fontSize: '0.95rem', fontWeight: 300, color: C.sub, maxWidth: 480, margin: '0 auto', lineHeight: 1.85 }}>
            New to Symponia? You get 10 free readings to experience the oracle. When you're ready to go deeper, top up with tokens or subscribe — all from within the app.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 80, maxWidth: 1000, margin: '0 auto 80px' }}>
          {PACKS.map(pack => (
            <PricingCard key={pack.id} pack={pack} />
          ))}
        </div>

        {/* How readings work */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: C.heading, fontSize: '1.8rem', fontWeight: 300, color: C.fg, marginBottom: 32, textAlign: 'center' }}>How readings work</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '◎', title: 'One token per exchange', body: 'Each conversation exchange uses 1 token — roughly 2 messages back and forth with the Oracle, regardless of mode.' },
              { icon: '∞', title: 'Token packs never expire', body: 'Purchased token packs stay in your account indefinitely and carry over forever. Subscription tokens (350/month) reset at each renewal.' },
              { icon: '📱', title: 'Purchase inside the app', body: 'Tokens and subscriptions are purchased directly within the Symponia iOS app. Your balance is stored on your device.' },
              { icon: '🔒', title: 'Secure payment via Stripe', body: 'All payments are processed by Stripe, the world\'s leading payment platform. We never see or store your card details.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 18, padding: '20px 24px', borderRadius: 16, border: `0.5px solid ${C.border}`, background: C.bgCard }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <p style={{ fontFamily: C.body, fontSize: '0.85rem', fontWeight: 400, color: C.fg, marginBottom: 6 }}>{item.title}</p>
                  <p style={{ fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, color: C.dim, lineHeight: 1.8 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: C.body, fontSize: '0.78rem', fontWeight: 300, color: C.dim, textAlign: 'center', marginTop: 40, lineHeight: 1.8 }}>
            Questions about tokens or billing? Contact us at{' '}
            <a href="mailto:hello@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>hello@symponia.io</a>
            <br />See our <a href="/terms#tokens" style={{ color: C.cyan, textDecoration: 'none' }}>Terms of Service</a> for full details.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
