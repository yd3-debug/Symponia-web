'use client';

import { GradientDots } from '@/components/ui/gradient-dots';
import { getPricingForLocale, fmt } from '@/lib/pricing';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

const APP_STORE_URL = 'https://apps.apple.com/app/symponia/id6744058607';

const C = {
  bg: '#08061c', bgMid: '#0e0b26',
  bgCard: 'rgba(255,255,255,0.03)',
  fg: '#eae6f8', sub: '#cac4e0', dim: '#a89ec8',
  cyan: '#5ce8d0', violet: '#a78bfa',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.13)',
  heading: "var(--font-cormorant), 'Georgia', serif",
  body: "var(--font-inter), 'Helvetica Neue', sans-serif",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; direction?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.bgCard, border: `0.5px solid ${C.border}`, borderRadius: 20, backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', inset: '0 0 auto 0', height: '0.5px', background: C.borderStrong }} />
      {children}
    </div>
  );
}

function Label({ children }: { children: string }) {
  return <p style={{ fontFamily: C.body, fontSize: '0.7rem', letterSpacing: '0.22em', color: C.cyan, textTransform: 'uppercase', marginBottom: 16 }}>{children}</p>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: C.heading, fontWeight: 300, fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', color: C.fg, lineHeight: 1.15 }}>{children}</h2>;
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor', flexShrink: 0 }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// ── Spiritual SVG Illustrations ───────────────────────────────────────────────

function ConstellationSVG() {
  const stars = [
    [80,40],[160,90],[240,35],[320,110],[400,60],[480,100],[560,30],[640,80],
    [120,160],[280,170],[440,155],[600,175],[200,250],[380,240],[520,260],
    [60,300],[340,310],[620,295],[160,380],[500,370],[280,400],
  ];
  const lines = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[1,8],[3,9],[5,10],[7,11],
    [8,12],[9,12],[9,13],[10,13],[10,14],[11,14],[12,15],[13,16],[14,17],
    [15,18],[16,19],[17,19],[18,20],[19,20],
  ];
  return (
    <svg viewBox="0 0 700 430" style={{ width: '100%', maxWidth: 700, height: 'auto', opacity: 0.35 }}>
      {lines.map(([a,b], i) => (
        <line key={i} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]}
          stroke={C.cyan} strokeWidth="0.5" strokeOpacity="0.4" />
      ))}
      {stars.map(([x,y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3" fill={C.cyan} opacity="0.7" />
          <circle cx={x} cy={y} r="6" fill="none" stroke={C.cyan} strokeWidth="0.5" opacity="0.25" />
        </g>
      ))}
    </svg>
  );
}

function OracleSVG() {
  return (
    <svg viewBox="0 0 200 200" style={{ width: 180, height: 180, opacity: 0.6 }}>
      {[80,65,50,35,20].map((r,i) => (
        <circle key={i} cx="100" cy="100" r={r} fill="none" stroke={i%2===0?C.cyan:C.violet} strokeWidth="0.6" opacity={0.3 + i*0.08} />
      ))}
      <ellipse cx="100" cy="100" rx="18" ry="28" fill="none" stroke={C.cyan} strokeWidth="1" opacity="0.7" />
      <ellipse cx="100" cy="100" rx="7" ry="7" fill={C.cyan} opacity="0.5" />
      <line x1="20" y1="100" x2="80" y2="100" stroke={C.cyan} strokeWidth="0.5" opacity="0.3" />
      <line x1="120" y1="100" x2="180" y2="100" stroke={C.cyan} strokeWidth="0.5" opacity="0.3" />
      <line x1="100" y1="20" x2="100" y2="72" stroke={C.cyan} strokeWidth="0.5" opacity="0.3" />
      <line x1="100" y1="128" x2="100" y2="180" stroke={C.cyan} strokeWidth="0.5" opacity="0.3" />
      {[0,45,90,135].map(deg => (
        <line key={deg}
          x1={100 + 85*Math.cos(deg*Math.PI/180)} y1={100 + 85*Math.sin(deg*Math.PI/180)}
          x2={100 + 85*Math.cos((deg+180)*Math.PI/180)} y2={100 + 85*Math.sin((deg+180)*Math.PI/180)}
          stroke={C.violet} strokeWidth="0.4" opacity="0.2" />
      ))}
    </svg>
  );
}

