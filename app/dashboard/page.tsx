'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ── Theme ─────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg:           '#f8f8fb',
  bgMid:        '#ffffff',
  bgCard:       '#ffffff',
  bgCardHover:  '#f4f3f9',
  bgActive:     '#ede9fb',
  fg:           '#1a1826',
  sub:          '#4a4460',
  dim:          '#8880a8',
  border:       'rgba(0,0,0,0.08)',
  borderMid:    'rgba(0,0,0,0.12)',
  borderStrong: 'rgba(0,0,0,0.18)',
  shadow:       '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
  cyan:         '#0ea5a0',
  violet:       '#7c3aed',
  pink:         '#db2777',
  green:        '#16a34a',
  orange:       '#ea580c',
  red:          '#dc2626',
  teal:         '#2563eb',
  yellow:       '#d97706',
  mono:         "'JetBrains Mono', 'Fira Code', monospace",
  body:         "'Inter', 'Helvetica Neue', system-ui, sans-serif",
};

const DARK = {
  bg:           '#07051a',
  bgMid:        '#0d0b22',
  bgCard:       'rgba(255,255,255,0.035)',
  bgCardHover:  'rgba(255,255,255,0.06)',
  bgActive:     'rgba(167,139,250,0.08)',
  fg:           '#eae6f8',
  sub:          '#b8b0d8',
  dim:          '#7c70a8',
  border:       'rgba(255,255,255,0.07)',
  borderMid:    'rgba(255,255,255,0.11)',
  borderStrong: 'rgba(255,255,255,0.18)',
  shadow:       '0 1px 3px rgba(0,0,0,0.4)',
  cyan:         '#5ce8d0',
  violet:       '#a78bfa',
  pink:         '#e879a0',
  green:        '#4ade80',
  orange:       '#fb923c',
  red:          '#f87171',
  teal:         '#5b8df0',
  yellow:       '#fbbf24',
  mono:         "'JetBrains Mono', 'Fira Code', monospace",
  body:         "'Inter', 'Helvetica Neue', system-ui, sans-serif",
};

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: 'orchestrator', name: 'Orchestrator', role: 'Marketing Director', icon: '◈',
    skills: ['Campaign Strategy', 'Agent Routing', 'Quality Control', 'Brief Writing', 'Brand Voice'],
    description: 'Reads your command, routes to the right agents, reviews all output before it reaches the queue. Nothing ships without sign-off.',
  },
  {
    id: 'instagram', name: 'Instagram', role: 'Platform Specialist', icon: '◎',
    skills: ['Carousel Narratives', 'Reels Hooks', 'Hashtag Research', 'Caption Formulas', 'Collab Strategy'],
    description: 'Carousel arcs, Reels scripts with 3-sec hooks, optimal hashtag sets (3–8 niche tags), and algorithm-first caption formulas.',
  },
  {
    id: 'tiktok', name: 'TikTok', role: 'Viral Specialist', icon: '▶',
    skills: ['3-sec Hook Formulas', 'Sound Strategy', 'Caption SEO', 'Duet/Stitch', 'Comment Bait'],
    description: 'Pattern-interrupt hooks, trending sound recommendations, TikTok search optimisation, and series formats built for completion rate.',
  },
  {
    id: 'linkedin', name: 'LinkedIn', role: 'Thought Leader', icon: '◻',
    skills: ['Thought Leadership', 'Hook Line Formula', 'Document Carousels', 'B2B Positioning', 'Dwell-time Copy'],
    description: '210-char hooks before "...more", no-link-in-body strategy, PDF carousels, and professional storytelling that builds authority.',
  },
  {
    id: 'video', name: 'Video Editor', role: 'Clip Architect', icon: '▣',
    skills: ['Scene Breakdown', 'FFmpeg Pipeline', 'B-roll Direction', 'Text Overlays', 'Kie.ai Prompts'],
    description: 'Breaks scripts into scenes, generates clips via Kie.ai, stitches them with FFmpeg. Outputs vertical 1080×1920 for Reels/TikTok.',
  },
  {
    id: 'copywriter', name: 'Copywriter', role: 'Word Strategist', icon: '✦',
    skills: ['Hook Writing', 'Power Words', 'CTA Optimisation', 'A/B Variants', 'Tone Adaptation'],
    description: "Multi-format copy across platforms. Adapts Symponia's philosophical tone — mystical but grounded — for each audience.",
  },
  {
    id: 'trends', name: 'Trend Researcher', role: 'Signal Hunter', icon: '◉',
    skills: ['Reddit Scraping', 'YouTube Trending', 'Google Trends', 'Virality Prediction', 'Timing Windows'],
    description: "No API keys needed. Scrapes Reddit, YouTube, and Google Trends to find what's gaining momentum in the niche right now.",
  },
  {
    id: 'visual', name: 'Visual Director', role: 'Aesthetic Lead', icon: '◆',
    skills: ['Brand Consistency', 'Kie.ai Prompting', 'Composition Rules', 'Platform Specs', 'Style Cohesion'],
    description: "Writes Kie.ai prompts that match Symponia's dark-mystical aesthetic. Reviews every visual for brand alignment before approval.",
  },
];

