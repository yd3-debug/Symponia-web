'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

const APP_STORE_URL = 'https://apps.apple.com/app/symponia/id6744058607';
const C = {
  bg: '#08061c', fg: '#eae6f8', sub: '#b8b0d8', dim: '#7c70a8',
  cyan: '#5ce8d0', border: 'rgba(255,255,255,0.07)',
  heading: "var(--font-cormorant), 'Georgia', serif",
  body: "var(--font-inter), 'Helvetica Neue', sans-serif",
};

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor', flexShrink: 0 }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const links = [['How it works', '/#how-it-works'], ['Modes', '/#modes'], ['Credits', '/credits'], ['FAQ', '/#faq']];

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,6,28,0.9)', backdropFilter: 'blur(24px)', borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.jpg" alt="Symponia" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover' }} />
            <span style={{ fontFamily: C.heading, fontSize: '1.3rem', fontWeight: 400, letterSpacing: '0.08em', color: C.fg }}>Symponia</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desk-links">
            <style>{`.desk-links{display:flex}@media(max-width:768px){.desk-links{display:none!important}}`}</style>
            {links.map(([l, h]) => (
              <a key={l} href={h} style={{ fontFamily: C.body, fontSize: '0.75rem', letterSpacing: '0.14em', color: C.dim, textDecoration: 'none', textTransform: 'uppercase' }}>{l}</a>
            ))}
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 100, background: C.cyan, color: C.bg, fontFamily: C.body, fontSize: '0.76rem', fontWeight: 500, textDecoration: 'none' }}
            ><AppleIcon /> Download</a>
          </div>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none' }} className="mob-btn">
            <style>{`.mob-btn{display:none!important}@media(max-width:768px){.mob-btn{display:block!important}}`}</style>
            {[0,1,2].map(i => (
              <motion.span key={i} style={{ display: 'block', width: 22, height: 1.5, background: C.fg, marginBottom: i < 2 ? 5 : 0 }}
                animate={open ? (i===1?{opacity:0}:{rotate:i===0?45:-45,y:i===0?6.5:-6.5}):{opacity:1,rotate:0,y:0}}
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
      <main>{children}</main>
      <footer style={{ borderTop: `0.5px solid ${C.border}`, background: C.bg, padding: '48px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.jpg" alt="Symponia" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
            <span style={{ fontFamily: C.heading, fontSize: '1.2rem', fontWeight: 300, color: C.fg }}>Symponia</span>
          </a>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Credits','/credits'],['Contact','mailto:hello@symponia.io']].map(([l,h]) => (
              <a key={l} href={h} style={{ fontFamily: C.body, fontSize: '0.78rem', fontWeight: 300, color: C.dim, textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
          <p style={{ fontFamily: C.body, fontSize: '0.7rem', color: C.dim, opacity: 0.4 }}>© {new Date().getFullYear()} Symponia</p>
        </div>
      </footer>
    </div>
  );
}
