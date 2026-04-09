'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          '#07051a',
  bgMid:       '#0d0b22',
  bgCard:      'rgba(255,255,255,0.035)',
  bgCardHover: 'rgba(255,255,255,0.06)',
  bgActive:    'rgba(167,139,250,0.08)',
  fg:          '#eae6f8',
  sub:         '#b8b0d8',
  dim:         '#7c70a8',
  border:      'rgba(255,255,255,0.07)',
  borderMid:   'rgba(255,255,255,0.11)',
  borderStrong:'rgba(255,255,255,0.18)',
  cyan:        '#5ce8d0',
  violet:      '#a78bfa',
  pink:        '#e879a0',
  green:       '#4ade80',
  orange:      '#fb923c',
  red:         '#f87171',
  teal:        '#5b8df0',
  yellow:      '#fbbf24',
  heading:     "var(--font-cormorant), 'Georgia', serif",
  body:        "var(--font-inter), 'Helvetica Neue', sans-serif",
  mono:        "'JetBrains Mono', 'Fira Code', monospace",
};

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: 'orchestrator', name: 'Orchestrator', role: 'Marketing Director', icon: '◈', color: C.violet,
    skills: ['Campaign Strategy', 'Agent Routing', 'Quality Control', 'Brief Writing', 'Brand Voice'],
    description: 'Reads your command, routes to the right agents, reviews all output before it reaches the queue. Nothing ships without sign-off.',
  },
  {
    id: 'instagram', name: 'Instagram', role: 'Platform Specialist', icon: '◎', color: C.pink,
    skills: ['Carousel Narratives', 'Reels Hooks', 'Hashtag Research', 'Caption Formulas', 'Collab Strategy'],
    description: 'Carousel arcs, Reels scripts with 3-sec hooks, optimal hashtag sets (3–8 niche tags), and algorithm-first caption formulas.',
  },
  {
    id: 'tiktok', name: 'TikTok', role: 'Viral Specialist', icon: '▶', color: C.cyan,
    skills: ['3-sec Hook Formulas', 'Sound Strategy', 'Caption SEO', 'Duet/Stitch', 'Comment Bait'],
    description: 'Pattern-interrupt hooks, trending sound recommendations, TikTok search optimisation, and series formats built for completion rate.',
  },
  {
    id: 'linkedin', name: 'LinkedIn', role: 'Thought Leader', icon: '◻', color: C.teal,
    skills: ['Thought Leadership', 'Hook Line Formula', 'Document Carousels', 'B2B Positioning', 'Dwell-time Copy'],
    description: '210-char hooks before "...more", no-link-in-body strategy, PDF carousels, and professional storytelling that builds authority.',
  },
  {
    id: 'video', name: 'Video Editor', role: 'Clip Architect', icon: '▣', color: C.orange,
    skills: ['Scene Breakdown', 'FFmpeg Pipeline', 'B-roll Direction', 'Text Overlays', 'Kie.ai Prompts'],
    description: 'Breaks scripts into scenes, generates clips via Kie.ai, stitches them with FFmpeg. Outputs vertical 1080×1920 for Reels/TikTok.',
  },
  {
    id: 'copywriter', name: 'Copywriter', role: 'Word Strategist', icon: '✦', color: C.yellow,
    skills: ['Hook Writing', 'Power Words', 'CTA Optimisation', 'A/B Variants', 'Tone Adaptation'],
    description: 'Multi-format copy across platforms. Adapts Symponia\'s philosophical tone — mystical but grounded — for each audience.',
  },
  {
    id: 'trends', name: 'Trend Researcher', role: 'Signal Hunter', icon: '◉', color: C.green,
    skills: ['Reddit Scraping', 'YouTube Trending', 'Google Trends', 'Virality Prediction', 'Timing Windows'],
    description: 'No API keys needed. Scrapes Reddit, YouTube, and Google Trends to find what\'s gaining momentum in the niche right now.',
  },
  {
    id: 'visual', name: 'Visual Director', role: 'Aesthetic Lead', icon: '◆', color: '#c084fc',
    skills: ['Brand Consistency', 'Kie.ai Prompting', 'Composition Rules', 'Platform Specs', 'Style Cohesion'],
    description: 'Writes Kie.ai prompts that match Symponia\'s dark-mystical aesthetic. Reviews every visual for brand alignment before approval.',
  },
];

