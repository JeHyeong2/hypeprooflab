import { getAllColumns } from '@/lib/columns';
import { getAllNovels } from '@/lib/novels';

export async function GET() {
  const baseUrl = 'https://hypeproof-ai.xyz';
  const columns = getAllColumns('ko');
  const novels = getAllNovels('ko');

  const items = [
    ...columns.map(c => ({
      title: c.frontmatter.title,
      link: `${baseUrl}/columns/${c.frontmatter.slug}`,
      description: c.frontmatter.excerpt,
      pubDate: new Date(c.frontmatter.date).toUTCString(),
      author: c.frontmatter.creator || '',
      category: c.frontmatter.category,
      tags: c.frontmatter.tags || [],
    })),
    ...novels.map(n => ({
      title: `[${n.frontmatter.series}] ${n.frontmatter.title}`,
      link: `${baseUrl}/novels/${n.frontmatter.slug}`,
      description: n.frontmatter.excerpt,
      pubDate: new Date(n.frontmatter.date).toUTCString(),
      author: n.frontmatter.author,
      category: 'Novel',
      tags: [] as string[],
    })),
  ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>HypeProof AI Lab</title>
    <link>${baseUrl}</link>
    <description>AI 시대의 본질을 탐구하는 독립 리서치 랩 — Deep research, columns, and practical AI insights.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>HypeProof AI Lab</title>
      <link>${baseUrl}</link>
    </image>
    ${items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <dc:creator><![CDATA[${item.author}]]></dc:creator>
      <category><![CDATA[${item.category}]]></category>${item.tags.map(tag => `
      <category><![CDATA[${tag}]]></category>`).join('')}
      <guid isPermaLink="true">${item.link}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
    },
  });
}
