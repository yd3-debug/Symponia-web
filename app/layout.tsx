import type { Metadata, Viewport } from 'next';
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

const BASE_URL = 'https://symponia.io';
const TITLE = 'Symponia — Hear Yourself Again';
const DESCRIPTION =
  'An AI oracle that speaks in the language of your soul. Daily readings, animal archetypes, zodiac guidance, and deep conversation — crafted for those who sense there is more.';
const OG_IMAGE = `${BASE_URL}/logo.jpg`;

export const viewport: Viewport = {
  themeColor: '#08061c',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: TITLE,
    template: '%s | Symponia',
  },
  description: DESCRIPTION,
  keywords: [
    'oracle app',
    'AI oracle',
    'spiritual app',
    'animal archetypes',
    'daily readings',
    'self-discovery',
    'soul guidance',
    'zodiac',
    'moon phases',
    'iOS spiritual app',
    'mindfulness',
    'inner wisdom',
    'resonance',
    'archetypes',
  ],
  authors: [{ name: 'Symponia' }],
  creator: 'Symponia',
  publisher: 'Symponia',

  alternates: {
    canonical: BASE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#08061c' }],
  },

  manifest: '/site.webmanifest',

  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Symponia',
    locale: 'en_US',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Symponia — Hear Yourself Again',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@symponia_app',
    creator: '@symponia_app',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },

  appLinks: {
    ios: {
      app_store_id: '6744058607',
      url: 'https://apps.apple.com/app/symponia/id6744058607',
    },
  },

  other: {
    // iOS smart banner (shows "Open in App Store" bar on Safari)
    'apple-itunes-app': 'app-id=6744058607',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Symponia',
    url: BASE_URL,
    description: DESCRIPTION,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'Symponia',
    description: DESCRIPTION,
    url: BASE_URL,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'iOS',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    installUrl: 'https://apps.apple.com/app/symponia/id6744058607',
    image: OG_IMAGE,
    featureList: [
      'Daily planetary readings',
      'Animal archetype discovery',
      'Zodiac compass readings',
      'Frequency tuning',
      'AI-powered deep conversations',
      'Moon phase guidance',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Symponia',
    url: BASE_URL,
    logo: OG_IMAGE,
    sameAs: ['https://apps.apple.com/app/symponia/id6744058607'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Symponia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Symponia is an AI oracle app for iOS that provides daily spiritual readings, animal archetype discovery, zodiac guidance, and deep self-reflective conversations.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Symponia work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Symponia uses AI to offer personalised oracle readings based on your animal archetypes, zodiac sign, moon phases, and planetary day rulers. You can ask questions, receive daily readings, and explore your inner landscape through guided conversation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Symponia free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Symponia is free to download on the App Store. It includes a starter token balance and offers optional token packs for continued use.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are animal archetypes in Symponia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Animal archetypes are symbolic animals you select to represent different facets of your nature. The oracle weaves these into your readings, offering guidance rooted in your unique energy pattern.',
        },
      },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