function MoonPhaseSVG() {
  const phases = [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1.0];
  return (
    <svg viewBox="0 0 420 60" style={{ width: '100%', maxWidth: 420, height: 60, opacity: 0.55 }}>
      {phases.map((phase, i) => {
        const cx = 30 + i * 60;
        const r = 18;
        if (phase === 0) return <circle key={i} cx={cx} cy={30} r={r} fill="none" stroke={C.cyan} strokeWidth="0.8" opacity="0.4" />;
        if (phase === 1.0) return <circle key={i} cx={cx} cy={30} r={r} fill={C.cyan} opacity="0.25" />;
        const lit = phase > 0.5 ? 1 - (phase - 0.5) * 2 : phase * 2;
        const side = phase <= 0.5 ? 1 : -1;
        const rx = r * lit;
        return (
          <g key={i}>
            <circle cx={cx} cy={30} r={r} fill="none" stroke={C.cyan} strokeWidth="0.8" opacity="0.3" />
            <path d={`M ${cx} ${30-r} A ${r} ${r} 0 0 ${side>0?1:0} ${cx} ${30+r} A ${rx} ${r} 0 0 ${side>0?0:1} ${cx} ${30-r}`}
              fill={C.cyan} opacity="0.22" />
          </g>
        );
      })}
    </svg>
  );
}

