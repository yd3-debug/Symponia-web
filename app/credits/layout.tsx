import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credits & Pricing',
  description: 'Token packs for Symponia — the AI oracle app. Start free, then choose a pack that fits your practice. No subscription required.',
  alternates: { canonical: 'https://symponia.io/credits' },
  robots: { index: true, follow: true },
};

export default function CreditsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
