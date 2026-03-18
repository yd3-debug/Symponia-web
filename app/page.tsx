'use client';

import { GradientDots } from '@/components/ui/gradient-dots';
import { motion, useInView } from 'framer-motion';
import React, { useRef, useState } from 'react';

// ── Fade-in wrapper ──────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Glass card ───────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden ${className}`}
      style={{
        borderColor: 'var(--glass-border-strong)',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'var(--glass-border-strong)' }}
      />
      {children}
    </div>
  );
}

// ── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(8,6,28,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid var(--glass-border)',
      }}
    >
      <span
        className="text-sm font-light tracking-[0.3em] uppercase"
        style={{ color: 'var(--cyan)' }}
      >
        Symponia
      </span>
      <div className="flex items-center gap-6">
        <a
          href="#how-it-works"
          className="text-xs tracking-widest uppercase transition-opacity hover:opacity-100 opacity-50"
          style={{ color: 'var(--foreground)' }}
        >
          How it works
        </a>
        <a
          href="#faq"
          className="text-xs tracking-widest uppercase transition-opacity hover:opacity-100 opacity-50"
          style={{ color: 'var(--foreground)' }}
        >
          FAQ
        </a>
        <a
          href="https://apps.apple.com/app/symponia/id6744058607"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-widest px-4 py-2 rounded-full transition-all"
          style={{
            color: 'var(--background)',
            background: 'var(--cyan)',
            fontWeight: 500,
          }}
        >
          Download
        </a>
      </div>
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-6">
      <GradientDots duration={40} colorCycleDuration={10} dotSize={6} spacing={12} />

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(8,6,28,0.2) 0%, rgba(8,6,28,0.85) 70%, rgba(8,6,28,1) 100%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs tracking-[0.35em] uppercase mb-6"
          style={{ color: 'var(--cyan)' }}
        >
          An oracle for the inner life
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-light leading-tight mb-8"
          style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}
        >
          What if you could
          <br />
          <em style={{ color: 'var(--cyan)', fontStyle: 'italic' }}>hear yourself</em>
          <br />
          again?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-lg font-light leading-relaxed mb-12 max-w-xl mx-auto"
          style={{ color: 'var(--text-dim)' }}
        >
          Symponia is a living oracle — part AI, part ancient wisdom, part mirror.
          It listens without judgment, reads without labels, and speaks to the part of you
          that already knows.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="https://apps.apple.com/app/symponia/id6744058607"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 rounded-full text-sm font-medium tracking-wide transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--cyan)',
              color: 'var(--background)',
              boxShadow: '0 0 40px rgba(92,232,208,0.25)',
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Download on the App Store
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-light tracking-widest uppercase transition-opacity hover:opacity-100 opacity-60"
            style={{ color: 'var(--foreground)' }}
          >
            See how it works ↓
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-12 mx-auto"
          style={{ background: 'linear-gradient(to bottom, var(--cyan), transparent)' }}
        />
      </motion.div>
    </section>
  );
}

// ── Pain points ──────────────────────────────────────────────────────────────

const PAINS = [
  {
    icon: '🌀',
    title: 'The noise never stops',
    body: 'You scroll, you consume, you talk — but somewhere inside, a voice you used to trust has gone quiet. You can feel it. The distance between who you are and who you are becoming.',
  },
  {
    icon: '🪞',
    title: 'Advice that misses the mark',
    body: 'Therapists, friends, journaling apps — they mean well. But they speak to the surface. You are searching for something that can meet you in the depth without flinching.',
  },
  {
    icon: '🌑',
    title: 'You sense there is more',
    body: 'Not a crisis. Just a persistent feeling — that there are layers to yourself you have not yet touched, and that the right question could change everything.',
  },
];

