import { MetadataRoute } from 'next'
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
  const baseUrl = 'https://hypeproof-ai.xyz'

  // We intentionally list only main routes. Individual columns / research /
  // novels / creators are discovered via in-page internal links (list pages,
  // Related* components, breadcrumbs, footer). This keeps the sitemap small,
  // strictly XSD-compliant, and easy for Search Console to consume.
  const columnDates = [
    ...getAllColumns('ko').map(c => c.frontmatter.date),
    ...getAllColumns('en').map(c => c.frontmatter.date),
  ]
  const researchDates = [
    ...getAllResearch('ko').map(r => r.frontmatter.date),
    ...getAllResearch('en').map(r => r.frontmatter.date),
  ]
  const novelDates = [
    ...getAllNovels('ko').map(n => n.frontmatter.date),
    ...getAllNovels('en').map(n => n.frontmatter.date),
  ]

  const latestColumnDate = latestContentDate(columnDates)
  const latestResearchDate = latestContentDate(researchDates)
  const latestNovelDate = latestContentDate(novelDates)
  const latestAnyDate = latestContentDate([latestColumnDate, latestResearchDate, latestNovelDate])

  return [
    {
      url: baseUrl,
      lastModified: toDateString(latestAnyDate),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/columns`,
      lastModified: toDateString(latestColumnDate),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: toDateString(latestResearchDate),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/novels`,
      lastModified: toDateString(latestNovelDate),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: toDateString(latestAnyDate),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: toDateString(latestAnyDate),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ai-personas`,
      lastModified: toDateString(latestAnyDate),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]
}
