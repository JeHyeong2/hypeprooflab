import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = 3600

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NODE_ENV === 'production'
  const siteUrl = process.env.SITE_URL || 'https://hypeproof-ai.xyz'

  // ── Dev / preview: block everything to prevent staging URLs from
  //    being indexed as duplicate content.
  if (!isProd) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  // Paths that must never be crawled by anyone.
  const blockedPaths = ['/private/', '/admin/', '/api/', '/_next/', '/static/']

  return {
    rules: [
      // 1) General crawler baseline
      {
        userAgent: '*',
        allow: '/',
        disallow: blockedPaths,
        crawlDelay: 1,
      },

      // 2) Major search engines — explicit allow + disallow.
      //    Googlebot uses ONLY its own group (does not inherit from `*`),
      //    so allow/disallow must be repeated here.
      { userAgent: 'Googlebot',       allow: '/', disallow: blockedPaths },
      { userAgent: 'Googlebot-Image', allow: ['/logos/', '/members/', '/authors/', '/og-image.png'], disallow: blockedPaths },
      { userAgent: 'Googlebot-News',  disallow: '/' }, // not a Google News publisher
      { userAgent: 'GoogleOther',     allow: '/', disallow: blockedPaths },
      { userAgent: 'Bingbot',         crawlDelay: 1 },
      { userAgent: 'DuckDuckBot',     crawlDelay: 2 },

      // 3) Naver — primary Korean search
      { userAgent: 'Yeti',     crawlDelay: 1 },
      { userAgent: 'Yetibot',  crawlDelay: 1 },
      { userAgent: 'Naverbot', crawlDelay: 1 },
      { userAgent: 'Cowbot',   crawlDelay: 1 },

      // 4) AI training bots — disallow so HypeProof content is not
      //    absorbed into base-model training corpora without permission.
      { userAgent: 'GPTBot',             disallow: '/' }, // OpenAI training
      { userAgent: 'ClaudeBot',          disallow: '/' }, // Anthropic training
      { userAgent: 'anthropic-ai',       disallow: '/' }, // Anthropic bulk
      { userAgent: 'Google-Extended',    disallow: '/' }, // Gemini training
      { userAgent: 'CCBot',              disallow: '/' }, // Common Crawl
      { userAgent: 'Bytespider',         disallow: '/' }, // ByteDance
      { userAgent: 'Meta-ExternalAgent', disallow: '/' }, // Meta AI training
      { userAgent: 'Applebot-Extended',  disallow: '/' }, // Apple AI training opt-out
      { userAgent: 'cohere-ai',          disallow: '/' }, // Cohere training

      // 5) AI citation bots — allow so HypeProof is citable in real-time
      //    answers from ChatGPT / Claude / Perplexity search surfaces.
      { userAgent: 'ChatGPT-User',     allow: '/', disallow: blockedPaths },
      { userAgent: 'OAI-SearchBot',    allow: '/', disallow: blockedPaths },
      { userAgent: 'Claude-SearchBot', allow: '/', disallow: blockedPaths },
      { userAgent: 'Claude-User',      allow: '/', disallow: blockedPaths },
      { userAgent: 'PerplexityBot',    allow: '/', disallow: blockedPaths },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
