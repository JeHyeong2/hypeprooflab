'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface LikeButtonProps {
  slug: string;
  contentType?: string;
}

export default function LikeButton({ slug, contentType = 'column' }: LikeButtonProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/likes?slug=${encodeURIComponent(slug)}&type=${contentType}`)
      .then(r => r.json())
      .then(data => {
        setCount(data.count || 0);
        setLiked(data.liked || false);
      })
      .catch(() => {});
  }, [slug, contentType]);

  const handleToggle = async () => {
    if (!session) {
      signIn();
      return;
    }
    if (loading) return;
    setLoading(true);

    // Optimistic update
    setLiked(prev => !prev);
    setCount(prev => prev + (liked ? -1 : 1));

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type: contentType }),
      });
      const data = await res.json();
      setCount(data.count);
      setLiked(data.liked);
    } catch {
      // Revert on error
      setLiked(prev => !prev);
      setCount(prev => prev + (liked ? 1 : -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
        liked
          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
          : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
      }`}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <svg
        className={`w-4 h-4 transition-transform ${liked ? 'scale-110' : ''}`}
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
