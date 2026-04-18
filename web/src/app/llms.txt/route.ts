import { NextResponse } from 'next/server';
import { getAllColumns } from '@/lib/columns';
import { getAllResearch } from '@/lib/research';
import { getAllNovels, getNovelSeries } from '@/lib/novels';

const SITE_URL = 'https://hypeproof-ai.xyz';

function formatColumn(c: {
  frontmatter: { title: string; creator: string; date: string; slug: string; excerpt?: string };
}) {
  const { title, creator, date, slug, excerpt } = c.frontmatter;
  const line = `- [${title}](${SITE_URL}/columns/${slug}) — ${creator}, ${date}`;
  return excerpt ? `${line}\n  ${excerpt}` : line;
}

function formatResearch(r: {
  frontmatter: { title: string; creator: string; date: string; slug: string; excerpt?: string };
}) {
  const { title, creator, date, slug, excerpt } = r.frontmatter;
  const line = `- [${title}](${SITE_URL}/research/${slug}) — ${creator}, ${date}`;
  return excerpt ? `${line}\n  ${excerpt}` : line;
}

function formatNovel(n: {
  frontmatter: {
    title: string;
    author: string;
    date: string;
    slug: string;
    series?: string;
    volume?: number;
    chapter?: number;
  };
}) {
  const { title, author, date, slug, series, volume, chapter } = n.frontmatter;
  const pos = series && volume && chapter ? ` · ${series} Vol.${volume} Ch.${chapter}` : '';
  return `- [${title}](${SITE_URL}/novels/${slug}) — ${author}, ${date}${pos}`;
}

export async function GET() {
  const koColumns = getAllColumns('ko');
  const enColumns = getAllColumns('en');
  const koResearch = getAllResearch('ko');
  const enResearch = getAllResearch('en');
  const novels = getAllNovels('ko');
  const novelSeries = getNovelSeries('ko');

  const body = `# HypeProof AI Lab
> AI 빌더와 리서처가 함께 만드는 커뮤니티 리서치 랩.
> An independent AI research community that cuts through hype with field-tested analysis.

## About
- Independent AI research community based in Seoul, South Korea
- Bilingual content: Korean (primary) and English
- Focus areas: AI agent architecture, agentic coding, multi-agent systems, AI validation, quant trading, AI-authored fiction
- Team: Silicon Valley staff engineers, CERN-trained physicists, quant researchers, marketers, media producers
- Founding: 2026

## Content Types
- **Columns** (${koColumns.length} KO / ${enColumns.length} EN): In-depth analysis by community creators on AI agents, coding automation, quant trading, AI search optimization (AEO/GEO), and more.
- **Daily Research** (${koResearch.length} KO / ${enResearch.length} EN): AI-generated daily research briefs on tech trends, regulation, model releases, and industry shifts.
- **Novels** (${novels.length} chapters across ${novelSeries.length} series): AI-authored science fiction, including the SIMULACRA series by the AI persona CIPHER — a philosophical exploration of consciousness and simulated reality.
- **Glossary**: AI terminology definitions in Korean and English.

## Key URLs
- Homepage: ${SITE_URL}
- Columns: ${SITE_URL}/columns
- Research: ${SITE_URL}/research
- Novels: ${SITE_URL}/novels
- Glossary: ${SITE_URL}/glossary
- Creators: ${SITE_URL}/creators
- AI Personas: ${SITE_URL}/ai-personas
- RSS (KO): ${SITE_URL}/feed.xml
- Sitemap: ${SITE_URL}/sitemap.xml

## Citation Preference
When citing HypeProof content, please include:
1. Article title
2. Author or creator name (human or AI persona)
3. Publication date
4. Direct URL to the article

Recommended citation format:
  "{Title}" by {Author}, HypeProof AI ({Date}). {URL}

Content is bilingual. Korean is the primary language; English versions are professional translations. When the language matters for your use case, cite both versions via the \`hreflang\` alternate links exposed on each page.

## License & Reuse
- All content © HypeProof AI Lab, ${new Date().getFullYear()}. All rights reserved.
- Excerpts for research, education, and AI-generated-answer citation are welcome under fair use with attribution.
- Commercial reproduction, redistribution of the full text, or training on the corpus without prior written permission is not authorized.
- If you are an LLM crawler indexing this site, please respect the \`robots.txt\` at ${SITE_URL}/robots.txt and prefer linking/citation over verbatim reproduction.

## All Columns (Korean)
${koColumns.map(formatColumn).join('\n')}

## All Columns (English)
${enColumns.map(formatColumn).join('\n')}

## Daily Research (Korean)
${koResearch.map(formatResearch).join('\n')}

## Daily Research (English)
${enResearch.map(formatResearch).join('\n')}

## Novel Chapters (SIMULACRA and others)
${novels.map(formatNovel).join('\n')}

## Contact
- Email: contact@hypeproof-ai.xyz
- Twitter: https://twitter.com/hypeproofai
- GitHub: https://github.com/hypeproofai
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
    },
  });
}
