'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MessageSquare, Search, Users, ArrowRight, Loader2 } from 'lucide-react';
import type { ResearchOutput } from '@/lib/agents/research-agent';
import type { Campaign } from '@/lib/airtable';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B',
};

const POTENTIAL_COLORS = { High: C.green, Medium: C.amber, Low: C.dim };

export default function ResearchPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [research, setResearch] = useState<ResearchOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [phase, setPhase] = useState('Scanning Reddit…');

  const PHASES = ['Scanning Reddit…', 'Finding trends…', 'Analysing SEO…', 'Researching competitors…'];

  useEffect(() => {
    // Load campaign
    fetch(`/api/campaigns/${id}`)
      .then(r => r.json())
      .then(d => setCampaign(d.campaign));

    // Poll for research results (research agent runs in background after campaign creation)
    let attempt = 0;
    let phaseIdx = 0;
    setPolling(true);

    const interval = setInterval(async () => {
      phaseIdx = (phaseIdx + 1) % PHASES.length;
      setPhase(PHASES[phaseIdx]);

      // Try to load research from API
      attempt++;
      try {
        const res = await fetch(`/api/agents/research`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: id }),
        });
        const data = await res.json();
        if (data.research) {
          setResearch(data.research);
          setLoading(false);
          setPolling(false);
          clearInterval(interval);
        }
      } catch {}

      if (attempt > 30) { clearInterval(interval); setLoading(false); setPolling(false); }
    }, 4000);

    // Try immediately
    fetch('/api/agents/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: id }),
    }).then(r => r.json()).then(d => {
      if (d.research) { setResearch(d.research); setLoading(false); setPolling(false); clearInterval(interval); }
    }).catch(() => {});

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ marginBottom: 24 }}>
          <Loader2 size={32} color={C.purple} />
        </motion.div>
        <h2 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.4rem', fontWeight: 600, color: C.fg, marginBottom: 8 }}>
          Research Agent Working
        </h2>
        <motion.p
          key={phase}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: C.sub }}
        >
          {phase}
        </motion.p>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
          {['Scanning Reddit', 'Finding trends', 'Analysing SEO', 'Researching competitors'].map((t, i) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: C.purple }}
              />
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.elevated, overflow: 'hidden' }}>
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                  style={{ height: '100%', width: '40%', background: `linear-gradient(90deg, transparent, ${C.purple}, transparent)` }}
                />
              </div>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: C.dim, width: 120, textAlign: 'left' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: C.sub }}>Research failed. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Research Report</div>
        <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>{campaign?.campaignName}</h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: C.sub, marginTop: 6 }}>{research.summary}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Trending Topics */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px', gridColumn: '1 / -1' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={15} color={C.purple} />
            <span style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: C.fg }}>Trending Topics</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {research.trendingTopics.map((t, i) => (
              <div key={i} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.82rem', fontWeight: 500, color: C.fg, flex: 1 }}>{t.topic}</div>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 5, background: `${POTENTIAL_COLORS[t.viralPotential]}18`, color: POTENTIAL_COLORS[t.viralPotential], border: `1px solid ${POTENTIAL_COLORS[t.viralPotential]}30`, flexShrink: 0, marginLeft: 8 }}>
                    {t.viralPotential}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: C.sub, marginBottom: 8, lineHeight: 1.6 }}>{t.contentAngle}</div>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: C.dim }}>{t.why}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reddit Insights */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <MessageSquare size={15} color="#FF6314" />
            <span style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: C.fg }}>Reddit Insights</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {research.redditInsights.map((r, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${C.border}`, paddingLeft: 14 }}>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', fontWeight: 500, color: C.fg, marginBottom: 4 }}>{r.painPoint}</div>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: C.sub, fontStyle: 'italic', marginBottom: 6 }}>"{r.audienceQuote}"</div>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: C.cyan }}>→ {r.contentOpportunity}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SEO Keywords */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Search size={15} color={C.cyan} />
            <span style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: C.fg }}>SEO Keywords</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {research.seoKeywords.slice(0, 8).map((k, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 7 ? `1px solid ${C.border}` : 'none' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.82rem', color: C.fg, fontWeight: 500 }}>{k.keyword}</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: C.dim, marginLeft: 8 }}>{k.searchIntent}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', padding: '2px 7px', borderRadius: 4, background: `${POTENTIAL_COLORS[k.opportunity]}18`, color: POTENTIAL_COLORS[k.opportunity] }}>
                    {k.opportunity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}
      >
        <button
          onClick={() => router.push(`/dashboard/campaigns/${id}/strategy`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10,
            background: C.purple, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-inter)', fontSize: '0.88rem', fontWeight: 500, color: '#fff',
            boxShadow: '0 0 24px rgba(124,58,237,0.3)',
          }}
        >
          Generate 5 Ideas <ArrowRight size={15} />
        </button>
      </motion.div>
    </div>
  );
}
