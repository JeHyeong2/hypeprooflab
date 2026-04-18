import Link from 'next/link';

interface RelatedResearchItem {
  slug: string;
  title: string;
  creator: string;
  date: string;
}

interface Props {
  items: RelatedResearchItem[];
  locale: string;
}

export default function RelatedResearch({ items, locale }: Props) {
  if (items.length === 0) return null;

  const isKo = locale === 'ko';

  return (
    <div className="mt-10 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
      <h3 className="text-base font-semibold text-white mb-4">
        {isKo ? '🔬 관련 리서치' : '🔬 Related research'}
      </h3>
      <div className="space-y-3">
        {items.map((r) => (
          <Link
            key={r.slug}
            href={`/research/${r.slug}?lang=${locale}`}
            className="block group"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-zinc-300 group-hover:text-cyan-400 transition-colors text-sm font-medium truncate">
                &ldquo;{r.title}&rdquo;
              </span>
              <span className="text-xs text-zinc-500 flex-shrink-0 whitespace-nowrap">
                {r.date}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
