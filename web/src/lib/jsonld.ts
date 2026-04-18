import { Column, ColumnFrontmatter, Citation } from './columns';
import { ResearchFrontmatter } from './research';
import { NovelFrontmatter } from './novels';

const SITE_URL = 'https://hypeproof-ai.xyz';
const ORG_NAME = 'HypeProof AI Lab';
const ORG_DESCRIPTION = 'AI 빌더와 리서처가 함께 만드는 커뮤니티 리서치 랩';

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
    // TODO: /search 라우트 구현 시 SearchAction 복구 (현재는 엔드포인트 없음)
  };
}

export function generateArticleJsonLd(column: { frontmatter: ColumnFrontmatter; locale: string; slug: string }, availableLocales?: string[]) {
  const fm = column.frontmatter;
  const url = `${SITE_URL}/columns/${column.slug}`;
  const lang = column.locale === 'ko' ? 'ko-KR' : 'en-US';
  const altLocale = column.locale === 'ko' ? 'en' : 'ko';
  const hasTranslation = availableLocales ? availableLocales.includes(altLocale) : false;

  const translationLinks: Record<string, unknown> = {};
  if (hasTranslation) {
    const altUrl = `${url}?lang=${altLocale}`;
    const altLang = altLocale === 'ko' ? 'ko-KR' : 'en-US';
    if (column.locale === 'ko') {
      translationLinks.workTranslation = { '@type': 'ScholarlyArticle', '@id': altUrl, inLanguage: altLang, url: altUrl };
    } else {
      translationLinks.translationOfWork = { '@type': 'ScholarlyArticle', '@id': altUrl, inLanguage: altLang, url: altUrl };
    }
  }

  const schemaType = fm.articleType === 'news' ? 'NewsArticle' : 'ScholarlyArticle';

  return {
    '@context': { '@vocab': 'https://schema.org/', '@language': lang },
    '@type': schemaType,
    headline: fm.title,
    description: fm.excerpt,
    datePublished: fm.date,
    ...(fm.updated ? { dateModified: fm.updated } : {}),
    ...(fm.articleType === 'news' && fm.category ? { articleSection: fm.category } : {}),
    inLanguage: lang,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: fm.tags?.join(', '),
    author: {
      '@type': 'Person',
      name: fm.creator,
      ...((fm.creatorImage) ? { image: `${SITE_URL}${fm.creatorImage}` } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article > p:first-of-type'],
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
    ...translationLinks,
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

// ─── BreadcrumbList ────────────────────────────────────
export function generateBreadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

// ─── Research TechArticle ──────────────────────────────
export function generateResearchArticleJsonLd(
  research: { frontmatter: ResearchFrontmatter; locale: string; slug: string },
  availableLocales?: string[],
) {
  const fm = research.frontmatter;
  const url = `${SITE_URL}/research/${research.slug}`;
  const lang = research.locale === 'ko' ? 'ko-KR' : 'en-US';
  const altLocale = research.locale === 'ko' ? 'en' : 'ko';
  const hasTranslation = availableLocales ? availableLocales.includes(altLocale) : false;

  const translationLinks: Record<string, unknown> = {};
  if (hasTranslation) {
    const altUrl = `${url}?lang=${altLocale}`;
    const altLang = altLocale === 'ko' ? 'ko-KR' : 'en-US';
    if (research.locale === 'ko') {
      translationLinks.workTranslation = { '@type': 'TechArticle', '@id': altUrl, inLanguage: altLang, url: altUrl };
    } else {
      translationLinks.translationOfWork = { '@type': 'TechArticle', '@id': altUrl, inLanguage: altLang, url: altUrl };
    }
  }

  return {
    '@context': { '@vocab': 'https://schema.org/', '@language': lang },
    '@type': 'TechArticle',
    headline: fm.title,
    description: fm.excerpt,
    datePublished: fm.date,
    ...(fm.updated ? { dateModified: fm.updated } : {}),
    inLanguage: lang,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: fm.tags?.join(', '),
    author: {
      '@type': 'Person',
      name: fm.creator,
      ...(fm.creatorImage ? { image: `${SITE_URL}${fm.creatorImage}` } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article > p:first-of-type'],
    },
    ...translationLinks,
  };
}

// ─── Novel CreativeWork ────────────────────────────────
export function generateNovelJsonLd(
  novel: { frontmatter: NovelFrontmatter; locale: string; slug: string },
  availableLocales?: string[],
) {
  const fm = novel.frontmatter;
  const url = `${SITE_URL}/novels/${novel.slug}`;
  const lang = novel.locale === 'ko' ? 'ko-KR' : 'en-US';

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: fm.title,
    headline: fm.title,
    description: fm.excerpt,
    datePublished: fm.date,
    inLanguage: lang,
    url,
    genre: 'Science Fiction',
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: fm.series,
    },
    position: `Vol.${fm.volume} Ch.${fm.chapter}`,
    author: {
      '@type': 'Person',
      name: fm.author,
      ...(fm.authorImage ? { image: `${SITE_URL}${fm.authorImage}` } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article > p:first-of-type'],
    },
  };
}

// ─── FAQPage ───────────────────────────────────────────
export function generateFAQJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ─── HowTo ─────────────────────────────────────────────
export interface HowToSpec {
  name: string;
  description?: string;
  totalTime?: string; // ISO 8601 duration, e.g. "PT30M"
  steps: { name: string; text: string; url?: string }[];
}

export function generateHowToJsonLd(spec: HowToSpec) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: spec.name,
    ...(spec.description ? { description: spec.description } : {}),
    ...(spec.totalTime ? { totalTime: spec.totalTime } : {}),
    step: spec.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  };
}

// ─── QAPage ────────────────────────────────────────────
export interface QAPair {
  question: string;
  answer: string;
  answerAuthor?: string;
  upvoteCount?: number;
}

export function generateQAPageJsonLd(primary: QAPair, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: primary.question,
      text: primary.question,
      url,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: primary.answer,
        ...(primary.answerAuthor
          ? { author: { '@type': 'Person', name: primary.answerAuthor } }
          : {}),
        ...(primary.upvoteCount !== undefined
          ? { upvoteCount: primary.upvoteCount }
          : {}),
      },
    },
  };
}

// ─── Research Collection ───────────────────────────────
export function generateResearchCollectionJsonLd(
  items: { frontmatter: { title: string; slug?: string }; slug: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Research | HypeProof AI Lab',
    description: 'AI-generated daily research — tech trends, industry analysis, and insights.',
    url: `${SITE_URL}/research`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/research/${item.slug}`,
        name: item.frontmatter.title,
      })),
    },
  };
}
