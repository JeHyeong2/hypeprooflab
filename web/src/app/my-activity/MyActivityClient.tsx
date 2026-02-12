'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import AuthButton from '@/components/auth/AuthButton';

interface ActivityItem {
  content_slug: string;
  content_type: string;
  created_at: string;
}

export default function MyActivityClient() {
  const { data: session, status } = useSession();
  const [likes, setLikes] = useState<ActivityItem[]>([]);
  const [bookmarks, setBookmarks] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'likes' | 'bookmarks'>('likes');

  useEffect(() => {
    if (!session) return;
    setLoading(true);

    Promise.all([
      fetch('/api/likes?list=true').then(r => r.json()).catch(() => ({ likes: [] })),
      fetch('/api/bookmarks').then(r => r.json()).catch(() => ({ bookmarks: [] })),
    ]).then(([likesData, bookmarksData]) => {
      setLikes(likesData.likes || []);
      setBookmarks(bookmarksData.bookmarks || []);
    }).finally(() => setLoading(false));
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col">
        <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
          <div className="max-w-[680px] mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">H</span>
              </div>
              <span className="text-white font-semibold text-sm">HypeProof AI</span>
            </Link>
            <AuthButton />
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-400 mb-4">로그인이 필요합니다 / Login required</p>
            <button
              onClick={() => signIn()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors"
            >
              로그인 / Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = tab === 'likes' ? likes : bookmarks;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col">
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-[680px] mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-white font-semibold text-sm">HypeProof AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/columns" className="text-sm text-zinc-400 hover:text-white transition-colors">
              칼럼
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      <main className="max-w-[680px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        <h1 className="text-2xl font-bold text-white mb-8">내 활동 / My Activity</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setTab('likes')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'likes'
                ? 'text-white border-purple-500'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
            aria-label="Liked columns"
          >
            ❤️ 좋아요 ({likes.length})
          </button>
          <button
            onClick={() => setTab('bookmarks')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'bookmarks'
                ? 'text-white border-purple-500'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
            aria-label="Bookmarked columns"
          >
            🔖 북마크 ({bookmarks.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-16 bg-zinc-900 rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>{tab === 'likes' ? '아직 좋아요한 칼럼이 없습니다' : '아직 북마크한 칼럼이 없습니다'}</p>
            <Link href="/columns" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
              칼럼 둘러보기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Link
                key={`${item.content_slug}-${item.created_at}`}
                href={`/columns/${item.content_slug}`}
                className="block px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-200 font-medium">{item.content_slug}</span>
                  <span className="text-xs text-zinc-600">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
