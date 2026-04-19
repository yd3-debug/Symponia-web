'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Eye, Heart, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { Campaign } from '@/lib/airtable';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444',
};

// Simulated engagement data (replace with real API when analytics are available)
function generateMockData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      impressions: Math.floor(Math.random() * 8000 + 2000),
      engagement: Math.floor(Math.random() * 600 + 100),
      reach: Math.floor(Math.random() * 5000 + 1000),
    };
  });
}

const PLATFORM_BREAKDOWN = [
  { platform: 'Instagram', posts: 24, engagement: 8.4, color: '#E1306C' },
  { platform: 'LinkedIn',  posts: 18, engagement: 5.2, color: '#0A66C2' },
  { platform: 'Twitter/X', posts: 31, engagement: 3.8, color: '#000000' },
  { platform: 'TikTok',    posts: 12, engagement: 12.1, color: '#FE2C55' },
];

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 22px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
        <TrendingUp size={12} color={C.green} />
      </div>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '1.6rem', fontWeight: 500, color: C.fg, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: C.sub }}>{label}</div>
      {sub && <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: C.green, marginTop: 4 }}>{sub}</div>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: C.sub, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.75rem', color: p.color, marginBottom: 2 }}>
          {p.name}: {p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data] = useState(() => generateMockData(30));
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    fetch('/api/campaigns').then(r => r.json()).then(d => setCampaigns(d.campaigns ?? []));
  }, []);

  const liveCount = campaigns.filter(c => c.status === 'Live').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Analytics</div>
        <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>
          Performance
        </h1>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: C.sub, marginTop: 6 }}>
          Last 30 days across all campaigns.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Impressions" value="142K" sub="+18% vs last month" icon={Eye} color={C.cyan} />
        <StatCard label="Total Reach" value="89K" sub="+12%" icon={Users} color={C.purple} />
        <StatCard label="Engagements" value="6.8K" sub="+24%" icon={Heart} color={C.red} />
        <StatCard label="Live Campaigns" value={String(liveCount)} icon={Zap} color={C.green} />
      </div>

      {/* Impressions chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}
      >
        <div style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: C.fg, marginBottom: 20 }}>
          Impressions & Reach
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="impressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.purple} stopOpacity={0.25} />
                <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.cyan} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.cyan} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: C.dim, fontSize: 10, fontFamily: 'var(--font-inter)' }} axisLine={false} tickLine={false} interval={6} />
            <YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="impressions" stroke={C.purple} strokeWidth={2} fill="url(#impressGrad)" name="Impressions" />
            <Area type="monotone" dataKey="reach" stroke={C.cyan} strokeWidth={2} fill="url(#reachGrad)" name="Reach" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Platform breakdown + engagement */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}
        >
          <div style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: C.fg, marginBottom: 18 }}>
            Platform Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PLATFORM_BREAKDOWN.map(p => (
              <div key={p.platform}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', color: C.fg }}>{p.platform}</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.7rem', color: C.sub }}>{p.posts} posts</span>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.7rem', color: p.color }}>{p.engagement}%</span>
                  </div>
                </div>
                <div style={{ height: 4, background: C.elevated, borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.engagement / 15) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ height: '100%', background: p.color, borderRadius: 2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px' }}
        >
          <div style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: C.fg, marginBottom: 18 }}>
            Daily Engagement
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.slice(-14)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fill: C.dim, fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: C.dim, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="engagement" fill={C.purple} radius={[3, 3, 0, 0]} name="Engagements" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI insight card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{
          marginTop: 16, background: `linear-gradient(135deg, ${C.purple}15, ${C.cyan}10)`,
          border: `1px solid ${C.purple}40`, borderRadius: 16, padding: '20px 24px',
          display: 'flex', gap: 16, alignItems: 'flex-start',
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.purple}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap size={16} color={C.purpleLight} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: C.fg, marginBottom: 6 }}>
            AI Insight
          </div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.82rem', color: C.sub, lineHeight: 1.65 }}>
            TikTok content is outperforming other platforms with 12.1% engagement rate. Consider increasing posting frequency there.
            Instagram Reels published Tuesday–Thursday 6–8pm are getting 34% more reach than other slots.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
