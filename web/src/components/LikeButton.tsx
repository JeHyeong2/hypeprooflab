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
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState(false);

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

    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(count + (liked ? -1 : 1));

    try {
      let res: Response | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, type: contentType }),
        });
        if (res.ok || res.status < 500) break;
        if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
      if (!res || !res.ok) throw new Error('Failed');
      const data = await res.json();
      setCount(data.count);
      setLiked(data.liked);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
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
          liked
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
        }`}
        aria-label={liked ? 'Unlike' : 'Like'}
        title={!session ? '로그인 필요' : undefined}
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
    </div>
  );
}