const STATUS_COLOR_LIGHT: Record<string, string> = {
  review: '#ea580c', approved: '#16a34a', scheduled: '#2563eb',
  posted: '#7c3aed', draft: '#8880a8', generating: '#0ea5a0', rejected: '#dc2626',
};
const STATUS_COLOR_DARK: Record<string, string> = {
  review: '#fb923c', approved: '#4ade80', scheduled: '#5b8df0',
  posted: '#a78bfa', draft: '#7c70a8', generating: '#5ce8d0', rejected: '#f87171',
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: '◎', tiktok: '▶', linkedin: '◻',
};

const F = {
  platform:     'Platform',
  contentType:  'Content Type',
  hook:         'Hook',
  caption:      'Caption',
  hashtags:     'Hashtags',
  script:       'Script',
  slides:       'Slides',
  visualPrompt: 'Visual Prompt',
  visualUrl:    'Visual URL',
  status:       'Status',
  scheduledAt:  'Scheduled At',
  viralScore:   'Viral Score',
  managerScore: 'Manager Score',
  notes:        'Manager Notes',
  topic:        'Topic',
};

type Tab      = 'queue' | 'brief' | 'agents' | 'calendar';
type Status   = 'review' | 'approved' | 'scheduled' | 'posted' | 'draft' | 'generating' | 'rejected' | 'all';
type Platform = 'all' | 'instagram' | 'tiktok' | 'linkedin';
interface AirtableRecord { id: string; fields: Record<string, any>; }
interface ChatMessage { role: 'user' | 'assistant'; content: string; agents?: string[]; ts: number; }

const TOKEN_KEY    = 'sym_dashboard_token';
const DARKMODE_KEY = 'sym_dashboard_dark';
function getToken()           { return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) ?? '' : ''; }
function saveToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken()         { localStorage.removeItem(TOKEN_KEY); }

