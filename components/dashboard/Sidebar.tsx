'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, LayoutGrid, FileText, Image, Calendar, BarChart2,
  PlusCircle, Settings, Zap,
} from 'lucide-react';

const NAV = [
  { label: 'Home',       href: '/dashboard',           icon: Home },
  { label: 'Campaigns',  href: '/dashboard/campaigns', icon: LayoutGrid },
  { label: 'Content',    href: '/dashboard/content',   icon: FileText },
  { label: 'Assets',     href: '/dashboard/assets',    icon: Image },
  { label: 'Calendar',   href: '/dashboard/calendar',  icon: Calendar },
  { label: 'Analytics',  href: '/dashboard/analytics', icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: '#08080F',
      borderRight: '1px solid #1A1A30',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1A1A30' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: '#F1F0FF', letterSpacing: '-0.01em' }}>
              Markos
            </div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', letterSpacing: '0.18em', color: '#4A4A6A', textTransform: 'uppercase', marginTop: 1 }}>
              AI Marketing OS
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', position: 'relative', display: 'block' }}>
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: 3, borderRadius: '0 3px 3px 0',
                    background: '#7C3AED',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                background: active ? '#1A1A30' : 'transparent',
                transition: 'background 0.12s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = '#141428'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <Icon size={16} color={active ? '#9F67FF' : '#4A4A6A'} strokeWidth={active ? 2 : 1.5} />
                <span style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.83rem',
                  fontWeight: active ? 500 : 400,
                  color: active ? '#F1F0FF' : '#8B8BA8',
                  letterSpacing: '0.01em',
                }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* New Campaign CTA */}
      <div style={{ padding: '0 12px 16px' }}>
        <Link href="/dashboard/campaigns/new" style={{ textDecoration: 'none', display: 'block' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              background: '#7C3AED',
              boxShadow: '0 0 24px rgba(124,58,237,0.35)',
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={15} color="#fff" />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.82rem', fontWeight: 500, color: '#fff' }}>
              New Campaign
            </span>
          </motion.div>
        </Link>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#1A1A30', margin: '0 12px' }} />

      {/* User */}
      <div style={{ padding: '12px 12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid #2D2D50' }} />
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#141428', border: '1px solid #2D2D50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#8B8BA8' }}>{user?.firstName?.[0] ?? '?'}</span>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.78rem', fontWeight: 500, color: '#F1F0FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.firstName ?? 'Loading…'}
          </div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', color: '#4A4A6A', letterSpacing: '0.08em' }}>
            Free plan
          </div>
        </div>
        <Link href="/dashboard/settings" style={{ color: '#4A4A6A', display: 'flex' }}>
          <Settings size={14} />
        </Link>
      </div>
    </aside>
  );
}
