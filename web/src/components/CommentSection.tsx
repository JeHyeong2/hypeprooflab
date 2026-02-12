'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_image: string | null;
  user_role: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  slug: string;
  locale?: string;
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'spectator') return null;
  const colors =
    role === 'admin'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : role === 'author'
      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase ${colors}`}>
      {role}
    </span>
  );
}

function TimeAgo({ date, locale }: { date: string; locale: string }) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  let text: string;
  if (diffMin < 1) text = locale === 'ko' ? '방금 전' : 'just now';
  else if (diffMin < 60) text = locale === 'ko' ? `${diffMin}분 전` : `${diffMin}m ago`;
  else if (diffHour < 24) text = locale === 'ko' ? `${diffHour}시간 전` : `${diffHour}h ago`;
  else if (diffDay < 30) text = locale === 'ko' ? `${diffDay}일 전` : `${diffDay}d ago`;
  else text = d.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <time dateTime={date} title={d.toLocaleString()} className="text-xs text-zinc-500">
      {text}
    </time>
  );
}

export default function CommentSection({ slug, locale = 'ko' }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'admin';
  const isKo = locale === 'ko';

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.error === 'unavailable') {
        setUnavailable(true);
        setComments([]);
      } else {
        setComments(data.comments || []);
        setUnavailable(false);
      }
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      signIn();
      return;
    }
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      const data = await res.json();
      setComments(prev => [...prev, data.comment]);
      setContent('');
    } catch (err) {
      setError(isKo ? '댓글 작성에 실패했습니다' : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (deletingId) return;
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch {
      // silent fail
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-zinc-800" aria-label={isKo ? '댓글' : 'Comments'}>
      <h2 className="text-lg font-bold text-white mb-6">
        {isKo ? '댓글' : 'Comments'}
        {!loading && !unavailable && comments.length > 0 && (
          <span className="text-zinc-500 font-normal ml-2 text-sm">({comments.length})</span>
        )}
      </h2>

      {unavailable && (
        <div className="text-sm text-zinc-500 bg-zinc-900/50 rounded-lg p-4 mb-6 border border-zinc-800">
          {isKo ? '댓글 기능을 일시적으로 사용할 수 없습니다' : 'Comments are temporarily unavailable'}
        </div>
      )}

      {/* Comment form */}
      {!unavailable && (
        <form onSubmit={handleSubmit} className="mb-8">
          {!session ? (
            <button
              type="button"
              onClick={() => signIn()}
              className="w-full text-left px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-sm hover:border-zinc-600 transition-colors"
              aria-label={isKo ? '로그인하여 댓글 작성' : 'Sign in to comment'}
            >
              {isKo ? '로그인하여 댓글을 남겨주세요' : 'Sign in to leave a comment'}
            </button>
          ) : (
            <div>
              <div className="flex items-start gap-3">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full mt-1 flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold mt-1 flex-shrink-0">
                    {(session.user?.name || '?')[0]}
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={isKo ? '댓글을 입력하세요...' : 'Write a comment...'}
                    maxLength={2000}
                    rows={3}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                    aria-label={isKo ? '댓글 입력' : 'Comment input'}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-zinc-600">
                      {content.length}/2000
                    </span>
                    <button
                      type="submit"
                      disabled={!content.trim() || submitting}
                      className="px-4 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label={isKo ? '댓글 등록' : 'Post comment'}
                    >
                      {submitting
                        ? (isKo ? '등록 중...' : 'Posting...')
                        : (isKo ? '등록' : 'Post')}
                    </button>
                  </div>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-400 mt-2">{error}</p>
              )}
            </div>
          )}
        </form>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
                <div className="h-3 w-full bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 group">
              {comment.user_image ? (
                <Image
                  src={comment.user_image}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full mt-0.5 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-bold mt-0.5 flex-shrink-0">
                  {(comment.user_name || '?')[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-zinc-200">{comment.user_name}</span>
                  <RoleBadge role={comment.user_role} />
                  <TimeAgo date={comment.created_at} locale={locale} />
                  {(comment.user_id === session?.user?.id || isAdmin) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-xs text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all ml-auto"
                      aria-label={isKo ? '댓글 삭제' : 'Delete comment'}
                    >
                      {deletingId === comment.id ? '...' : (isKo ? '삭제' : 'Delete')}
                    </button>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-1 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
          {!unavailable && comments.length === 0 && !loading && (
            <p className="text-sm text-zinc-600 text-center py-4">
              {isKo ? '아직 댓글이 없습니다. 첫 댓글을 남겨보세요!' : 'No comments yet. Be the first to comment!'}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
