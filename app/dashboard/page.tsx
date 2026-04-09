'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ── Design tokens (matching symponia.io exactly) ──────────────────────────────
const C = {
  bg:           '#08061c',
  bgMid:        '#0e0b26',
  bgCard:       'rgba(255,255,255,0.03)',
  bgCardHover:  'rgba(255,255,255,0.05)',
  fg:           '#eae6f8',
  sub:          '#b8b0d8',
  dim:          '#7c70a8',
  border:       'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',
  cyan:         '#5ce8d0',
  violet:       '#a78bfa',
  green:        'rgba(80,200,120,0.9)',
  orange:       'rgba(240,170,60,0.9)',
  red:          'rgba(220,80,80,0.9)',
  teal:         '#5b8df0',
  heading:      "var(--font-cormorant), 'Georgia', serif",
  body:         "var(--font-inter), 'Helvetica Neue', sans-serif",
};

// ── Field name map (must match Airtable column names) ─────────────────────────
const F = {
  platform:      'Platform',
  contentType:   'Content Type',
  agent:         'Agent',
  hook:          'Hook',
  caption:       'Caption',
  hashtags:      'Hashtags',
  script:        'Script',
  slides:        'Slides (JSON)',
  visualPrompt:  'Visual Prompt',
  imageUrl:      'Image URL',
  videoUrl:      'Video URL',
  status:        'Status',
  scheduledAt:   'Scheduled At',
  blotPostId:    'Blotato Post ID',
  trendReference:'Trend Reference',
  viralScore:    'Viral Score',
  notes:         'Notes',
  generatedAt:   'Generated At',
  firstComment:  'First Comment',
};

type Status   = 'review' | 'approved' | 'scheduled' | 'posted' | 'draft' | 'generating' | 'rejected' | 'all';
type Platform = 'all' | 'instagram' | 'tiktok' | 'linkedin';

interface AirtableRecord { id: string; fields: Record<string, any>; }

