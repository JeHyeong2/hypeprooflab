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

  useEffect(() => {
    if (!session) return;
    fetch(`/api/bookmarks?slug=${encodeURIComponent(slug)}&type=${contentType}`)
      .then(r => r.json())
      .then(data => setBookmarked(data.bookmarked || false))
      .catch(() => {});
  }, [slug, contentType, session]);

  const handleToggle = async () => {
    if (!session) {
      signIn();
      return;
    }
    if (loading) return;
    setLoading(true);
    setBookmarked(prev => !prev);

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type: contentType }),
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch {
      setBookmarked(prev => !prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
        bookmarked
          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
      }`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
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
  );
}