// ── Status / platform colours ─────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  review: C.orange, approved: C.green, scheduled: C.teal,
  posted: C.violet, draft: C.dim, generating: C.cyan, rejected: C.red,
};
const PLATFORM_COLOR: Record<string, string> = {
  instagram: C.pink, tiktok: C.cyan, linkedin: C.teal,
};
const PLATFORM_ICON: Record<string, string> = {
  instagram: '◎', tiktok: '▶', linkedin: '◻',
};

// ── Field map ─────────────────────────────────────────────────────────────────
const F = {
  platform: 'Platform', contentType: 'Content Type', hook: 'Hook',
  caption: 'Caption', hashtags: 'Hashtags', script: 'Script',
  slides: 'Slides (JSON)', visualPrompt: 'Visual Prompt', imageUrl: 'Image URL',
  videoUrl: 'Video URL', status: 'Status', scheduledAt: 'Scheduled At',
  viralScore: 'Viral Score', notes: 'Notes', generatedAt: 'Generated At',
  topic: 'Topic',
};

type Tab      = 'queue' | 'agents' | 'calendar';
type Status   = 'review' | 'approved' | 'scheduled' | 'posted' | 'draft' | 'generating' | 'rejected' | 'all';
type Platform = 'all' | 'instagram' | 'tiktok' | 'linkedin';
interface AirtableRecord { id: string; fields: Record<string, any>; }

