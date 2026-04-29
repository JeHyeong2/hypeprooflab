import { getAllColumns } from '@/lib/columns'
import { getAllResearch } from '@/lib/research'
import { getAllNovels } from '@/lib/novels'
import {
  SITE_URL,
  SITEMAP_HEADERS,
  sitemapindexXml,
  maxDate,
  type SitemapRef,
} from '@/lib/sitemap-helpers'

// Sitemap Index — points to one sub-sitemap per content type so future growth
// (>1,000 URLs, multi-MB) doesn't require a structural change. Search Console
// auto-discovers the sub-sitemaps from this index.
//
// Total URL count today is ~117 — well under the 50,000 single-sitemap limit.
// Splitting now is a deliberate forward-compatibility choice, not a necessity.
export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  const koColumns = getAllColumns('ko')
  const enColumns = getAllColumns('en')
  const koResearch = getAllResearch('ko')
  const enResearch = getAllResearch('en')
  const koNovels = getAllNovels('ko')

  const refs: SitemapRef[] = [
    { loc: `${SITE_URL}/sitemap-static.xml` },
    {
      loc: `${SITE_URL}/sitemap-columns.xml`,
      lastmod: maxDate([...koColumns, ...enColumns]),
    },
    {
      loc: `${SITE_URL}/sitemap-research.xml`,
      lastmod: maxDate([...koResearch, ...enResearch]),
    },
    {
      loc: `${SITE_URL}/sitemap-novels.xml`,
      lastmod: maxDate(koNovels),
    },
  ]

  return new Response(sitemapindexXml(refs), { status: 200, headers: SITEMAP_HEADERS })
}
