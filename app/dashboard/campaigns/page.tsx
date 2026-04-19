'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Zap, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import type { Campaign, CampaignStatus } from '@/lib/airtable';
import { PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444',
};

const STATUS_ORDER: CampaignStatus[] = ['Brief', 'Research', 'Ideas', 'Content', 'Visuals', 'Scheduled', 'Live'];

const STATUS_COLORS: Record<CampaignStatus, string> = {
  Brief: C.dim, Research: C.cyan, Ideas: C.amber,
  Content: C.purpleLight, Visuals: C.purple,
  Scheduled: C.green, Live: C.green,
};

function ProgressPip({ status }: { status: CampaignStatus }) {
  const idx = STATUS_ORDER.indexOf(status);
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {STATUS_ORDER.map((s, i) => (
        <div key={s} style={{
          width: i <= idx ? 16 : 8, height: 4, borderRadius: 2,
          background: i <= idx ? STATUS_COLORS[status] : C.elevated,
          transition: 'width 0.3s, background 0.3s',
        }} />
      ))}
    </div>
  );
}

function CampaignRow({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  const color = STATUS_COLORS[campaign.status] ?? C.dim;

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: '18px 22px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = C.purple + '60')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
    >
      {/* Status dot */}
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />

      {/* Name + brand */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: C.fg, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {campaign.campaignName}
        </div>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: C.sub }}>
          {campaign.brandName} · {campaign.goal}
        </div>
      </div>

      {/* Platforms */}
      <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
        {campaign.platforms.slice(0, 4).map(p => (
          <div key={p} style={{ width: 7, height: 7, borderRadius: '50%', background: PLATFORM_COLORS[p] ?? C.dim }} title={p} />
        ))}
        {campaign.platforms.length > 4 && (
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', color: C.dim }}>+{campaign.platforms.length - 4}</span>
        )}
      </div>

      {/* Progress */}
      <div style={{ flexShrink: 0 }}>
        <ProgressPip status={campaign.status} />
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', color: color, marginTop: 5, textAlign: 'right' }}>
          {campaign.status}
        </div>
      </div>
    </motion.div>
  );
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CampaignStatus | 'All'>('All');

  useEffect(() => {
    fetch('/api/campaigns').then(r => r.json()).then(d => {
      setCampaigns(d.campaigns ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? campaigns : campaigns.filter(c => c.status === filter);
  const liveCount = campaigns.filter(c => c.status === 'Live').length;
  const activeCount = campaigns.filter(c => !['Brief', 'Live'].includes(c.status)).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Campaigns</div>
          <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>
            All Campaigns
          </h1>
        </div>
        <button
          onClick={() => router.push('/dashboard/campaigns/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 20px', borderRadius: 10,
            background: C.purple, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-inter)', fontSize: '0.83rem', fontWeight: 500, color: '#fff',
            boxShadow: '0 0 20px rgba(124,58,237,0.3)',
          }}
        >
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: campaigns.length, icon: TrendingUp, color: C.purple },
          { label: 'Active', value: activeCount, icon: Zap, color: C.amber },
          { label: 'Live', value: liveCount, icon: CheckCircle, color: C.green },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={15} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '1.1rem', fontWeight: 500, color: C.fg }}>{value}</div>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: C.dim }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['All', ...STATUS_ORDER] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '5px 12px', borderRadius: 20,
              background: filter === s ? (s === 'All' ? C.purple : STATUS_COLORS[s as CampaignStatus] + '22') : 'transparent',
              border: `1px solid ${filter === s ? (s === 'All' ? C.purple : STATUS_COLORS[s as CampaignStatus] + '60') : C.border}`,
              color: filter === s ? (s === 'All' ? '#fff' : STATUS_COLORS[s as CampaignStatus]) : C.dim,
              fontFamily: 'var(--font-inter)', fontSize: '0.72rem', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ background: C.surface, borderRadius: 14, height: 76, border: `1px solid ${C.border}` }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.88rem', color: C.sub, marginBottom: 16 }}>
            {filter === 'All' ? 'No campaigns yet.' : `No ${filter} campaigns.`}
          </p>
          {filter === 'All' && (
            <button
              onClick={() => router.push('/dashboard/campaigns/new')}
              style={{ padding: '9px 20px', borderRadius: 8, background: C.purple, border: 'none', color: '#fff', fontFamily: 'var(--font-inter)', fontSize: '0.83rem', cursor: 'pointer' }}
            >
              Create your first campaign
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(c => (
            <CampaignRow
              key={c.id}
              campaign={c}
              onClick={() => router.push(`/dashboard/campaigns/${c.id}/research`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
