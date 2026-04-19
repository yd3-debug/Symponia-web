'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import type { Platform } from '@/lib/airtable';
import { PLATFORM_COLORS } from '@/lib/platform-specs';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
  green: '#10B981', amber: '#F59E0B',
};

const PLATFORMS: Platform[] = ['Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'Facebook', 'YouTube', 'Pinterest'];
const TONES = ['Professional', 'Casual', 'Humorous', 'Inspirational', 'Educational'];

const inputStyle = {
  width: '100%', padding: '14px 16px',
  background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10,
  color: C.fg, fontFamily: 'var(--font-inter)', fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box' as const,
};
const textareaStyle = { ...inputStyle, minHeight: 100, resize: 'vertical' as const, lineHeight: 1.65 };

interface Step {
  key: string;
  question: string;
  hint?: string;
  type: 'text' | 'textarea' | 'chips';
  options?: string[];
  multi?: boolean;
}

const STEPS: Step[] = [
  { key: 'brandName', question: "What's your brand name?", hint: 'The name customers know you by.', type: 'text' },
  { key: 'brandVoice', question: "Describe your brand voice.", hint: 'How do you speak to customers? e.g. "Conversational, witty, data-driven"', type: 'textarea' },
  { key: 'audienceDescription', question: "Who is your target audience?", hint: 'Role, industry, company size, pain points.', type: 'textarea' },
  { key: 'platforms', question: "Which platforms do you use?", type: 'chips', options: PLATFORMS, multi: true },
  { key: 'visualStyle', question: "What's your visual style?", type: 'chips', options: ['Minimalist', 'Bold', 'Luxury', 'Playful', 'Corporate', 'Dark', 'Bright'], multi: false },
  { key: 'competitors', question: "Who are your main competitors?", hint: 'Optional — helps the AI understand your market.', type: 'text' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];
  const value = answers[current.key] ?? (current.multi ? [] : '');
  const progress = ((step) / STEPS.length) * 100;

  function setValue(val: any) {
    setAnswers(a => ({ ...a, [current.key]: val }));
  }

  function toggleChip(option: string) {
    if (current.multi) {
      const arr: string[] = value || [];
      setValue(arr.includes(option) ? arr.filter(v => v !== option) : [...arr, option]);
    } else {
      setValue(option);
    }
  }

  function canProceed() {
    if (current.key === 'competitors') return true; // optional
    if (current.multi) return (value as string[]).length > 0;
    return String(value).trim().length > 0;
  }

  async function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      await finish();
    }
  }

  async function finish() {
    setSaving(true);
    await fetch('/api/brand-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    });
    router.push('/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: C.elevated }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${C.purple}, ${C.cyan})` }}
        />
      </div>

      {/* Logo */}
      <div style={{ position: 'fixed', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={14} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: C.fg }}>Markos</span>
      </div>

      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Step counter */}
        <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: '0.68rem', color: C.dim, marginBottom: 32, textAlign: 'center' }}>
          {step + 1} / {STEPS.length}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <h2 style={{
              fontFamily: "var(--font-cal-sans), 'Inter', sans-serif",
              fontSize: '1.8rem', fontWeight: 600, color: C.fg,
              marginBottom: 10, lineHeight: 1.2,
            }}>
              {current.question}
            </h2>

            {current.hint && (
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.83rem', color: C.sub, marginBottom: 28, lineHeight: 1.6 }}>
                {current.hint}
              </p>
            )}

            <div style={{ marginBottom: 32 }}>
              {current.type === 'text' && (
                <input
                  autoFocus
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canProceed() && next()}
                  style={inputStyle}
                  placeholder={current.key === 'competitors' ? 'e.g. Buffer, Hootsuite (optional)' : ''}
                />
              )}

              {current.type === 'textarea' && (
                <textarea
                  autoFocus
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  style={textareaStyle}
                />
              )}

              {current.type === 'chips' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {current.options?.map(opt => {
                    const selected = current.multi ? (value as string[]).includes(opt) : value === opt;
                    const color = PLATFORM_COLORS[opt as Platform] ?? C.purple;
                    return (
                      <motion.button
                        key={opt}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleChip(opt)}
                        style={{
                          padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                          background: selected ? `${color}20` : C.elevated,
                          border: `1px solid ${selected ? color : C.border}`,
                          color: selected ? color : C.sub,
                          fontFamily: 'var(--font-inter)', fontSize: '0.84rem', fontWeight: selected ? 500 : 400,
                          transition: 'all 0.15s',
                        }}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => step > 0 && setStep(s => s - 1)}
                style={{
                  padding: '10px 18px', borderRadius: 9, cursor: step === 0 ? 'default' : 'pointer',
                  background: 'transparent', border: `1px solid ${C.border}`,
                  color: step === 0 ? C.dim : C.sub,
                  fontFamily: 'var(--font-inter)', fontSize: '0.83rem',
                  opacity: step === 0 ? 0.4 : 1,
                }}
                disabled={step === 0}
              >
                Back
              </button>

              <motion.button
                whileHover={{ scale: canProceed() ? 1.02 : 1 }}
                whileTap={{ scale: canProceed() ? 0.97 : 1 }}
                onClick={() => canProceed() && next()}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 10,
                  background: canProceed() ? C.purple : C.elevated,
                  border: 'none', cursor: canProceed() ? 'pointer' : 'default',
                  fontFamily: 'var(--font-inter)', fontSize: '0.88rem', fontWeight: 500,
                  color: canProceed() ? '#fff' : C.dim,
                  boxShadow: canProceed() ? '0 0 24px rgba(124,58,237,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? 'Setting up…' : step === STEPS.length - 1 ? 'Enter Dashboard' : 'Continue'}
                {!saving && <ArrowRight size={15} />}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