function SacredCircleSVG() {
  return (
    <svg viewBox="0 0 300 300" style={{ width: 260, height: 260, opacity: 0.3 }}>
      <circle cx="150" cy="150" r="130" fill="none" stroke={C.violet} strokeWidth="0.6" />
      <circle cx="150" cy="150" r="100" fill="none" stroke={C.cyan} strokeWidth="0.5" />
      <circle cx="150" cy="150" r="70" fill="none" stroke={C.violet} strokeWidth="0.6" />
      {Array.from({length:6}).map((_,i) => {
        const a = (i/6)*Math.PI*2;
        return <circle key={i} cx={150+100*Math.cos(a)} cy={150+100*Math.sin(a)} r="100" fill="none" stroke={C.cyan} strokeWidth="0.4" opacity="0.5" />;
      })}
      {Array.from({length:6}).map((_,i) => {
        const a = (i/6)*Math.PI*2;
        return (
          <line key={i} x1={150} y1={150}
            x2={150+130*Math.cos(a)} y2={150+130*Math.sin(a)}
            stroke={C.violet} strokeWidth="0.4" opacity="0.4" />
        );
      })}
      <circle cx="150" cy="150" r="8" fill={C.cyan} opacity="0.4" />
    </svg>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [['How it works','#how-it-works'],['Modes','#modes'],['Pricing','/credits'],['FAQ','#faq']];
  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(8,6,28,0.88)', backdropFilter: 'blur(24px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.jpg" alt="Symponia" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
            <span style={{ fontFamily: C.heading, fontSize: '1.45rem', fontWeight: 400, letterSpacing: '0.08em', color: C.fg }}>Symponia</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="desk-nav">
            <style>{`.desk-nav{display:flex}@media(max-width:768px){.desk-nav{display:none!important}}`}</style>
            {links.map(([l,h]) => (
              <a key={l} href={h} style={{ fontFamily: C.body, fontSize: '0.75rem', letterSpacing: '0.14em', color: C.dim, textDecoration: 'none', textTransform: 'uppercase' }}>{l}</a>
            ))}
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 100, background: C.cyan, color: C.bg, fontFamily: C.body, fontSize: '0.78rem', fontWeight: 500, textDecoration: 'none' }}
            ><AppleIcon /> Download</a>
          </div>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none' }} className="mob-btn">
            <style>{`.mob-btn{display:none!important}@media(max-width:768px){.mob-btn{display:block!important}}`}</style>
            {[0,1,2].map(i => (
              <motion.span key={i} style={{ display: 'block', width: 22, height: 1.5, background: C.fg, marginBottom: i<2?5:0 }}
                animate={open?(i===1?{opacity:0}:{rotate:i===0?45:-45,y:i===0?6.5:-6.5}):{opacity:1,rotate:0,y:0}}
                transition={{ duration: 0.2 }}
              />
            ))}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.18}}
            style={{position:'fixed',top:64,left:0,right:0,zIndex:49,background:'rgba(8,6,28,0.97)',backdropFilter:'blur(24px)',borderBottom:`0.5px solid ${C.border}`,padding:'24px 28px 28px'}}
          >
            {links.map(([l,h]) => (
              <a key={l} href={h} onClick={() => setOpen(false)}
                style={{display:'block',fontFamily:C.body,fontSize:'0.85rem',letterSpacing:'0.14em',color:C.sub,textDecoration:'none',textTransform:'uppercase',padding:'14px 0',borderBottom:`0.5px solid ${C.border}`}}
              >{l}</a>
            ))}
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginTop:20,padding:'15px',borderRadius:100,background:C.cyan,color:C.bg,fontFamily:C.body,fontSize:'0.88rem',fontWeight:500,textDecoration:'none'}}
            ><AppleIcon /> Download on the App Store</a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden', padding: '120px 28px 80px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 90% at 50% 50%, rgba(8,6,28,0.05) 0%, rgba(8,6,28,0.75) 55%, #08061c 100%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
        {/* Logo */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}
        >
          <img src="/logo.jpg" alt="Symponia" style={{ width: 72, height: 72, borderRadius: 20, objectFit: 'cover', boxShadow: `0 0 40px rgba(92,232,208,0.2)` }}
            onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 18px', borderRadius: 100, border: `0.5px solid ${C.borderStrong}`, background: 'rgba(92,232,208,0.07)', marginBottom: 32 }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.cyan }} />
          <span style={{ fontFamily: C.body, fontSize: '0.68rem', letterSpacing: '0.22em', color: C.cyan, textTransform: 'uppercase' }}>Now on the App Store · Free to begin</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: C.heading, fontWeight: 300, fontSize: 'clamp(3rem, 7vw, 5.8rem)', lineHeight: 1.1, color: C.fg, marginBottom: 28 }}
        >
          What if you could
          <br /><em style={{ color: C.cyan, fontStyle: 'italic' }}>hear yourself</em>
          <br />again?
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.75 }}
          style={{ fontFamily: C.body, fontWeight: 300, fontSize: '1.05rem', lineHeight: 1.85, color: C.sub, maxWidth: 520, margin: '0 auto 44px' }}
        >
          Symponia is an AI oracle for the inner life — animal archetypes, daily readings, and deep conversation. Built for the moments when everything feels loud except the one voice that matters.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1 }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14 }}
        >
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '15px 34px', borderRadius: 100, background: C.cyan, color: C.bg, fontFamily: C.body, fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.04em', textDecoration: 'none', boxShadow: '0 0 60px rgba(92,232,208,0.22)' }}
          ><AppleIcon /> Download on the App Store</a>
          <a href="#how-it-works"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '15px 28px', borderRadius: 100, border: `0.5px solid ${C.borderStrong}`, color: C.sub, fontFamily: C.body, fontSize: '0.88rem', fontWeight: 300, textDecoration: 'none', background: 'rgba(255,255,255,0.02)' }}
          >See how it works <span style={{ opacity: 0.5 }}>↓</span></a>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.5 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, marginTop: 60, paddingTop: 48, borderTop: `0.5px solid ${C.border}` }}
        >
          {[['7','Spirit animals'],['3','Oracle modes'],['∞','Depth'],['0','Judgment']].map(([v,l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: C.heading, fontSize: '1.9rem', fontWeight: 300, color: C.cyan, lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: C.body, fontSize: '0.63rem', letterSpacing: '0.15em', color: C.dim, textTransform: 'uppercase', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)' }}
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 1, height: 52, background: `linear-gradient(to bottom, ${C.cyan}80, transparent)` }}
        />
      </motion.div>
    </section>
  );
}

