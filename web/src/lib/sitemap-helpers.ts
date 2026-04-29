// Shared utilities for sitemap route handlers.
// All five sitemap routes (index + 4 sub-sitemaps) import from here so XML
// shape, escaping, and response headers stay identical.

export const SITE_URL = process.env.SITE_URL || 'https://hypeproof-ai.xyz'

export type Item = {
  frontmatter: { date?: string; updated?: string; slug?: string }
  slug: string
}

export type Entry = {
  loc: string
  lastmod?: Date
  alternates?: Record<string, string>
}

export function lastmodFromContent(item: Item): Date | undefined {
  const raw = item.frontmatter.updated || item.frontmatter.date
  if (!raw) return undefined
  const d = new Date(raw)
  return isNaN(d.getTime()) ? undefined : d
}

export function maxDate(items: Item[]): Date | undefined {
  const dates = items.map(lastmodFromContent).filter((d): d is Date => d !== undefined)
  if (!dates.length) return undefined
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function entryToXml(e: Entry): string {
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

export function urlsetXml(entries: Entry[]): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    entries.map(entryToXml).join('\n') +
    `\n</urlset>\n`
  )
}

export type SitemapRef = {
  loc: string
  lastmod?: Date
}

export function sitemapindexXml(refs: SitemapRef[]): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    refs
      .map(r => {
        const parts = ['<sitemap>', `<loc>${escapeXml(r.loc)}</loc>`]
        if (r.lastmod) parts.push(`<lastmod>${r.lastmod.toISOString()}</lastmod>`)
        parts.push('</sitemap>')
        return parts.join('')
      })
      .join('\n') +
    `\n</sitemapindex>\n`
  )
}

export const SITEMAP_HEADERS: HeadersInit = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=3600, must-revalidate',
  'X-Robots-Tag': 'noindex',
}
