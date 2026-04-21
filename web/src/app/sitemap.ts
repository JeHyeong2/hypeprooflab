import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL || 'https://hypeproof-ai.xyz'
  const lastModified = new Date()

  // Main routes only. Individual columns / research / novels / creators are
  // discovered via in-page internal links — keeps the sitemap small and
  // strictly XSD-compliant.
  const staticRoutes = [
    { path: '',             priority: 1.0, changeFrequency: 'daily'  as const },
    { path: '/columns',     priority: 0.9, changeFrequency: 'daily'  as const },
    { path: '/research',    priority: 0.9, changeFrequency: 'daily'  as const },
    { path: '/novels',      priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/creators',    priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/glossary',    priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/ai-personas', priority: 0.5, changeFrequency: 'weekly' as const },
  ]

  return staticRoutes.map(route => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
