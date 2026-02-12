'use client';

import { useState } from 'react';

interface Props {
  url: string;
  title: string;
  locale?: string;
}

export default function ShareButtons({ url, title, locale = 'ko' }: Props) {
  const [copied, setCopied] = useState(false);
  const isKo = locale === 'ko';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="mt-8 pt-6 border-t border-zinc-800">
      <p className="text-xs text-zinc-500 mb-3">{isKo ? '공유하기' : 'Share'}</p>
      <div className="flex items-center gap-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
          aria-label="Share on Twitter"
        >
          𝕏 Twitter
        </a>
        <button
          onClick={copyLink}
          className="px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
          aria-label="Copy link"
        >
          {copied ? '✓ Copied!' : '🔗 ' + (isKo ? '링크 복사' : 'Copy link')}
        </button>
      </div>
    </div>
  );
}
