'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Loader2, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import type { StrategyIdea } from '@/lib/agents/strategy-agent';
import type { Campaign } from '@/lib/airtable';
import { PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#07060f', surface: '#0e0c1e', elevated: '#141228',
  border: 'rgba(255,255,255,0.07)', borderAccent: 'rgba(124,58,237,0.4)',
  purple: '#7c3aed', purpleLight: '#a78bfa', purpleDim: 'rgba(124,58,237,0.12)',
  cyan: '#22d3ee', fg: '#f0eeff', sub: '#9d97c0', dim: '#4e4a70',
  green: '#34d399', amber: '#fbbf24', red: '#f87171',
};

const FORMAT_ICONS: Record<string, string> = {
  Carousel: '🎠', Reel: '🎬', Thread: '🧵', Article: '📝',
  Story: '◎', Video: '▶', Post: '📸',
};

function IdeaCard({
  idea, index, selected, onSelect,
}: {
  idea: StrategyIdea; index: number; selected: boolean; onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const platformColor = PLATFORM_COLORS[idea.bestPlatform as any] ?? C.purple;
  const engColor = idea.engagementPotential === 'High' ? C.green : idea.engagementPotential === 'Medium' ? C.amber : C.red;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={onSelect}
      style={{
        background: selected ? `linear-gradient(135deg, rgba(124,58,237,0.08), rgba(34,211,238,0.04))` : C.surface,
        border: `1px solid ${selected ? C.borderAccent : C.border}`,
        borderRadius: 16, padding: '20px 22px', cursor: 'pointer',
        boxShadow: selected ? `0 0 0 1px rgba(124,58,237,0.3), 0 8px 32px rgba(124,58,237,0.12)` : `0 2px 12px rgba(0,0,0,0.3)`,
        transition: 'all 0.18s ease', position: 'relative',
      }}
    >
      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 24, height: 24, borderRadius: '50%',
            background: C.purple, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(124,58,237,0.5)',
          }}
        >
          <Check size={13} color="#fff" />
        </motion.div>
      )}

      {/* Badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '3px 9px', borderRadius: 5,
          background: `${platformColor}18`, color: platformColor, border: `1px solid ${platformColor}35`,
        }}>{idea.bestPlatform}</span>
        <span style={{
          fontSize: '0.6rem', fontWeight: 500, padding: '3px 9px', borderRadius: 5,
          background: C.elevated, color: C.sub, border: `1px solid ${C.border}`,
        }}>
          {FORMAT_ICONS[idea.contentFormat] ?? '◈'} {idea.contentFormat}
        </span>
        <span style={{
          fontSize: '0.6rem', fontWeight: 500, padding: '3px 9px', borderRadius: 5,
          background: `${engColor}15`, color: engColor, border: `1px solid ${engColor}30`,
        }}>{idea.engagementPotential} potential</span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "var(--font-syne), 'Inter', sans-serif",
        fontSize: '1rem', fontWeight: 600, color: C.fg, marginBottom: 8, lineHeight: 1.3,
      }}>
        {idea.title}
      </h3>

      {/* Angle */}
      <p style={{ fontSize: '0.8rem', color: C.sub, lineHeight: 1.7, marginBottom: 14 }}>
        {idea.angle}
      </p>

      {/* Hook box */}
      <div style={{
        background: C.elevated, border: `1px solid ${C.border}`,
        borderLeft: `2px solid ${C.purpleLight}`,
        borderRadius: 8, padding: '10px 14px', marginBottom: 14,
      }}>
        <div style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase', marginBottom: 5 }}>Hook</div>
        <div style={{ fontSize: '0.82rem', color: C.fg, fontStyle: 'italic', lineHeight: 1.5 }}>"{idea.hook}"</div>
      </div>

      {/* Trending score bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <TrendingUp size={12} color={C.cyan} />
        <div style={{ flex: 1, height: 4, background: C.elevated, borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${idea.trendingScore * 10}%` }}
            transition={{ duration: 0.7, delay: index * 0.07 + 0.2 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${C.purple}, ${C.cyan})`, borderRadius: 2 }}
          />
        </div>
        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.68rem', color: C.sub, minWidth: 32 }}>
          {idea.trendingScore}/10
        </span>
      </div>

      {/* Expand for reason */}
      {(idea.trendingReason || idea.engagementReason) && (
        <button
          onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.68rem', color: C.dim, padding: 0,
          }}
        >
          <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          {expanded ? 'Less' : 'Why this works'}
        </button>
      )}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginTop: 10 }}
          >
            {idea.trendingReason && (
              <p style={{ fontSize: '0.73rem', color: C.sub, lineHeight: 1.6, marginBottom: 6 }}>
                <span style={{ color: C.cyan }}>Trending:</span> {idea.trendingReason}
              </p>
            )}
            {idea.engagementReason && (
              <p style={{ fontSize: '0.73rem', color: C.sub, lineHeight: 1.6 }}>
                <span style={{ color: C.green }}>Engagement:</span> {idea.engagementReason}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
  const [genPhase, setGenPhase] = useState('');

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
    if (!selected.size) return;
    setGenerating(true);

    const selectedIdeas = [...selected].map(i => ideas[i]).filter(Boolean);
    const platforms = campaign?.platforms ?? [];

    // Show animated phases
    const phases = [
      ...selectedIdeas.map(idea => `Writing "${idea.title}"…`),
      ...platforms.map(p => `Crafting ${p} scripts…`),
      'Saving to Airtable…',
    ];
    let phaseIdx = 0;
    setGenPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIdx = Math.min(phaseIdx + 1, phases.length - 1);
      setGenPhase(phases[phaseIdx]);
    }, 2000);

    try {
      await fetch('/api/agents/content/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, ideas: selectedIdeas }),
      });
    } catch {
      // batch endpoint fires in background — error just means the request sent
    }

    clearInterval(phaseInterval);
    router.push(`/dashboard/campaigns/${id}/content`);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center', gap: 20 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${C.border}`, borderTop: `2px solid ${C.purple}` }}
        />
        <div>
          <div style={{ fontFamily: "var(--font-syne), 'Inter', sans-serif", fontSize: '1.3rem', fontWeight: 600, color: C.fg, marginBottom: 6 }}>
            Strategy Agent Thinking
          </div>
          <div style={{ fontSize: '0.82rem', color: C.sub }}>
            Generating 5 campaign concepts from your research…
          </div>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center', gap: 24 }}>
        <motion.div
          animate={{ scale: [1, 1.06, 1], boxShadow: [`0 0 32px rgba(124,58,237,0.2)`, `0 0 64px rgba(124,58,237,0.4)`, `0 0 32px rgba(124,58,237,0.2)`] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Sparkles size={26} color="#fff" />
        </motion.div>
        <div>
          <div style={{ fontFamily: "var(--font-syne), 'Inter', sans-serif", fontSize: '1.4rem', fontWeight: 600, color: C.fg, marginBottom: 8 }}>
            Generating Scripts & Content
          </div>
          <motion.div
            key={genPhase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '0.85rem', color: C.sub }}
          >
            {genPhase}
          </motion.div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: C.purple }}
            />
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: C.dim, maxWidth: 320 }}>
          Writing platform-native copy + scripts for {campaign?.platforms?.length ?? 0} platforms. This takes 1–3 minutes.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Campaign Ideas</div>
          <h1 style={{ fontFamily: "var(--font-syne), 'Inter', sans-serif", fontSize: '1.7rem', fontWeight: 700, color: C.fg, marginBottom: 6 }}>
            5 Strategic Concepts
          </h1>
          <p style={{ fontSize: '0.82rem', color: C.sub, lineHeight: 1.6 }}>
            Select ideas to generate full scripts & copy for every platform.
          </p>
        </div>

        <AnimatePresence>
          {selected.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={generateContent}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '13px 26px', borderRadius: 12,
                background: `linear-gradient(135deg, ${C.purple}, #5b21b6)`,
                border: 'none', cursor: 'pointer',
                fontSize: '0.88rem', fontWeight: 600, color: '#fff',
                boxShadow: '0 0 32px rgba(124,58,237,0.4)',
              }}
            >
              <Sparkles size={15} />
              Generate Scripts ({selected.size} idea{selected.size > 1 ? 's' : ''})
              <ArrowRight size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Ideas grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {ideas.map((idea, i) => (
          <IdeaCard
            key={i} idea={idea} index={i}
            selected={selected.has(i)}
            onSelect={() => toggleSelect(i)}
          />
        ))}
      </div>

      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 28, padding: '16px 20px',
            background: C.purpleDim, border: `1px solid ${C.borderAccent}`,
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: C.sub }}>
            <span style={{ color: C.fg, fontWeight: 500 }}>{selected.size} idea{selected.size > 1 ? 's' : ''} selected</span>
            {' · '}{campaign?.platforms?.length ?? 0} platforms
            {' · '}{(selected.size * (campaign?.platforms?.length ?? 1))} pieces of content will be generated
          </div>
          <button
            onClick={generateContent}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 9,
              background: C.purple, border: 'none', cursor: 'pointer',
              fontSize: '0.83rem', fontWeight: 500, color: '#fff',
            }}
          >
            <Sparkles size={13} /> Generate Scripts <ArrowRight size={13} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
