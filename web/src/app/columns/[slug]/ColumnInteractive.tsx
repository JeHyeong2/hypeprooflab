'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackContentView } from '@/lib/analytics';
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import CommentSection from '@/components/CommentSection';

interface Props {
  slug: string;
  availableLocales: string[];
  currentLocale: string;
  showEngagement?: boolean;
}

export default function ColumnInteractive({ slug, availableLocales, currentLocale, showEngagement }: Props) {
  const router = useRouter();
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    trackContentView(slug, 'column');
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (showEngagement) {
    return (
      <>
        <div className="mt-10 flex items-center gap-3">
          <LikeButton slug={slug} />
          <BookmarkButton slug={slug} />
        </div>
        <CommentSection slug={slug} locale={currentLocale} />
      </>
    );
  }

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
        <div
          className="h-full bg-purple-500 transition-[width] duration-100"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Language toggle (floating) */}
      {availableLocales.length > 1 && (
        <div className="fixed top-3 right-4 z-[55] flex items-center gap-1 text-sm">
          {availableLocales.map((locale, i) => (
            <React.Fragment key={locale}>
              {i > 0 && <span className="text-zinc-600">|</span>}
              <button
                onClick={() => router.push(`/columns/${slug}?lang=${locale}`)}
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
    </>
  );
}
