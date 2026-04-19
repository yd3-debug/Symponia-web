'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Edit2, RefreshCw, Sparkles, Copy, Image as ImageIcon,
  ChevronDown, ChevronUp, Loader2, Zap, Clock, Wand2,
} from 'lucide-react';
import type { Campaign, ContentPiece } from '@/lib/airtable';
import { PLATFORM_COLORS } from '@/lib/platform-specs';
import type { ShadowWork } from '@/lib/agents/shadow-agent';

// ── Brand theme (Symponia) ─────────────────────────────────────────────────────
const C = {
  bg:          '#07060f',
  surface:     '#0e0c1e',
  elevated:    '#141228',
  border:      'rgba(255,255,255,0.07)',
  borderAcc:   'rgba(124,58,237,0.35)',
  purple:      '#7c3aed',
  purpleLight: '#a78bfa',
  purpleDim:   'rgba(124,58,237,0.1)',
  cyan:        '#22d3ee',
  cyanDim:     'rgba(34,211,238,0.08)',
  fg:          '#f0eeff',
  sub:         '#9d97c0',
  dim:         '#4e4a70',
  green:       '#34d399',
  amber:       '#fbbf24',
  red:         '#f87171',
  syne:        "var(--font-syne), 'Inter', sans-serif",
  inter:       "var(--font-inter), 'DM Sans', sans-serif",
  mono:        "var(--font-jetbrains-mono), 'Fira Code', monospace",
};

// ── Script renderer ────────────────────────────────────────────────────────────

