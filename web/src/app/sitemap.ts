import { MetadataRoute } from 'next'
import { getAllColumns } from '@/lib/columns'

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
  ]
  
  // Add column pages from MD files
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
  
  return [...staticPages, ...columnPages]
}
