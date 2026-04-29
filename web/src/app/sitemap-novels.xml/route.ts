import { getAllNovels } from '@/lib/novels'
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
  const koNovels = getAllNovels('ko')

  const entries: Entry[] = koNovels.map(n => ({
    loc: `${SITE_URL}/novels/${n.slug}`,
    lastmod: lastmodFromContent(n),
  }))

  return new Response(urlsetXml(entries), { status: 200, headers: SITEMAP_HEADERS })
}
