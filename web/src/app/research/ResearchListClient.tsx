'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Research } from '@/lib/research';
import { Footer } from '@/components/layout/Footer';
import ViewCounter from '@/components/ViewCounter';
import AuthButton from '@/components/auth/AuthButton';

interface Props {
  koResearch: Research[];
  enResearch: Research[];
}

export default function ResearchListClient({ koResearch, enResearch }: Props) {
  const [locale, setLocale] = useState<'ko' | 'en'>('ko');
  const items = locale === 'ko' ? koResearch : enResearch;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-[960px] mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">HypeProof AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-1 rounded transition-colors ${locale === 'en' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                EN
              </button>
              <span className="text-zinc-600">|</span>
              <button
                onClick={() => setLocale('ko')}
                className={`px-2 py-1 rounded transition-colors ${locale === 'ko' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                KO
              </button>
            </div>
            <Link href="/columns" className="text-sm text-zinc-400 hover:text-white transition-colors">
              {locale === 'ko' ? '칼럼' : 'Columns'}
            </Link>
            <Link href="/novels" className="text-sm text-zinc-400 hover:text-white transition-colors">
              {locale === 'ko' ? '웹소설' : 'Novels'}
            </Link>
            <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
              {locale === 'ko' ? '홈' : 'Home'}
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      <main className="max-w-[960px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-16">
          {/* AI Generated badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
              AI Generated Research
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {locale === 'ko' ? '리서치' : 'Research'}
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            {locale === 'ko'
              ? 'AI가 매일 수집·분석하는 테크 트렌드와 산업 인사이트'
              : 'Daily AI-curated tech trends and industry insights'}
          </p>
        </div>

        <div className="space-y-8">
          {items.map((item) => {
            const fm = item.frontmatter;
            return (
              <Link
                key={fm.slug}
                href={`/research/${fm.slug}?lang=${locale}`}
                className="block group"
              >
                <article className="py-8 border-b border-zinc-800/50 hover:border-cyan-800/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3 text-sm text-zinc-500">
                    <span className="text-cyan-400 uppercase tracking-wider text-xs font-medium whitespace-nowrap">{fm.category}</span>
                    {fm.authorType === 'ai' && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-xs text-cyan-400/80">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                          </svg>
                          AI Generated
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <time>{new Date(fm.date).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    <span>·</span>
                    <span>{fm.readTime} read</span>
                    <span>·</span>
                    <ViewCounter slug={fm.slug} />
                  </div>

                  <h2 className={`text-xl md:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-3 ${
                    locale === 'ko' ? 'tracking-[0.03em] leading-[1.5]' : 'tracking-[0.01em] leading-[1.4]'
                  }`}>
                    {fm.title}
                  </h2>

                  <p className={`text-zinc-400 mb-4 ${
                    locale === 'ko' ? 'leading-[1.8] tracking-[0.03em]' : 'leading-[1.7] tracking-[0.01em]'
                  }`}>
                    {fm.excerpt}
                  </p>

                  <div className="flex items-center gap-3">
                    {fm.creatorImage && (
                      <Image src={fm.creatorImage} alt={fm.creator || ''} width={24} height={24} className="rounded-full" />
                    )}
                    <span className="text-sm text-zinc-500">{fm.creator}</span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">
              {locale === 'ko' ? '아직 리서치가 없습니다.' : 'No research yet.'}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
