import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Symponia — Hear Yourself Again',
  description: 'An AI oracle that speaks in the language of your soul. Daily readings, animal archetypes, and deep conversation — crafted for those who sense there is more.',
  keywords: ['oracle', 'spiritual', 'AI', 'animal archetypes', 'self-discovery', 'tarot', 'soul', 'iOS app'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
