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
      author: c.frontmatter.author,
    })),
    ...novels.map(n => ({
      title: `[${n.frontmatter.series}] ${n.frontmatter.title}`,
      link: `${baseUrl}/novels/${n.frontmatter.slug}`,
      description: n.frontmatter.excerpt,
      pubDate: new Date(n.frontmatter.date).toUTCString(),
      author: n.frontmatter.author,
    })),
  ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HypeProof AI</title>
    <link>${baseUrl}</link>
    <description>Deep research, columns, and practical AI insights.</description>
    <language>ko</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <author>${item.author}</author>
      <guid>${item.link}</guid>
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
