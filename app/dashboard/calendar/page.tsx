'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import type { CalendarEntry, Platform } from '@/lib/airtable';
import { PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

interface ScheduledPost extends CalendarEntry {
  contentPreview?: string;
}

function PostDot({ entry }: { entry: ScheduledPost }) {
  const color = PLATFORM_COLORS[entry.platform] ?? C.purple;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: color,
        cursor: 'pointer', flexShrink: 0,
      }} />
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
              background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: '8px 12px', minWidth: 160, zIndex: 10, marginBottom: 6,
            }}
          >
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', fontWeight: 500, color, marginBottom: 4 }}>{entry.platform}</div>
            {entry.contentPreview && (
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: C.sub, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {entry.contentPreview}
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', color: C.dim, marginTop: 4 }}>
              {entry.publishStatus ?? 'Queued'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DayCell({ date, posts }: { date: Date | null; posts: ScheduledPost[] }) {
  const today = new Date();
  const isToday = date && date.toDateString() === today.toDateString();

  if (!date) return <div style={{ background: 'transparent', borderRadius: 10, minHeight: 80 }} />;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${isToday ? C.purple + '60' : C.border}`,
      borderRadius: 10, padding: '8px 10px', minHeight: 80,
      boxShadow: isToday ? `0 0 0 1px ${C.purple}40` : 'none',
    }}>
      <div style={{
        fontFamily: isToday ? "var(--font-jetbrains-mono), monospace" : 'var(--font-inter)',
        fontSize: '0.72rem',
        color: isToday ? C.purple : date < today ? C.dim : C.sub,
        fontWeight: isToday ? 500 : 400,
        marginBottom: 6,
      }}>
        {date.getDate()}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {posts.map((p, i) => <PostDot key={i} entry={p} />)}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [entries, setEntries] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch scheduled content via campaigns
    fetch('/api/campaigns').then(r => r.json()).then(async d => {
      const campaigns = d.campaigns ?? [];
      const allEntries: ScheduledPost[] = [];

      await Promise.all(
        campaigns.map(async (c: { id: string }) => {
          try {
            const res = await fetch(`/api/campaigns/${c.id}/calendar`);
            if (!res.ok) return;
            const data = await res.json();
            (data.entries ?? []).forEach((e: ScheduledPost) => allEntries.push(e));
          } catch {}
        })
      );

      setEntries(allEntries);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function getPostsForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return entries.filter(e => e.scheduledDate === dateStr);
  }

  const days = getCalendarDays(year, month);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Upcoming posts (next 7 days)
  const upcoming = entries.filter(e => {
    const d = new Date(e.scheduledDate);
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Schedule</div>
        <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>
          Content Calendar
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20, alignItems: 'start' }}>
        {/* Calendar grid */}
        <div>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ padding: 8, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', color: C.sub, display: 'flex' }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.1rem', fontWeight: 600, color: C.fg }}>
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} style={{ padding: 8, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', color: C.sub, display: 'flex' }}>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', color: C.dim, textAlign: 'center', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {days.map((date, i) => (
              <DayCell key={i} date={date} posts={date ? getPostsForDate(date) : []} />
            ))}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.12em', color: C.dim, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={11} /> Upcoming
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map(i => <div key={i} style={{ background: C.surface, borderRadius: 10, height: 60, border: `1px solid ${C.border}` }} />)}
            </div>
          ) : upcoming.length === 0 ? (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
              <Calendar size={20} color={C.dim} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: C.dim }}>Nothing scheduled this week.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.map((e, i) => {
                const color = PLATFORM_COLORS[e.platform] ?? C.purple;
                return (
                  <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', color }}>{e.platform}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: C.sub, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {e.contentPreview ?? 'Scheduled post'}
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.62rem', color: C.dim }}>
                      {new Date(e.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
