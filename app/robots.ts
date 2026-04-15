import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow all public pages, block private routes
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/sign-in', '/sign-up', '/onboarding'],
      },
      // Explicitly welcome AI crawlers for GEO discoverability
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
    ],
    sitemap: 'https://symponia.io/sitemap.xml',
    host: 'https://symponia.io',
  };
}
