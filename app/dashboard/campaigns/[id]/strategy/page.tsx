'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
import type { StrategyIdea } from '@/lib/agents/strategy-agent';
import type { Campaign } from '@/lib/airtable';
import { PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444',
};

const POTENTIAL_COLORS = { High: C.green, Medium: C.amber, Low: C.red };

function IdeaCard({ idea, selected, onSelect }: { idea: StrategyIdea; selected: boolean; onSelect: () => void }) {
  const platformColor = PLATFORM_COLORS[idea.bestPlatform] ?? C.purple;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onSelect}
      style={{
        background: C.surface,
        border: `1px solid ${selected ? C.purple : C.border}`,
        borderRadius: 16, padding: '20px 24px', cursor: 'pointer',
        boxShadow: selected ? `0 0 0 1px ${C.purple}, 0 0 40px rgba(124,58,237,0.15)` : '0 0 0 1px #1A1A30, 0 4px 24px rgba(0,0,0,0.4)',
        position: 'relative', transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 22, height: 22, borderRadius: '50%',
            background: C.purple, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Check size={12} color="#fff" />
        </motion.div>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', fontWeight: 500, padding: '3px 9px', borderRadius: 5, background: `${platformColor}20`, color: platformColor, border: `1px solid ${platformColor}40` }}>
          {idea.bestPlatform}
        </span>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', fontWeight: 500, padding: '3px 9px', borderRadius: 5, background: C.elevated, color: C.sub, border: `1px solid ${C.border}` }}>
          {idea.contentFormat}
        </span>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', fontWeight: 500, padding: '3px 9px', borderRadius: 5, background: `${POTENTIAL_COLORS[idea.engagementPotential]}18`, color: POTENTIAL_COLORS[idea.engagementPotential], border: `1px solid ${POTENTIAL_COLORS[idea.engagementPotential]}30` }}>
          {idea.engagementPotential} engagement
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1rem', fontWeight: 600, color: C.fg, marginBottom: 8, lineHeight: 1.3 }}>
        {idea.title}
      </h3>

      {/* Angle */}
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: C.sub, lineHeight: 1.65, marginBottom: 14 }}>
        {idea.angle}
      </p>

      {/* Hook */}
      <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', letterSpacing: '0.15em', color: C.dim, textTransform: 'uppercase', marginBottom: 4 }}>Hook</div>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: C.fg, fontStyle: 'italic' }}>"{idea.hook}"</div>
      </div>

      {/* Trending score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TrendingUp size={12} color={C.cyan} />
        <div style={{ flex: 1, height: 4, background: C.elevated, borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${idea.trendingScore * 10}%` }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${C.purple}, ${C.cyan})`, borderRadius: 2 }}
          />
        </div>
        <span style={{ fontFamily: "var(--font-jetbrains-mono), 'Courier New', monospace", fontSize: '0.7rem', color: C.sub }}>
          {idea.trendingScore}/10
        </span>
      </div>
    </motion.div>
  );
}

export default function StrategyPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [ideas, setIdeas] = useState<StrategyIdea[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`).then(r => r.json()).then(d => setCampaign(d.campaign));
    fetch('/api/agents/strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: id }),
    }).then(r => r.json()).then(d => {
      if (d.ideas) setIdeas(d.ideas);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  function toggleSelect(i: number) {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  }

  async function generateContent() {
    setGenerating(true);
    router.push(`/dashboard/campaigns/${id}/content`);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ marginBottom: 24 }}>
          <Loader2 size={32} color={C.purple} />
        </motion.div>
        <h2 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.4rem', fontWeight: 600, color: C.fg, marginBottom: 8 }}>
          Strategy Agent Thinking…
        </h2>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: C.sub }}>
          Generating 5 campaign ideas based on your research.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Campaign Ideas</div>
          <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>5 Campaign Concepts</h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: C.sub, marginTop: 6 }}>
            Select one or more ideas to generate full content for.
          </p>
        </div>

        <AnimatePresence>
          {selected.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={generateContent}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 10,
                background: C.purple, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-inter)', fontSize: '0.88rem', fontWeight: 500, color: '#fff',
                boxShadow: '0 0 24px rgba(124,58,237,0.3)',
              }}
            >
              Generate Content ({selected.size} idea{selected.size > 1 ? 's' : ''}) <ArrowRight size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {ideas.map((idea, i) => (
          <IdeaCard key={i} idea={idea} selected={selected.has(i)} onSelect={() => toggleSelect(i)} />
        ))}
      </div>
    </div>
  );
}
