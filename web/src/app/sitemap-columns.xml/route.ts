import { getAllColumns, getAvailableLocalesForSlug } from '@/lib/columns'
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
  const koColumns = getAllColumns('ko')
  const enColumns = getAllColumns('en')
  const koColumnSlugs = new Set(koColumns.map(c => c.slug))

  const koEntries: Entry[] = koColumns.map(c => {
    const locales = getAvailableLocalesForSlug(c.slug)
    const alternates: Record<string, string> = {}
    if (locales.includes('ko')) alternates.ko = `${SITE_URL}/columns/${c.slug}?lang=ko`
    if (locales.includes('en')) alternates.en = `${SITE_URL}/columns/${c.slug}?lang=en`
    if (locales.length > 1) alternates['x-default'] = `${SITE_URL}/columns/${c.slug}`
    return {
      loc: `${SITE_URL}/columns/${c.slug}`,
      lastmod: lastmodFromContent(c),
      alternates: Object.keys(alternates).length > 1 ? alternates : undefined,
    }
  })

  const enOnlyEntries: Entry[] = enColumns
    .filter(c => !koColumnSlugs.has(c.slug))
    .map(c => ({
      loc: `${SITE_URL}/columns/${c.slug}?lang=en`,
      lastmod: lastmodFromContent(c),
    }))

  return new Response(urlsetXml([...koEntries, ...enOnlyEntries]), {
    status: 200,
    headers: SITEMAP_HEADERS,
  })
}
