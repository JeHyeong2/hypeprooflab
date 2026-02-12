import { MetadataRoute } from 'next'
import { getAllColumns } from '@/lib/columns'
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
  ]
  
  // Column pages
  const koColumns = getAllColumns('ko')
  const enColumns = getAllColumns('en')
  const columnPages: MetadataRoute.Sitemap = []
  const seenSlugs = new Set<string>()
  
  for (const col of [...koColumns, ...enColumns]) {
    const slug = col.frontmatter.slug
    if (seenSlugs.has(slug)) continue
    seenSlugs.add(slug)
    columnPages.push({
      url: `${baseUrl}/columns/${slug}`,
      lastModified: new Date(col.frontmatter.date),
      changeFrequency: 'monthly',
      priority: 0.7,
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
