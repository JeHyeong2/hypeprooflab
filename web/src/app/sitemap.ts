import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hypeproof-ai.xyz'
  
  return [
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
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly', 
      priority: 0.5,
    },
    // Add dynamic column pages
    {
      url: `${baseUrl}/columns/claude-opus-4-6-alignment`,
      lastModified: new Date('2026-02-06'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/columns/openai-agents-sdk`,
      lastModified: new Date('2026-02-05'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/columns/ai-education-paradigm`,
      lastModified: new Date('2026-02-03'),
      changeFrequency: 'monthly',
      priority: 0.6,
    }
  ]
}