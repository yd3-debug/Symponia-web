'use client';

import { PageShell } from '@/components/PageShell';
import { motion } from 'framer-motion';
import React from 'react';

const APP_STORE_URL = 'https://apps.apple.com/app/symponia/id6744058607';

const C = {
  bg: '#08080F', bgCard: 'rgba(15,15,26,0.92)',
  fg: '#F1F0FF', sub: '#AEAECE', dim: '#A8A8C8',
  cyan: '#06B6D4', violet: '#9F67FF',
  border: '#1A1A30',
  borderStrong: '#2D2D50',
  heading: "var(--font-cal-sans), 'Inter', sans-serif",
  body: "var(--font-inter), 'Helvetica Neue', sans-serif",
};

function Card({ children, style = {}, accent = false }: { children: React.ReactNode; style?: React.CSSProperties; accent?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'relative',
        borderRadius: 22,
        border: `0.5px solid ${accent ? C.violet + '50' : C.border}`,
        background: accent ? 'rgba(159,103,255,0.05)' : C.bgCard,
        backdropFilter: 'blur(12px)',
        padding: '36px 32px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        ...style,
      }}
    >
      <div style={{ position: 'absolute', inset: '0 0 auto 0', height: '0.5px', background: accent ? C.violet + '60' : C.borderStrong }} />
      {children}
    </motion.div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <span style={{ color: C.violet, fontSize: '0.7rem', marginTop: 4, flexShrink: 0 }}>◆</span>
      <span style={{ fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, color: C.sub, lineHeight: 1.7 }}>{children}</span>
    </div>
  );
}

function BeginCard() {
  return (
    <Card>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: C.body, fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>New arrivals</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: C.heading, fontSize: '3rem', fontWeight: 300, color: C.fg, lineHeight: 1 }}>Free</span>
        </div>
        <p style={{ fontFamily: C.body, fontSize: '0.78rem', fontWeight: 300, color: C.dim }}>A small free allowance to explore Symponia</p>
      </div>

      <div style={{ padding: '16px 0', borderTop: `0.5px solid ${C.border}`, borderBottom: `0.5px solid ${C.border}`, marginBottom: 20 }}>
        <p style={{ fontFamily: C.body, fontSize: '0.84rem', fontWeight: 300, color: C.sub, lineHeight: 1.75 }}>
          Name your seven animal archetypes, receive your constellation portrait, and try a few reflection sessions. No commitment.
        </p>
      </div>

      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 100, background: C.cyan, color: C.bg, fontFamily: C.body, fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.06em', textAlign: 'center', textDecoration: 'none', marginTop: 'auto' }}
      >
        Download on the App Store
      </a>
    </Card>
  );
}

function MonthlyCard() {
  return (
    <Card accent>
      <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 12px', borderRadius: 100, background: C.violet, color: '#fff', fontFamily: C.body, fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Recommended
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: C.body, fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.violet, marginBottom: 8 }}>Symponia Monthly</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: C.heading, fontSize: '3rem', fontWeight: 300, color: C.fg, lineHeight: 1 }}>£12.99</span>
        </div>
        <p style={{ fontFamily: C.body, fontSize: '0.78rem', fontWeight: 300, color: C.dim }}>per month · 350 reflection sessions</p>
      </div>

      <div style={{ padding: '16px 0', borderTop: `0.5px solid ${C.border}`, borderBottom: `0.5px solid ${C.border}`, marginBottom: 20 }}>
        <Bullet>350 sessions across Archetype, My Day, and Conversation modes</Bullet>
        <Bullet>Free daily reflections (don't count against sessions)</Bullet>
        <Bullet>Fresh allotment each month — sessions do not carry over</Bullet>
        <Bullet>Cancel anytime via Apple ID settings</Bullet>
      </div>

      <div style={{ width: '100%', padding: '14px', borderRadius: 100, border: `0.5px solid ${C.violet + '40'}`, background: 'rgba(159,103,255,0.06)', color: C.violet, fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, letterSpacing: '0.08em', textAlign: 'center', marginTop: 'auto' }}>
        Available in the app
      </div>
    </Card>
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
            Start free. Go monthly when you&apos;re ready.
          </p>
        </div>

        {/* Cards */}
        <div style={{ maxWidth: 720, margin: '0 auto 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            <BeginCard />
            <MonthlyCard />
          </div>
        </div>

        {/* How it works */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: C.heading, fontSize: '1.8rem', fontWeight: 300, color: C.fg, marginBottom: 32, textAlign: 'center' }}>How it works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '◎', title: 'One session per reflection', body: 'Each back-and-forth with Symponia uses one session. Daily reflections are free and do not count toward your allotment.' },
              { icon: '🔄', title: 'Monthly resets', body: 'Your 350 monthly sessions reset at each renewal. Unused sessions do not carry over.' },
              { icon: '📱', title: 'Purchase inside the app', body: 'All purchases happen inside the Symponia iOS app via Apple In-App Purchase.' },
              { icon: '🔒', title: 'Secure payment via Apple', body: 'All payments are processed by Apple. We never see or store your card details.' },
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
            Questions about subscriptions or billing? Contact us at{' '}
            <a href="mailto:hello@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>hello@symponia.io</a>
            <br />See our <a href="/terms#tokens" style={{ color: C.cyan, textDecoration: 'none' }}>Terms of Service</a> for full details.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
