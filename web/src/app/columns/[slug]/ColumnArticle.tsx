'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import type { Column } from '@/lib/columns';
import { Footer } from '@/components/layout/Footer';
import ViewCounter from '@/components/ViewCounter';
import AuthButton from '@/components/auth/AuthButton';
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import CommentSection from '@/components/CommentSection';

interface Props {
  column: Column;
  slug: string;
  availableLocales: string[];
}

export default function ColumnArticle({ column, slug, availableLocales }: Props) {
  const router = useRouter();
  const currentLocale = column.locale;
  
  const [readProgress, setReadProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { frontmatter, content } = column;
  
  const switchLocale = (locale: string) => {
    router.push(`/columns/${slug}?lang=${locale}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300" style={{ scrollBehavior: 'smooth' }}>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
        <div
          className="h-full bg-purple-500 transition-[width] duration-100"
          style={{ width: `${readProgress}%` }}
        />
      </div>
      
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
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
              <Link href="/columns" className="hover:text-white transition-colors">
                {currentLocale === 'ko' ? '칼럼' : 'Columns'}
              </Link>
              <span className="text-zinc-600">›</span>
              <span className="text-zinc-300 truncate max-w-[200px]">{frontmatter.title}</span>
            </div>

            {/* Language toggle */}
            {availableLocales.length > 1 && (
              <div className="flex items-center gap-1 text-sm">
                {availableLocales.map((locale, i) => (
                  <React.Fragment key={locale}>
                    {i > 0 && <span className="text-zinc-600">|</span>}
                    <button
                      onClick={() => switchLocale(locale)}
                      aria-label={`Switch to ${locale === 'ko' ? 'Korean' : 'English'}`}
                      lang={locale}
                      className={`px-2 py-1 rounded transition-colors ${
                        currentLocale === locale
                          ? 'text-white font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {locale.toUpperCase()}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
            
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
      
      {/* Article */}
      <article className="max-w-[680px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Category */}
        <div className="mb-6">
          <span className="text-sm text-purple-400 uppercase tracking-wider font-medium">
            {frontmatter.category}
          </span>
        </div>
        
        {/* Title */}
        <h1 className={`font-bold text-white mb-6 ${
          currentLocale === 'ko' 
            ? 'text-2xl sm:text-3xl md:text-[32px] tracking-[0.03em] leading-[1.4]' 
            : 'text-2xl sm:text-3xl md:text-[32px] tracking-[0.01em] leading-[1.3]'
        }`}>
          {frontmatter.title}
        </h1>
        
        {/* Excerpt */}
        <p className={`text-zinc-400 mb-8 ${
          currentLocale === 'ko'
            ? 'text-lg leading-[1.8] tracking-[0.03em]'
            : 'text-lg leading-[1.7] tracking-[0.01em]'
        }`}>
          {frontmatter.excerpt}
        </p>
        
        {/* Author block */}
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
        
        {/* Content */}
        <div
          className={`column-content prose prose-invert max-w-none ${
            currentLocale === 'ko'
              ? 'text-[18px] leading-[32px] tracking-[0.03em] md:text-[18px] md:leading-[32px]'
              : 'text-[18px] leading-[30px] tracking-[0.01em] md:text-[18px] md:leading-[30px]'
          } text-zinc-300 prose-headings:text-white prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-10 prose-h3:mb-4 prose-strong:text-white prose-strong:font-semibold prose-blockquote:border-l-2 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:my-8 prose-blockquote:text-zinc-300 prose-blockquote:italic prose-blockquote:text-lg prose-hr:border-zinc-800 prose-hr:my-12 prose-p:mb-6 prose-p:leading-relaxed prose-li:mb-2 prose-li:ml-4`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {content}
          </ReactMarkdown>
        </div>
        
        {/* Like & Bookmark */}
        <div className="mt-10 flex items-center gap-3">
          <LikeButton slug={slug} />
          <BookmarkButton slug={slug} />
        </div>

        {/* Comments */}
        <CommentSection slug={slug} locale={currentLocale} />

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
        
        {/* Back to columns */}
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
