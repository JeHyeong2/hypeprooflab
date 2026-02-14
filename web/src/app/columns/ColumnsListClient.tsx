'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Column } from '@/lib/columns';
import { Footer } from '@/components/layout/Footer';
import ViewCounter from '@/components/ViewCounter';
import AuthButton from '@/components/auth/AuthButton';

interface Props {
  koColumns: Column[];
  enColumns: Column[];
}

export default function ColumnsListClient({ koColumns, enColumns }: Props) {
  const [locale, setLocale] = useState<'ko' | 'en'>('ko');
  const columns = locale === 'ko' ? koColumns : enColumns;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-[960px] mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
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
            <Link href="/novels" className="text-sm text-zinc-400 hover:text-white transition-colors">
              {locale === 'ko' ? '웹소설' : 'Novels'}
            </Link>
            <Link href="/creators" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Creators
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {locale === 'ko' ? '칼럼' : 'Columns'}
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            {locale === 'ko'
              ? 'AI, 기술, 그리고 우리가 만들어가는 미래에 대한 심층 분석'
              : 'Deep analysis, research insights, and sharp takes on AI and the future'}
          </p>
        </div>

        <div className="space-y-8">
          {columns.map((column) => {
            const fm = column.frontmatter;
            return (
              <Link
                key={fm.slug}
                href={`/columns/${fm.slug}?lang=${locale}`}
                className="block group"
              >
                <article className="py-8 border-b border-zinc-800/50 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3 mb-3 text-sm text-zinc-500">
                    <span className="text-purple-400 uppercase tracking-wider text-xs font-medium">{fm.category}</span>
                    <span>·</span>
                    <time>{new Date(fm.date).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    <span>·</span>
                    <span>{fm.readTime} read</span>
                    <span>·</span>
                    <ViewCounter slug={fm.slug} />
                  </div>
                  
                  <h2 className={`text-xl md:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors mb-3 ${
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
                    {(fm.creatorImage || fm.authorImage) && (
                      <Image src={(fm.creatorImage || fm.authorImage)!} alt={fm.creator || fm.author || ''} width={24} height={24} className="rounded-full" />
                    )}
                    <span className="text-sm text-zinc-500">{fm.creator || fm.author}</span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {columns.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">
              {locale === 'ko' ? '아직 칼럼이 없습니다.' : 'No columns yet.'}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
