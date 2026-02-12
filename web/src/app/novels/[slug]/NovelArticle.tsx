'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Novel } from '@/lib/novels';
import { Footer } from '@/components/layout/Footer';

function parseMarkdown(md: string): string {
  return md
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-white mt-10 mb-4">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-white mt-12 mb-6">$1</h2>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="text-purple-300">$1</em>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-zinc-800 my-12" />')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-zinc-900 border border-zinc-800 rounded-lg p-4 my-6 overflow-x-auto text-sm"><code class="text-green-400">$1</code></pre>')
    // Blockquote (Markdown > style)
    .replace(/^> (.*)$/gm, '<blockquote class="border-l-2 border-purple-500 pl-6 my-8 text-zinc-300 italic text-lg">$1</blockquote>')
    // Chat/dialogue format
    .replace(/^\*\*\[([^\]]+)\]\*\*: (.*)$/gm, '<div class="my-4 p-3 bg-zinc-900/50 rounded-lg border-l-4 border-blue-500"><div class="text-blue-300 font-mono text-sm mb-1">[$1]</div><div class="text-zinc-200">$2</div></div>')
    // List items
    .replace(/^- \*\*(.*?)\*\*: (.*)$/gm, '<li class="mb-3 ml-4 list-disc"><strong class="text-white font-semibold">$1:</strong> $2</li>')
    .replace(/^- (.*)$/gm, '<li class="mb-2 ml-4 list-disc">$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="mb-6 leading-relaxed">')
    // Single newlines in running text
    .replace(/\n/g, '<br />')
    ;
}

interface Props {
  novel: Novel;
  slug: string;
  availableLocales: string[];
  seriesNovels: Novel[];
  nextChapter: Novel | null;
  previousChapter: Novel | null;
}

export default function NovelArticle({ 
  novel, 
  slug, 
  availableLocales, 
  seriesNovels, 
  nextChapter, 
  previousChapter 
}: Props) {
  const router = useRouter();
  const currentLocale = novel.locale;
  const isKo = currentLocale === 'ko';
  
  const [readProgress, setReadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { frontmatter, content } = novel;
  const htmlContent = parseMarkdown(content);
  
  const switchLocale = (locale: string) => {
    router.push(`/novels/${slug}?lang=${locale}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 relative" style={{ scrollBehavior: 'smooth' }}>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-[width] duration-100"
          style={{ width: `${readProgress}%` }}
        />
      </div>
      
      {/* Sticky navigation */}
      <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">HypeProof AI</span>
          </Link>
          
          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400">
            <Link href="/novels" className="hover:text-white transition-colors">
              {isKo ? '웹소설' : 'Novels'}
            </Link>
            <span>›</span>
            <Link href={`/novels/authors/${frontmatter.author.toLowerCase()}`} className="hover:text-white transition-colors">
              {frontmatter.series}
            </Link>
            <span>›</span>
            <span className="text-white">
              {isKo ? `${frontmatter.volume}권 ${frontmatter.chapter}화` : `Vol.${frontmatter.volume} Ch.${frontmatter.chapter}`}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Table of Contents Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              aria-label="목차"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Language toggle */}
            {availableLocales.length > 1 && (
              <div className="flex items-center gap-1 text-sm">
                {availableLocales.map((locale, i) => (
                  <React.Fragment key={locale}>
                    {i > 0 && <span className="text-zinc-600">|</span>}
                    <button
                      onClick={() => switchLocale(locale)}
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
              href="/novels"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {isKo ? '모든 소설' : 'All Novels'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Table of Contents Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-zinc-900/95 backdrop-blur-md border-r border-zinc-800 z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {frontmatter.series} {isKo ? '목차' : 'Contents'}
            </h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
            {seriesNovels.map((chapter) => (
              <Link
                key={chapter.slug}
                href={`/novels/${chapter.slug}?lang=${currentLocale}`}
                className={`block p-3 rounded-lg transition-colors ${
                  chapter.slug === slug
                    ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                    : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="text-sm font-medium">
                  {isKo ? `${chapter.frontmatter.volume}권 ${chapter.frontmatter.chapter}화` : `Vol.${chapter.frontmatter.volume} Ch.${chapter.frontmatter.chapter}`}
                </div>
                <div className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {chapter.frontmatter.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Article */}
      <article className="max-w-[800px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Series Badge */}
        <div className="mb-6">
          <Link 
            href={`/novels/authors/${frontmatter.author.toLowerCase()}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="text-sm font-medium">{frontmatter.series}</span>
          </Link>
        </div>
        
        {/* Volume/Chapter Info */}
        <div className="mb-4 text-zinc-500">
          <span className="text-sm">
            {isKo 
              ? `${frontmatter.volume}권 ${frontmatter.chapter}화`
              : `Volume ${frontmatter.volume} • Chapter ${frontmatter.chapter}`
            }
          </span>
        </div>
        
        {/* Title */}
        <h1 className={`font-bold text-white mb-6 ${
          isKo 
            ? 'text-2xl sm:text-3xl md:text-[36px] tracking-[0.02em] leading-[1.3]' 
            : 'text-2xl sm:text-3xl md:text-[36px] tracking-[0.01em] leading-[1.2]'
        }`}>
          {frontmatter.title}
        </h1>
        
        {/* Excerpt */}
        <p className={`text-zinc-400 mb-8 ${
          isKo
            ? 'text-lg leading-[1.8] tracking-[0.02em]'
            : 'text-lg leading-[1.7] tracking-[0.01em]'
        }`}>
          {frontmatter.excerpt}
        </p>
        
        {/* Author block */}
        <div className="flex items-center gap-4 mb-10 pb-10 border-b border-zinc-800">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
            {frontmatter.authorImage ? (
              <Image
                src={frontmatter.authorImage}
                alt={frontmatter.author}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {frontmatter.author[0]}
              </div>
            )}
          </div>
          <div>
            <div className="text-white font-semibold text-lg">{frontmatter.author}</div>
            <div className="text-zinc-400 text-sm">
              by {frontmatter.authorHuman}
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className={`prose prose-invert max-w-none ${
            isKo 
              ? 'text-[17px] leading-[1.9] tracking-[0.02em]' 
              : 'text-[17px] leading-[1.8] tracking-[0.01em]'
          }`}
          dangerouslySetInnerHTML={{ __html: `<p class="mb-6 leading-relaxed">${htmlContent}</p>` }}
        />

        {/* Chapter Navigation */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex items-center justify-between gap-4">
          {previousChapter ? (
            <Link
              href={`/novels/${previousChapter.slug}?lang=${currentLocale}`}
              className="flex-1 p-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="text-xs text-zinc-500 mb-1">← {isKo ? '이전 화' : 'Previous'}</div>
              <div className="text-sm text-white font-medium line-clamp-1">{previousChapter.frontmatter.title}</div>
            </Link>
          ) : <div className="flex-1" />}
          
          {nextChapter ? (
            <Link
              href={`/novels/${nextChapter.slug}?lang=${currentLocale}`}
              className="flex-1 p-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors text-right"
            >
              <div className="text-xs text-zinc-500 mb-1">{isKo ? '다음 화' : 'Next'} →</div>
              <div className="text-sm text-white font-medium line-clamp-1">{nextChapter.frontmatter.title}</div>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </article>
      
      <Footer />
    </div>
  );
}
