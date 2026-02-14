import { getAllMembersAsync, FALLBACK_MEMBERS } from '@/lib/members';
import { getAllColumns } from '@/lib/columns';
import { getPersonas } from '@/lib/personas';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/layout/Footer';
import AuthButton from '@/components/auth/AuthButton';

interface Props {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';

  return {
    title: locale === 'ko' ? 'Creators' : 'Creators',
    description: locale === 'ko'
      ? 'HypeProof AI의 크리에이터들을 만나보세요.'
      : 'Meet the creators of HypeProof AI.',
    openGraph: {
      title: 'Creators | HypeProof AI',
      description: locale === 'ko'
        ? 'HypeProof AI의 크리에이터들을 만나보세요.'
        : 'Meet the creators of HypeProof AI.',
      type: 'website',
    },
  };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default async function CreatorsPage({ searchParams }: Props) {
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const isKo = locale === 'ko';

  // Get members from Notion (or fallback)
  const members = await getAllMembersAsync();
  const personas = await getPersonas();

  // Get all columns to count per creator
  const allColumns = [...getAllColumns('ko'), ...getAllColumns('en')];
  const uniqueColumns = Array.from(
    new Map(allColumns.map(c => [c.frontmatter.slug, c])).values()
  );

  // Build creator list: use Notion members if available, else fallback
  const creatorList = members.length > 0
    ? members.filter(m => m.role === 'admin' || m.role === 'creator')
    : FALLBACK_MEMBERS.filter(m => m.role === 'admin' || m.role === 'creator');

  // Count columns per creator
  function getColumnCount(name: string): number {
    return uniqueColumns.filter(c => {
      const creator = (c.frontmatter.creator || c.frontmatter.author || '').toLowerCase();
      return creator === name.toLowerCase();
    }).length;
  }

  // Count personas per creator
  function getPersonaCount(name: string): number {
    return personas.filter(p => p.creator.toLowerCase() === name.toLowerCase()).length;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-white font-semibold tracking-tight">HypeProof AI</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/columns" className="text-zinc-400 hover:text-white transition-colors text-sm">
              {isKo ? '칼럼' : 'Columns'}
            </Link>
            <Link href="/novels" className="text-zinc-400 hover:text-white transition-colors text-sm">
              {isKo ? '웹소설' : 'Novels'}
            </Link>
            <Link href="/creators" className="text-white font-medium text-sm">
              Creators
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 text-center border-b border-zinc-800/30">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
            Creators
          </h1>
          <p className="text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            {isKo
              ? 'HypeProof AI를 함께 만들어가는 크리에이터들을 소개합니다.'
              : 'Meet the creators building HypeProof AI together.'}
          </p>
        </div>
      </section>

      {/* Creator Grid */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatorList.map((member) => {
              const name = member.displayName;
              const slug = slugify(name);
              const columnCount = getColumnCount(name);
              const personaCount = getPersonaCount(name);

              return (
                <Link
                  key={name}
                  href={`/creators/${slug}?lang=${locale}`}
                  className="group block"
                >
                  <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-zinc-700 flex items-center justify-center text-white font-bold text-xl">
                        {name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {name}
                        </h3>
                        <span className="text-xs text-purple-400 capitalize">{member.role}</span>
                      </div>
                    </div>

                    {/* Join date */}
                    {'joinDate' in member && (member as any).joinDate && (
                      <p className="text-xs text-zinc-500 mt-2 mb-3">
                        {isKo ? '가입: ' : 'Joined: '}
                        {new Date((member as any).joinDate).toLocaleDateString(
                          isKo ? 'ko-KR' : 'en-US',
                          { year: 'numeric', month: 'short' }
                        )}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span>📝</span>
                        <span>{columnCount} {isKo ? '글' : 'columns'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>🤖</span>
                        <span>{personaCount} {isKo ? '페르소나' : 'personas'}</span>
                      </div>
                      {'totalPoints' in member && (member as any).totalPoints > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span>⭐</span>
                          <span>{(member as any).totalPoints} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
