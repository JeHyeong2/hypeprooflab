import Link from 'next/link';

interface RelatedColumnItem {
  slug: string;
  title: string;
  creator: string;
  date: string;
}

interface RelatedColumnsProps {
  columns: RelatedColumnItem[];
  locale: string;
}

export default function RelatedColumns({ columns, locale }: RelatedColumnsProps) {
  if (columns.length === 0) return null;

  const isKo = locale === 'ko';

  return (
    <div className="mt-10 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
      <h3 className="text-base font-semibold text-white mb-4">
        {isKo ? '📚 이런 칼럼은 어떠세요?' : '📚 You might also enjoy'}
      </h3>
      <div className="space-y-3">
        {columns.map((col) => (
          <Link
            key={col.slug}
            href={`/columns/${col.slug}?lang=${locale}`}
            className="block group"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-zinc-300 group-hover:text-purple-400 transition-colors text-sm font-medium truncate">
                &ldquo;{col.title}&rdquo;
              </span>
              <span className="text-xs text-zinc-500 flex-shrink-0 whitespace-nowrap">
                {col.creator}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
