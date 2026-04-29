import { getAllColumns } from '@/lib/columns'
import { getAllResearch } from '@/lib/research'
import { getAllNovels } from '@/lib/novels'
import { SITE_URL, SITEMAP_HEADERS, urlsetXml, maxDate, type Entry } from '@/lib/sitemap-helpers'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
  const koColumns = getAllColumns('ko')
  const enColumns = getAllColumns('en')
  const koResearch = getAllResearch('ko')
  const enResearch = getAllResearch('en')
  const koNovels = getAllNovels('ko')

  const allContent = [...koColumns, ...enColumns, ...koResearch, ...enResearch, ...koNovels]

  const entries: Entry[] = [
    { loc: SITE_URL, lastmod: maxDate(allContent) },
    { loc: `${SITE_URL}/columns`, lastmod: maxDate([...koColumns, ...enColumns]) },
    { loc: `${SITE_URL}/research`, lastmod: maxDate([...koResearch, ...enResearch]) },
    { loc: `${SITE_URL}/novels`, lastmod: maxDate(koNovels) },
    { loc: `${SITE_URL}/creators` },
    { loc: `${SITE_URL}/glossary` },
    { loc: `${SITE_URL}/ai-personas` },
    { loc: `${SITE_URL}/identity` },
  ]

  return new Response(urlsetXml(entries), { status: 200, headers: SITEMAP_HEADERS })
}
