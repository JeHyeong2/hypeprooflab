import { getColumn, getAllColumns, getAvailableLocalesForSlug } from '@/lib/columns';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ColumnContent from './ColumnContent';
import ColumnInteractive from './ColumnInteractive';
import { Footer } from '@/components/layout/Footer';
import ViewCounter from '@/components/ViewCounter';
import AuthButton from '@/components/auth/AuthButton';
import ShareButtons from '@/components/ShareButtons';
import { generateArticleJsonLd } from '@/lib/jsonld';

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
  const { frontmatter, content } = column;
  const currentLocale = column.locale;

  const articleJsonLd = generateArticleJsonLd(column);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300" style={{ scrollBehavior: 'smooth' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Interactive reading progress + locale switcher */}
      <ColumnInteractive slug={slug} availableLocales={availableLocales} currentLocale={currentLocale} />

      {/* Sticky compact nav */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50" aria-label="Column navigation">
        <div className="max-w-[680px] mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">HypeProof AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
              <Link href="/columns" className="hover:text-white transition-colors">
                {currentLocale === 'ko' ? '칼럼' : 'Columns'}
              </Link>
              <span className="text-zinc-600">›</span>
              <span className="text-zinc-300 truncate max-w-[200px]">{frontmatter.title}</span>
            </div>

            <Link
              href="/columns"
              className="sm:hidden text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {currentLocale === 'ko' ? '모든 칼럼' : 'All Columns'}
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Article - server rendered */}
      <article className="max-w-[680px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6">
          <span className="text-sm text-purple-400 uppercase tracking-wider font-medium">
            {frontmatter.category}
          </span>
        </div>

        <h1 className={`font-bold text-white mb-6 ${
          currentLocale === 'ko'
            ? 'text-2xl sm:text-3xl md:text-[32px] tracking-[0.03em] leading-[1.4]'
            : 'text-2xl sm:text-3xl md:text-[32px] tracking-[0.01em] leading-[1.3]'
        }`}>
          {frontmatter.title}
        </h1>

        <p className={`text-zinc-400 mb-8 ${
          currentLocale === 'ko'
            ? 'text-lg leading-[1.8] tracking-[0.03em]'
            : 'text-lg leading-[1.7] tracking-[0.01em]'
        }`}>
          {frontmatter.excerpt}
        </p>

        <div className="flex items-center gap-4 mb-10 pb-10 border-b border-zinc-800">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
            {frontmatter.authorImage ? (
              <Image
                src={frontmatter.authorImage}
                alt={frontmatter.author}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {frontmatter.author[0]}
              </div>
            )}
          </div>
          <div>
            <div className="text-white font-medium">{frontmatter.author}</div>
            <div className="text-zinc-500 text-sm">
              <time dateTime={frontmatter.date}>
                {new Date(frontmatter.date).toLocaleDateString(
                  currentLocale === 'ko' ? 'ko-KR' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </time>
              {' · '}
              {frontmatter.readTime} {currentLocale === 'ko' ? '읽기' : 'read'}
              {' · '}
              <ViewCounter slug={slug} trackView={true} />
            </div>
          </div>
        </div>

        {/* Server-rendered markdown content */}
        <ColumnContent content={content} locale={currentLocale} />

        {/* Share buttons */}
        <ShareButtons
          url={`https://hypeproof-ai.xyz/columns/${slug}`}
          title={frontmatter.title}
          locale={currentLocale}
        />

        {/* Client-side interactive: Like, Bookmark, Comments */}
        <ColumnInteractive slug={slug} availableLocales={availableLocales} currentLocale={currentLocale} showEngagement />

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-wrap gap-2">
            {frontmatter.tags?.map((tag: string) => (
              <span key={tag} className="px-3 py-1 text-xs text-zinc-400 bg-zinc-900 rounded-full border border-zinc-800">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/columns"
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
          >
            {currentLocale === 'ko' ? '← 모든 칼럼으로 돌아가기' : '← Back to all columns'}
          </Link>
        </div>
      </article>
      <Footer />
    </div>
  );
}
