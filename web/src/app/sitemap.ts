import { MetadataRoute } from 'next'
import { getAllColumns, getAvailableLocalesForSlug } from '@/lib/columns'
import { getAllNovels } from '@/lib/novels'

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
      url: `${baseUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
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
      lastModified: new Date(col.frontmatter.date),
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
    novelPages.push({
      url: `${baseUrl}/novels/${slug}`,
      lastModified: new Date(novel.frontmatter.date),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }
  
  return [...staticPages, ...columnPages, ...novelPages]
}
