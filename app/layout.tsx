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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'Symponia',
    description: DESCRIPTION,
    url: BASE_URL,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'iOS',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free starter credits',
        price: '0',
        priceCurrency: 'USD',
        description: '10 free oracle credits included on first install',
      },
      {
        '@type': 'Offer',
        name: 'Token packs',
        price: '0',
        priceCurrency: 'USD',
        description: 'Additional one-time token packs available in-app',
        availability: 'https://schema.org/InStock',
      },
    ],
    installUrl: 'https://apps.apple.com/app/symponia/id6744058607',
    downloadUrl: 'https://apps.apple.com/app/symponia/id6744058607',
    image: OG_IMAGE,
    screenshot: OG_IMAGE,
    featureList: [
      'Daily planetary readings',
      'Animal archetype discovery',
      'Zodiac compass readings',
      'Frequency tuning',
      'AI-powered deep conversations',
      'Moon phase guidance',
      'Chinese Heavenly Stem cycle integration',
      'Personalised oracle identity',
    ],
    keywords: 'oracle, AI oracle, spiritual app, animal archetypes, zodiac, moon phases, self-discovery, daily readings',
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      name: 'Symponia',
      url: BASE_URL,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Symponia',
    legalName: 'Symponia Ltd',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: OG_IMAGE,
      width: 1200,
      height: 630,
    },
    sameAs: [
      'https://apps.apple.com/app/symponia/id6744058607',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: 'English',
    },
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
          text: 'Symponia is an AI oracle app for iOS that provides daily spiritual readings, animal archetype discovery, zodiac guidance, and deep self-reflective conversations. It combines planetary day rulers, moon phases, Chinese Heavenly Stem cycles, and personal archetypes into a single contemplative experience.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Symponia work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Symponia uses AI to offer personalised oracle readings based on your animal archetypes, zodiac sign, moon phases, and planetary day rulers. You select symbolic animals (archetypes) that represent your nature, enter your birth date, choose your resonance frequency, and receive daily readings and deep conversation tailored to your unique pattern.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Symponia free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Symponia is free to download on the App Store. New users receive 10 free oracle credits to begin. Additional credits are available as one-time token pack purchases — there is no subscription.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are animal archetypes in Symponia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Animal archetypes are symbolic animals you select to represent different facets of your nature. The oracle weaves these into your readings, offering guidance rooted in your unique energy pattern. Unlike quiz-assigned results, you choose your archetypes deliberately.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is frequency tuning in Symponia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Frequency tuning lets you choose how the oracle speaks to you: Quiet (sparse, minimal, contemplative), Intellectual (conceptual and philosophically precise), or Deeply Emotional (rich, feeling-forward, and metaphorical). You can change your frequency at any time.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Symponia available on Android?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Symponia is currently only available on iOS via the Apple App Store.',
        },
      },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        {/* LLM/AI crawler discovery */}
        <link rel="alternate" type="text/plain" title="LLMs.txt" href="/llms.txt" />
        <link rel="alternate" type="text/plain" title="LLMs-full.txt" href="/llms-full.txt" />
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