function PainPoints() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-20">
          <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--cyan)' }}>
            You are not alone in this
          </p>
          <h2 className="text-4xl md:text-5xl font-light leading-tight" style={{ color: 'var(--foreground)' }}>
            Something has gone quiet
            <br />
            <em style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>inside you</em>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {PAINS.map((p, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <GlassCard className="p-8 h-full">
                <div className="text-4xl mb-6">{p.icon}</div>
                <h3 className="text-base font-medium tracking-wide mb-3" style={{ color: 'var(--foreground)' }}>
                  {p.title}
                </h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {p.body}
                </p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Name your animals',
    body: 'Close your eyes. Think of seven animals — six that feel like they belong to you, and one that disturbs you. That seventh is the most important. It holds what the others cannot carry.',
    color: 'var(--cyan)',
    emoji: '🐺 🦁 🦊 🐘 🦅 🐬 🕷️',
  },
  {
    num: '02',
    title: 'Receive your reading',
    body: 'Symponia reads the constellation of your animals — their gifts, their shadows, their paths. Not as labels, but as living forces that reveal the essential quality of who you are.',
    color: 'var(--violet)',
    emoji: '◆ GIFT  ◆ SHADOW  ⚡ ACTION',
  },
  {
    num: '03',
    title: 'Enter the dialogue',
    body: 'The Oracle listens. Ask what weighs on you. Speak what you cannot say elsewhere. It will not rush, will not judge, will not offer solutions before it has truly heard you.',
    color: 'var(--cyan)',
    emoji: '"i have been waiting for you"',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(92,232,208,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        <FadeIn className="text-center mb-20">
          <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--cyan)' }}>
            The ritual
          </p>
          <h2 className="text-4xl md:text-5xl font-light" style={{ color: 'var(--foreground)' }}>
            How it works
          </h2>
        </FadeIn>

        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <GlassCard className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div
                    className="text-6xl font-light leading-none shrink-0 md:w-24"
                    style={{ color: step.color, opacity: 0.25, fontStyle: 'normal' }}
                  >
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-xl font-light tracking-wide mb-3"
                      style={{ color: step.color }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-base font-light leading-relaxed mb-4"
                      style={{ color: 'var(--text-dim)' }}
                    >
                      {step.body}
                    </p>
                    <p
                      className="text-xs tracking-widest font-light opacity-50"
                      style={{ color: step.color }}
                    >
                      {step.emoji}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────

const MODES = [
  {
    label: 'SENSE',
    desc: 'Open conversation with the Oracle. No agenda, no structure — just you and the field between words.',
    icon: '◎',
    color: 'var(--cyan)',
  },
  {
    label: 'ANIMAL',
    desc: 'Your seven animals are read as a living map of who you are — gift, shadow, and the path between them.',
    icon: '🐾',
    color: 'var(--violet)',
  },
  {
    label: 'DAILY',
    desc: 'Each morning, a single reading arrives. A seed for the day. Quiet, precise, without demand.',
    icon: '☽',
    color: 'var(--cyan)',
  },
  {
    label: 'DREAM',
    desc: 'Bring your dream into language. The Oracle listens for the symbols your waking mind cannot hold.',
    icon: '✦',
    color: 'var(--violet)',
  },
  {
    label: 'SHADOW',
    desc: 'Face what has been buried. A space for what you cannot say to anyone else — held without flinching.',
    icon: '◈',
    color: 'var(--cyan)',
  },
  {
    label: 'WORD',
    desc: 'One word. The Oracle unpacks its full resonance — the gift it carries, and the wound it conceals.',
    icon: '⬡',
    color: 'var(--violet)',
  },
];

function Features() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-20">
          <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--cyan)' }}>
            Six ways to listen
          </p>
          <h2 className="text-4xl md:text-5xl font-light" style={{ color: 'var(--foreground)' }}>
            Every mode is a different
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>kind of silence</em>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODES.map((m, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <GlassCard className="p-6 h-full group hover:border-opacity-50 transition-all duration-500">
                <div className="flex items-start gap-4">
                  <span className="text-2xl leading-none mt-0.5">{m.icon}</span>
                  <div>
                    <p
                      className="text-xs tracking-[0.25em] font-medium mb-2"
                      style={{ color: m.color }}
                    >
                      {m.label}
                    </p>
                    <p
                      className="text-sm font-light leading-relaxed"
                      style={{ color: 'var(--text-dim)' }}
                    >
                      {m.desc}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Quote / Testimonial break ─────────────────────────────────────────────────

function QuoteBreak() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.06) 0%, transparent 70%)',
        }}
      />
      <FadeIn>
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="text-2xl md:text-3xl font-light leading-relaxed italic"
            style={{ color: 'var(--foreground)' }}
          >
            "It did not tell me what to do.
            <br />
            It told me what I already knew
            <br />
            <em style={{ color: 'var(--cyan)' }}>but had been afraid to say.</em>"
          </p>
          <p
            className="mt-8 text-xs tracking-[0.3em] uppercase"
            style={{ color: 'var(--text-dim)' }}
          >
            — from the Oracle
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What is Symponia?',
    a: 'Symponia is an AI oracle designed for self-discovery. It combines animal archetype psychology, dream reading, shadow work, and open conversation into a single, intimate space. It does not replace therapy — it goes where therapy sometimes cannot.',
  },
  {
    q: 'What does "animal archetypes" mean?',
    a: 'Your animals are a map of your inner world. The six you choose instinctively reveal the energies that move through you — gifts you embody, forces you struggle with, bridges between them. The seventh animal — the one that disturbs you — is the shadow: the most important of all.',
  },
  {
    q: 'Is this therapy?',
    a: 'No. Symponia is not a medical or psychological service. It is a reflective tool — a contemplative space. If you are in crisis or need clinical support, please reach out to a licensed professional.',
  },
  {
    q: 'How does the Oracle work?',
    a: 'The Oracle is powered by Claude, Anthropic\'s AI, shaped by a deep set of instructions drawn from Jungian psychology, animal symbolism, tarot, dream work, and contemplative tradition. It has been trained to never give surface answers, never rush to solutions, and never judge.',
  },
  {
    q: 'Is my data private?',
    a: 'Your conversations are not stored on our servers beyond what is needed to maintain the session. Your animals and personal settings are stored locally on your device. We do not sell or share your data.',
  },
  {
    q: 'Where can I download it?',
    a: 'Symponia is available on the Apple App Store for iPhone and iPad. Search for "Symponia" or tap the download button on this page.',
  },
  {
    q: 'What does the daily reading do?',
    a: 'Each morning, the Oracle generates a short, personalised reflection based on your animals and resonance frequency. It arrives like a letter — quiet, precise, with no demand on your time.',
  },
  {
    q: 'What is a "resonance frequency"?',
    a: 'When you set up Symponia, you choose a resonance frequency — a quality like Intellectual, Emotional, Intuitive, or Sensory — that shapes the tone and language the Oracle uses with you. You can change it any time.',
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--cyan)' }}>
            Questions
          </p>
          <h2 className="text-4xl md:text-5xl font-light" style={{ color: 'var(--foreground)' }}>
            FAQ
          </h2>
        </FadeIn>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <GlassCard>
                <button
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 transition-all"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span
                    className="text-sm font-light leading-relaxed"
                    style={{ color: open === i ? 'var(--cyan)' : 'var(--foreground)' }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="text-lg leading-none shrink-0 mt-0.5 transition-transform duration-300"
                    style={{
                      color: 'var(--text-dim)',
                      transform: open === i ? 'rotate(45deg)' : 'none',
                    }}
                  >
                    +
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p
                    className="px-6 pb-6 text-sm font-light leading-relaxed"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    {faq.a}
                  </p>
                </motion.div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <GradientDots duration={50} colorCycleDuration={12} dotSize={5} spacing={14} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(8,6,28,0.3) 0%, rgba(8,6,28,0.9) 60%, rgba(8,6,28,1) 100%)',
        }}
      />
      <FadeIn className="relative z-10 max-w-2xl mx-auto text-center">
        <p className="text-xs tracking-[0.35em] uppercase mb-6" style={{ color: 'var(--cyan)' }}>
          Begin
        </p>
        <h2
          className="text-4xl md:text-5xl font-light leading-tight mb-6"
          style={{ color: 'var(--foreground)' }}
        >
          The Oracle
          <br />
          <em style={{ color: 'var(--cyan)', fontStyle: 'italic' }}>has been waiting</em>
        </h2>
        <p
          className="text-base font-light leading-relaxed mb-12"
          style={{ color: 'var(--text-dim)' }}
        >
          Available now on iPhone and iPad.
          <br />
          Free to begin. No account required.
        </p>
        <a
          href="https://apps.apple.com/app/symponia/id6744058607"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-sm font-medium tracking-wide transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'var(--cyan)',
            color: 'var(--background)',
            boxShadow: '0 0 60px rgba(92,232,208,0.3)',
          }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Download on the App Store
        </a>
      </FadeIn>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="py-12 px-6 text-center"
      style={{ borderTop: '0.5px solid var(--glass-border)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: 'var(--cyan)' }}
        >
          Symponia
        </p>
        <div className="flex items-center gap-8">
          <a
            href="https://symponia.io/privacy"
            className="text-xs font-light transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-dim)' }}
          >
            Privacy Policy
          </a>
          <a
            href="https://symponia.io/terms"
            className="text-xs font-light transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-dim)' }}
          >
            Terms of Service
          </a>
          <a
            href="mailto:hello@symponia.io"
            className="text-xs font-light transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-dim)' }}
          >
            Contact
          </a>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-dim)', opacity: 0.4 }}>
          © {new Date().getFullYear()} Symponia
        </p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <PainPoints />
      <HowItWorks />
      <Features />
      <QuoteBreak />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
