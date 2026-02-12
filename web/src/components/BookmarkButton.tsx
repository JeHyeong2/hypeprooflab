'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface BookmarkButtonProps {
  slug: string;
  contentType?: string;
}

export default function BookmarkButton({ slug, contentType = 'column' }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/bookmarks?slug=${encodeURIComponent(slug)}&type=${contentType}`)
      .then(r => r.json())
      .then(data => setBookmarked(data.bookmarked || false))
      .catch(() => {});
  }, [slug, contentType, session]);

  const handleToggle = async () => {
    if (!session) {
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
        signIn();
      }, 800);
      return;
    }
    if (loading) return;
    setLoading(true);
    setError(false);

    const prevBookmarked = bookmarked;
    setBookmarked(!bookmarked);

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type: contentType }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch {
      setBookmarked(prevBookmarked);
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {showTooltip && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1.5 rounded-md shadow-lg z-10">
          로그인 필요
        </div>
      )}
      {error && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-900/80 text-red-200 text-xs px-2.5 py-1.5 rounded-md shadow-lg z-10">
          오류가 발생했습니다
        </div>
      )}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
          bookmarked
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
        }`}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        title={!session ? '로그인 필요' : undefined}
      >
        <svg
          className={`w-4 h-4 transition-transform ${bookmarked ? 'scale-110' : ''}`}
          fill={bookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
          />
        </svg>
        {bookmarked ? '저장됨' : '저장'}
      </button>
    </div>
  );
}
