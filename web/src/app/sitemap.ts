import type { MetadataRoute } from 'next'
import { getAllColumns } from '@/lib/columns'
import { getAllResearch } from '@/lib/research'
import { getAllNovels } from '@/lib/novels'

// Date-only (YYYY-MM-DD) — W3C Datetime, Google-preferred form.
function toDateString(input: string | Date | undefined): string {
  const today = new Date().toISOString().slice(0, 10)
  if (!input) return today
  if (typeof input === 'string') {
    const m = input.match(/^\d{4}-\d{2}-\d{2}/)
    return m ? m[0] : today
  }
  return isNaN(input.getTime()) ? today : input.toISOString().slice(0, 10)
}

// Latest content date per section — anchors lastmod to actual publish
// activity so Google doesn't see spurious changes on every crawl.
function latestContentDate(dates: (string | undefined)[]): string {
  const valid = dates
    .map(d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : null))
    .filter((d): d is string => d !== null)
    .sort()
  return valid.length > 0 ? valid[valid.length - 1] : new Date().toISOString().slice(0, 10)
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL || 'https://hypeproof-ai.xyz'

  // Main routes only. Individual columns / research / novels / creators are
  // discovered via in-page internal links (list pages, Related* components,
  // breadcrumbs, footer). Keeps the sitemap small and strictly XSD-compliant.
  const latestColumnDate = latestContentDate([
    ...getAllColumns('ko').map(c => c.frontmatter.date),
    ...getAllColumns('en').map(c => c.frontmatter.date),
  ])
  const latestResearchDate = latestContentDate([
    ...getAllResearch('ko').map(r => r.frontmatter.date),
    ...getAllResearch('en').map(r => r.frontmatter.date),
  ])
  const latestNovelDate = latestContentDate([
    ...getAllNovels('ko').map(n => n.frontmatter.date),
    ...getAllNovels('en').map(n => n.frontmatter.date),
  ])
  const latestAnyDate = latestContentDate([latestColumnDate, latestResearchDate, latestNovelDate])

  const staticRoutes: Array<{
    path: string
    lastModified: string
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
    priority: number
  }> = [
    { path: '',              lastModified: latestAnyDate,      changeFrequency: 'daily',   priority: 1.0 },
    { path: '/columns',      lastModified: latestColumnDate,   changeFrequency: 'daily',   priority: 0.9 },
    { path: '/research',     lastModified: latestResearchDate, changeFrequency: 'daily',   priority: 0.9 },
    { path: '/novels',       lastModified: latestNovelDate,    changeFrequency: 'weekly',  priority: 0.8 },
    { path: '/creators',     lastModified: latestAnyDate,      changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/glossary',     lastModified: latestAnyDate,      changeFrequency: 'weekly',  priority: 0.6 },
    { path: '/ai-personas',  lastModified: latestAnyDate,      changeFrequency: 'weekly',  priority: 0.5 },
  ]

  return staticRoutes.map(r => ({
    url: `${siteUrl}${r.path}`,
    lastModified: toDateString(r.lastModified),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
