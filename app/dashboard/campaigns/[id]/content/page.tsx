'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check, Edit2 } from 'lucide-react';
import type { Campaign, ContentPiece } from '@/lib/airtable';
import { PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444',
};

function SeoScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? C.green : score >= 60 ? C.amber : C.red;
  return (
    <span style={{
      fontFamily: "var(--font-jetbrains-mono), 'Courier New', monospace",
      fontSize: '0.7rem', fontWeight: 500,
      padding: '3px 8px', borderRadius: 5,
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }}>
      SEO {score}
    </span>
  );
}

function ContentCard({ piece, onApprove }: { piece: ContentPiece; onApprove: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(piece.contentBody);
  const color = PLATFORM_COLORS[piece.platform] ?? C.purple;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px', boxShadow: '0 0 0 1px #1A1A30, 0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 5, background: `${color}20`, color, border: `1px solid ${color}40` }}>
            {piece.platform}
          </span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', color: C.dim }}>{piece.contentType}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {piece.seoScore && <SeoScoreBadge score={piece.seoScore} />}
          {piece.status === 'Approved' && <Check size={14} color={C.green} />}
        </div>
      </div>

      {editing ? (
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          style={{
            width: '100%', minHeight: 120, background: C.elevated, border: `1px solid ${C.purple}`,
            boxShadow: '0 0 0 3px rgba(124,58,237,0.2)', borderRadius: 8, color: C.fg,
            fontFamily: 'var(--font-inter)', fontSize: '0.85rem', lineHeight: 1.7,
            padding: '12px', resize: 'vertical', outline: 'none', marginBottom: 10,
          }}
        />
      ) : (
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: C.sub, lineHeight: 1.75, marginBottom: 14, whiteSpace: 'pre-wrap' }}>
          {body}
        </p>
      )}

      {piece.hashtags && (
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: C.purple, marginBottom: 14, lineHeight: 1.6 }}>
          {piece.hashtags}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setEditing(!editing)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, background: C.elevated, border: `1px solid ${C.border}`, color: C.sub, fontFamily: 'var(--font-inter)', fontSize: '0.75rem', cursor: 'pointer' }}>
          <Edit2 size={11} /> {editing ? 'Done' : 'Edit'}
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, background: C.elevated, border: `1px solid ${C.border}`, color: C.sub, fontFamily: 'var(--font-inter)', fontSize: '0.75rem', cursor: 'pointer' }}>
          <RefreshCw size={11} /> Regenerate
        </button>
        {piece.status !== 'Approved' && (
          <button onClick={() => onApprove(piece.id!)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, background: `${C.green}18`, border: `1px solid ${C.green}40`, color: C.green, fontFamily: 'var(--font-inter)', fontSize: '0.75rem', cursor: 'pointer', marginLeft: 'auto' }}>
            <Check size={11} /> Approve
          </button>
        )}
      </div>
    </div>
  );
}

export default function ContentPage() {
  const { id } = useParams() as { id: string };
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [pieces, setPieces] = useState<ContentPiece[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/campaigns/${id}`).then(r => r.json()),
      fetch(`/api/campaigns/${id}/content`).then(r => r.json()).catch(() => ({ pieces: [] })),
    ]).then(([campaignData, contentData]) => {
      setCampaign(campaignData.campaign);
      setPieces(contentData.pieces ?? []);
      if (campaignData.campaign?.platforms?.[0]) setActiveTab(campaignData.campaign.platforms[0]);
      setLoading(false);
    });
  }, [id]);

  const platforms = campaign?.platforms ?? [];
  const filtered = pieces.filter(p => p.platform === activeTab);

  function approve(pieceId: string) {
    fetch(`/api/campaigns/${id}/content/${pieceId}/approve`, { method: 'POST' })
      .then(() => setPieces(prev => prev.map(p => p.id === pieceId ? { ...p, status: 'Approved' } : p)));
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Content</div>
        <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>Generated Content</h1>
      </div>

      {/* Platform tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {platforms.map(p => {
          const color = PLATFORM_COLORS[p] ?? C.purple;
          const active = activeTab === p;
          return (
            <button key={p} onClick={() => setActiveTab(p)} style={{
              padding: '10px 16px', borderRadius: '8px 8px 0 0',
              background: active ? C.surface : 'transparent',
              border: `1px solid ${active ? C.border : 'transparent'}`,
              borderBottom: active ? `1px solid ${C.surface}` : '1px solid transparent',
              marginBottom: -1,
              color: active ? color : C.dim,
              fontFamily: 'var(--font-inter)', fontSize: '0.8rem', fontWeight: active ? 500 : 400,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
              {p}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {[1, 2].map(i => <div key={i} style={{ background: C.surface, borderRadius: 16, height: 180, border: `1px solid ${C.border}` }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.sub, fontFamily: 'var(--font-inter)', fontSize: '0.88rem' }}>
          No content generated for {activeTab} yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map(piece => <ContentCard key={piece.id} piece={piece} onApprove={approve} />)}
        </div>
      )}
    </div>
  );
}
