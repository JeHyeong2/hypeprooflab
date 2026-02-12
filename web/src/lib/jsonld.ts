import { Column, ColumnFrontmatter, Citation } from './columns';

const SITE_URL = 'https://hypeproof-ai.xyz';
const ORG_NAME = 'HypeProof AI Lab';
const ORG_DESCRIPTION = 'AI 시대의 본질을 탐구하는 독립 리서치 랩';

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    alternateName: 'HypeProof AI',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: ORG_DESCRIPTION,
    foundingDate: '2026',
    foundingLocation: { '@type': 'Place', name: 'Seoul, South Korea' },
    sameAs: [
      'https://twitter.com/hypeproofai',
      'https://github.com/hypeproofai',
    ],
  };
}

export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url: SITE_URL,
    description: ORG_DESCRIPTION,
    inLanguage: ['ko', 'en'],
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateArticleJsonLd(column: { frontmatter: ColumnFrontmatter; locale: string; slug: string }) {
  const fm = column.frontmatter;
  const url = `${SITE_URL}/columns/${column.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: fm.title,
    description: fm.excerpt,
    datePublished: fm.date,
    inLanguage: column.locale === 'ko' ? 'ko-KR' : 'en-US',
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: fm.tags?.join(', '),
    author: {
      '@type': 'Person',
      name: fm.author,
      ...(fm.authorImage ? { image: `${SITE_URL}${fm.authorImage}` } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    ...(fm.citations && fm.citations.length > 0
      ? {
          citation: fm.citations.map((c: Citation) => ({
            '@type': 'CreativeWork',
            name: c.title,
            url: c.url,
            ...(c.author ? { author: { '@type': 'Person', name: c.author } } : {}),
            ...(c.year ? { datePublished: c.year } : {}),
          })),
        }
      : {}),
  };
}

export function generateCollectionJsonLd(columns: { frontmatter: ColumnFrontmatter; slug: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Columns | HypeProof AI Lab',
    description: 'Deep analysis, research insights, and sharp takes on AI, technology, and the future.',
    url: `${SITE_URL}/columns`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: columns.length,
      itemListElement: columns.map((col, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/columns/${col.slug}`,
        name: col.frontmatter.title,
      })),
    },
  };
}
