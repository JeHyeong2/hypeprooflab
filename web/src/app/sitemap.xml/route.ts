import { getAllColumns, getAvailableLocalesForSlug as getColumnLocales } from '@/lib/columns'
import { getAllResearch, getAvailableLocalesForResearchSlug } from '@/lib/research'
import { getAllNovels } from '@/lib/novels'

// Route handler (not Metadata Route) — guarantees Content-Type: application/xml
// even on transient build/ISR fallbacks. Search Console reported
// "Incorrect http header content-type: text/html" against the previous
// Metadata Route implementation; explicit Response() headers fix it.
export const dynamic = 'force-static'
export const revalidate = 3600

const SITE_URL = process.env.SITE_URL || 'https://hypeproof-ai.xyz'

type Item = { frontmatter: { date?: string; updated?: string; slug?: string }; slug: string }
type Entry = {
  loc: string
  lastmod?: Date
  alternates?: Record<string, string>
}

function lastmodFromContent(item: Item): Date | undefined {
  const raw = item.frontmatter.updated || item.frontmatter.date
  if (!raw) return undefined
  const d = new Date(raw)
  return isNaN(d.getTime()) ? undefined : d
}

function maxDate(items: Item[]): Date | undefined {
  const dates = items.map(lastmodFromContent).filter((d): d is Date => d !== undefined)
  if (!dates.length) return undefined
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function entryToXml(e: Entry): string {
  const parts: string[] = ['<url>']
  parts.push(`<loc>${escapeXml(e.loc)}</loc>`)
  if (e.lastmod) {
    parts.push(`<lastmod>${e.lastmod.toISOString()}</lastmod>`)
  }
  if (e.alternates) {
    for (const [lang, href] of Object.entries(e.alternates)) {
      parts.push(
        `<xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}"/>`,
      )
    }
  }
  parts.push('</url>')
  return parts.join('')
}

function buildEntries(): Entry[] {
  const koColumns = getAllColumns('ko')
  const enColumns = getAllColumns('en')
  const koResearch = getAllResearch('ko')
  const enResearch = getAllResearch('en')
  const koNovels = getAllNovels('ko')

  const allContent: Item[] = [
    ...koColumns,
    ...enColumns,
    ...koResearch,
    ...enResearch,
    ...koNovels,
  ]

  const staticEntries: Entry[] = [
    { loc: SITE_URL, lastmod: maxDate(allContent) },
    { loc: `${SITE_URL}/columns`, lastmod: maxDate([...koColumns, ...enColumns]) },
    { loc: `${SITE_URL}/research`, lastmod: maxDate([...koResearch, ...enResearch]) },
    { loc: `${SITE_URL}/novels`, lastmod: maxDate(koNovels) },
    { loc: `${SITE_URL}/creators` },
    { loc: `${SITE_URL}/glossary` },
    { loc: `${SITE_URL}/ai-personas` },
    { loc: `${SITE_URL}/identity` },
  ]

  const koColumnSlugs = new Set(koColumns.map(c => c.slug))
  const columnEntries: Entry[] = koColumns.map(c => {
    const locales = getColumnLocales(c.slug)
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

  const enOnlyColumnEntries: Entry[] = enColumns
    .filter(c => !koColumnSlugs.has(c.slug))
    .map(c => ({
      loc: `${SITE_URL}/columns/${c.slug}?lang=en`,
      lastmod: lastmodFromContent(c),
    }))

  const koResearchSlugs = new Set(koResearch.map(r => r.slug))
  const researchEntries: Entry[] = koResearch.map(r => {
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

  const enOnlyResearchEntries: Entry[] = enResearch
    .filter(r => !koResearchSlugs.has(r.slug))
    .map(r => ({
      loc: `${SITE_URL}/research/${r.slug}?lang=en`,
      lastmod: lastmodFromContent(r),
    }))

  const novelEntries: Entry[] = koNovels.map(n => ({
    loc: `${SITE_URL}/novels/${n.slug}`,
    lastmod: lastmodFromContent(n),
  }))

  return [
    ...staticEntries,
    ...columnEntries,
    ...enOnlyColumnEntries,
    ...researchEntries,
    ...enOnlyResearchEntries,
    ...novelEntries,
  ]
}

export async function GET() {
  const entries = buildEntries()
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    entries.map(entryToXml).join('\n') +
    `\n</urlset>\n`

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, must-revalidate',
      'X-Robots-Tag': 'noindex',
    },
  })
}
