'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Search, Filter } from 'lucide-react';
import type { ContentPiece, Platform, ContentStatus } from '@/lib/airtable';
import { PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444',
};

const STATUS_COLORS: Record<ContentStatus, string> = {
  Draft: C.dim, Review: C.amber, Approved: C.green,
  Scheduled: C.cyan, Published: C.purple,
};

const PLATFORMS: Platform[] = ['Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'Facebook', 'YouTube', 'Pinterest'];

interface ContentPieceWithCampaign extends ContentPiece {
  campaignName?: string;
  campaignId: string;
}

function ContentRow({ piece }: { piece: ContentPieceWithCampaign }) {
  const platformColor = PLATFORM_COLORS[piece.platform] ?? C.purple;
  const statusColor = STATUS_COLORS[piece.status] ?? C.dim;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '14px 18px',
        display: 'grid', gridTemplateColumns: '1fr auto auto auto',
        gap: 16, alignItems: 'center',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '0.82rem', color: C.fg,
          lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {piece.contentBody}
        </p>
        {piece.campaignName && (
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: C.dim, marginTop: 4, display: 'block' }}>
            {piece.campaignName}
          </span>
        )}
      </div>

      <span style={{
        fontFamily: 'var(--font-inter)', fontSize: '0.62rem', fontWeight: 500,
        padding: '3px 9px', borderRadius: 5, flexShrink: 0,
        background: `${platformColor}18`, color: platformColor, border: `1px solid ${platformColor}30`,
      }}>
        {piece.platform}
      </span>

      {piece.seoScore != null && (
        <span style={{
          fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.65rem',
          padding: '3px 8px', borderRadius: 5, flexShrink: 0,
          background: `${piece.seoScore >= 80 ? C.green : piece.seoScore >= 60 ? C.amber : C.red}18`,
          color: piece.seoScore >= 80 ? C.green : piece.seoScore >= 60 ? C.amber : C.red,
        }}>
          SEO {piece.seoScore}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        {piece.status === 'Approved' && <Check size={11} color={C.green} />}
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: statusColor }}>
          {piece.status}
        </span>
      </div>
    </motion.div>
  );
}

export default function ContentLibraryPage() {
  const [pieces, setPieces] = useState<ContentPieceWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'All'>('All');

  useEffect(() => {
    // Fetch all campaigns first, then load content pieces from each
    fetch('/api/campaigns').then(r => r.json()).then(async d => {
      const campaigns = d.campaigns ?? [];
      const allPieces: ContentPieceWithCampaign[] = [];

      await Promise.all(
        campaigns.map(async (c: { id: string; campaignName: string }) => {
          try {
            const res = await fetch(`/api/campaigns/${c.id}/content`);
            const data = await res.json();
            (data.pieces ?? []).forEach((p: ContentPiece) => {
              allPieces.push({ ...p, campaignName: c.campaignName, campaignId: c.id });
            });
          } catch {}
        })
      );

      setPieces(allPieces);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = pieces.filter(p => {
    if (platformFilter !== 'All' && p.platform !== platformFilter) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (search && !p.contentBody.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const approvedCount = pieces.filter(p => p.status === 'Approved').length;
  const publishedCount = pieces.filter(p => p.status === 'Published').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Library</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>
            Content Library
          </h1>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '1rem', color: C.green, fontWeight: 500 }}>{approvedCount}</div>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', color: C.dim }}>Approved</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '1rem', color: C.purple, fontWeight: 500 }}>{publishedCount}</div>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', color: C.dim }}>Published</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '1rem', color: C.fg, fontWeight: 500 }}>{pieces.length}</div>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', color: C.dim }}>Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <Search size={13} color={C.dim} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search content…"
            style={{
              width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
              color: C.fg, fontFamily: 'var(--font-inter)', fontSize: '0.8rem', outline: 'none',
            }}
          />
        </div>

        {/* Platform filter */}
        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value as Platform | 'All')}
          style={{
            padding: '8px 12px', background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.sub, fontFamily: 'var(--font-inter)', fontSize: '0.78rem',
            outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="All">All Platforms</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as ContentStatus | 'All')}
          style={{
            padding: '8px 12px', background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.sub, fontFamily: 'var(--font-inter)', fontSize: '0.78rem',
            outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="All">All Statuses</option>
          {(['Draft', 'Review', 'Approved', 'Scheduled', 'Published'] as ContentStatus[]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ background: C.surface, borderRadius: 12, height: 80, border: `1px solid ${C.border}` }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: C.sub, fontFamily: 'var(--font-inter)', fontSize: '0.88rem' }}>
          {pieces.length === 0 ? 'No content yet. Create a campaign to get started.' : 'No content matches your filters.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(p => <ContentRow key={p.id} piece={p} />)}
        </div>
      )}
    </div>
  );
}
