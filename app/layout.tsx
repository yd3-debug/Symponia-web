import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Symponia — Hear Yourself Again',
  description: 'An AI oracle that speaks in the language of your soul. Daily readings, animal archetypes, and deep conversation — crafted for those who sense there is more.',
  keywords: ['oracle', 'spiritual', 'AI', 'animal archetypes', 'self-discovery', 'soul', 'iOS app'],
  openGraph: {
    title: 'Symponia — Hear Yourself Again',
    description: 'An AI oracle that speaks in the language of your soul.',
    type: 'website',
    url: 'https://symponia.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Symponia — Hear Yourself Again',
    description: 'An AI oracle that speaks in the language of your soul.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
