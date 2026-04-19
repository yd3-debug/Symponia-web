'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import type { Campaign } from '@/lib/airtable';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
};

const TABS = [
  { label: 'Research',  segment: 'research' },
  { label: 'Strategy',  segment: 'strategy' },
  { label: 'Content',   segment: 'content' },
  { label: 'Assets',    segment: 'assets' },
] as const;

export default function CampaignDetailLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams() as { id: string };
  const pathname = usePathname();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`).then(r => r.json()).then(d => setCampaign(d.campaign));
  }, [id]);

  const activeSegment = TABS.find(t => pathname.endsWith(t.segment))?.segment ?? 'research';

  return (
    <div>
      {/* Back + campaign name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => router.push('/dashboard/campaigns')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 7, background: C.elevated, border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: '0.75rem' }}
        >
          <ChevronLeft size={13} /> Campaigns
        </button>
        {campaign && (
          <>
            <span style={{ color: C.dim, fontSize: '0.75rem' }}>/</span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.82rem', color: C.fg, fontWeight: 500 }}>
              {campaign.campaignName}
            </span>
          </>
        )}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 28, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {TABS.map(tab => {
          const active = activeSegment === tab.segment;
          return (
            <button
              key={tab.segment}
              onClick={() => router.push(`/dashboard/campaigns/${id}/${tab.segment}`)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                background: active ? C.surface : 'transparent',
                border: `1px solid ${active ? C.border : 'transparent'}`,
                borderBottom: active ? `1px solid ${C.surface}` : '1px solid transparent',
                marginBottom: -1,
                color: active ? C.fg : C.dim,
                fontFamily: 'var(--font-inter)', fontSize: '0.8rem', fontWeight: active ? 500 : 400,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {active && (
                <motion.div
                  layoutId="campaign-tab-indicator"
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: C.purple, borderRadius: '2px 2px 0 0' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {children}
    </div>
  );
}