async function apiGet(path: string, token: string)                 { const r = await fetch(path, { headers: { 'x-dashboard-token': token } }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiPatch(path: string, body: object, token: string) { const r = await fetch(path, { method: 'PATCH',  headers: { 'Content-Type': 'application/json', 'x-dashboard-token': token }, body: JSON.stringify(body) }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiPost(path: string,  body: object, token: string) { const r = await fetch(path, { method: 'POST',   headers: { 'Content-Type': 'application/json', 'x-dashboard-token': token }, body: JSON.stringify(body) }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }

export default function Dashboard() {
  const [authed,   setAuthed]   = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [token,    setTokenState] = useState('');

  const [dark,     setDark]     = useState(false);
  const C = dark ? DARK : LIGHT;
  const STATUS_COLOR = dark ? STATUS_COLOR_DARK : STATUS_COLOR_LIGHT;
  const PLATFORM_COLOR: Record<string, string> = {
    instagram: C.pink, tiktok: C.cyan, linkedin: C.teal,
  };

  const [tab,      setTab]      = useState<Tab>('queue');
  const [status,   setStatus]   = useState<Status>('review');
  const [platform, setPlatform] = useState<Platform>('all');

  const [records,  setRecords]  = useState<AirtableRecord[]>([]);
  const [counts,   setCounts]   = useState<Record<string, number>>({});
  const [loading,  setLoading]  = useState(false);

  const [detail,   setDetail]   = useState<AirtableRecord | null>(null);
  const [schedModal, setSchedModal] = useState<{ record: AirtableRecord } | null>(null);
  const [schedDate,  setSchedDate]  = useState('');

  // Chat
  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [chatInput,   setChatInput]   = useState('');
  const [chatPlatform,setChatPlatform] = useState<Platform>('all');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<{ msg: string; type?: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((msg: string, type = '') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const t = getToken();
    if (t) { setTokenState(t); setAuthed(true); }
    const savedDark = localStorage.getItem(DARKMODE_KEY);
    if (savedDark === 'true') setDark(true);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem(DARKMODE_KEY, String(next));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    try {
      const res  = await fetch('/api/dashboard/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (data.ok && data.token) { saveToken(data.token); setTokenState(data.token); setAuthed(true); }
      else setLoginErr('Invalid username or password');
    } catch { setLoginErr('Login failed — please try again'); }
  };

  const loadRecords = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (status !== 'all') p.set('status', status);
      if (platform !== 'all') p.set('platform', platform);
      const data = await apiGet(`/api/dashboard/records?${p}`, token);
      setRecords(data.records ?? []);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') setAuthed(false);
      else showToast('Failed to load records', 'error');
    } finally { setLoading(false); }
  }, [authed, status, platform, showToast, token]);

  const loadCounts = useCallback(async () => {
    if (!authed) return;
    try {
      const statuses = ['generating', 'review', 'approved', 'scheduled', 'posted'];
      const results  = await Promise.allSettled(statuses.map(s => apiGet(`/api/dashboard/records?status=${s}`, token)));
      const c: Record<string, number> = {};
      results.forEach((r, i) => { c[statuses[i]] = r.status === 'fulfilled' ? (r.value.records ?? []).length : 0; });
      setCounts(c);
    } catch {}
  }, [authed, token]);

  useEffect(() => { if (authed) { loadRecords(); loadCounts(); } }, [authed, status, platform, loadRecords, loadCounts]);
  useEffect(() => { if (!authed) return; const t = setInterval(() => { loadRecords(); loadCounts(); }, 30000); return () => clearInterval(t); }, [authed, loadRecords, loadCounts]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiPatch('/api/dashboard/records', { id, fields: { [F.status]: newStatus } }, token);
      setRecords(rs => rs.filter(r => r.id !== id));
      setDetail(null);
      showToast(`Marked as ${newStatus}`, 'success');
      loadCounts();
    } catch { showToast('Update failed', 'error'); }
  };

  const schedulePost = async () => {
    if (!schedModal || !schedDate) return;
    try {
      await apiPost('/api/dashboard/generate', { recordId: schedModal.record.id, scheduledAt: schedDate }, token);
      await apiPatch('/api/dashboard/records', { id: schedModal.record.id, fields: { [F.status]: 'scheduled', [F.scheduledAt]: schedDate } }, token);
      setSchedModal(null);
      setRecords(rs => rs.filter(r => r.id !== schedModal.record.id));
      showToast('Scheduled via Blotato', 'success');
      loadCounts();
    } catch { showToast('Scheduling failed', 'error'); }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput, ts: Date.now() };
    setMessages(m => [...m, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await apiPost('/api/dashboard/generate', { command: chatInput, platform: chatPlatform }, token);
      const reply = res.message ?? 'Team briefed — content will appear in queue shortly.';
      const agentsRouted: string[] = res.agents ?? [];
      setMessages(m => [...m, { role: 'assistant', content: reply, agents: agentsRouted, ts: Date.now() }]);
      setTimeout(() => { loadRecords(); loadCounts(); }, 3000);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Failed to reach the agent team. Please try again.', ts: Date.now() }]);
    } finally { setChatLoading(false); }
  };

  const f = (r: AirtableRecord, field: string) => r.fields[field] ?? '';
  const score = (r: AirtableRecord) => Number(f(r, F.viralScore)) || 0;
  const scoreColor = (n: number) => n >= 8 ? C.green : n >= 6 ? C.orange : C.dim;
  const calendarRecords = records.filter(r => f(r, F.scheduledAt));
  const scheduledDates  = new Set(calendarRecords.map(r => f(r, F.scheduledAt)?.slice(0, 10)));

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: dark ? DARK.bg : '#f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LIGHT.body }}>
        <div style={{ width: 400, padding: '48px 40px', background: dark ? DARK.bgMid : '#ffffff', border: `1px solid ${dark ? DARK.borderMid : 'rgba(0,0,0,0.1)'}`, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 600, color: dark ? DARK.fg : '#1a1826', marginBottom: 4 }}>Symponia</div>
          <div style={{ fontSize: '0.72rem', color: dark ? DARK.dim : '#8880a8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 36 }}>Marketing OS</div>
          <form onSubmit={handleLogin}>
            {(['Username', 'Password'] as const).map((label, i) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 500, color: dark ? DARK.sub : '#4a4460', marginBottom: 6 }}>{label}</div>
                <input
                  type={i === 1 ? 'password' : 'text'}
                  value={i === 0 ? username : password}
                  onChange={e => i === 0 ? setUsername(e.target.value) : setPassword(e.target.value)}
                  autoComplete={i === 0 ? 'username' : 'current-password'}
                  placeholder={label}
                  style={{ width: '100%', padding: '10px 14px', background: dark ? 'rgba(255,255,255,0.04)' : '#f8f8fb', border: `1px solid ${dark ? DARK.border : 'rgba(0,0,0,0.12)'}`, borderRadius: 8, color: dark ? DARK.fg : '#1a1826', fontFamily: LIGHT.body, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            {loginErr && <div style={{ fontSize: '0.8rem', color: '#dc2626', marginBottom: 14, textAlign: 'center' }}>{loginErr}</div>}
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontFamily: LIGHT.body, fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', marginTop: 4 }}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── MAIN ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: C.body, color: C.fg }}>

      {/* Top bar */}
      <header style={{ height: 52, background: C.bgMid, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 0, flexShrink: 0, boxShadow: dark ? 'none' : C.shadow }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginRight: 32 }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: C.violet }}>◈</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: C.fg }}>Symponia</span>
          <span style={{ fontSize: '0.6rem', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Marketing OS</span>
        </a>

        {(['queue', 'brief', 'agents', 'calendar'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0 14px', height: 52, background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? C.violet : 'transparent'}`, color: tab === t ? C.violet : C.dim, fontSize: '0.78rem', fontWeight: tab === t ? 600 : 400, letterSpacing: '0.04em', cursor: 'pointer', transition: 'all .15s', fontFamily: C.body }}>
            {t === 'queue' ? 'Content Queue' : t === 'brief' ? 'Brief Orchestrator' : t === 'agents' ? 'Agent Team' : 'Calendar'}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {(['review','approved','scheduled'] as Status[]).map(s => (
          <div key={s} onClick={() => { setTab('queue'); setStatus(s); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', cursor: 'pointer', opacity: status === s && tab === 'queue' ? 1 : 0.5, borderRadius: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[s] }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: C.sub }}>{counts[s] ?? 0}</span>
            <span style={{ fontSize: '0.65rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s}</span>
          </div>
        ))}

        {/* Dark mode toggle */}
        <button onClick={toggleDark} title={dark ? 'Light mode' : 'Dark mode'}
          style={{ marginLeft: 12, padding: '5px 10px', background: C.bgActive, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', color: C.sub, fontFamily: C.body }}>
          {dark ? '☀ Light' : '☾ Dark'}
        </button>

        <button onClick={() => { clearToken(); setAuthed(false); }}
          style={{ marginLeft: 10, fontSize: '0.72rem', color: C.dim, background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', padding: '5px 10px', fontFamily: C.body }}>
          Sign out
        </button>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar — queue only */}
        {tab === 'queue' && (
          <aside style={{ width: 192, background: C.bgMid, borderRight: `1px solid ${C.border}`, padding: '16px 0', flexShrink: 0, overflowY: 'auto' }}>
            <div style={{ padding: '0 14px 10px', fontSize: '0.6rem', fontWeight: 600, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Pipeline</div>
            {([
              { key: 'review'    as Status, label: 'For Review' },
              { key: 'approved'  as Status, label: 'Approved' },
              { key: 'scheduled' as Status, label: 'Scheduled' },
              { key: 'posted'    as Status, label: 'Posted' },
              { key: 'all'       as Status, label: 'All Content' },
              { key: 'draft'     as Status, label: 'Draft' },
              { key: 'rejected'  as Status, label: 'Rejected' },
            ]).map(({ key, label }) => (
              <button key={key} onClick={() => setStatus(key)} style={{ width: '100%', padding: '8px 14px', background: status === key ? C.bgActive : 'none', border: 'none', borderLeft: `2px solid ${status === key ? C.violet : 'transparent'}`, color: status === key ? C.violet : C.sub, fontFamily: C.body, fontSize: '0.8rem', fontWeight: status === key ? 600 : 400, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{label}</span>
                {counts[key] ? <span style={{ fontSize: '0.68rem', color: STATUS_COLOR[key] ?? C.dim, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderRadius: 10, padding: '1px 6px', fontWeight: 600 }}>{counts[key]}</span> : null}
              </button>
            ))}

            <div style={{ padding: '16px 14px 8px', fontSize: '0.6rem', fontWeight: 600, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Platform</div>
            {(['all','instagram','tiktok','linkedin'] as Platform[]).map(p => (
              <button key={p} onClick={() => setPlatform(p)} style={{ width: '100%', padding: '7px 14px', background: platform === p ? C.bgActive : 'none', border: 'none', borderLeft: `2px solid ${platform === p ? (PLATFORM_COLOR[p] ?? C.violet) : 'transparent'}`, color: platform === p ? C.fg : C.sub, fontFamily: C.body, fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                {p !== 'all' && <span style={{ color: PLATFORM_COLOR[p], fontSize: '0.7rem' }}>{PLATFORM_ICON[p]}</span>}
                {p === 'all' ? 'All Platforms' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}

            <div style={{ padding: '16px 14px 8px', fontSize: '0.6rem', fontWeight: 600, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Actions</div>
            <button onClick={() => { loadRecords(); loadCounts(); }} style={{ width: '100%', padding: '7px 14px', background: 'none', border: 'none', color: C.sub, fontFamily: C.body, fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer' }}>↺ Refresh</button>
          </aside>
        )}

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', padding: tab === 'brief' ? 0 : 24 }}>

          {/* ── QUEUE TAB ── */}
          {tab === 'queue' && (
            <>
              {loading && <div style={{ color: C.dim, fontSize: '0.82rem', padding: '48px 0', textAlign: 'center' }}>Loading…</div>}
              {!loading && records.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
                  <div style={{ fontSize: '2.5rem', opacity: 0.15 }}>◈</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: C.sub }}>Nothing here yet</div>
                  <div style={{ fontSize: '0.82rem', color: C.dim, textAlign: 'center', maxWidth: 300, lineHeight: 1.7 }}>
                    Switch to <strong style={{ cursor: 'pointer', color: C.violet }} onClick={() => setTab('brief')}>Brief Orchestrator</strong> to brief the agent team.
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {records.map(r => (
                  <ContentCard key={r.id} r={r} f={f} score={score} scoreColor={scoreColor}
                    C={C} STATUS_COLOR={STATUS_COLOR} PLATFORM_COLOR={PLATFORM_COLOR}
                    onClick={() => setDetail(r)}
                    onApprove={() => updateStatus(r.id, 'approved')}
                    onReject={() => updateStatus(r.id, 'rejected')}
                    onSchedule={() => { setSchedModal({ record: r }); setSchedDate(''); }}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── BRIEF TAB (Chat) ── */}
          {tab === 'brief' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Chat header */}
              <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, background: C.bgMid, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: dark ? 'rgba(124,58,237,0.15)' : '#ede9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.violet, fontSize: '1rem', fontWeight: 700 }}>◈</div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: C.fg }}>Orchestrator</div>
                  <div style={{ fontSize: '0.72rem', color: C.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                    Online · Marketing Director
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: C.dim }}>
                  Describe what you need — the Orchestrator will decide which agents to brief and why.
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.length === 0 && (
                  <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 480 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.2 }}>◈</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: C.sub, marginBottom: 8 }}>Brief the Orchestrator</div>
                    <div style={{ fontSize: '0.82rem', color: C.dim, lineHeight: 1.8, marginBottom: 24 }}>
                      Tell the team what to create. The Orchestrator will read your brief, decide which agents to activate, and explain its routing decisions before generating content.
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        'Create a TikTok video about shadow work trends',
                        'Write a LinkedIn post on animal archetype psychology',
                        'Generate an Instagram carousel on the 7 spirit animals',
                      ].map(s => (
                        <button key={s} onClick={() => setChatInput(s)}
                          style={{ padding: '10px 16px', background: dark ? 'rgba(255,255,255,0.04)' : '#fff', border: `1px solid ${C.border}`, borderRadius: 8, color: C.sub, fontFamily: C.body, fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', boxShadow: dark ? 'none' : C.shadow }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.role === 'user' ? C.violet : (dark ? 'rgba(124,58,237,0.15)' : '#ede9fb'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: msg.role === 'user' ? '#fff' : C.violet, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                      {msg.role === 'user' ? 'Y' : '◈'}
                    </div>
                    <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 6, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', background: msg.role === 'user' ? C.violet : (dark ? 'rgba(255,255,255,0.05)' : '#ffffff'), color: msg.role === 'user' ? '#fff' : C.fg, fontSize: '0.85rem', lineHeight: 1.7, boxShadow: dark ? 'none' : C.shadow, border: msg.role === 'user' ? 'none' : `1px solid ${C.border}` }}>
                        {msg.content}
                      </div>
                      {msg.agents && msg.agents.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          <span style={{ fontSize: '0.68rem', color: C.dim }}>Routed to:</span>
                          {msg.agents.map(a => (
                            <span key={a} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 10, background: dark ? 'rgba(124,58,237,0.12)' : '#ede9fb', color: C.violet, fontWeight: 500 }}>{a}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: '0.65rem', color: C.dim }}>
                        {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: dark ? 'rgba(124,58,237,0.15)' : '#ede9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.violet, fontSize: '0.75rem', fontWeight: 700 }}>◈</div>
                    <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: dark ? 'rgba(255,255,255,0.05)' : '#ffffff', border: `1px solid ${C.border}`, fontSize: '0.85rem', color: C.dim, boxShadow: dark ? 'none' : C.shadow }}>
                      Thinking…
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, background: C.bgMid }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <select value={chatPlatform} onChange={e => setChatPlatform(e.target.value as Platform)}
                    style={{ padding: '10px 12px', background: dark ? 'rgba(255,255,255,0.04)' : '#f8f8fb', border: `1px solid ${C.border}`, borderRadius: 8, color: C.sub, fontFamily: C.body, fontSize: '0.78rem', outline: 'none', flexShrink: 0 }}>
                    <option value="all">All platforms</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                  <textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    placeholder='Describe what you want the team to create… (Enter to send, Shift+Enter for new line)'
                    rows={2}
                    style={{ flex: 1, padding: '10px 14px', background: dark ? 'rgba(255,255,255,0.04)' : '#f8f8fb', border: `1px solid ${C.border}`, borderRadius: 8, color: C.fg, fontFamily: C.body, fontSize: '0.88rem', outline: 'none', resize: 'none', lineHeight: 1.5 }}
                  />
                  <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                    style={{ padding: '10px 20px', background: chatInput.trim() ? C.violet : (dark ? 'rgba(255,255,255,0.04)' : '#f0f0f5'), border: 'none', borderRadius: 8, color: chatInput.trim() ? '#fff' : C.dim, fontFamily: C.body, fontSize: '0.82rem', fontWeight: 500, cursor: chatInput.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'all .15s' }}>
                    {chatLoading ? '…' : 'Send →'}
                  </button>
                </div>
                <div style={{ fontSize: '0.68rem', color: C.dim, marginTop: 8 }}>The Orchestrator will explain which agents are being activated and why.</div>
              </div>
            </div>
          )}

          {/* ── AGENTS TAB ── */}
          {tab === 'agents' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: C.fg, marginBottom: 4 }}>Agent Team</div>
                <div style={{ fontSize: '0.82rem', color: C.dim, lineHeight: 1.7, maxWidth: 600 }}>
                  8 specialist agents managed by the Orchestrator. Use Brief Orchestrator to activate them. Each agent has deep platform expertise and reports back before content reaches your queue.
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {AGENTS.map(a => <AgentCard key={a.id} agent={a} C={C} dark={dark} />)}
              </div>
            </div>
          )}

          {/* ── CALENDAR TAB ── */}
          {tab === 'calendar' && (
            <CalendarView records={records} f={f} scheduledDates={scheduledDates} onLoad={loadRecords} platform={platform} C={C} />
          )}
        </main>
      </div>

      {/* Detail panel */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={() => setDetail(null)}>
          <div style={{ width: 520, background: C.bgMid, height: '100%', overflowY: 'auto', padding: 28, boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', borderLeft: `1px solid ${C.borderMid}` }} onClick={e => e.stopPropagation()}>
            <DetailPanel r={detail} f={f} score={score} scoreColor={scoreColor} C={C} STATUS_COLOR={STATUS_COLOR} PLATFORM_COLOR={PLATFORM_COLOR}
              onApprove={() => updateStatus(detail.id, 'approved')}
              onReject={() => updateStatus(detail.id, 'rejected')}
              onSchedule={() => { setSchedModal({ record: detail }); setSchedDate(''); }}
              onClose={() => setDetail(null)}
            />
          </div>
        </div>
      )}

      {/* Schedule modal */}
      {schedModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setSchedModal(null)}>
          <div style={{ width: 400, background: C.bgMid, border: `1px solid ${C.borderMid}`, borderRadius: 16, padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: C.fg, marginBottom: 4 }}>Schedule Post</div>
            <div style={{ fontSize: '0.78rem', color: C.dim, marginBottom: 20 }}>Will be sent to Blotato and posted automatically at the selected time.</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 500, color: C.sub, marginBottom: 6 }}>Date & Time</div>
            <input type="datetime-local" value={schedDate} onChange={e => setSchedDate(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: dark ? 'rgba(255,255,255,0.04)' : '#f8f8fb', border: `1px solid ${C.border}`, borderRadius: 8, color: C.fg, fontFamily: C.body, fontSize: '0.88rem', outline: 'none', marginBottom: 18, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSchedModal(null)} style={{ flex: 1, padding: '10px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={schedulePost} disabled={!schedDate} style={{ flex: 2, padding: '10px', background: C.teal, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>Schedule via Blotato →</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: C.bgMid, border: `1px solid ${toast.type === 'error' ? C.red : C.borderMid}`, borderRadius: 10, padding: '10px 20px', fontSize: '0.82rem', color: toast.type === 'error' ? C.red : C.fg, zIndex: 300, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: C.body }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ContentCard({ r, f, score, scoreColor, C, STATUS_COLOR, PLATFORM_COLOR, onClick, onApprove, onReject, onSchedule }: {
  r: AirtableRecord; f: any; score: any; scoreColor: any; C: typeof LIGHT;
  STATUS_COLOR: Record<string, string>; PLATFORM_COLOR: Record<string, string>;
  onClick: () => void; onApprove: () => void; onReject: () => void; onSchedule: () => void;
}) {
  const plat    = (f(r, 'Platform') as string)?.toLowerCase() ?? '';
  const status  = (f(r, 'Status')   as string)?.toLowerCase() ?? '';
  const sc      = score(r);
  const preview = f(r, 'Hook') || f(r, 'Caption') || f(r, 'Script') || '';

  return (
    <div onClick={onClick} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px', cursor: 'pointer', transition: 'all .15s', boxShadow: C.shadow }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadow; }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${PLATFORM_COLOR[plat] ?? C.violet}, transparent)`, borderRadius: 2, marginBottom: 14 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: PLATFORM_COLOR[plat] ?? C.dim, background: `${PLATFORM_COLOR[plat] ?? C.dim}18`, padding: '3px 8px', borderRadius: 5 }}>
            {PLATFORM_ICON[plat]} {plat}
          </span>
          {f(r, 'Content Type') && <span style={{ fontSize: '0.65rem', color: C.dim }}>{f(r, 'Content Type')}</span>}
        </div>
        {sc > 0 && <span style={{ fontSize: '0.88rem', fontWeight: 700, color: scoreColor(sc), fontFamily: C.mono }}>{sc.toFixed(1)}</span>}
      </div>
      <div style={{ fontSize: '0.85rem', color: C.sub, lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {preview || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>No preview</span>}
      </div>
      {f(r, 'Hashtags') && <div style={{ fontSize: '0.72rem', color: C.violet, marginBottom: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f(r, 'Hashtags')}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[status] ?? C.dim }} />
          <span style={{ fontSize: '0.68rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{status}</span>
        </div>
        {status === 'review' && (
          <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
            <ActionBtn label="✓ Approve" color={C.green}  onClick={onApprove} />
            <ActionBtn label="✗ Reject"  color={C.red}    onClick={onReject} />
            <ActionBtn label="Schedule"  color={C.teal}   onClick={onSchedule} />
          </div>
        )}
        {status === 'approved' && (
          <div onClick={e => e.stopPropagation()}>
            <ActionBtn label="Schedule →" color={C.teal} onClick={onSchedule} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '4px 10px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 6, color, fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer' }}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT CARD
// ─────────────────────────────────────────────────────────────────────────────
function AgentCard({ agent, C, dark }: { agent: typeof AGENTS[number]; C: typeof LIGHT; dark: boolean }) {
  const agentColors = [C.violet, C.pink, C.cyan, C.teal, C.orange, C.yellow, C.green, '#c084fc'];
  const color = agentColors[AGENTS.findIndex(a => a.id === agent.id) % agentColors.length];
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px', boxShadow: C.shadow }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 2, marginBottom: 16 }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ color, fontSize: '1rem' }}>{agent.icon}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: C.fg }}>{agent.name}</span>
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: 500, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{agent.role}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
          <span style={{ fontSize: '0.65rem', color: C.dim }}>Idle</span>
        </div>
      </div>
      <div style={{ fontSize: '0.82rem', color: C.sub, lineHeight: 1.65, marginBottom: 14 }}>{agent.description}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {agent.skills.map(s => (
          <span key={s} style={{ fontSize: '0.65rem', color, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 5, padding: '3px 8px' }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────
function DetailPanel({ r, f, score, scoreColor, C, STATUS_COLOR, PLATFORM_COLOR, onApprove, onReject, onSchedule, onClose }: {
  r: AirtableRecord; f: any; score: any; scoreColor: any; C: typeof LIGHT;
  STATUS_COLOR: Record<string, string>; PLATFORM_COLOR: Record<string, string>;
  onApprove: () => void; onReject: () => void; onSchedule: () => void; onClose: () => void;
}) {
  const plat   = (f(r, 'Platform') as string)?.toLowerCase() ?? '';
  const status = (f(r, 'Status')   as string)?.toLowerCase() ?? '';
  const sc     = score(r);

  const Row = ({ label, value }: { label: string; value: string }) => value ? (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: '0.85rem', color: C.sub, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  ) : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: PLATFORM_COLOR[plat] ?? C.dim, background: `${PLATFORM_COLOR[plat] ?? C.dim}18`, padding: '3px 8px', borderRadius: 5 }}>
            {PLATFORM_ICON[plat]} {plat}
          </span>
          {sc > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 700, color: scoreColor(sc), fontFamily: C.mono }}>{sc.toFixed(1)}</span>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '1.1rem', fontFamily: C.body }}>✕</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[status] ?? C.dim }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: STATUS_COLOR[status] ?? C.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{status}</span>
      </div>
      <Row label="Hook"          value={f(r, 'Hook')} />
      <Row label="Caption"       value={f(r, 'Caption')} />
      <Row label="Script"        value={f(r, 'Script')} />
      <Row label="Hashtags"      value={f(r, 'Hashtags')} />
      <Row label="Visual Prompt" value={f(r, 'Visual Prompt')} />
      <Row label="Notes"         value={f(r, 'Notes')} />
      <Row label="Scheduled"     value={f(r, 'Scheduled At')} />
      {status === 'review' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={onApprove} style={{ flex: 1, padding: '10px', background: C.green, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>✓ Approve</button>
          <button onClick={onReject}  style={{ flex: 1, padding: '10px', background: 'none', border: `1px solid ${C.red}`, borderRadius: 8, color: C.red, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>✗ Reject</button>
          <button onClick={onSchedule} style={{ flex: 1, padding: '10px', background: C.teal, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>Schedule →</button>
        </div>
      )}
      {status === 'approved' && (
        <button onClick={onSchedule} style={{ width: '100%', padding: '10px', background: C.teal, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', marginTop: 8 }}>Schedule via Blotato →</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR VIEW
// ─────────────────────────────────────────────────────────────────────────────
function CalendarView({ records, f, scheduledDates, onLoad, platform, C }: {
  records: AirtableRecord[]; f: any; scheduledDates: Set<string>; onLoad: () => void; platform: Platform; C: typeof LIGHT;
}) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: C.fg }}>{monthName}</div>
        <button onClick={onLoad} style={{ padding: '6px 14px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, color: C.sub, fontFamily: C.body, fontSize: '0.78rem', cursor: 'pointer' }}>↺ Refresh</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {names.map(n => <div key={n} style={{ padding: '8px', textAlign: 'center', fontSize: '0.68rem', fontWeight: 600, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{n}</div>)}
        {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const hasPost = scheduledDates.has(key);
          const isToday = d === now.getDate();
          return (
            <div key={d} style={{ padding: '10px 8px', minHeight: 64, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 6, position: 'relative', boxShadow: C.shadow }}>
              <div style={{ fontSize: '0.75rem', fontWeight: isToday ? 700 : 400, color: isToday ? C.violet : C.sub, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isToday ? `${C.violet}18` : 'transparent' }}>{d}</div>
              {hasPost && <div style={{ marginTop: 4, width: 6, height: 6, borderRadius: '50%', background: C.violet }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