function ScriptBlock({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  return (
    <div style={{
      background: '#050411', border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '14px 16px',
      fontFamily: C.mono, fontSize: '0.78rem',
      lineHeight: 1.9, color: C.fg,
    }}>
      {lines.map((line, i) => {
        const isTimestamp = /^\[\d+:\d+\]/.test(line);
        const isStage = /^(HOOK|CTA|MAIN|BRIDGE|OUTRO|INTRO)[:—]/i.test(line);
        return (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 2 }}>
            {isTimestamp && (
              <span style={{ color: C.cyan, minWidth: 50, flexShrink: 0 }}>
                {line.match(/\[\d+:\d+\]/)?.[0]}
              </span>
            )}
            <span style={{
              color: isStage ? C.purpleLight : isTimestamp ? C.sub : C.fg,
              fontWeight: isStage ? 600 : 400,
            }}>
              {isTimestamp ? line.replace(/^\[\d+:\d+\]\s*/, '') : line}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SlidesDeck({ slides }: { slides: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding: '4px 10px', borderRadius: 6, border: `1px solid ${i === active ? C.purple : C.border}`,
            background: i === active ? C.purpleDim : C.elevated,
            color: i === active ? C.purpleLight : C.dim,
            fontSize: '0.68rem', fontWeight: i === active ? 600 : 400, cursor: 'pointer',
          }}>
            Slide {i + 1}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          style={{
            background: C.elevated, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '14px 16px',
            fontSize: '0.83rem', color: C.fg, lineHeight: 1.7,
          }}
        >
          {slides[active]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Shadow work panel ──────────────────────────────────────────────────────────

function ShadowWorkPanel({ campaignId, platform, contentBody }: {
  campaignId: string; platform: string; contentBody: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shadow, setShadow] = useState<ShadowWork | null>(null);
  const [copied, setCopied] = useState('');

  async function runShadow() {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/shadow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, platform, contentBody: contentBody.slice(0, 800) }),
      });
      const data = await res.json();
      if (data.shadowWork) setShadow(data.shadowWork);
    } catch {}
    setLoading(false);
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <div style={{ marginTop: 16, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => { setOpen(!open); if (!open && !shadow) runShadow(); }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: C.elevated,
          border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wand2 size={14} color={C.purpleLight} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.fg }}>Content Optimizer</span>
          <span style={{
            fontSize: '0.58rem', padding: '2px 7px', borderRadius: 4,
            background: 'rgba(167,139,250,0.15)', color: C.purpleLight,
            border: `1px solid rgba(167,139,250,0.25)`, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>A/B · Hooks · Hashtags</span>
        </div>
        {loading ? <Loader2 size={14} color={C.dim} style={{ animation: 'spin 1s linear infinite' }} />
                 : open ? <ChevronUp size={14} color={C.dim} /> : <ChevronDown size={14} color={C.dim} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {loading && !shadow && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: C.sub, fontSize: '0.8rem' }}>
                  <Loader2 size={20} color={C.purple} style={{ marginBottom: 8 }} />
                  <br />Analysing content performance...…
                </div>
              )}

              {shadow && (
                <>
                  {/* Alternative Hooks */}
                  <div>
                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase', marginBottom: 10 }}>
                      5 Hook Variants (A/B Test These)
                    </div>
                    {shadow.alternativeHooks.map((hook, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
                        padding: '9px 12px', marginBottom: 6,
                        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                      }}>
                        <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                          <span style={{
                            fontFamily: C.mono, fontSize: '0.6rem', color: C.purple,
                            minWidth: 18, marginTop: 1,
                          }}>0{i + 1}</span>
                          <span style={{ fontSize: '0.8rem', color: C.fg, lineHeight: 1.5 }}>{hook}</span>
                        </div>
                        <button onClick={() => copy(hook, `hook-${i}`)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: copied === `hook-${i}` ? C.green : C.dim, flexShrink: 0,
                        }}>
                          <Copy size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* CTA Variants */}
                  <div>
                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase', marginBottom: 10 }}>
                      CTA Variants
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {shadow.ctaVariants.map((cta, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                        }}>
                          <span style={{ fontSize: '0.8rem', color: C.fg }}>{cta}</span>
                          <button onClick={() => copy(cta, `cta-${i}`)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: copied === `cta-${i}` ? C.green : C.dim,
                          }}>
                            <Copy size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Engagement Bait */}
                  <div>
                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase', marginBottom: 10 }}>
                      Comment Starters
                    </div>
                    {shadow.engagementBait.map((q, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', marginBottom: 6,
                        background: `rgba(34,211,238,0.04)`, border: `1px solid rgba(34,211,238,0.12)`, borderRadius: 8,
                      }}>
                        <span style={{ fontSize: '0.8rem', color: C.fg }}>{q}</span>
                        <button onClick={() => copy(q, `bait-${i}`)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: copied === `bait-${i}` ? C.green : C.dim,
                        }}>
                          <Copy size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Posting time + hashtags */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase', marginBottom: 8 }}>Best Post Time</div>
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        padding: '10px 12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                      }}>
                        <Clock size={13} color={C.amber} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.78rem', color: C.fg, lineHeight: 1.5 }}>{shadow.bestPostTime}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase', marginBottom: 8 }}>A/B Test Notes</div>
                      <div style={{
                        padding: '10px 12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                        fontSize: '0.75rem', color: C.sub, lineHeight: 1.5,
                      }}>
                        {shadow.abTestNotes}
                      </div>
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase', marginBottom: 10 }}>
                      Hashtag Strategy
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {([
                        { label: 'Primary', tags: shadow.hashtagStrategy.primary, color: C.purpleLight },
                        { label: 'Niche', tags: shadow.hashtagStrategy.niche, color: C.cyan },
                        { label: 'Trending', tags: shadow.hashtagStrategy.trending, color: C.amber },
                      ] as const).map(({ label, tags, color }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '0.62rem', color: C.dim, minWidth: 56 }}>{label}</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {tags.map((tag, i) => (
                              <button key={i} onClick={() => copy(tag, `tag-${label}-${i}`)} style={{
                                padding: '2px 8px', borderRadius: 5, border: `1px solid ${color}30`,
                                background: `${color}10`, color, fontSize: '0.68rem',
                                cursor: 'pointer', fontFamily: C.mono,
                              }}>
                                {copied === `tag-${label}-${i}` ? '✓' : tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Rich content parser ────────────────────────────────────────────────────────

function parseContent(raw: string): Record<string, any> | null {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {}
  return null;
}

function RichContentView({ piece, platform }: { piece: ContentPiece; platform: string }) {
  const data = parseContent(piece.contentBody);
  if (!data) {
    return (
      <div style={{ fontSize: '0.85rem', color: C.sub, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
        {piece.contentBody}
      </div>
    );
  }

  const sections: JSX.Element[] = [];

  // Instagram
  if (platform === 'Instagram') {
    if (data.caption) sections.push(
      <div key="caption">
        <SectionLabel>Caption</SectionLabel>
        <div style={{ fontSize: '0.85rem', color: C.fg, lineHeight: 1.8 }}>{data.caption}</div>
      </div>
    );
    if (data.storyCopy?.length) sections.push(
      <div key="story">
        <SectionLabel>Story Slides</SectionLabel>
        <SlidesDeck slides={data.storyCopy} />
      </div>
    );
    if (data.reelScript15s || data.reelScript30s || data.reelScript60s) {
      const scripts = [
        { label: '15s', text: data.reelScript15s },
        { label: '30s', text: data.reelScript30s },
        { label: '60s', text: data.reelScript60s },
      ].filter(s => s.text);
      sections.push(
        <div key="reels">
          <SectionLabel>Reel Scripts</SectionLabel>
          <ScriptTabs scripts={scripts} />
        </div>
      );
    }
    if (data.seoAltText) sections.push(
      <div key="seo">
        <SectionLabel>SEO Alt Text</SectionLabel>
        <div style={{ fontSize: '0.78rem', color: C.sub, lineHeight: 1.6, fontStyle: 'italic' }}>{data.seoAltText}</div>
      </div>
    );
  }

  // TikTok
  if (platform === 'TikTok') {
    if (data.hookLine) sections.push(
      <div key="hook">
        <SectionLabel>Opening Hook (first 3 seconds)</SectionLabel>
        <div style={{
          padding: '12px 16px', background: 'rgba(251,191,36,0.06)',
          border: `1px solid rgba(251,191,36,0.2)`, borderRadius: 10,
          fontSize: '0.9rem', fontWeight: 600, color: C.amber, lineHeight: 1.5,
        }}>
          "{data.hookLine}"
        </div>
      </div>
    );
    const scripts = [
      { label: '15s', text: data.script15s },
      { label: '30s', text: data.script30s },
      { label: '60s', text: data.script60s },
    ].filter(s => s.text);
    if (scripts.length) sections.push(
      <div key="scripts">
        <SectionLabel>Video Scripts</SectionLabel>
        <ScriptTabs scripts={scripts} />
      </div>
    );
    if (data.textOverlayCopy?.length) sections.push(
      <div key="overlays">
        <SectionLabel>Text Overlays</SectionLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {data.textOverlayCopy.map((t: string, i: number) => (
            <div key={i} style={{
              padding: '6px 12px', background: C.elevated, border: `1px solid ${C.border}`,
              borderRadius: 8, fontSize: '0.78rem', color: C.fg,
            }}>{t}</div>
          ))}
        </div>
      </div>
    );
    if (data.soundSuggestion) sections.push(
      <div key="sound">
        <SectionLabel>Sound Suggestion</SectionLabel>
        <div style={{ fontSize: '0.8rem', color: C.cyan }}>{data.soundSuggestion}</div>
      </div>
    );
  }

  // LinkedIn
  if (platform === 'LinkedIn') {
    if (data.shortPost) sections.push(
      <div key="short">
        <SectionLabel>Short Post</SectionLabel>
        <div style={{ fontSize: '0.85rem', color: C.fg, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{data.shortPost}</div>
      </div>
    );
    if (data.longFormPost) sections.push(
      <div key="long">
        <SectionLabel>Long-form Article</SectionLabel>
        <div style={{ fontSize: '0.82rem', color: C.sub, lineHeight: 1.9, whiteSpace: 'pre-wrap', maxHeight: 240, overflow: 'auto' }}>{data.longFormPost}</div>
      </div>
    );
    if (data.headlineOptions?.length) sections.push(
      <div key="headlines">
        <SectionLabel>Headline Options</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.headlineOptions.map((h: string, i: number) => (
            <div key={i} style={{ padding: '8px 12px', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: '0.82rem', color: C.fg }}>{h}</div>
          ))}
        </div>
      </div>
    );
  }

  // Twitter/X
  if (platform === 'Twitter/X') {
    if (data.hookTweet) sections.push(
      <div key="hook">
        <SectionLabel>Hook Tweet</SectionLabel>
        <div style={{ fontSize: '0.88rem', color: C.fg, lineHeight: 1.7 }}>{data.hookTweet}</div>
      </div>
    );
    if (data.thread?.length) sections.push(
      <div key="thread">
        <SectionLabel>Thread ({data.thread.length} tweets)</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.thread.map((t: string, i: number) => (
            <div key={i} style={{
              padding: '10px 14px', background: C.elevated, border: `1px solid ${C.border}`,
              borderLeft: `2px solid ${C.purpleLight}`, borderRadius: '0 8px 8px 0',
              fontSize: '0.83rem', color: C.fg, lineHeight: 1.6,
            }}>
              <span style={{ fontFamily: C.mono, fontSize: '0.58rem', color: C.dim, marginBottom: 4, display: 'block' }}>
                {i + 1}/{data.thread.length}
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>
    );
    if (data.engagementVariant) sections.push(
      <div key="engage">
        <SectionLabel>Engagement Variant</SectionLabel>
        <div style={{ fontSize: '0.85rem', color: C.cyan, lineHeight: 1.7 }}>{data.engagementVariant}</div>
      </div>
    );
  }

  // YouTube
  if (platform === 'YouTube') {
    const scripts = [
      { label: '30s', text: data.shortScript30s },
      { label: '60s', text: data.shortScript60s },
    ].filter(s => s.text);
    if (scripts.length) sections.push(
      <div key="scripts">
        <SectionLabel>YouTube Shorts Scripts</SectionLabel>
        <ScriptTabs scripts={scripts} />
      </div>
    );
    if (data.thumbnailTextOptions?.length) sections.push(
      <div key="thumbs">
        <SectionLabel>Thumbnail Text Options</SectionLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {data.thumbnailTextOptions.map((t: string, i: number) => (
            <div key={i} style={{
              padding: '8px 14px', background: '#111', border: `1px solid ${C.border}`,
              borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, color: '#fff',
            }}>{t}</div>
          ))}
        </div>
      </div>
    );
  }

  // Facebook
  if (platform === 'Facebook') {
    if (data.postCopy) sections.push(
      <div key="post">
        <SectionLabel>Post Copy</SectionLabel>
        <div style={{ fontSize: '0.85rem', color: C.fg, lineHeight: 1.8 }}>{data.postCopy}</div>
      </div>
    );
    if (data.adCopyVariant) sections.push(
      <div key="ad">
        <SectionLabel>Ad Copy Variant</SectionLabel>
        <div style={{ fontSize: '0.82rem', color: C.sub, lineHeight: 1.7, fontStyle: 'italic' }}>{data.adCopyVariant}</div>
      </div>
    );
  }

  // Pinterest
  if (platform === 'Pinterest') {
    if (data.pinTitle) sections.push(
      <div key="title">
        <SectionLabel>Pin Title</SectionLabel>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.fg }}>{data.pinTitle}</div>
      </div>
    );
    if (data.pinDescription) sections.push(
      <div key="desc">
        <SectionLabel>Description</SectionLabel>
        <div style={{ fontSize: '0.83rem', color: C.sub, lineHeight: 1.7 }}>{data.pinDescription}</div>
      </div>
    );
    if (data.boardSuggestion) sections.push(
      <div key="board">
        <SectionLabel>Board</SectionLabel>
        <div style={{ fontSize: '0.8rem', color: C.cyan }}>{data.boardSuggestion}</div>
      </div>
    );
  }

  // Fallback — show body field if no structured sections
  if (!sections.length) {
    const bodyText = data.body ?? data.caption ?? data.hookTweet ?? data.longFormPost ?? piece.contentBody;
    sections.push(
      <div key="body" style={{ fontSize: '0.85rem', color: C.sub, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
        {bodyText}
      </div>
    );
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{sections}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.58rem', letterSpacing: '0.15em', color: '#4e4a70',
      textTransform: 'uppercase', marginBottom: 8, fontWeight: 600,
    }}>
      {children}
    </div>
  );
}

function ScriptTabs({ scripts }: { scripts: { label: string; text: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {scripts.map((s, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding: '5px 12px', borderRadius: 6,
            border: `1px solid ${i === active ? C.purple : C.border}`,
            background: i === active ? C.purpleDim : C.elevated,
            color: i === active ? C.purpleLight : C.dim,
            fontSize: '0.7rem', fontWeight: i === active ? 600 : 400, cursor: 'pointer',
          }}>
            {s.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ScriptBlock text={scripts[active].text} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Content card ───────────────────────────────────────────────────────────────

function ContentCard({
  piece, campaignId, onApprove, onGenerateVisuals,
}: {
  piece: ContentPiece; campaignId: string;
  onApprove: (id: string) => void;
  onGenerateVisuals: (piece: ContentPiece) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(piece.contentBody);
  const [copied, setCopied] = useState(false);
  const color = PLATFORM_COLORS[piece.platform] ?? C.purple;
  const isApproved = piece.status === 'Approved';
  const rawText = (() => {
    try {
      const d = JSON.parse(body);
      return d.caption ?? d.hookTweet ?? d.longFormPost ?? d.postCopy ?? d.pinTitle ?? d.script30s ?? body;
    } catch { return body; }
  })();

  function copyAll() {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: C.surface,
        border: `1px solid ${isApproved ? 'rgba(52,211,153,0.25)' : C.border}`,
        borderRadius: 16,
        boxShadow: isApproved ? '0 0 24px rgba(52,211,153,0.06)' : '0 4px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: `1px solid ${C.border}`,
        background: C.elevated,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {piece.platform}
          </span>
          <span style={{ fontSize: '0.68rem', color: C.dim }}>· {piece.contentType}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isApproved && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.62rem', padding: '2px 8px', borderRadius: 4,
              background: 'rgba(52,211,153,0.1)', color: C.green, border: `1px solid rgba(52,211,153,0.2)`,
            }}>
              <Check size={10} /> Approved
            </span>
          )}
          {piece.seoScore && (
            <span style={{
              fontFamily: C.mono, fontSize: '0.62rem',
              padding: '2px 8px', borderRadius: 4,
              background: piece.seoScore >= 80 ? 'rgba(52,211,153,0.1)' : piece.seoScore >= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
              color: piece.seoScore >= 80 ? C.green : piece.seoScore >= 60 ? C.amber : C.red,
              border: `1px solid ${piece.seoScore >= 80 ? 'rgba(52,211,153,0.25)' : piece.seoScore >= 60 ? 'rgba(251,191,36,0.25)' : 'rgba(248,113,113,0.25)'}`,
            }}>
              SEO {piece.seoScore}
            </span>
          )}
          <button onClick={copyAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? C.green : C.dim }}>
            <Copy size={13} />
          </button>
        </div>
      </div>

      {/* Content body */}
      <div style={{ padding: '20px 18px' }}>
        {editing ? (
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            style={{
              width: '100%', minHeight: 160,
              background: C.elevated, border: `1px solid ${C.purple}`,
              boxShadow: '0 0 0 3px rgba(124,58,237,0.15)',
              borderRadius: 8, color: C.fg,
              fontSize: '0.85rem', lineHeight: 1.7,
              padding: '12px', resize: 'vertical', outline: 'none', marginBottom: 12,
              fontFamily: C.inter,
            }}
          />
        ) : (
          <RichContentView piece={{ ...piece, contentBody: body }} platform={piece.platform} />
        )}

        {/* Hashtags */}
        {piece.hashtags && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.14em', color: C.dim, textTransform: 'uppercase', marginBottom: 6 }}>Hashtags</div>
            <div style={{ fontSize: '0.78rem', color: C.purpleLight, lineHeight: 1.8, fontFamily: C.mono }}>
              {piece.hashtags}
            </div>
          </div>
        )}
      </div>

      {/* Shadow work */}
      <div style={{ padding: '0 18px 8px' }}>
        <ShadowWorkPanel
          campaignId={campaignId}
          platform={piece.platform}
          contentBody={rawText}
        />
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 18px',
        borderTop: `1px solid ${C.border}`, flexWrap: 'wrap',
      }}>
        <button onClick={() => setEditing(!editing)} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 14px', borderRadius: 7,
          background: C.elevated, border: `1px solid ${C.border}`,
          color: C.sub, fontSize: '0.75rem', cursor: 'pointer',
        }}>
          <Edit2 size={11} /> {editing ? 'Done' : 'Edit'}
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 14px', borderRadius: 7,
          background: C.elevated, border: `1px solid ${C.border}`,
          color: C.sub, fontSize: '0.75rem', cursor: 'pointer',
        }}>
          <RefreshCw size={11} /> Regenerate
        </button>

        <div style={{ flex: 1 }} />

        {!isApproved ? (
          <button onClick={() => piece.id && onApprove(piece.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 7,
            background: 'rgba(52,211,153,0.1)', border: `1px solid rgba(52,211,153,0.3)`,
            color: C.green, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
          }}>
            <Check size={11} /> Approve
          </button>
        ) : (
          <button onClick={() => onGenerateVisuals(piece)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 7,
            background: `linear-gradient(135deg, ${C.purple}, #0891b2)`,
            border: 'none', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 0 16px rgba(124,58,237,0.3)',
          }}>
            <ImageIcon size={11} /> Generate Visuals
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [pieces, setPieces] = useState<ContentPiece[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingVisuals, setGeneratingVisuals] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function loadContent() {
    return Promise.all([
      fetch(`/api/campaigns/${id}`).then(r => r.json()),
      fetch(`/api/campaigns/${id}/content`).then(r => r.json()).catch(() => ({ pieces: [] })),
    ]).then(([campaignData, contentData]) => {
      setCampaign(campaignData.campaign);
      const newPieces = contentData.pieces ?? [];
      setPieces(newPieces);
      if (!activeTab && campaignData.campaign?.platforms?.[0]) {
        setActiveTab(campaignData.campaign.platforms[0]);
      }
      setLoading(false);
      setGenerating(newPieces.length === 0);
      return newPieces.length;
    });
  }

  useEffect(() => {
    loadContent().then(count => {
      if (count === 0) {
        // Content is being generated in background — poll until pieces appear
        pollRef.current = setInterval(() => {
          loadContent().then(n => {
            if (n > 0 && pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
          });
        }, 4000);
      }
    });
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  async function approve(pieceId: string) {
    await fetch(`/api/campaigns/${id}/content/${pieceId}/approve`, { method: 'POST' });
    setPieces(prev => prev.map(p => p.id === pieceId ? { ...p, status: 'Approved' } : p));
  }

  async function generateVisuals(piece: ContentPiece) {
    if (!piece.id) return;
    setGeneratingVisuals(piece.id);
    try {
      const rawText = (() => {
        try {
          const d = JSON.parse(piece.contentBody);
          return d.caption ?? d.hookTweet ?? d.longFormPost ?? d.postCopy ?? piece.contentBody;
        } catch { return piece.contentBody; }
      })();
      await fetch('/api/agents/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: id,
          contentPieceId: piece.id,
          contentMessage: rawText.slice(0, 500),
        }),
      });
      // Navigate to assets page to track progress
      router.push(`/dashboard/campaigns/${id}/assets`);
    } catch {
      setGeneratingVisuals(null);
    }
  }

  const platforms = campaign?.platforms ?? [];
  const filtered = pieces.filter(p => p.platform === activeTab);
  const approvedCount = pieces.filter(p => p.status === 'Approved').length;

  async function generateAllVisuals() {
    const approved = pieces.filter(p => p.status === 'Approved');
    for (const piece of approved) {
      await generateVisuals(piece);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>
            Generated Content
          </div>
          <h1 style={{ fontFamily: C.syne, fontSize: '1.7rem', fontWeight: 700, color: C.fg, marginBottom: 4 }}>
            Scripts & Copy
          </h1>
          {!loading && (
            <p style={{ fontSize: '0.8rem', color: C.sub }}>
              {pieces.length} piece{pieces.length !== 1 ? 's' : ''} across {platforms.length} platform{platforms.length !== 1 ? 's' : ''}
              {approvedCount > 0 && ` · ${approvedCount} approved`}
            </p>
          )}
        </div>
        {approvedCount > 0 && (
          <button
            onClick={generateAllVisuals}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 22px', borderRadius: 10,
              background: `linear-gradient(135deg, ${C.purple}, #0e7490)`,
              border: 'none', cursor: 'pointer',
              fontSize: '0.83rem', fontWeight: 600, color: '#fff',
              boxShadow: '0 0 24px rgba(124,58,237,0.3)',
            }}
          >
            <Zap size={14} /> Generate All Visuals ({approvedCount})
          </button>
        )}
      </div>

      {/* Generating state */}
      {generating && pieces.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '50vh', gap: 20, textAlign: 'center',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              border: `2px solid ${C.border}`, borderTop: `2px solid ${C.purple}`,
              borderRight: `2px solid ${C.cyan}`,
            }}
          />
          <div>
            <div style={{ fontFamily: C.syne, fontSize: '1.3rem', fontWeight: 600, color: C.fg, marginBottom: 6 }}>
              Content Agent Working
            </div>
            <div style={{ fontSize: '0.82rem', color: C.sub, lineHeight: 1.6 }}>
              Writing platform-native scripts & copy for all selected ideas.<br />
              This page refreshes automatically when content is ready.
            </div>
          </div>
        </motion.div>
      )}

      {/* Platform tabs */}
      {!generating && (
        <>
          <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: `1px solid ${C.border}` }}>
            {platforms.map(p => {
              const color = PLATFORM_COLORS[p] ?? C.purple;
              const active = activeTab === p;
              const count = pieces.filter(pc => pc.platform === p).length;
              return (
                <button key={p} onClick={() => setActiveTab(p)} style={{
                  padding: '10px 16px', borderRadius: '8px 8px 0 0',
                  background: active ? C.surface : 'transparent',
                  border: `1px solid ${active ? C.border : 'transparent'}`,
                  borderBottom: active ? `1px solid ${C.surface}` : '1px solid transparent',
                  marginBottom: -1,
                  color: active ? color : C.dim,
                  fontSize: '0.78rem', fontWeight: active ? 600 : 400,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {p}
                  {count > 0 && (
                    <span style={{
                      fontFamily: C.mono, fontSize: '0.58rem',
                      padding: '1px 5px', borderRadius: 4,
                      background: active ? `${color}20` : C.elevated,
                      color: active ? color : C.dim,
                      border: `1px solid ${active ? color + '30' : C.border}`,
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {[1, 2].map(i => (
                <div key={i} style={{ background: C.surface, borderRadius: 16, height: 220, border: `1px solid ${C.border}` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ color: C.dim, fontSize: '0.88rem', marginBottom: 8 }}>
                No content for {activeTab} yet.
              </div>
              <div style={{ color: C.dim, fontSize: '0.75rem' }}>
                Generate ideas from the Strategy tab to create content.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 20 }}>
              <AnimatePresence>
                {filtered.map(piece => (
                  <ContentCard
                    key={piece.id}
                    piece={piece}
                    campaignId={id}
                    onApprove={approve}
                    onGenerateVisuals={generateVisuals}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
