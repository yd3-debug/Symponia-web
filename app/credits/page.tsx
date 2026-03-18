'use client';

import { PageShell } from '@/components/PageShell';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

const C = {
  bg: '#08061c', bgCard: 'rgba(255,255,255,0.03)',
  fg: '#eae6f8', sub: '#b8b0d8', dim: '#7c70a8',
  cyan: '#5ce8d0', violet: '#a78bfa',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.13)',
  heading: "var(--font-cormorant), 'Georgia', serif",
  body: "var(--font-inter), 'Helvetica Neue', sans-serif",
};

const PACKS = [
  {
    id: 'starter',
    name: 'Seeker',
    credits: 50,
    price: '€2.99',
    priceId: 'price_starter', // Replace with real Stripe price ID
    desc: 'A gentle beginning.',
    perCredit: '€0.06 per session',
    accent: C.dim,
    popular: false,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    credits: 150,
    price: '€7.99',
    priceId: 'price_explorer', // Replace with real Stripe price ID
    desc: 'For the curious and the committed.',
    perCredit: '€0.053 per session',
    accent: C.cyan,
    popular: true,
  },
  {
    id: 'seeker',
    name: 'Initiate',
    credits: 350,
    price: '€14.99',
    priceId: 'price_seeker', // Replace with real Stripe price ID
    desc: 'A deeper practice.',
    perCredit: '€0.043 per session',
    accent: C.violet,
    popular: false,
  },
  {
    id: 'oracle',
    name: 'Oracle',
    credits: 800,
    price: '€29.99',
    priceId: 'price_oracle', // Replace with real Stripe price ID
    desc: 'Unlimited depth. The full journey.',
    perCredit: '€0.037 per session',
    accent: C.cyan,
    popular: false,
  },
];

function CreditCard({ pack }: { pack: typeof PACKS[0]; loading?: boolean; onBuy?: (priceId: string) => void }) {
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
        <p style={{ fontFamily: C.body, fontSize: '0.78rem', fontWeight: 300, color: C.dim }}>{pack.perCredit}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderTop: `0.5px solid ${C.border}`, borderBottom: `0.5px solid ${C.border}` }}>
          <span style={{ fontFamily: C.heading, fontSize: '2rem', fontWeight: 300, color: pack.accent }}>{pack.credits}</span>
          <span style={{ fontFamily: C.body, fontSize: '0.75rem', fontWeight: 300, color: C.dim, letterSpacing: '0.08em' }}>Oracle sessions</span>
        </div>
        <p style={{ fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, color: C.sub, marginTop: 14, lineHeight: 1.7 }}>{pack.desc}</p>
      </div>

      {/* TODO: Enable when Stripe is configured */}
      <div style={{ width: '100%', padding: '14px', borderRadius: 100, border: `0.5px solid ${C.border}`, background: 'rgba(255,255,255,0.02)', color: C.dim, fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, letterSpacing: '0.08em', textAlign: 'center', marginTop: 'auto' }}>
        Coming soon
      </div>
    </motion.div>
  );
}

export default function CreditsPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleBuy(priceId: string, packId: string) {
    setLoadingId(packId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
        setLoadingId(null);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setLoadingId(null);
    }
  }

  return (
    <PageShell>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 28px 120px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontFamily: C.body, fontSize: '0.7rem', letterSpacing: '0.22em', color: C.cyan, textTransform: 'uppercase', marginBottom: 16 }}>Credits</p>
          <h1 style={{ fontFamily: C.heading, fontWeight: 300, fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: C.fg, marginBottom: 20, lineHeight: 1.1 }}>
            Choose your depth
          </h1>
          <p style={{ fontFamily: C.body, fontSize: '0.95rem', fontWeight: 300, color: C.sub, maxWidth: 480, margin: '0 auto', lineHeight: 1.85 }}>
            Each Oracle session uses one credit. Credits never expire and work across all modes — Sense, Animal, Daily, Dream, Shadow, and Word.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 80 }}>
          {PACKS.map(pack => (
            <CreditCard
              key={pack.id}
              pack={pack}
              loading={loadingId === pack.id}
              onBuy={(priceId) => handleBuy(priceId, pack.id)}
            />
          ))}
        </div>

        {/* How credits work */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: C.heading, fontSize: '1.8rem', fontWeight: 300, color: C.fg, marginBottom: 32, textAlign: 'center' }}>How credits work</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '◎', title: 'One credit per session', body: 'Every message exchange with the Oracle uses one credit, regardless of the mode. Daily readings use one credit each morning.' },
              { icon: '∞', title: 'Credits never expire', body: 'Your credits stay in your account indefinitely. There are no monthly fees, no subscriptions — just credits when you need them.' },
              { icon: '📱', title: 'Used inside the app', body: 'Credits are consumed inside the Symponia iOS app. Your balance is stored locally on your device and synced after purchase.' },
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
            Questions about credits or billing? Contact us at{' '}
            <a href="mailto:hello@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>hello@symponia.io</a>
            <br />See our <a href="/terms#credits" style={{ color: C.cyan, textDecoration: 'none' }}>Terms of Service</a> for full details.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
