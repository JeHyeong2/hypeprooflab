import type { MetadataRoute } from 'next'
import { getAllColumns, getAvailableLocalesForSlug as getColumnLocales } from '@/lib/columns'
import { getAllResearch, getAvailableLocalesForResearchSlug } from '@/lib/research'
import { getAllNovels } from '@/lib/novels'

export const revalidate = 3600

const SITE_URL = process.env.SITE_URL || 'https://hypeproof-ai.xyz'

type Item = { frontmatter: { date?: string; updated?: string; slug?: string }; slug: string }

function lastmodFromContent(item: Item): Date | undefined {
  const raw = item.frontmatter.updated || item.frontmatter.date
  if (!raw) return undefined
  const d = new Date(raw)
  return isNaN(d.getTime()) ? undefined : d
}

function maxDate(items: Item[]): Date | undefined {
  const dates = items.map(lastmodFromContent).filter((d): d is Date => d !== undefined)
  if (!dates.length) return undefined
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const koColumns = getAllColumns('ko')
  const enColumns = getAllColumns('en')
  const koResearch = getAllResearch('ko')
  const enResearch = getAllResearch('en')
  const koNovels = getAllNovels('ko')

  const allContent: Item[] = [
    ...koColumns,
    ...enColumns,
    ...koResearch,
    ...enResearch,
    ...koNovels,
  ]

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: maxDate(allContent) },
    { url: `${SITE_URL}/columns`, lastModified: maxDate([...koColumns, ...enColumns]) },
    { url: `${SITE_URL}/research`, lastModified: maxDate([...koResearch, ...enResearch]) },
    { url: `${SITE_URL}/novels`, lastModified: maxDate(koNovels) },
    { url: `${SITE_URL}/creators` },
    { url: `${SITE_URL}/glossary` },
    { url: `${SITE_URL}/ai-personas` },
    { url: `${SITE_URL}/identity` },
  ]

  const koColumnSlugs = new Set(koColumns.map(c => c.slug))
  const columnRoutes: MetadataRoute.Sitemap = koColumns.map(c => {
    const locales = getColumnLocales(c.slug)
    const languages: Record<string, string> = {}
    if (locales.includes('ko')) languages.ko = `${SITE_URL}/columns/${c.slug}?lang=ko`
    if (locales.includes('en')) languages.en = `${SITE_URL}/columns/${c.slug}?lang=en`
    return {
      url: `${SITE_URL}/columns/${c.slug}`,
      lastModified: lastmodFromContent(c),
      alternates: Object.keys(languages).length > 1 ? { languages } : undefined,
    }
  })

  const enOnlyColumnRoutes: MetadataRoute.Sitemap = enColumns
    .filter(c => !koColumnSlugs.has(c.slug))
    .map(c => ({
      url: `${SITE_URL}/columns/${c.slug}?lang=en`,
      lastModified: lastmodFromContent(c),
    }))

  const koResearchSlugs = new Set(koResearch.map(r => r.slug))
  const researchRoutes: MetadataRoute.Sitemap = koResearch.map(r => {
    const locales = getAvailableLocalesForResearchSlug(r.slug)
    const languages: Record<string, string> = {}
    if (locales.includes('ko')) languages.ko = `${SITE_URL}/research/${r.slug}?lang=ko`
    if (locales.includes('en')) languages.en = `${SITE_URL}/research/${r.slug}?lang=en`
    return {
      url: `${SITE_URL}/research/${r.slug}`,
      lastModified: lastmodFromContent(r),
      alternates: Object.keys(languages).length > 1 ? { languages } : undefined,
    }
  })

  const enOnlyResearchRoutes: MetadataRoute.Sitemap = enResearch
    .filter(r => !koResearchSlugs.has(r.slug))
    .map(r => ({
      url: `${SITE_URL}/research/${r.slug}?lang=en`,
      lastModified: lastmodFromContent(r),
    }))

  const novelRoutes: MetadataRoute.Sitemap = koNovels.map(n => ({
    url: `${SITE_URL}/novels/${n.slug}`,
    lastModified: lastmodFromContent(n),
  }))

  return [
    ...staticRoutes,
    ...columnRoutes,
    ...enOnlyColumnRoutes,
    ...researchRoutes,
    ...enOnlyResearchRoutes,
    ...novelRoutes,
  ]
}