// ── Auth ──────────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'sym_dashboard_token';
function getToken()      { return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) ?? '' : ''; }
function saveToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken()    { localStorage.removeItem(TOKEN_KEY); }

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiGet(path: string)                     { const r = await fetch(path, { headers: { 'x-dashboard-token': getToken() } }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiPatch(path: string, body: object)     { const r = await fetch(path, { method: 'PATCH',  headers: { 'Content-Type': 'application/json', 'x-dashboard-token': getToken() }, body: JSON.stringify(body) }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiPost(path: string,  body: object)     { const r = await fetch(path, { method: 'POST',   headers: { 'Content-Type': 'application/json', 'x-dashboard-token': getToken() }, body: JSON.stringify(body) }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  // Auth
  const [authed,   setAuthed]   = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');

  // Navigation
  const [tab,      setTab]      = useState<Tab>('queue');
  const [status,   setStatus]   = useState<Status>('review');
  const [platform, setPlatform] = useState<Platform>('all');

  // Data
  const [records,  setRecords]  = useState<AirtableRecord[]>([]);
  const [counts,   setCounts]   = useState<Record<string, number>>({});
  const [loading,  setLoading]  = useState(false);

  // Detail panel
  const [detail,   setDetail]   = useState<AirtableRecord | null>(null);

  // Command bar
  const [cmd,       setCmd]      = useState('');
  const [cmdPlat,   setCmdPlat]  = useState<Platform>('all');
  const [cmdRunning,setCmdRunning] = useState(false);
  const [cmdResult, setCmdResult] = useState('');
  const cmdRef = useRef<HTMLInputElement>(null);

  // Schedule modal
  const [schedModal, setSchedModal] = useState<{ record: AirtableRecord } | null>(null);
  const [schedDate,  setSchedDate]  = useState('');

  // Toast
  const [toast,     setToast]    = useState<{ msg: string; type?: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((msg: string, type = '') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => { if (getToken()) setAuthed(true); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    try {
      const res  = await fetch('/api/dashboard/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (data.ok && data.token) { saveToken(data.token); setAuthed(true); }
      else setLoginErr('Invalid username or password');
    } catch { setLoginErr('Login failed — please try again'); }
  };

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (status !== 'all') p.set('status', status);
      if (platform !== 'all') p.set('platform', platform);
      const data = await apiGet(`/api/dashboard/records?${p}`);
      setRecords(data.records ?? []);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') { setAuthed(false); }
      else showToast('Failed to load records', 'error');
    } finally { setLoading(false); }
  }, [authed, status, platform, showToast]);

  const loadCounts = useCallback(async () => {
    if (!authed) return;
    try {
      const statuses = ['generating', 'review', 'approved', 'scheduled', 'posted'];
      const results  = await Promise.allSettled(statuses.map(s => apiGet(`/api/dashboard/records?status=${s}`)));
      const c: Record<string, number> = {};
      results.forEach((r, i) => { c[statuses[i]] = r.status === 'fulfilled' ? (r.value.records ?? []).length : 0; });
      setCounts(c);
    } catch {}
  }, [authed]);

  useEffect(() => { if (authed) { loadRecords(); loadCounts(); } }, [authed, status, platform, loadRecords, loadCounts]);
  useEffect(() => { if (!authed) return; const t = setInterval(() => { loadRecords(); loadCounts(); }, 30000); return () => clearInterval(t); }, [authed, loadRecords, loadCounts]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); cmdRef.current?.focus(); }
      if (e.key === 'Escape') { setDetail(null); setSchedModal(null); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiPatch('/api/dashboard/records', { id, fields: { [F.status]: newStatus } });
      setRecords(rs => rs.filter(r => r.id !== id));
      setDetail(null);
      showToast(`Marked as ${newStatus}`, 'success');
      loadCounts();
    } catch { showToast('Update failed', 'error'); }
  };

  const schedulePost = async () => {
    if (!schedModal || !schedDate) return;
    try {
      await apiPost('/api/dashboard/generate', { recordId: schedModal.record.id, scheduledAt: schedDate });
      await apiPatch('/api/dashboard/records', { id: schedModal.record.id, fields: { [F.status]: 'scheduled', [F.scheduledAt]: schedDate } });
      setSchedModal(null);
      setRecords(rs => rs.filter(r => r.id !== schedModal.record.id));
      showToast('Scheduled via Blotato', 'success');
      loadCounts();
    } catch { showToast('Scheduling failed', 'error'); }
  };

  const runCommand = async () => {
    if (!cmd.trim() || cmdRunning) return;
    setCmdRunning(true);
    setCmdResult('');
    try {
      const res = await apiPost('/api/dashboard/generate', { command: cmd, platform: cmdPlat });
      setCmdResult(res.message ?? 'Team briefed — content will appear in queue shortly.');
      setCmd('');
      setTimeout(() => { loadRecords(); loadCounts(); }, 3000);
    } catch { setCmdResult('Failed to reach agent team'); }
    finally { setCmdRunning(false); }
  };

  // ── Field helper ────────────────────────────────────────────────────────────
  const f = (r: AirtableRecord, field: string) => r.fields[field] ?? '';
  const score = (r: AirtableRecord) => Number(f(r, F.viralScore)) || 0;
  const scoreColor = (n: number) => n >= 8 ? C.green : n >= 6 ? C.orange : C.dim;

  // ── Calendar data ───────────────────────────────────────────────────────────
  const calendarRecords = records.filter(r => f(r, F.scheduledAt));
  const scheduledDates  = new Set(calendarRecords.map(r => f(r, F.scheduledAt)?.slice(0, 10)));

  // ────────────────────────────────────────────────────────────────────────────
  // LOGIN SCREEN
  // ────────────────────────────────────────────────────────────────────────────
  if (!authed) {
    const inp: React.CSSProperties = {
      width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
      border: `0.5px solid ${C.border}`, borderRadius: 10, color: C.fg,
      fontFamily: C.body, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: 12,
    };
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.body }}>
        <div style={{ width: 400, padding: '52px 44px', background: C.bgMid, border: `0.5px solid ${C.borderMid}`, borderRadius: 24 }}>
          <div style={{ fontFamily: C.heading, fontSize: '2.2rem', fontWeight: 300, color: C.fg, marginBottom: 4 }}>◈ Symponia</div>
          <div style={{ fontSize: '0.7rem', color: C.dim, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 40 }}>Marketing OS</div>
          <form onSubmit={handleLogin}>
            <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Username</div>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Username" style={inp} />
            <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Password" style={{ ...inp, marginBottom: 24 }} />
            {loginErr && <div style={{ fontSize: '0.8rem', color: C.red, marginBottom: 16, textAlign: 'center' }}>{loginErr}</div>}
            <button type="submit" style={{ width: '100%', padding: '13px', background: 'rgba(167,139,250,0.15)', border: `0.5px solid rgba(167,139,250,0.5)`, borderRadius: 10, color: C.fg, fontFamily: C.body, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.1em' }}>
              Sign in →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MAIN LAYOUT
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: C.body, color: C.fg }}>

      {/* ── Top bar ── */}
      <header style={{ height: 56, background: C.bgMid, borderBottom: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0, flexShrink: 0 }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginRight: 40 }}>
          <span style={{ fontFamily: C.heading, fontSize: '1.3rem', fontWeight: 300, color: C.fg }}>◈ Symponia</span>
          <span style={{ fontSize: '0.6rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Marketing OS</span>
        </a>

        {/* Tabs */}
        {(['queue', 'agents', 'calendar'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0 18px', height: 56, background: 'none', border: 'none', color: tab === t ? C.fg : C.dim, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderBottom: `2px solid ${tab === t ? C.violet : 'transparent'}`, transition: 'all .15s' }}>
            {t === 'queue' ? 'Content Queue' : t === 'agents' ? 'Agent Team' : 'Calendar'}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Pipeline mini-counts */}
        {(['review','approved','scheduled','posted'] as Status[]).map(s => (
          <div key={s} onClick={() => { setTab('queue'); setStatus(s); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', cursor: 'pointer', opacity: status === s && tab === 'queue' ? 1 : 0.5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[s] }} />
            <span style={{ fontSize: '0.7rem', color: C.sub }}>{counts[s] ?? 0}</span>
            <span style={{ fontSize: '0.65rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s}</span>
          </div>
        ))}

        <button onClick={() => { clearToken(); setAuthed(false); }} style={{ marginLeft: 20, fontSize: '0.65rem', color: C.dim, background: 'none', border: `0.5px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', padding: '5px 10px', letterSpacing: '0.08em' }}>
          Sign out
        </button>
      </header>

      {/* ── Command bar ── */}
      <div style={{ background: C.bgMid, borderBottom: `0.5px solid ${C.border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: C.violet, fontSize: '1rem', flexShrink: 0 }}>◈</span>
        <input
          ref={cmdRef}
          value={cmd}
          onChange={e => setCmd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && runCommand()}
          placeholder='Tell the team what to create… e.g. "Create a TikTok video about shadow work trends" (⌘K)'
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.fg, fontFamily: C.body, fontSize: '0.88rem', placeholder: C.dim }}
        />
        <select value={cmdPlat} onChange={e => setCmdPlat(e.target.value as Platform)} style={{ background: C.bgCard, border: `0.5px solid ${C.border}`, borderRadius: 8, color: C.sub, fontFamily: C.body, fontSize: '0.75rem', padding: '6px 10px', outline: 'none' }}>
          <option value="all">All platforms</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="linkedin">LinkedIn</option>
        </select>
        <button onClick={runCommand} disabled={cmdRunning || !cmd.trim()} style={{ padding: '7px 18px', background: cmd.trim() ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.03)', border: `0.5px solid ${cmd.trim() ? 'rgba(167,139,250,0.5)' : C.border}`, borderRadius: 8, color: cmd.trim() ? C.fg : C.dim, fontFamily: C.body, fontSize: '0.78rem', cursor: cmd.trim() ? 'pointer' : 'default', letterSpacing: '0.08em', transition: 'all .15s' }}>
          {cmdRunning ? '...' : 'Brief Team →'}
        </button>
      </div>
      {cmdResult && (
        <div style={{ background: 'rgba(92,232,208,0.06)', borderBottom: `0.5px solid rgba(92,232,208,0.2)`, padding: '10px 24px', fontSize: '0.8rem', color: C.cyan }}>
          ✓ {cmdResult}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left sidebar ── */}
        {tab === 'queue' && (
          <aside style={{ width: 200, background: C.bgMid, borderRight: `0.5px solid ${C.border}`, padding: '20px 0', flexShrink: 0, overflowY: 'auto' }}>
            <div style={{ padding: '0 16px 12px', fontSize: '0.6rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Pipeline</div>
            {([
              { key: 'review'    as Status, label: 'For Review' },
              { key: 'approved'  as Status, label: 'Approved' },
              { key: 'scheduled' as Status, label: 'Scheduled' },
              { key: 'posted'    as Status, label: 'Posted' },
              { key: 'all'       as Status, label: 'All Content' },
              { key: 'draft'     as Status, label: 'Draft' },
              { key: 'rejected'  as Status, label: 'Rejected' },
            ]).map(({ key, label }) => (
              <button key={key} onClick={() => setStatus(key)} style={{ width: '100%', padding: '9px 16px', background: status === key ? C.bgActive : 'none', border: 'none', borderLeft: `2px solid ${status === key ? C.violet : 'transparent'}`, color: status === key ? C.fg : C.sub, fontFamily: C.body, fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{label}</span>
                {counts[key] ? <span style={{ fontSize: '0.7rem', color: STATUS_COLOR[key] ?? C.dim, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '1px 7px' }}>{counts[key]}</span> : null}
              </button>
            ))}

            <div style={{ padding: '20px 16px 8px', fontSize: '0.6rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Platform</div>
            {(['all','instagram','tiktok','linkedin'] as Platform[]).map(p => (
              <button key={p} onClick={() => setPlatform(p)} style={{ width: '100%', padding: '8px 16px', background: platform === p ? C.bgActive : 'none', border: 'none', borderLeft: `2px solid ${platform === p ? (PLATFORM_COLOR[p] ?? C.violet) : 'transparent'}`, color: platform === p ? C.fg : C.sub, fontFamily: C.body, fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                {p !== 'all' && <span style={{ color: PLATFORM_COLOR[p], fontSize: '0.7rem' }}>{PLATFORM_ICON[p]}</span>}
                {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}

            <div style={{ padding: '20px 16px 8px', fontSize: '0.6rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Actions</div>
            <button onClick={() => { loadRecords(); loadCounts(); }} style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', color: C.sub, fontFamily: C.body, fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer' }}>↺ Refresh</button>
          </aside>
        )}

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* ── QUEUE TAB ── */}
          {tab === 'queue' && (
            <>
              {loading && <div style={{ color: C.dim, fontSize: '0.8rem', padding: '40px 0', textAlign: 'center' }}>Loading…</div>}
              {!loading && records.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
                  <span style={{ fontSize: '3rem', opacity: 0.15 }}>◈</span>
                  <div style={{ fontFamily: C.heading, fontSize: '1.4rem', fontWeight: 300, color: C.sub }}>Nothing here yet</div>
                  <div style={{ fontSize: '0.8rem', color: C.dim, textAlign: 'center', maxWidth: 320, lineHeight: 1.7 }}>Type a command above to brief the agent team, or switch to a different pipeline stage.</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {records.map(r => <ContentCard key={r.id} r={r} f={f} score={score} scoreColor={scoreColor} onClick={() => setDetail(r)} onApprove={() => updateStatus(r.id, 'approved')} onReject={() => updateStatus(r.id, 'rejected')} onSchedule={() => { setSchedModal({ record: r }); setSchedDate(''); }} />)}
              </div>
            </>
          )}

          {/* ── AGENTS TAB ── */}
          {tab === 'agents' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: C.heading, fontSize: '1.8rem', fontWeight: 300, color: C.fg, marginBottom: 6 }}>Agent Orchestra</div>
                <div style={{ fontSize: '0.8rem', color: C.dim, lineHeight: 1.7, maxWidth: 600 }}>
                  8 specialist agents managed by the Orchestrator. Use the command bar to brief them. Each agent has deep platform expertise and reports back to the Orchestrator before content reaches your queue.
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {AGENTS.map(a => <AgentCard key={a.id} agent={a} />)}
              </div>
            </div>
          )}

          {/* ── CALENDAR TAB ── */}
          {tab === 'calendar' && (
            <CalendarView records={records} f={f} scheduledDates={scheduledDates} onLoad={loadRecords} platform={platform} />
          )}
        </main>
      </div>

      {/* ── Detail panel ── */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={() => setDetail(null)}>
          <div style={{ width: 520, background: C.bgMid, height: '100%', overflowY: 'auto', padding: 32, boxShadow: '-20px 0 60px rgba(0,0,0,0.4)', borderLeft: `0.5px solid ${C.borderMid}` }} onClick={e => e.stopPropagation()}>
            <DetailPanel r={detail} f={f} score={score} scoreColor={scoreColor}
              onApprove={() => updateStatus(detail.id, 'approved')}
              onReject={() => updateStatus(detail.id, 'rejected')}
              onSchedule={() => { setSchedModal({ record: detail }); setSchedDate(''); }}
              onClose={() => setDetail(null)}
            />
          </div>
        </div>
      )}

      {/* ── Schedule modal ── */}
      {schedModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setSchedModal(null)}>
          <div style={{ width: 400, background: C.bgMid, border: `0.5px solid ${C.borderMid}`, borderRadius: 20, padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: C.heading, fontSize: '1.4rem', color: C.fg, marginBottom: 6 }}>Schedule Post</div>
            <div style={{ fontSize: '0.75rem', color: C.dim, marginBottom: 24 }}>Will be sent to Blotato and posted automatically at the selected time.</div>
            <div style={{ fontSize: '0.7rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Date & Time</div>
            <input type="datetime-local" value={schedDate} onChange={e => setSchedDate(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${C.border}`, borderRadius: 10, color: C.fg, fontFamily: C.body, fontSize: '0.88rem', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSchedModal(null)} style={{ flex: 1, padding: '11px', background: 'none', border: `0.5px solid ${C.border}`, borderRadius: 10, color: C.dim, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={schedulePost} disabled={!schedDate} style={{ flex: 2, padding: '11px', background: 'rgba(91,141,240,0.18)', border: `0.5px solid rgba(91,141,240,0.5)`, borderRadius: 10, color: C.fg, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>Schedule via Blotato →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: C.bgMid, border: `0.5px solid ${toast.type === 'error' ? C.red : C.borderMid}`, borderRadius: 12, padding: '12px 24px', fontSize: '0.82rem', color: toast.type === 'error' ? C.red : C.fg, zIndex: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ContentCard({ r, f, score, scoreColor, onClick, onApprove, onReject, onSchedule }: {
  r: AirtableRecord; f: any; score: any; scoreColor: any;
  onClick: () => void; onApprove: () => void; onReject: () => void; onSchedule: () => void;
}) {
  const plat   = (f(r, 'Platform') as string)?.toLowerCase() ?? '';
  const status = (f(r, 'Status')   as string)?.toLowerCase() ?? '';
  const sc     = score(r);
  const preview = f(r, 'Hook') || f(r, 'Caption') || f(r, 'Script') || '';

  return (
    <div onClick={onClick} style={{ background: C.bgCard, border: `0.5px solid ${C.border}`, borderRadius: 16, padding: '20px', cursor: 'pointer', transition: 'all .15s', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => (e.currentTarget.style.background = C.bgCardHover)}
      onMouseLeave={e => (e.currentTarget.style.background = C.bgCard)}>

      {/* Accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${PLATFORM_COLOR[plat] ?? C.violet}, transparent)`, borderRadius: '16px 16px 0 0' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: PLATFORM_COLOR[plat] ?? C.dim, background: `${PLATFORM_COLOR[plat] ?? C.dim}18`, padding: '3px 8px', borderRadius: 6 }}>
            {PLATFORM_ICON[plat]} {plat}
          </span>
          {f(r, 'Content Type') && (
            <span style={{ fontSize: '0.63rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {f(r, 'Content Type')}
            </span>
          )}
        </div>
        {sc > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '0.65rem', color: C.dim }}>score</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: scoreColor(sc), fontFamily: C.mono }}>{sc.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Preview text */}
      <div style={{ fontSize: '0.85rem', color: C.sub, lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {preview || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>No preview</span>}
      </div>

      {/* Hashtags */}
      {f(r, 'Hashtags') && (
        <div style={{ fontSize: '0.72rem', color: C.violet, opacity: 0.7, marginBottom: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {f(r, 'Hashtags')}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[status] ?? C.dim }} />
          <span style={{ fontSize: '0.7rem', color: C.dim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{status}</span>
        </div>
        {status === 'review' && (
          <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
            <ActionBtn label="✓" color={C.green}  onClick={onApprove} title="Approve" />
            <ActionBtn label="✗" color={C.red}    onClick={onReject}  title="Reject" />
            <ActionBtn label="→" color={C.teal}   onClick={onSchedule} title="Schedule" />
          </div>
        )}
        {status === 'approved' && (
          <div onClick={e => e.stopPropagation()}>
            <ActionBtn label="Schedule →" color={C.teal} onClick={onSchedule} title="Schedule via Blotato" />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick, title }: { label: string; color: string; onClick: () => void; title: string }) {
  return (
    <button title={title} onClick={onClick} style={{ padding: '4px 10px', background: `${color}18`, border: `0.5px solid ${color}44`, borderRadius: 7, color, fontFamily: 'monospace', fontSize: '0.75rem', cursor: 'pointer' }}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT CARD
// ─────────────────────────────────────────────────────────────────────────────
function AgentCard({ agent }: { agent: typeof AGENTS[number] }) {
  return (
    <div style={{ background: C.bgCard, border: `0.5px solid ${C.border}`, borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${agent.color}, transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <span style={{ color: agent.color, fontSize: '1.1rem' }}>{agent.icon}</span>
            <span style={{ fontFamily: C.heading, fontSize: '1.2rem', fontWeight: 400, color: C.fg }}>{agent.name}</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{agent.role}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          <span style={{ fontSize: '0.65rem', color: C.dim }}>Idle</span>
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', color: C.sub, lineHeight: 1.65, marginBottom: 16 }}>{agent.description}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {agent.skills.map(s => (
          <span key={s} style={{ fontSize: '0.65rem', color: agent.color, background: `${agent.color}12`, border: `0.5px solid ${agent.color}30`, borderRadius: 6, padding: '3px 8px', letterSpacing: '0.04em' }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────
function DetailPanel({ r, f, score, scoreColor, onApprove, onReject, onSchedule, onClose }: {
  r: AirtableRecord; f: any; score: any; scoreColor: any;
  onApprove: () => void; onReject: () => void; onSchedule: () => void; onClose: () => void;
}) {
  const plat   = (f(r, 'Platform') as string)?.toLowerCase() ?? '';
  const status = (f(r, 'Status')   as string)?.toLowerCase() ?? '';
  const sc     = score(r);

  const Section = ({ label, value }: { label: string; value: string }) => value ? (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '0.85rem', color: C.sub, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  ) : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: PLATFORM_COLOR[plat] ?? C.dim, background: `${PLATFORM_COLOR[plat] ?? C.dim}18`, padding: '4px 10px', borderRadius: 7 }}>{PLATFORM_ICON[plat]} {plat}</span>
          <span style={{ fontSize: '0.7rem', color: C.dim }}>{f(r, 'Content Type')}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.dim, fontSize: '1.2rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
      </div>

      {sc > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 16px', background: `${scoreColor(sc)}10`, border: `0.5px solid ${scoreColor(sc)}30`, borderRadius: 12 }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, color: scoreColor(sc), fontFamily: C.mono }}>{sc.toFixed(1)}</span>
          <div>
            <div style={{ fontSize: '0.72rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Viral Score</div>
            <div style={{ fontSize: '0.75rem', color: C.sub }}>{sc >= 8 ? 'High potential' : sc >= 6 ? 'Good — refine hook' : 'Needs rework'}</div>
          </div>
        </div>
      )}

      <Section label="Topic"       value={f(r, 'Topic')} />
      <Section label="Hook"        value={f(r, 'Hook')} />
      <Section label="Caption"     value={f(r, 'Caption')} />
      <Section label="Script"      value={f(r, 'Script')} />
      <Section label="Hashtags"    value={f(r, 'Hashtags')} />
      <Section label="Kie.ai Prompt" value={f(r, 'Visual Prompt')} />
      <Section label="Manager Notes" value={f(r, 'Notes')} />

      {f(r, 'Slides (JSON)') && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Carousel Slides</div>
          {(() => { try { const slides = JSON.parse(f(r, 'Slides (JSON)')); return slides.map((s: any, i: number) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ fontSize: '0.65rem', color: C.violet, marginBottom: 4 }}>Slide {i + 1}</div>
              <div style={{ fontSize: '0.82rem', color: C.sub }}>{s.headline ?? s.text ?? JSON.stringify(s)}</div>
            </div>
          )); } catch { return <div style={{ fontSize: '0.82rem', color: C.dim }}>{f(r, 'Slides (JSON)')}</div>; } })()}
        </div>
      )}

      {(f(r, 'Image URL') || f(r, 'Video URL')) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Visual</div>
          <a href={f(r, 'Image URL') || f(r, 'Video URL')} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: C.teal }}>Open visual →</a>
        </div>
      )}

      {status === 'review' && (
        <div style={{ display: 'flex', gap: 10, marginTop: 32, paddingTop: 20, borderTop: `0.5px solid ${C.border}` }}>
          <button onClick={onApprove} style={{ flex: 1, padding: '11px', background: 'rgba(74,222,128,0.12)', border: `0.5px solid rgba(74,222,128,0.4)`, borderRadius: 10, color: C.green, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>✓ Approve</button>
          <button onClick={onReject}  style={{ flex: 1, padding: '11px', background: 'rgba(248,113,113,0.1)',  border: `0.5px solid rgba(248,113,113,0.4)`, borderRadius: 10, color: C.red,   fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>✗ Reject</button>
          <button onClick={onSchedule} style={{ flex: 1, padding: '11px', background: 'rgba(91,141,240,0.12)', border: `0.5px solid rgba(91,141,240,0.4)`, borderRadius: 10, color: C.teal, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>→ Schedule</button>
        </div>
      )}
      {status === 'approved' && (
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: `0.5px solid ${C.border}` }}>
          <button onClick={onSchedule} style={{ width: '100%', padding: '12px', background: 'rgba(91,141,240,0.12)', border: `0.5px solid rgba(91,141,240,0.4)`, borderRadius: 10, color: C.teal, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>Schedule via Blotato →</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR VIEW
// ─────────────────────────────────────────────────────────────────────────────
function CalendarView({ records, f, scheduledDates, onLoad, platform }: {
  records: AirtableRecord[]; f: any; scheduledDates: Set<string>; onLoad: () => void; platform: Platform;
}) {
  const today  = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName   = new Date(year, month).toLocaleString('default', { month: 'long' });

  const recordsByDate: Record<string, AirtableRecord[]> = {};
  records.forEach(r => {
    const d = f(r, 'Scheduled At')?.slice(0, 10);
    if (d) { (recordsByDate[d] ??= []).push(r); }
  });

  const days = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => { const d = new Date(year, month - 1); setYear(d.getFullYear()); setMonth(d.getMonth()); }} style={{ background: 'none', border: `0.5px solid ${C.border}`, borderRadius: 8, color: C.sub, padding: '6px 12px', cursor: 'pointer', fontFamily: C.body }}>←</button>
        <div style={{ fontFamily: C.heading, fontSize: '1.6rem', fontWeight: 300, color: C.fg, minWidth: 200 }}>{monthName} {year}</div>
        <button onClick={() => { const d = new Date(year, month + 1); setYear(d.getFullYear()); setMonth(d.getMonth()); }} style={{ background: 'none', border: `0.5px solid ${C.border}`, borderRadius: 8, color: C.sub, padding: '6px 12px', cursor: 'pointer', fontFamily: C.body }}>→</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: C.border, borderRadius: 12, overflow: 'hidden' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ background: C.bgMid, padding: '10px 0', textAlign: 'center', fontSize: '0.65rem', color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{d}</div>
        ))}
        {days.map((day, i) => {
          if (!day) return <div key={i} style={{ background: C.bgMid, minHeight: 80 }} />;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const dayRecords = recordsByDate[dateStr] ?? [];
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <div key={i} style={{ background: C.bgMid, minHeight: 80, padding: 8, borderTop: isToday ? `2px solid ${C.violet}` : undefined }}>
              <div style={{ fontSize: '0.78rem', color: isToday ? C.violet : C.sub, fontWeight: isToday ? 600 : 400, marginBottom: 4 }}>{day}</div>
              {dayRecords.map(r => {
                const plat = (f(r, 'Platform') as string)?.toLowerCase() ?? '';
                return (
                  <div key={r.id} style={{ fontSize: '0.62rem', color: PLATFORM_COLOR[plat] ?? C.dim, background: `${PLATFORM_COLOR[plat] ?? C.dim}18`, borderRadius: 4, padding: '2px 5px', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {PLATFORM_ICON[plat]} {f(r, 'Topic') || f(r, 'Content Type') || plat}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {records.filter(r => f(r, 'Scheduled At')).length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.dim, fontSize: '0.8rem' }}>
          No scheduled posts yet. Approve content and schedule it via Blotato.
        </div>
      )}
    </div>
  );
}