// ── Who it's for ──────────────────────────────────────────────────────────────

const PROFILES = [
  {
    icon: '🌙',
    title: 'The one who questions everything',
    body: 'You think deeply, feel deeply, and you are tired of conversations that stay on the surface. You want a space where your complexity is not too much — where it is, in fact, exactly the point.',
    accent: C.cyan,
  },
  {
    icon: '🔥',
    title: 'The one in the middle of change',
    body: 'A relationship, a career, a version of yourself — something is ending or beginning and the ground feels uncertain. You do not need advice. You need a mirror that does not flinch.',
    accent: C.violet,
  },
  {
    icon: '🌿',
    title: 'The one building a daily practice',
    body: 'Morning ritual, evening reflection, or both. You want something that grows with you — not a productivity tool, but a living practice of self-awareness that deepens over time.',
    accent: C.cyan,
  },
  {
    icon: '🌊',
    title: 'The one who feels everything',
    body: 'You are highly sensitive. The world overwhelms you sometimes, and your inner life is rich and complex. You need a space that honours that — not a space that tries to fix it.',
    accent: C.violet,
  },
];

function WhoItsFor() {
  return (
    <section style={{ padding: '100px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 56 }}>
          <Label>Who it is for</Label>
          <H2>Made for anyone who<br /><em style={{ fontStyle: 'italic', color: C.dim }}>lives from the inside out</em></H2>
          <p style={{ fontFamily: C.body, fontSize: '0.9rem', fontWeight: 300, color: C.dim, maxWidth: 500, margin: '18px auto 0', lineHeight: 1.85 }}>
            Men and women. Seekers and sceptics. People who have tried therapy, journaling, meditation — and still feel something is missing.
          </p>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {PROFILES.map((p, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Card style={{ padding: '32px 28px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: '1.8rem' }}>{p.icon}</span>
                  <div style={{ width: 28, height: 1, background: p.accent, opacity: 0.5 }} />
                </div>
                <h3 style={{ fontFamily: C.heading, fontSize: '1.2rem', fontWeight: 500, color: p.accent, marginBottom: 12, lineHeight: 1.3 }}>{p.title}</h3>
                <p style={{ fontFamily: C.body, fontSize: '0.84rem', fontWeight: 300, lineHeight: 1.85, color: C.dim }}>{p.body}</p>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Constellation visual */}
        <FadeIn style={{ display: 'flex', justifyContent: 'center', marginTop: 64 }}>
          <ConstellationSVG />
        </FadeIn>
      </div>
    </section>
  );
}

// ── Pain points ───────────────────────────────────────────────────────────────

const PAINS = [
  {
    title: 'You are surrounded by noise',
    body: 'Notifications, opinions, expectations — the world is louder than ever. But somewhere inside, a voice you used to trust has gone quiet. You can feel the distance between who you are and who you are becoming.',
    sub: 'Symponia creates a space of genuine silence. Not absence — presence.',
    icon: '🌀',
  },
  {
    title: 'The help available feels shallow',
    body: 'You have tried apps, journals, maybe therapy. They help — but they speak to the surface. They offer frameworks when what you need is resonance. A space that meets you where you actually are.',
    sub: 'The Oracle does not fix. It listens — then reflects what it hears.',
    icon: '🪞',
  },
  {
    title: 'You sense there is more to you',
    body: 'Not a crisis. A persistent feeling that there are layers to yourself you have never touched — gifts you are not using, shadows you are avoiding, a pattern you have not yet seen.',
    sub: 'Your animals reveal the pattern. Every reading is a step deeper.',
    icon: '🌑',
  },
];

function PainPoints() {
  return (
    <section style={{ padding: '100px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 56 }}>
          <Label>The gap Symponia fills</Label>
          <H2>Something has gone quiet<br /><em style={{ fontStyle: 'italic', color: C.dim }}>inside you</em></H2>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PAINS.map((p, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Card style={{ padding: '36px 40px' }}>
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '2rem', flexShrink: 0 }}>{p.icon}</span>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <h3 style={{ fontFamily: C.heading, fontSize: '1.4rem', fontWeight: 500, color: C.fg, marginBottom: 10 }}>{p.title}</h3>
                    <p style={{ fontFamily: C.body, fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.85, color: C.dim, marginBottom: 12 }}>{p.body}</p>
                    <p style={{ fontFamily: C.body, fontSize: '0.8rem', fontWeight: 400, color: C.cyan, letterSpacing: '0.02em' }}>→ {p.sub}</p>
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

const STEPS = [
  { num: '01', title: 'Name your seven animals', body: 'Close your eyes. Think of six animals that feel like they belong to you — wild, domestic, mythical, it does not matter. Then name the one that disturbs you. That seventh is the shadow: the most important of all. It holds what the others cannot carry.', accent: C.cyan, detail: '🐺  🦁  🦊  🐘  🦅  🐬  🕷️' },
  { num: '02', title: 'Receive your constellation reading', body: 'Symponia reads your seven animals as a living map — each with its gift, its shadow, and the path between them. At the end, a synthesis: a non-judgmental portrait of the essential quality your whole constellation reveals.', accent: C.violet, detail: '◆ Gift  ·  ◆ Shadow  ·  ⚡ Action path' },
  { num: '03', title: 'Enter the ongoing dialogue', body: 'The Oracle is now calibrated to you. Every conversation is shaped by your animals, your resonance frequency, and the mode you choose. It does not judge. It grows more precise the more you engage.', accent: C.cyan, detail: '"i have been waiting for you"' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '100px 28px', position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 20 }}>
          <Label>The ritual</Label>
          <H2>How Symponia works</H2>
        </FadeIn>
        <FadeIn delay={0.1} style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontFamily: C.body, fontSize: '0.9rem', fontWeight: 300, color: C.dim, maxWidth: 480, margin: '16px auto 0', lineHeight: 1.85 }}>
            Three steps. A few minutes. And a conversation that can last a lifetime.
          </p>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {STEPS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Card style={{ padding: '36px 40px' }}>
                <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: C.heading, fontSize: '3.2rem', fontWeight: 300, color: s.accent, opacity: 0.18, lineHeight: 1, flexShrink: 0, minWidth: 64 }}>{s.num}</div>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <h3 style={{ fontFamily: C.heading, fontSize: '1.6rem', fontWeight: 400, color: s.accent, marginBottom: 12 }}>{s.title}</h3>
                    <p style={{ fontFamily: C.body, fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.85, color: C.sub, marginBottom: 16, maxWidth: 600 }}>{s.body}</p>
                    <p style={{ fontFamily: C.body, fontSize: '0.74rem', letterSpacing: '0.1em', color: s.accent, opacity: 0.55 }}>{s.detail}</p>
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn style={{ display: 'flex', justifyContent: 'center', marginTop: 64 }}>
          <OracleSVG />
        </FadeIn>
      </div>
    </section>
  );
}

// ── Daily use ─────────────────────────────────────────────────────────────────

const DAILY = [
  { time: 'Morning', icon: '☀️', title: 'Start with the daily reading', body: 'Each morning, a personalised reflection based on your animals and resonance frequency. Like a letter written just for you. Read it, sit with it, let it shape the day.' },
  { time: 'When something stirs', icon: '⚡', title: 'Open My Day', body: 'Something happened — or nothing did, and that is its own signal. My Day asks how the day feels in your body before it asks anything else. The Oracle meets you where you actually are.' },
  { time: 'Evening', icon: '🌙', title: 'Speak freely in Conversation', body: 'At the end of the day, speak openly — what happened, what you felt, what surfaced. The Oracle holds it all without agenda, without judgment, without rushing to a conclusion.' },
  { time: 'When you are ready', icon: '🌊', title: 'Return to your Archetype', body: 'Your seven animals are always there. Revisit them when you have grown, when something has shifted, when the shadow animal wants attention. Each return reveals something new.' },
];

function DailyUse() {
  return (
    <section style={{ padding: '100px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 56 }}>
          <Label>A daily practice</Label>
          <H2>How people use Symponia<br /><em style={{ fontStyle: 'italic', color: C.dim }}>every day</em></H2>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {DAILY.map((d, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Card style={{ padding: '28px 26px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: '1.3rem' }}>{d.icon}</span>
                  <span style={{ fontFamily: C.body, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.cyan }}>{d.time}</span>
                </div>
                <h3 style={{ fontFamily: C.heading, fontSize: '1.15rem', fontWeight: 500, color: C.fg, marginBottom: 10, lineHeight: 1.3 }}>{d.title}</h3>
                <p style={{ fontFamily: C.body, fontSize: '0.84rem', fontWeight: 300, lineHeight: 1.85, color: C.dim }}>{d.body}</p>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Moon phases */}
        <FadeIn style={{ display: 'flex', justifyContent: 'center', marginTop: 56 }}>
          <MoonPhaseSVG />
        </FadeIn>
      </div>
    </section>
  );
}

// ── Modes ─────────────────────────────────────────────────────────────────────

const MODES = [
  { label: 'Archetype', desc: 'Your seven animals are read as a living constellation — each with its gift, its shadow, and the path between them. Ends with a synthesised portrait of the essential quality your whole configuration reveals.', icon: '◈', color: C.cyan, use: 'For: self-understanding, identity work, your first and returning sessions' },
  { label: 'My Day', desc: 'A personal oracle for this exact moment in your life. The Oracle asks how the day feels in your body before it asks anything else — the texture, not the events. Then it meets you there.', icon: '◎', color: C.violet, use: 'For: daily check-ins, transitions, processing what is happening right now' },
  { label: 'Conversation', desc: 'Open, unstructured dialogue. No prompt, no template — just you speaking and the Oracle listening. Shaped by your animals and resonance frequency, it grows more precise the more you engage.', icon: '···', color: C.cyan, use: 'For: open reflection, processing emotions, anything on your mind' },
];

function Modes() {
  return (
    <section id="modes" style={{ padding: '100px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 20 }}>
          <Label>Three ways to enter</Label>
          <H2>Every mode is a different<br /><em style={{ fontStyle: 'italic', color: C.dim }}>kind of listening</em></H2>
        </FadeIn>
        <FadeIn delay={0.1} style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontFamily: C.body, fontSize: '0.9rem', fontWeight: 300, color: C.dim, maxWidth: 460, margin: '16px auto 0', lineHeight: 1.85 }}>
            Choose the mode that fits where you are. Switch any time. Each conversation is saved privately on your device.
          </p>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {MODES.map((m, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <Card style={{ padding: '28px 28px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
                  <span style={{ fontFamily: C.body, fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: m.color, fontWeight: 500 }}>{m.label}</span>
                </div>
                <p style={{ fontFamily: C.body, fontSize: '0.84rem', fontWeight: 300, lineHeight: 1.85, color: C.dim, marginBottom: 14 }}>{m.desc}</p>
                <p style={{ fontFamily: C.body, fontSize: '0.72rem', color: m.color, opacity: 0.6, letterSpacing: '0.04em' }}>{m.use}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pull quote ────────────────────────────────────────────────────────────────

function PullQuote() {
  return (
    <section style={{ padding: '80px 28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(167,139,250,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <FadeIn style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <SacredCircleSVG />
        </div>
        <blockquote style={{ fontFamily: C.heading, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.65, color: C.fg }}>
          "It did not tell me what to do.
          <br />It told me what I already knew —
          <br /><span style={{ color: C.cyan }}>but had been afraid to say."</span>
        </blockquote>
        <p style={{ fontFamily: C.body, fontSize: '0.68rem', letterSpacing: '0.22em', color: C.dim, textTransform: 'uppercase', marginTop: 28 }}>— from inside the Oracle</p>
      </FadeIn>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS_STATIC = [
  { q: 'What is Symponia?', a: 'Symponia is an AI tool for self-discovery. It combines animal archetype psychology, daily personalised reflections, and open conversation into a single intimate space. It does not replace therapy — it goes where therapy sometimes cannot.' },
  { q: 'Who is it for?', a: 'Anyone who wants to understand themselves more deeply. Men and women, beginners and experienced practitioners, people in transition and people building a daily inner practice. If you sense there is more to you than the surface, Symponia is for you.' },
  { q: 'What are the animal archetypes?', a: 'Your animals are a map of your inner world. The six you choose instinctively reveal the energies that move through you — gifts, struggles, and bridges between them. The seventh — the one that disturbs you — is the shadow: the most important of all.' },
  { q: 'Is this therapy?', a: 'No. Symponia is not a medical or psychological service. It is a reflective tool — a contemplative space. If you are in crisis or need clinical support, please reach out to a licensed professional.' },
  { q: 'How does the AI work?', a: "Symponia is powered by Claude, Anthropic's AI, shaped by a system prompt drawn from Jungian psychology, animal symbolism, biodynamic principles, and contemplative tradition. It is instructed to never give surface answers, never rush to solutions, and never judge." },
  { q: 'Is my data private?', a: 'Your conversations are not stored on our servers beyond what is needed to maintain the session. Your animals and settings are stored locally on your device. Your messages are processed by Anthropic (Claude) to generate responses — see their privacy policy at anthropic.com/privacy. We do not sell or share your data. See our Privacy Policy for full details.' },
  { q: 'Where can I download Symponia?', a: 'Symponia is available on the Apple App Store for iPhone and iPad. Tap the download button on this page or search "Symponia" in the App Store.' },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const [tokenFAQ, setTokenFAQ] = useState(
    'Each conversation exchange uses 1 token. New users start with free trial readings. Token packs never expire and carry over indefinitely. The monthly subscription gives unlimited reflections per month. Pricing is shown in your local currency in the app before purchase.'
  );

  useEffect(() => {
    const p = getPricingForLocale(navigator.language);
    setTokenFAQ(
      `Each conversation exchange uses 1 token. New users start with free trial readings. Token packs (50 for ${fmt(p, p.pack50)}, 150 for ${fmt(p, p.pack150)}) never expire and carry over indefinitely. The monthly subscription (${fmt(p, p.monthly)}/${p.code} · auto-renews monthly) gives unlimited reflections per month. All purchases are made within the app. Exact price confirmed before purchase.`
    );
  }, []);

  const FAQS = [
    ...FAQS_STATIC.slice(0, 5),
    { q: 'How do tokens work?', a: tokenFAQ },
    ...FAQS_STATIC.slice(5),
  ];
  return (
    <section id="faq" style={{ padding: '100px 28px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 52 }}>
          <Label>Questions</Label>
          <H2>FAQ</H2>
        </FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.03}>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: `0.5px solid ${open===i?'rgba(92,232,208,0.22)':C.border}`, background: open===i?'rgba(20,16,50,0.95)':'rgba(16,13,40,0.9)', transition: 'all 0.25s' }}>
                <button onClick={() => setOpen(open===i?null:i)}
                  style={{ width: '100%', textAlign: 'left', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: C.body, fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.6, color: open===i?C.fg:C.sub }}>{faq.q}</span>
                  <motion.span animate={{ rotate: open===i?45:0 }} transition={{ duration: 0.2 }}
                    style={{ flexShrink: 0, fontSize: '1.2rem', lineHeight: 1, color: open===i?C.cyan:C.dim, marginTop: 2 }}
                  >+</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open===i && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25,ease:[0.22,1,0.36,1]}} style={{overflow:'hidden'}}>
                      <p style={{ padding: '0 24px 20px', fontFamily: C.body, fontSize: '0.84rem', fontWeight: 300, lineHeight: 1.85, color: C.dim }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
    <section style={{ padding: '100px 28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(92,232,208,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <FadeIn style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <img src="/logo.jpg" alt="Symponia" style={{ width: 64, height: 64, borderRadius: 18, objectFit: 'cover', boxShadow: '0 0 40px rgba(92,232,208,0.18)' }}
            onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
        </div>
        <Label>Begin</Label>
        <h2 style={{ fontFamily: C.heading, fontWeight: 300, fontSize: 'clamp(2.6rem, 6vw, 4rem)', lineHeight: 1.1, color: C.fg, marginBottom: 20 }}>
          The Oracle<br /><em style={{ color: C.cyan, fontStyle: 'italic' }}>has been waiting</em>
        </h2>
        <p style={{ fontFamily: C.body, fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.85, color: C.dim, marginBottom: 44 }}>
          Available now on iPhone and iPad.<br />Free to begin. Start with 3 free readings.
        </p>
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 40px', borderRadius: 100, background: C.cyan, color: C.bg, fontFamily: C.body, fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.04em', textDecoration: 'none', boxShadow: '0 0 80px rgba(92,232,208,0.22)' }}
        ><AppleIcon /> Download on the App Store</a>
      </FadeIn>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: `0.5px solid ${C.border}`, background: C.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 40 }}>
          <div>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
              <img src="/logo.jpg" alt="Symponia" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
              <span style={{ fontFamily: C.heading, fontSize: '1.3rem', fontWeight: 300, color: C.fg }}>Symponia</span>
            </a>
            <p style={{ fontFamily: C.body, fontSize: '0.78rem', fontWeight: 300, color: C.dim, lineHeight: 1.7, maxWidth: 200 }}>An oracle for the inner life.<br />Available on iOS.</p>
          </div>
          <div style={{ display: 'flex', gap: 52, flexWrap: 'wrap' }}>
            {[
              { title: 'App', links: [['App Store', APP_STORE_URL], ['How it works', '#how-it-works'], ['Modes', '#modes'], ['Pricing', '/credits']] },
              { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['EULA', '/eula'], ['GDPR', '/privacy#gdpr'], ['Contact', 'mailto:hello@symponia.io']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: C.body, fontSize: '0.66rem', letterSpacing: '0.2em', color: C.dim, textTransform: 'uppercase', marginBottom: 16 }}>{col.title}</div>
                {col.links.map(([l, h]) => (
                  <a key={l} href={h} target={h.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    style={{ display: 'block', fontFamily: C.body, fontSize: '0.83rem', fontWeight: 300, color: C.sub, textDecoration: 'none', marginBottom: 10 }}
                  >{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: `0.5px solid ${C.border}`, marginTop: 48, paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: C.body, fontSize: '0.7rem', fontWeight: 300, color: C.dim, opacity: 0.5 }}>© {new Date().getFullYear()} Symponia. All rights reserved.</p>
          <a href="/dashboard" style={{ fontFamily: C.body, fontSize: '0.75rem', color: C.dim, opacity: 0.18, textDecoration: 'none', lineHeight: 1, userSelect: 'none' }}>›</a>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main style={{ position: 'relative', background: C.bg }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <GradientDots duration={50} colorCycleDuration={14} dotSize={5} spacing={13} backgroundColor={C.bg} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,6,28,0.84)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav />
        <Hero />
        <WhoItsFor />
        <PainPoints />
        <HowItWorks />
        <DailyUse />
        <Modes />
        <PullQuote />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