// ── Auth ──────────────────────────────────────────────────────────────────────
const PASS_KEY = 'sym_dashboard_token';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem(PASS_KEY) ?? '' : ''; }
function saveToken(t: string) { localStorage.setItem(PASS_KEY, t); }

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiGet(path: string): Promise<any> {
  const res = await fetch(path, { headers: { 'x-dashboard-token': getToken() } });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPatch(path: string, body: object): Promise<any> {
  const res = await fetch(path, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-dashboard-token': getToken() },
    body:    JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(path: string, body: object): Promise<any> {
  const res = await fetch(path, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'x-dashboard-token': getToken() },
    body:    JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  review:     C.orange,
  approved:   C.green,
  scheduled:  C.teal,
  posted:     C.violet,
  draft:      C.dim,
  generating: C.cyan,
  rejected:   C.red,
};

const PLATFORM_COLOR: Record<string, string> = {
  instagram: C.violet,
  tiktok:    C.green,
  linkedin:  C.teal,
};

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [authed,   setAuthed]   = useState(false);
  const [passInput, setPassInput] = useState('');
  const [records,  setRecords]  = useState<AirtableRecord[]>([]);
  const [counts,   setCounts]   = useState<Record<string, number>>({});
  const [loading,  setLoading]  = useState(false);
  const [status,   setStatus]   = useState<Status>('review');
  const [platform, setPlatform] = useState<Platform>('all');
  const [detail,   setDetail]   = useState<AirtableRecord | null>(null);
  const [genOpen,  setGenOpen]  = useState(false);
  const [genPlat,  setGenPlat]  = useState('all');
  const [genType,  setGenType]  = useState('auto');
  const [genTopic, setGenTopic] = useState('');
  const [genRunning, setGenRunning] = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; type?: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type = '') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (token) { setAuthed(true); }
  }, []);

  const handleLogin = () => {
    saveToken(passInput);
    setAuthed(true);
  };

  // ── Load records ───────────────────────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (platform !== 'all') params.set('platform', platform);
      const data = await apiGet(`/api/dashboard/records?${params}`);
      setRecords(data.records ?? []);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') { setAuthed(false); showToast('Session expired — please log in again', 'error'); }
      else showToast('Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  }, [authed, status, platform, showToast]);

  // Count across all statuses (for pipeline badges)
  const loadCounts = useCallback(async () => {
    if (!authed) return;
    const statuses = ['review', 'approved', 'scheduled', 'posted', 'generating', 'draft'];
    const counts: Record<string, number> = {};
    await Promise.allSettled(statuses.map(async s => {
      try {
        const data = await apiGet(`/api/dashboard/records?status=${s}`);
        counts[s] = data.records?.length ?? 0;
      } catch {}
    }));
    setCounts(counts);
  }, [authed]);

  useEffect(() => { loadRecords(); }, [loadRecords]);
  useEffect(() => { loadCounts(); }, [loadCounts]);

  // Auto-refresh every 30 s
  useEffect(() => {
    const t = setInterval(() => { loadRecords(); loadCounts(); }, 30_000);
    return () => clearInterval(t);
  }, [loadRecords, loadCounts]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDetail(null); setGenOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') { e.preventDefault(); setGenOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  async function approve(id: string) {
    try {
      await apiPatch('/api/dashboard/records', { id, fields: { [F.status]: 'approved', 'Approved At': new Date().toISOString() } });
      showToast('Approved ✓', 'success');
      loadRecords(); loadCounts();
    } catch { showToast('Error approving', 'error'); }
  }

  async function reject(id: string) {
    try {
      await apiPatch('/api/dashboard/records', { id, fields: { [F.status]: 'rejected' } });
      showToast('Rejected');
      loadRecords(); loadCounts();
    } catch { showToast('Error rejecting', 'error'); }
  }

  async function schedule(id: string) {
    const at = prompt('Schedule date/time (ISO 8601):\ne.g. 2026-04-10T09:00:00Z');
    if (!at) return;
    try {
      await apiPatch('/api/dashboard/records', { id, fields: { [F.status]: 'scheduled', [F.scheduledAt]: at } });
      // Also tell n8n → Blotato
      await apiPost('/api/dashboard/generate', { action: 'schedule', recordId: id, scheduledAt: at });
      showToast('Scheduled ✓', 'success');
      loadRecords(); loadCounts();
    } catch { showToast('Error scheduling', 'error'); }
  }

  async function runGeneration() {
    setGenRunning(true);
    try {
      const data = await apiPost('/api/dashboard/generate', { platform: genPlat, type: genType, topic: genTopic });
      if (data.ok) {
        showToast('Agent team triggered ◈', 'success');
      } else {
        showToast(data.message ?? 'Run agents via CLI', 'error');
        if (data.command) console.info('[Dashboard] CLI command:', data.command);
      }
      setGenOpen(false);
      setTimeout(() => { loadRecords(); loadCounts(); }, 8000);
    } catch { showToast('Failed to trigger agents', 'error'); }
    finally { setGenRunning(false); }
  }

  // ── Login screen ───────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.body }}>
        <div style={{ width: 360, padding: '48px 40px', background: C.bgCard, border: `0.5px solid ${C.borderStrong}`, borderRadius: 20 }}>
          <div style={{ fontFamily: C.heading, fontSize: '2rem', fontWeight: 300, color: C.fg, marginBottom: 8 }}>◈ Symponia</div>
          <div style={{ fontSize: '0.75rem', color: C.dim, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 36 }}>Marketing Dashboard</div>
          <input
            type="password"
            placeholder="Access code"
            value={passInput}
            onChange={e => setPassInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '11px 16px', background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${C.border}`, borderRadius: 10, color: C.fg, fontFamily: C.body, fontSize: '0.9rem', outline: 'none', marginBottom: 12 }}
          />
          <button
            onClick={handleLogin}
            style={{ width: '100%', padding: '11px', background: `rgba(167,139,250,0.14)`, border: `0.5px solid rgba(167,139,250,0.4)`, borderRadius: 10, color: C.fg, fontFamily: C.body, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Enter
          </button>
          <p style={{ marginTop: 20, fontSize: '0.72rem', color: C.dim, opacity: 0.6, lineHeight: 1.6 }}>
            Set <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 4 }}>DASHBOARD_PASSWORD</code> in your environment to enable access control.
          </p>
        </div>
      </div>
    );
  }

  // ── Field helpers ──────────────────────────────────────────────────────────
  const f = (r: AirtableRecord, field: string) => r.fields[field] ?? '';
  const scoreClass = (n: number) => n >= 8 ? C.green : n >= 6 ? C.orange : C.dim;

  // ── Pipeline stages ────────────────────────────────────────────────────────
  const STAGES: { key: Status; label: string }[] = [
    { key: 'generating', label: 'Generating' },
    { key: 'review',     label: 'Review' },
    { key: 'approved',   label: 'Approved' },
    { key: 'scheduled',  label: 'Scheduled' },
    { key: 'posted',     label: 'Posted' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.fg, fontFamily: C.body, display: 'flex' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div style={{ width: 224, flexShrink: 0, borderRight: `0.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '28px 0' }}>

        {/* Logo */}
        <div style={{ padding: '0 20px 24px', borderBottom: `0.5px solid ${C.border}`, marginBottom: 8 }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: C.heading, fontSize: '1.2rem', fontWeight: 300, color: C.fg }}>◈ Symponia</span>
          </a>
          <div style={{ fontSize: '0.65rem', color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Marketing Dashboard</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {[
            { key: 'review'    as Status, label: 'For Review',  badge: counts.review },
            { key: 'approved'  as Status, label: 'Approved',    badge: counts.approved },
            { key: 'scheduled' as Status, label: 'Scheduled',   badge: counts.scheduled },
            { key: 'posted'    as Status, label: 'Posted',      badge: counts.posted },
          ].map(item => (
            <button key={item.key} onClick={() => setStatus(item.key)}
              style={{
                width: '100%', padding: '9px 20px', display: 'flex', alignItems: 'center', gap: 10,
                background: status === item.key ? 'rgba(167,139,250,0.08)' : 'transparent',
                borderLeft: `2px solid ${status === item.key ? C.violet : 'transparent'}`,
                border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none',
                borderLeftWidth: 2, borderLeftStyle: 'solid', borderLeftColor: status === item.key ? C.violet : 'transparent',
                color: status === item.key ? C.fg : C.sub,
                fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left',
              }}>
              {item.label}
              {(item.badge ?? 0) > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: item.key === 'review' ? 'rgba(220,80,80,0.18)' : 'rgba(167,139,250,0.15)', color: item.key === 'review' ? C.red : C.violet, borderRadius: 20, padding: '1px 7px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div style={{ padding: '16px 20px 6px', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.dim }}>Content</div>
          {(['all', 'draft', 'rejected'] as Status[]).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              style={{ width: '100%', padding: '9px 20px', background: status === s ? 'rgba(167,139,250,0.08)' : 'transparent', border: 'none', borderLeft: `2px solid ${status === s ? C.violet : 'transparent'}`, color: status === s ? C.fg : C.sub, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </nav>

        {/* Generate button */}
        <button onClick={() => setGenOpen(true)}
          style={{ margin: '0 12px 4px', padding: '11px', background: 'rgba(167,139,250,0.12)', border: `0.5px solid rgba(167,139,250,0.35)`, borderRadius: 10, color: C.fg, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ color: C.violet }}>◈</span> Generate
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: C.dim }}>⌘G</span>
        </button>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ height: 58, borderBottom: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: C.fg }}>
            {status === 'all' ? 'All Content' : status.charAt(0).toUpperCase() + status.slice(1)}
            {loading && <span style={{ marginLeft: 10, fontSize: '0.75rem', color: C.dim }}>Loading…</span>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Platform filter */}
            <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${C.border}`, borderRadius: 8, padding: 4 }}>
              {(['all', 'instagram', 'tiktok', 'linkedin'] as Platform[]).map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  style={{
                    padding: '4px 12px', borderRadius: 5, border: 'none', cursor: 'pointer',
                    background: platform === p ? `rgba(${p === 'instagram' ? '167,139,250' : p === 'tiktok' ? '80,200,120' : p === 'linkedin' ? '91,141,240' : '255,255,255'},0.12)` : 'transparent',
                    color: platform === p ? (p === 'all' ? C.fg : PLATFORM_COLOR[p] ?? C.fg) : C.dim,
                    fontFamily: C.body, fontSize: '0.75rem',
                  }}>
                  {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={() => { loadRecords(); loadCounts(); }}
              style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${C.border}`, borderRadius: 7, color: C.sub, fontFamily: C.body, fontSize: '0.75rem', cursor: 'pointer' }}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>

          {/* Pipeline summary */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            {STAGES.map(s => (
              <button key={s.key} onClick={() => setStatus(s.key)}
                style={{ flexShrink: 0, padding: '12px 16px', background: status === s.key ? 'rgba(167,139,250,0.10)' : C.bgCard, border: `0.5px solid ${status === s.key ? 'rgba(167,139,250,0.40)' : C.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', minWidth: 90 }}>
                <div style={{ fontFamily: C.heading, fontSize: '1.8rem', fontWeight: 300, color: STATUS_COLOR[s.key] ?? C.violet, lineHeight: 1 }}>{counts[s.key] ?? 0}</div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dim, marginTop: 4 }}>{s.label}</div>
              </button>
            ))}
          </div>

          {/* Grid */}
          {records.length === 0 && !loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '80px 40px', color: C.dim, textAlign: 'center' }}>
              <div style={{ fontFamily: C.heading, fontSize: '3rem', color: 'rgba(167,139,250,0.25)' }}>◈</div>
              <div style={{ fontFamily: C.heading, fontSize: '1.4rem', fontWeight: 300, color: C.sub }}>Nothing here yet</div>
              <div style={{ fontSize: '0.82rem', maxWidth: 280, lineHeight: 1.65 }}>Run the agent team to generate content. Use ⌘G or the Generate button.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {records.map(r => {
                const plat  = f(r, F.platform);
                const stat  = f(r, F.status);
                const score = f(r, F.viralScore);
                const img   = f(r, F.imageUrl) || f(r, F.videoUrl);
                const hook  = f(r, F.hook);
                const cap   = f(r, F.caption);
                const type  = f(r, F.contentType);
                const agent = f(r, F.agent);

                return (
                  <div key={r.id}
                    style={{ background: C.bgCard, border: `0.5px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderStrong)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>

                    {/* Card image */}
                    <div onClick={() => setDetail(r)} style={{ height: 180, background: C.bgMid, position: 'relative', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {img
                        ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: C.heading, fontSize: '2rem', color: 'rgba(167,139,250,0.20)' }}>◈</span>
                      }
                      {/* Badges */}
                      <span style={{ position: 'absolute', top: 9, left: 9, padding: '2px 9px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', background: `rgba(${plat === 'instagram' ? '167,139,250' : plat === 'tiktok' ? '80,200,120' : '91,141,240'},0.22)`, border: `0.5px solid ${PLATFORM_COLOR[plat] ?? C.dim}50`, color: PLATFORM_COLOR[plat] ?? C.dim }}>
                        {plat}
                      </span>
                      <span style={{ position: 'absolute', top: 9, right: 9, padding: '2px 9px', borderRadius: 20, fontSize: '0.65rem', background: 'rgba(0,0,0,0.45)', color: 'rgba(234,230,248,0.65)', border: `0.5px solid rgba(255,255,255,0.10)` }}>
                        {type}
                      </span>
                      {score > 0 && (
                        <span style={{ position: 'absolute', bottom: 9, right: 9, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: `1.5px solid ${scoreClass(score)}80`, color: scoreClass(score), fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {score}
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div onClick={() => setDetail(r)} style={{ padding: '14px 14px 10px', flex: 1, cursor: 'pointer' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: C.fg, lineHeight: 1.4, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {hook || '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: C.sub, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10 }}>
                        {cap}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: STATUS_COLOR[stat] ?? C.dim, background: `${STATUS_COLOR[stat] ?? C.dim}18`, borderRadius: 20, padding: '2px 8px' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_COLOR[stat] ?? C.dim, display: 'inline-block' }} />
                          {stat}
                        </span>
                        {agent && <span style={{ fontSize: '0.67rem', color: C.dim }}>{agent}</span>}
                      </div>
                    </div>

                    {/* Card actions */}
                    <div style={{ padding: '8px 10px 10px', display: 'flex', gap: 6, borderTop: `0.5px solid ${C.border}` }}>
                      {stat === 'review' && <>
                        <Btn label="✓ Approve" color={C.green}   onClick={() => approve(r.id)} />
                        <Btn label="✕ Reject"  color={C.red}     onClick={() => reject(r.id)} />
                        <Btn label="View"       color={C.dim}     onClick={() => setDetail(r)} />
                      </>}
                      {stat === 'approved' && <>
                        <Btn label="◎ Schedule" color={C.violet} onClick={() => schedule(r.id)} />
                        <Btn label="View"        color={C.dim}   onClick={() => setDetail(r)} />
                      </>}
                      {(stat === 'scheduled' || stat === 'posted') &&
                        <Btn label="View Details" color={C.dim} onClick={() => setDetail(r)} />
                      }
                      {(stat === 'draft' || stat === 'generating') &&
                        <Btn label="View" color={C.dim} onClick={() => setDetail(r)} />
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Detail panel ─────────────────────────────────────────────────────── */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end' }}>
          <div onClick={() => setDetail(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }} />
          <div style={{ position: 'relative', width: 480, background: '#0e0b26', borderLeft: `0.5px solid ${C.borderStrong}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1 }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: PLATFORM_COLOR[f(detail, F.platform)] ?? C.dim, background: `${PLATFORM_COLOR[f(detail, F.platform)] ?? C.dim}20`, border: `0.5px solid ${PLATFORM_COLOR[f(detail, F.platform)] ?? C.dim}50` }}>
                {f(detail, F.platform)}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: STATUS_COLOR[f(detail, F.status)] ?? C.dim, background: `${STATUS_COLOR[f(detail, F.status)] ?? C.dim}18`, borderRadius: 20, padding: '2px 8px' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_COLOR[f(detail, F.status)] ?? C.dim, display: 'inline-block', boxShadow: f(detail, F.status) === 'generating' ? `0 0 8px ${C.cyan}` : undefined }} />
                {f(detail, F.status)}
              </span>
              <button onClick={() => setDetail(null)} style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${C.border}`, color: C.sub, cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {(f(detail, F.imageUrl) || f(detail, F.videoUrl)) && (
                <img src={f(detail, F.imageUrl) || f(detail, F.videoUrl)} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 20, display: 'block' }} />
              )}
              <Section label="Hook">
                <p style={{ fontSize: '0.9rem', color: C.fg, lineHeight: 1.55, fontWeight: 500 }}>{f(detail, F.hook) || '—'}</p>
              </Section>
              <Section label="Caption">
                <p style={{ fontSize: '0.82rem', color: C.sub, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{f(detail, F.caption) || '—'}</p>
              </Section>
              {f(detail, F.script) && (
                <Section label="Script">
                  <p style={{ fontSize: '0.78rem', color: C.sub, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{f(detail, F.script)}</p>
                </Section>
              )}
              {f(detail, F.slides) && (() => {
                try {
                  const slides = JSON.parse(f(detail, F.slides));
                  return (
                    <Section label={`Slides (${slides.length})`}>
                      {slides.map((s: string, i: number) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          <span style={{ fontSize: '0.62rem', color: C.cyan, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Slide {i + 1}</span>
                          <p style={{ fontSize: '0.8rem', color: C.sub, marginTop: 3, lineHeight: 1.55 }}>{s}</p>
                        </div>
                      ))}
                    </Section>
                  );
                } catch { return null; }
              })()}
              <Section label="Visual Prompt (Kie.ai)">
                <p style={{ fontSize: '0.75rem', color: C.dim, lineHeight: 1.6, fontStyle: 'italic' }}>{f(detail, F.visualPrompt) || '—'}</p>
              </Section>
              <Section label="Trend · Score">
                <p style={{ fontSize: '0.8rem', color: C.sub }}>{f(detail, F.trendReference) || '—'} · <span style={{ color: scoreClass(f(detail, F.viralScore)) }}>{f(detail, F.viralScore)}/10</span></p>
              </Section>
              {f(detail, F.notes) && (
                <Section label="Agent Notes">
                  <p style={{ fontSize: '0.75rem', color: C.dim, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{f(detail, F.notes)}</p>
                </Section>
              )}
              {f(detail, F.hashtags) && (
                <Section label="Hashtags">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {String(f(detail, F.hashtags)).split(/\s+/).filter(h => h).map(h => (
                      <span key={h} style={{ fontSize: '0.75rem', color: C.violet }}>{h}</span>
                    ))}
                  </div>
                </Section>
              )}
              {f(detail, F.firstComment) && (
                <Section label="First Comment (LinkedIn)">
                  <p style={{ fontSize: '0.75rem', color: C.sub, lineHeight: 1.6 }}>{f(detail, F.firstComment)}</p>
                </Section>
              )}
            </div>

            {/* Detail actions */}
            <div style={{ padding: '12px 16px', borderTop: `0.5px solid ${C.border}`, display: 'flex', gap: 8 }}>
              {f(detail, F.status) === 'review' && <>
                <Btn label="✓ Approve" color={C.green} onClick={() => { approve(detail.id); setDetail(null); }} />
                <Btn label="✕ Reject"  color={C.red}   onClick={() => { reject(detail.id); setDetail(null); }} />
              </>}
              {f(detail, F.status) === 'approved' && (
                <Btn label="◎ Schedule via Blotato" color={C.violet} onClick={() => schedule(detail.id)} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Generate modal ───────────────────────────────────────────────────── */}
      {genOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setGenOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', width: 460, background: '#0e0b26', border: `0.5px solid ${C.borderStrong}`, borderRadius: 18, padding: '32px', zIndex: 1 }}>
            <div style={{ fontFamily: C.heading, fontSize: '1.8rem', fontWeight: 300, color: C.fg, marginBottom: 24 }}>Generate Content</div>

            <Label>Platform</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 20 }}>
              {['all', 'instagram', 'tiktok', 'linkedin'].map(p => (
                <button key={p} onClick={() => setGenPlat(p)}
                  style={{ padding: '9px 4px', borderRadius: 8, border: `0.5px solid ${genPlat === p ? (PLATFORM_COLOR[p] ?? C.violet) + '80' : C.border}`, background: genPlat === p ? `${PLATFORM_COLOR[p] ?? C.violet}14` : 'transparent', color: genPlat === p ? (PLATFORM_COLOR[p] ?? C.violet) : C.sub, fontFamily: C.body, fontSize: '0.75rem', cursor: 'pointer' }}>
                  {p === 'all' ? 'All 3' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <Label>Content Type</Label>
            <select value={genType} onChange={e => setGenType(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${C.border}`, borderRadius: 8, color: C.fg, fontFamily: C.body, fontSize: '0.82rem', outline: 'none', marginBottom: 16 }}>
              <option value="auto">Auto (agent decides based on trends)</option>
              <option value="reel">Reel / Short Video</option>
              <option value="carousel">Carousel</option>
              <option value="static">Static Post</option>
              <option value="short-post">Short Post</option>
              <option value="document-carousel">Document Carousel (LinkedIn)</option>
              <option value="series">Series — Part 1</option>
            </select>

            <Label>Topic / Focus (optional)</Label>
            <input value={genTopic} onChange={e => setGenTopic(e.target.value)} placeholder="e.g. wolf shadow archetype, shadow work for leaders…"
              style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${C.border}`, borderRadius: 8, color: C.fg, fontFamily: C.body, fontSize: '0.82rem', outline: 'none', marginBottom: 24 }} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setGenOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: `0.5px solid ${C.border}`, borderRadius: 8, color: C.sub, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={runGeneration} disabled={genRunning}
                style={{ flex: 2, padding: '10px', background: 'rgba(167,139,250,0.14)', border: `0.5px solid rgba(167,139,250,0.40)`, borderRadius: 8, color: C.fg, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer', opacity: genRunning ? 0.6 : 1 }}>
                {genRunning ? '◈ Running…' : '◈ Run Manager + Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, padding: '11px 18px',
          background: '#0e0b26', border: `0.5px solid ${toast.type === 'success' ? 'rgba(80,200,120,0.40)' : toast.type === 'error' ? 'rgba(220,80,80,0.35)' : C.border}`,
          borderRadius: 10, fontSize: '0.82rem', color: C.fg, zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function Btn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  const C_body = "var(--font-inter), 'Helvetica Neue', sans-serif";
  return (
    <button onClick={onClick}
      style={{ flex: 1, padding: '7px 10px', background: `${color}12`, border: `0.5px solid ${color}45`, borderRadius: 7, color, fontFamily: C_body, fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center', transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = `${color}20`)}
      onMouseLeave={e => (e.currentTarget.style.background = `${color}12`)}>
      {label}
    </button>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7c70a8', marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}

function Label({ children }: { children: string }) {
  return <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7c70a8', marginBottom: 8 }}>{children}</div>;
}
