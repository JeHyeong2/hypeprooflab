import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  // M6: Security headers + crawler-friendly headers for sitemap/robots.
  // Sitemap/robots fetched by Google Search Console got "가져올 수 없음" with
  // the Next.js default `Vary: rsc, next-router-state-tree, ...` token leaking
  // into a static XML file. Pin Cache-Control + Content-Type explicitly so the
  // crawler sees the same response shape as a plain static file.
  headers: async () => [
    {
      source: '/sitemap.xml',
      headers: [
        { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
        { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=3600, must-revalidate' },
        { key: 'X-Robots-Tag', value: 'noindex' },
      ],
    },
    {
      source: '/robots.txt',
      headers: [
        { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
        { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=3600, must-revalidate' },
      ],
    },
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-XSS-Protection', value: '0' },
      ],
    },
  ],
};

export default nextConfig;
