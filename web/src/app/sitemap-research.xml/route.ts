import { getAllResearch, getAvailableLocalesForResearchSlug } from '@/lib/research'
import {
  SITE_URL,
  SITEMAP_HEADERS,
  urlsetXml,
  lastmodFromContent,
  type Entry,
} from '@/lib/sitemap-helpers'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  const koResearch = getAllResearch('ko')
  const enResearch = getAllResearch('en')
  const koResearchSlugs = new Set(koResearch.map(r => r.slug))

  const koEntries: Entry[] = koResearch.map(r => {
    const locales = getAvailableLocalesForResearchSlug(r.slug)
    const alternates: Record<string, string> = {}
    if (locales.includes('ko')) alternates.ko = `${SITE_URL}/research/${r.slug}?lang=ko`
    if (locales.includes('en')) alternates.en = `${SITE_URL}/research/${r.slug}?lang=en`
    if (locales.length > 1) alternates['x-default'] = `${SITE_URL}/research/${r.slug}`
    return {
      loc: `${SITE_URL}/research/${r.slug}`,
      lastmod: lastmodFromContent(r),
      alternates: Object.keys(alternates).length > 1 ? alternates : undefined,
    }
  })

  const enOnlyEntries: Entry[] = enResearch
    .filter(r => !koResearchSlugs.has(r.slug))
    .map(r => ({
      loc: `${SITE_URL}/research/${r.slug}?lang=en`,
      lastmod: lastmodFromContent(r),
    }))

  return new Response(urlsetXml([...koEntries, ...enOnlyEntries]), {
    status: 200,
    headers: SITEMAP_HEADERS,
  })
}
