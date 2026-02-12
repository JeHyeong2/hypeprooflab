import { getNovel, getAllNovels, getAvailableLocalesForSlug, getNovelsBySeries, getNextChapter, getPreviousChapter } from '@/lib/novels';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import NovelArticle from './NovelArticle';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
  const koSlugs = getAllNovels('ko').map(n => ({ slug: n.frontmatter.slug }));
  const enSlugs = getAllNovels('en').map(n => ({ slug: n.frontmatter.slug }));
  const allSlugs = [...koSlugs, ...enSlugs];
  const unique = Array.from(new Map(allSlugs.map(s => [s.slug, s])).values());
  return unique;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const novel = getNovel(slug, locale) || getNovel(slug, locale === 'ko' ? 'en' : 'ko');
  if (!novel) return {};
  const fm = novel.frontmatter;
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

export default async function NovelPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  
  const novel = getNovel(slug, locale) || getNovel(slug, locale === 'ko' ? 'en' : 'ko');
  if (!novel) notFound();
  
  const availableLocales = getAvailableLocalesForSlug(slug);
  const seriesNovels = getNovelsBySeries(novel.frontmatter.series, novel.locale);
  const nextChapter = getNextChapter(slug, novel.locale);
  const previousChapter = getPreviousChapter(slug, novel.locale);
  
  return (
    <NovelArticle 
      novel={novel} 
      slug={slug} 
      availableLocales={availableLocales}
      seriesNovels={seriesNovels}
      nextChapter={nextChapter}
      previousChapter={previousChapter}
    />
  );
}