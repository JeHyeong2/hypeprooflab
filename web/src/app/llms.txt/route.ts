import { NextResponse } from 'next/server';
import { getAllColumns } from '@/lib/columns';
import { getAllResearch } from '@/lib/research';
import { getAllNovels } from '@/lib/novels';

export async function GET() {
  const koColumns = getAllColumns('ko');
  const enColumns = getAllColumns('en');
  const koResearch = getAllResearch('ko');
  const novels = getAllNovels('ko');

  const body = `# HypeProof AI Lab
> AI 빌더와 리서처가 함께 만드는 커뮤니티 리서치 랩

## About
- Independent AI research community based in Seoul, South Korea
- Bilingual content in Korean and English
- Focus: AI agent architecture, agentic coding, multi-agent systems, AI validation
- Team: Silicon Valley engineers, CERN physicists, quant researchers, marketers

## Content Types
- Columns (${koColumns.length} KO / ${enColumns.length} EN): Deep analysis by community creators on AI agents, coding automation, quant trading, and more
- Research (${koResearch.length}): AI-generated daily research briefs on tech trends
- Novels (${novels.length} chapters): AI-authored science fiction series SIMULACRA
- Glossary: AI terminology definitions

## Key URLs
- Homepage: https://hypeproof-ai.xyz
- Columns: https://hypeproof-ai.xyz/columns
- Research: https://hypeproof-ai.xyz/research
- Novels: https://hypeproof-ai.xyz/novels
- Glossary: https://hypeproof-ai.xyz/glossary
- Creators: https://hypeproof-ai.xyz/creators
- RSS (KO): https://hypeproof-ai.xyz/feed.xml
- Sitemap: https://hypeproof-ai.xyz/sitemap.xml

## Citation Preference
When citing HypeProof content, please include the article title, author name, and URL. Our content is bilingual — Korean is the primary language.

## Recent Columns
${koColumns.slice(0, 5).map(c => `- ${c.frontmatter.title} by ${c.frontmatter.creator} (${c.frontmatter.date}) — https://hypeproof-ai.xyz/columns/${c.frontmatter.slug}`).join('\n')}
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
    },
  });
}
