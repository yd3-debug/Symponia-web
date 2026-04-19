'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Save, Check, Globe, Zap, User } from 'lucide-react';
import type { Platform } from '@/lib/airtable';
import { PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444',
};

const PLATFORMS: Platform[] = ['Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'Facebook', 'YouTube', 'Pinterest'];

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Icon size={15} color={C.purple} />
        <span style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: C.fg }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: C.sub, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 9,
  color: C.fg, fontFamily: 'var(--font-inter)', fontSize: '0.84rem',
  outline: 'none', boxSizing: 'border-box' as const,
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 90, resize: 'vertical' as const, lineHeight: 1.6,
};

export default function SettingsPage() {
  const { user } = useUser();
  const [saved, setSaved] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<Platform>>(new Set());

  const [brand, setBrand] = useState({
    brandName: '',
    brandVoice: '',
    audienceDescription: '',
    competitors: '',
    colorPalette: '',
    visualStyle: '',
  });

  useEffect(() => {
    // Load brand profile
    fetch('/api/brand-profile').then(r => r.json()).then(d => {
      if (d.profile) setBrand(d.profile);
    }).catch(() => {});
  }, []);

  async function save() {
    await fetch('/api/brand-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brand),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function togglePlatform(p: Platform) {
    setConnectedPlatforms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', letterSpacing: '0.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 8 }}>Settings</div>
        <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: C.fg }}>
          Account & Brand
        </h1>
      </div>

      {/* Account info */}
      <SectionCard title="Account" icon={User}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Avatar" style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${C.border}` }} />
          )}
          <div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9rem', fontWeight: 500, color: C.fg }}>
              {user?.fullName ?? user?.firstName ?? 'User'}
            </div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: C.sub, marginTop: 2 }}>
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Brand profile */}
      <SectionCard title="Brand Profile" icon={Zap}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Brand Name">
            <input
              value={brand.brandName}
              onChange={e => setBrand(b => ({ ...b, brandName: e.target.value }))}
              placeholder="Acme Corp"
              style={inputStyle}
            />
          </Field>
          <Field label="Color Palette">
            <input
              value={brand.colorPalette}
              onChange={e => setBrand(b => ({ ...b, colorPalette: e.target.value }))}
              placeholder="#6366F1, #EC4899"
              style={inputStyle}
            />
          </Field>
        </div>
        <Field label="Brand Voice">
          <textarea
            value={brand.brandVoice}
            onChange={e => setBrand(b => ({ ...b, brandVoice: e.target.value }))}
            placeholder="Professional but approachable. We use plain language, avoid jargon, and lead with empathy."
            style={textareaStyle}
          />
        </Field>
        <Field label="Target Audience">
          <textarea
            value={brand.audienceDescription}
            onChange={e => setBrand(b => ({ ...b, audienceDescription: e.target.value }))}
            placeholder="B2B SaaS founders and marketing leads at Series A–C companies."
            style={textareaStyle}
          />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Competitors">
            <input
              value={brand.competitors}
              onChange={e => setBrand(b => ({ ...b, competitors: e.target.value }))}
              placeholder="HubSpot, Mailchimp, Buffer"
              style={inputStyle}
            />
          </Field>
          <Field label="Visual Style">
            <input
              value={brand.visualStyle}
              onChange={e => setBrand(b => ({ ...b, visualStyle: e.target.value }))}
              placeholder="Minimalist, dark, premium"
              style={inputStyle}
            />
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={save}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 9,
              background: saved ? C.green : C.purple, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-inter)', fontSize: '0.82rem', fontWeight: 500, color: '#fff',
              transition: 'background 0.2s',
            }}
          >
            {saved ? <Check size={13} /> : <Save size={13} />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </SectionCard>

      {/* Connected platforms */}
      <SectionCard title="Connected Platforms" icon={Globe}>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: C.sub, marginBottom: 16, lineHeight: 1.6 }}>
          Connect your social accounts to enable direct scheduling via Blotato.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {PLATFORMS.map(p => {
            const color = PLATFORM_COLORS[p] ?? C.purple;
            const connected = connectedPlatforms.has(p);
            return (
              <motion.button
                key={p}
                whileTap={{ scale: 0.97 }}
                onClick={() => togglePlatform(p)}
                style={{
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  background: connected ? `${color}15` : C.elevated,
                  border: `1px solid ${connected ? color + '60' : C.border}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', color: connected ? color : C.sub, fontWeight: connected ? 500 : 400 }}>
                  {p}
                </span>
                {connected && <Check size={11} color={color} style={{ marginLeft: 'auto' }} />}
              </motion.button>
            );
          })}
        </div>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', color: C.dim, marginTop: 12 }}>
          Platform OAuth integration requires Blotato API keys configured in environment variables.
        </p>
      </SectionCard>

      {/* API keys info */}
      <SectionCard title="Integrations" icon={Zap}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Anthropic Claude', key: 'ANTHROPIC_API_KEY', status: 'Configured' },
            { name: 'fal.ai (Images & Video)', key: 'FAL_API_KEY', status: 'Configured' },
            { name: 'Exa.ai (Research)', key: 'EXA_API_KEY', status: 'Configured' },
            { name: 'Blotato (Scheduling)', key: 'BLOTATO_API_KEY', status: 'Configure in .env' },
            { name: 'Kling AI (Premium Video)', key: 'KLING_API_KEY', status: 'Optional' },
          ].map(({ name, key, status }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: C.elevated, borderRadius: 9, border: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: C.fg }}>{name}</div>
                <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.65rem', color: C.dim, marginTop: 2 }}>{key}</div>
              </div>
              <span style={{
                fontFamily: 'var(--font-inter)', fontSize: '0.65rem',
                padding: '3px 8px', borderRadius: 5,
                background: status === 'Configured' ? `${C.green}18` : status === 'Optional' ? `${C.amber}18` : `${C.red}18`,
                color: status === 'Configured' ? C.green : status === 'Optional' ? C.amber : C.red,
                border: `1px solid ${status === 'Configured' ? C.green : status === 'Optional' ? C.amber : C.red}30`,
              }}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
