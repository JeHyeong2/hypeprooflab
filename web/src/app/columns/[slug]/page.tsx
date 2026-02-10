import { getColumn, getAllColumns, getAvailableLocalesForSlug } from '@/lib/columns';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ColumnArticle from './ColumnArticle';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
  const koSlugs = getAllColumns('ko').map(c => ({ slug: c.frontmatter.slug }));
  const enSlugs = getAllColumns('en').map(c => ({ slug: c.frontmatter.slug }));
  const allSlugs = [...koSlugs, ...enSlugs];
  const unique = Array.from(new Map(allSlugs.map(s => [s.slug, s])).values());
  return unique;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const column = getColumn(slug, locale) || getColumn(slug, locale === 'ko' ? 'en' : 'ko');
  if (!column) return {};
  const fm = column.frontmatter;
  return {
    title: fm.title,
    description: fm.excerpt,
    openGraph: {
      title: fm.title,
      description: fm.excerpt,
      type: 'article',
      publishedTime: fm.date,
      authors: [fm.author],
      tags: fm.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: fm.title,
      description: fm.excerpt,
    },
  };
}

export default async function ColumnPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  
  const column = getColumn(slug, locale) || getColumn(slug, locale === 'ko' ? 'en' : 'ko');
  if (!column) notFound();
  
  const availableLocales = getAvailableLocalesForSlug(slug);
  
  return <ColumnArticle column={column} slug={slug} availableLocales={availableLocales} />;
}
