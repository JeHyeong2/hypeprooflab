'use client';

import { useEffect, useState } from 'react';

interface ViewCounterProps {
  slug: string;
  trackView?: boolean; // true on detail page, false on list
}

export default function ViewCounter({ slug, trackView = false }: ViewCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (trackView) {
      fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
        .then((res) => res.json())
        .then((data) => setCount(data.count ?? 0))
        .catch(() => {});
    } else {
      fetch(`/api/views?slug=${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((data) => setCount(data.count ?? 0))
        .catch(() => {});
    }
  }, [slug, trackView]);

  if (count === null) {
    return <span className="text-zinc-500 text-sm">—</span>;
  }

  return (
    <span className="text-zinc-500 text-sm flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path
          fillRule="evenodd"
          d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clipRule="evenodd"
        />
      </svg>
      {count.toLocaleString()}
    </span>
  );
}
