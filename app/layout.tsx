import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

// Cal Sans SemiBold — download CalSans-SemiBold.woff2 from
// https://github.com/calcom/font and place at public/fonts/CalSans-SemiBold.woff2
const calSans = localFont({
  src: '../public/fonts/CalSans-SemiBold.woff2',
  variable: '--font-cal-sans',
  weight: '600',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const BASE_URL = 'https://symponia.io';
const TITLE = 'Symponia — Hear Yourself Again';
const DESCRIPTION =
  'An AI companion that speaks in the language of your soul. Daily reflections, animal archetypes, and deep conversation — crafted for those who sense there is more.';
const OG_IMAGE = `${BASE_URL}/logo.jpg`;

export const viewport: Viewport = {
  themeColor: '#08080F',
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
    'AI companion',
    'self-discovery app',
    'spiritual app',
    'animal archetypes',
    'daily reflections',
    'self-discovery',
    'soul guidance',
    'inner work',
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
        description: '10 free conversations included on first install',
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
      'Daily personalised reflections',
      'Animal archetype discovery',
      'Six reflective conversation modes',
      'Frequency tuning',
      'AI-powered deep conversations',
      'Dream and shadow work',
      'Moon phase and planetary guidance',
      'Personalised companion identity',
    ],
    keywords: 'self-discovery app, AI companion, animal archetypes, daily reflections, inner work, iOS wellness app',
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
          text: 'Symponia is an AI-powered self-reflection app for iOS. It uses animal archetypes, daily personalised reflections, and six conversation modes to help you explore your inner life. It is powered by Claude, Anthropic\'s AI.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Symponia work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You select seven spirit animals that represent facets of your nature. Symponia uses these archetypes along with your resonance frequency to personalise all reflections and conversations. Each session draws on your unique animal constellation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Symponia free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Symponia is free to download on the App Store. New users receive 10 free credits to begin. Additional credits are available as one-time token pack purchases — there is no subscription required.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are animal archetypes in Symponia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Animal archetypes are symbolic animals you choose to represent different facets of your nature. Unlike quiz-assigned results, you select them deliberately. Symponia weaves these animals into all reflections and conversations.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Symponia therapy or a medical service?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Symponia is a reflective and contemplative tool, not a medical, therapeutic, or psychological service. Nothing in the app constitutes professional advice or diagnosis. If you need mental health support, please consult a qualified professional.',
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
    <html lang="en" className={`${calSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
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
