import { MetadataRoute } from 'next'
import { getAllColumns, getAvailableLocalesForSlug } from '@/lib/columns'
import { getAllResearch, getAvailableLocalesForResearchSlug } from '@/lib/research'
import { getAllNovels, getAvailableLocalesForSlug as getNovelLocales } from '@/lib/novels'
import { getAllMembers, FALLBACK_MEMBERS } from '@/lib/members'

function safeDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hypeproof-ai.xyz'
  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/columns`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/novels`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ai-personas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]
  
  // Column pages with hreflang alternates
  const koColumns = getAllColumns('ko')
  const enColumns = getAllColumns('en')
  const columnPages: MetadataRoute.Sitemap = []
  const seenSlugs = new Set<string>()
  
  for (const col of [...koColumns, ...enColumns]) {
    const slug = col.frontmatter.slug
    if (seenSlugs.has(slug)) continue
    seenSlugs.add(slug)

    const locales = getAvailableLocalesForSlug(slug)
    const alternates: Record<string, string> = {}
    if (locales.includes('ko')) alternates['ko'] = `${baseUrl}/columns/${slug}?lang=ko`
    if (locales.includes('en')) alternates['en'] = `${baseUrl}/columns/${slug}?lang=en`

    columnPages.push({
      url: `${baseUrl}/columns/${slug}`,
      lastModified: safeDate(col.frontmatter.date),
      changeFrequency: 'monthly',
      priority: 0.7,
      ...(locales.length > 1 ? {
        alternates: {
          languages: alternates,
        },
      } : {}),
    })
  }
  
  // Research pages
  const koResearch = getAllResearch('ko')
  const enResearch = getAllResearch('en')
  const researchPages: MetadataRoute.Sitemap = []
  const seenResearchSlugs = new Set<string>()

  for (const res of [...koResearch, ...enResearch]) {
    const slug = res.slug || res.frontmatter.slug
    if (!slug || seenResearchSlugs.has(slug)) continue
    seenResearchSlugs.add(slug)

    const locales = getAvailableLocalesForResearchSlug(slug)
    const alternates: Record<string, string> = {}
    if (locales.includes('ko')) alternates['ko'] = `${baseUrl}/research/${slug}?lang=ko`
    if (locales.includes('en')) alternates['en'] = `${baseUrl}/research/${slug}?lang=en`

    researchPages.push({
      url: `${baseUrl}/research/${slug}`,
      lastModified: safeDate(res.frontmatter.date),
      changeFrequency: 'monthly',
      priority: 0.7,
      ...(locales.length > 1 ? {
        alternates: {
          languages: alternates,
        },
      } : {}),
    })
  }

  // Novel pages
  const koNovels = getAllNovels('ko')
  const enNovels = getAllNovels('en')
  const novelPages: MetadataRoute.Sitemap = []
  const seenNovelSlugs = new Set<string>()
  
  for (const novel of [...koNovels, ...enNovels]) {
    const slug = novel.frontmatter.slug
    if (seenNovelSlugs.has(slug)) continue
    seenNovelSlugs.add(slug)

    const locales = getNovelLocales(slug)
    const alternates: Record<string, string> = {}
    if (locales.includes('ko')) alternates['ko'] = `${baseUrl}/novels/${slug}?lang=ko`
    if (locales.includes('en')) alternates['en'] = `${baseUrl}/novels/${slug}?lang=en`

    novelPages.push({
      url: `${baseUrl}/novels/${slug}`,
      lastModified: safeDate(novel.frontmatter.date),
      changeFrequency: 'monthly',
      priority: 0.6,
      ...(locales.length > 1 ? {
        alternates: {
          languages: alternates,
        },
      } : {}),
    })
  }

  // Creator pages — skip members whose displayName has no ASCII alphanumerics
  // (e.g. Korean-only names slugify to empty), which would otherwise create
  // duplicate /creators/ entries in the sitemap.
  const members = getAllMembers()
  const creatorList = (members.length > 0 ? members : FALLBACK_MEMBERS)
    .filter(m => m.role === 'admin' || m.role === 'creator')
  const creatorPages: MetadataRoute.Sitemap = creatorList
    .map(m => m.displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    .filter(slug => slug.length > 0)
    .map(slug => ({
      url: `${baseUrl}/creators/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

  return [...staticPages, ...columnPages, ...researchPages, ...novelPages, ...creatorPages]
}
