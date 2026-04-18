import Link from 'next/link';

interface RelatedNovelItem {
  slug: string;
  title: string;
  volume?: number;
  chapter?: number;
}

interface Props {
  items: RelatedNovelItem[];
  locale: string;
  seriesName?: string;
}

export default function RelatedNovels({ items, locale, seriesName }: Props) {
  if (items.length === 0) return null;

  const isKo = locale === 'ko';

  return (
    <div className="mt-10 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
      <h3 className="text-base font-semibold text-white mb-4">
        {isKo
          ? `📖 ${seriesName ? `${seriesName} ` : ''}다른 화`
          : `📖 More from ${seriesName ?? 'this series'}`}
      </h3>
      <div className="space-y-3">
        {items.map((n) => (
          <Link
            key={n.slug}
            href={`/novels/${n.slug}?lang=${locale}`}
            className="block group"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-zinc-300 group-hover:text-purple-400 transition-colors text-sm font-medium truncate">
                &ldquo;{n.title}&rdquo;
              </span>
              {n.volume && n.chapter && (
                <span className="text-xs text-zinc-500 flex-shrink-0 whitespace-nowrap">
                  {isKo
                    ? `${n.volume}권 ${n.chapter}화`
                    : `Vol.${n.volume} Ch.${n.chapter}`}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
