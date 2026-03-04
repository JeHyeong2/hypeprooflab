import { getResearch, getAllResearch, getAvailableLocalesForResearchSlug } from '@/lib/research';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ColumnContent from '@/app/columns/[slug]/ColumnContent';
import { Footer } from '@/components/layout/Footer';
import ViewCounter from '@/components/ViewCounter';
import AuthButton from '@/components/auth/AuthButton';
import ShareButtons from '@/components/ShareButtons';
import ResearchInteractive from './ResearchInteractive';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
  const koSlugs = getAllResearch('ko').map(r => ({ slug: r.slug }));
  const enSlugs = getAllResearch('en').map(r => ({ slug: r.slug }));
  const allSlugs = [...koSlugs, ...enSlugs];
  const unique = Array.from(new Map(allSlugs.map(s => [s.slug, s])).values());
  return unique;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const research = getResearch(slug, locale) || getResearch(slug, locale === 'ko' ? 'en' : 'ko');
  if (!research) return {};
  const fm = research.frontmatter;
  const availableLocales = getAvailableLocalesForResearchSlug(slug);
  const baseUrl = 'https://hypeproof-ai.xyz';
  const researchUrl = `${baseUrl}/research/${slug}`;

  const alternatesLanguages: Record<string, string> = {};
  if (availableLocales.includes('ko')) alternatesLanguages['ko'] = `${researchUrl}?lang=ko`;
  if (availableLocales.includes('en')) alternatesLanguages['en'] = `${researchUrl}?lang=en`;
  alternatesLanguages['x-default'] = researchUrl;

  return {
    title: fm.title,
    description: fm.excerpt,
    alternates: {
      canonical: researchUrl,
      languages: alternatesLanguages,
    },
    openGraph: {
      title: fm.title,
      description: fm.excerpt,
      type: 'article',
      publishedTime: fm.date,
      authors: [fm.creator || ''],
      tags: fm.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: fm.title,
      description: fm.excerpt,
    },
  };
}

export default async function ResearchDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';

  const research = getResearch(slug, locale) || getResearch(slug, locale === 'ko' ? 'en' : 'ko');
  if (!research) notFound();

  const availableLocales = getAvailableLocalesForResearchSlug(slug);
  const { frontmatter, content } = research;
  const currentLocale = research.locale;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300" style={{ scrollBehavior: 'smooth' }}>
      {/* Interactive reading progress + locale switcher */}
      <ResearchInteractive slug={slug} availableLocales={availableLocales} currentLocale={currentLocale} />

      {/* Sticky compact nav */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50" aria-label="Research navigation">
        <div className="max-w-[680px] mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">HypeProof AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
              <Link href="/research" className="hover:text-white transition-colors">
                {currentLocale === 'ko' ? '리서치' : 'Research'}
              </Link>
              <span className="text-zinc-600">›</span>
              <span className="text-zinc-300 truncate max-w-[200px]">{frontmatter.title}</span>
            </div>

            <Link
              href="/research"
              className="sm:hidden text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {currentLocale === 'ko' ? '모든 리서치' : 'All Research'}
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-[680px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Category + AI badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-cyan-400 uppercase tracking-wider font-medium">
            {frontmatter.category}
          </span>
          {frontmatter.authorType === 'ai' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
              AI Generated
            </span>
          )}
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
            {frontmatter.creatorImage ? (
              <Image
                src={frontmatter.creatorImage}
                alt={frontmatter.creator || ''}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {(frontmatter.creator || '?')[0]}
              </div>
            )}
          </div>
          <div>
            <div className="text-white font-medium">{frontmatter.creator}</div>
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

        {/* Reuse ColumnContent for markdown rendering */}
        <ColumnContent content={content} locale={currentLocale} />

        {/* Share buttons */}
        <ShareButtons
          url={`https://hypeproof-ai.xyz/research/${slug}`}
          title={frontmatter.title}
          locale={currentLocale}
        />

        {/* Client-side interactive: Like, Bookmark, Comments */}
        <ResearchInteractive slug={slug} availableLocales={availableLocales} currentLocale={currentLocale} showEngagement />

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
            href="/research"
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
          >
            {currentLocale === 'ko' ? '← 모든 리서치로 돌아가기' : '← Back to all research'}
          </Link>
        </div>
      </article>
      <Footer />
    </div>
  );
}
