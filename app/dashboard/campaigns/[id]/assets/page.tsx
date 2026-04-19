'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, Zap, CheckCircle, XCircle, Clock, Play } from 'lucide-react';
import { createSupabaseBrowserClient, type GenerationJob } from '@/lib/supabase';
import { PLATFORM_SPECS, PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444',
};

const STATUS_CONFIG = {
  queued:     { label: 'Queued',     color: C.dim,   icon: Clock },
  processing: { label: 'Processing', color: C.amber,  icon: Zap },
  done:       { label: 'Ready',      color: C.green,  icon: CheckCircle },
  failed:     { label: 'Failed',     color: C.red,    icon: XCircle },
} as const;

function PulseBar() {
  return (
    <div style={{ height: 3, background: C.elevated, borderRadius: 2, overflow: 'hidden', marginTop: 12 }}>
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ height: '100%', width: '50%', background: `linear-gradient(90deg, transparent, ${C.amber}, transparent)` }}
      />
    </div>
  );
}

function AssetCard({ job }: { job: GenerationJob }) {
  const cfg = STATUS_CONFIG[job.status];
  const StatusIcon = cfg.icon;
  const spec = PLATFORM_SPECS[job.platform_spec_key as keyof typeof PLATFORM_SPECS];
  const platformColor = PLATFORM_COLORS[spec?.label?.split(' ')[0] ?? ''] ?? C.purple;
  const isImage = job.job_type === 'image';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: C.surface,
        border: `1px solid ${job.status === 'processing' ? C.amber + '50' : C.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: job.status === 'processing' ? `0 0 20px ${C.amber}15` : '0 2px 12px rgba(0,0,0,0.3)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Preview area */}
      <div style={{
        background: C.elevated,
        aspectRatio: spec ? `${spec.width} / ${spec.height}` : '1 / 1',
        maxHeight: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {job.status === 'done' && job.asset_url ? (
          isImage ? (
            <img
              src={job.asset_url}
              alt="Generated asset"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <video
                src={job.asset_url}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                muted playsInline loop
                autoPlay
              />
              <div style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.7)', borderRadius: 6,
                padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Play size={10} color="#fff" fill="#fff" />
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.65rem', color: '#fff' }}>
                  {(spec as any)?.durations?.[0] ? `${(spec as any).durations[0]}s` : 'Video'}
                </span>
              </div>
            </div>
          )
        ) : (
          <div style={{ textAlign: 'center' }}>
            {isImage
              ? <ImageIcon size={28} color={C.dim} />
              : <Video size={28} color={C.dim} />}
            {job.status === 'processing' && (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', color: C.amber, marginTop: 8 }}
              >
                Generating…
              </motion.div>
            )}
          </div>
        )}
      </div>

      {job.status === 'processing' && <PulseBar />}

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-inter)', fontSize: '0.62rem', fontWeight: 500,
              padding: '2px 7px', borderRadius: 4,
              background: `${platformColor}18`, color: platformColor, border: `1px solid ${platformColor}30`,
            }}>
              {spec?.label?.split(' ')[0] ?? job.platform_spec_key}
            </span>
            <span style={{
              fontFamily: 'var(--font-inter)', fontSize: '0.62rem',
              padding: '2px 7px', borderRadius: 4,
              background: C.elevated, color: C.dim, border: `1px solid ${C.border}`,
            }}>
              {isImage ? 'Image' : 'Video'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <StatusIcon size={12} color={cfg.color} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
        </div>

        {spec && (
          <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.62rem', color: C.dim }}>
            {spec.width}×{spec.height} · {spec.label}
          </div>
        )}

        {job.error && (
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.68rem', color: C.red, marginTop: 4 }}>
            {job.error}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AssetsPage() {
  const { id } = useParams() as { id: string };
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Keep only the latest job per (spec_key, job_type) — prevents old runs showing up
    function dedupeLatest(all: GenerationJob[]): GenerationJob[] {
      const latest = new Map<string, GenerationJob>();
      for (const job of all) {
        const key = `${job.platform_spec_key}:${job.job_type}`;
        const existing = latest.get(key);
        if (!existing || job.created_at > existing.created_at) latest.set(key, job);
      }
      return [...latest.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
    }

    // Initial load
    (supabase as any)
      .from('generation_jobs')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setJobs(dedupeLatest(data ?? []));
        setLoading(false);
      });

    // Realtime subscription
    const channel = (supabase as any)
      .channel(`campaign-assets-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'generation_jobs',
        filter: `campaign_id=eq.${id}`,
      }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setJobs(prev => {
            const incoming = payload.new as GenerationJob;
            const key = `${incoming.platform_spec_key}:${incoming.job_type}`;
            // Replace any older job with same key, or add if new
            const filtered = prev.filter(j =>
              `${j.platform_spec_key}:${j.job_type}` !== key || j.created_at > incoming.created_at
            );
            const exists = filtered.some(j => j.id === incoming.id);
            return exists
              ? filtered.map(j => j.id === incoming.id ? incoming : j)
              : [...filtered, incoming];
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const images = jobs.filter(j => j.job_type === 'image');
  const videos = jobs.filter(j => j.job_type === 'video');
  const doneCount = jobs.filter(j => j.status === 'done').length;
  const processingCount = jobs.filter(j => j.status === 'processing').length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Visual Assets</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>
            Generation Queue
          </h1>
          {jobs.length > 0 && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {processingCount > 0 && (
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Zap size={13} color={C.amber} />
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', color: C.amber }}>
                    {processingCount} processing
                  </span>
                </motion.div>
              )}
              <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.72rem', color: C.sub }}>
                {doneCount}/{jobs.length} ready
              </span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: C.surface, borderRadius: 14, height: 220, border: `1px solid ${C.border}` }} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <ImageIcon size={36} color={C.dim} style={{ margin: '0 auto' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.88rem', color: C.sub, marginBottom: 8 }}>
            No visual assets queued yet.
          </p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', color: C.dim }}>
            Approve content pieces to trigger image & video generation.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {images.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <ImageIcon size={14} color={C.cyan} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', fontWeight: 500, color: C.fg }}>Images</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.68rem', color: C.dim }}>
                  {images.filter(j => j.status === 'done').length}/{images.length}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                <AnimatePresence>
                  {images.map(job => <AssetCard key={job.id} job={job} />)}
                </AnimatePresence>
              </div>
            </section>
          )}

          {videos.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Video size={14} color={C.purple} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', fontWeight: 500, color: C.fg }}>Videos</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.68rem', color: C.dim }}>
                  {videos.filter(j => j.status === 'done').length}/{videos.length}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                <AnimatePresence>
                  {videos.map(job => <AssetCard key={job.id} job={job} />)}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
