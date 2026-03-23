import Link from 'next/link';
import Image from 'next/image';

interface CreatorProfileCardProps {
  creatorName: string;
  creatorImage?: string;
  creatorSlug: string;
  columnCount: number;
  locale: string;
}

export default function CreatorProfileCard({
  creatorName,
  creatorImage,
  creatorSlug,
  columnCount,
  locale,
}: CreatorProfileCardProps) {
  const isKo = locale === 'ko';

  return (
    <div className="mt-12 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
      <div className="flex items-center gap-4">
        <Link href={`/creators/${creatorSlug}?lang=${locale}`} className="flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 hover:border-purple-500/50 transition-colors">
            {creatorImage ? (
              <Image
                src={creatorImage}
                alt={creatorName}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                {creatorName[0]}
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/creators/${creatorSlug}?lang=${locale}`}
            className="text-white font-semibold hover:text-purple-400 transition-colors"
          >
            {creatorName}
          </Link>
          <div className="text-sm text-zinc-400 mt-0.5">
            {isKo
              ? `칼럼 ${columnCount}편 작성`
              : `${columnCount} column${columnCount !== 1 ? 's' : ''} published`}
          </div>
          <Link
            href={`/creators/${creatorSlug}?lang=${locale}`}
            className="inline-block mt-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            {isKo ? '프로필 보기 →' : 'View profile →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
