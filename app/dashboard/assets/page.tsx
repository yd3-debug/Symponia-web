'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, Zap } from 'lucide-react';
import { createSupabaseBrowserClient, type GenerationJob } from '@/lib/supabase';
import { PLATFORM_SPECS, PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444',
};

const STATUS_COLORS = { queued: C.dim, processing: C.amber, done: C.green, failed: C.red };

export default function AllAssetsPage() {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase
      .from('generation_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => { setJobs(data ?? []); setLoading(false); });

    const channel = supabase
      .channel('all-assets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'generation_jobs' }, payload => {
        if (payload.eventType === 'INSERT') setJobs(prev => [payload.new as GenerationJob, ...prev]);
        else if (payload.eventType === 'UPDATE') setJobs(prev => prev.map(j => j.id === payload.new.id ? payload.new as GenerationJob : j));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const done = jobs.filter(j => j.status === 'done');
  const inProgress = jobs.filter(j => j.status !== 'done' && j.status !== 'failed');

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Assets</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>
            All Generated Assets
          </h1>
          {inProgress.length > 0 && (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Zap size={13} color={C.amber} />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', color: C.amber }}>
                {inProgress.length} generating
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ background: C.surface, borderRadius: 12, height: 180, border: `1px solid ${C.border}` }} />
          ))}
        </div>
      ) : done.length === 0 && inProgress.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <ImageIcon size={36} color={C.dim} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.88rem', color: C.sub }}>No assets generated yet.</p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', color: C.dim, marginTop: 6 }}>
            Approve content pieces to trigger visual generation.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {jobs.map(job => {
            const spec = PLATFORM_SPECS[job.platform_spec_key as keyof typeof PLATFORM_SPECS];
            const color = STATUS_COLORS[job.status];
            const isImg = job.job_type === 'image';
            return (
              <div key={job.id} style={{ background: C.surface, border: `1px solid ${job.status === 'processing' ? C.amber + '40' : C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: C.elevated, aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {job.status === 'done' && job.asset_url ? (
                    isImg
                      ? <img src={job.asset_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <video src={job.asset_url} muted playsInline loop autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      {isImg ? <ImageIcon size={24} color={C.dim} /> : <Video size={24} color={C.dim} />}
                      {job.status === 'processing' && (
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}
                          style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', color: C.amber, marginTop: 6 }}>
                          Processing…
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', color: C.dim, marginBottom: 3 }}>{spec?.platform ?? job.platform_spec_key}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', color }}>{job.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
