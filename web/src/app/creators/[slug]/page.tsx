import { getAllMembers, getAllMembersAsync, FALLBACK_MEMBERS, MemberInfo } from '@/lib/members';
import { getAllColumns } from '@/lib/columns';
import { getPersonas } from '@/lib/personas';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import AuthButton from '@/components/auth/AuthButton';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getCreatorList() {
  const members = getAllMembers();
  const list = members.length > 0
    ? members.filter(m => m.role === 'admin' || m.role === 'creator')
    : FALLBACK_MEMBERS.filter(m => m.role === 'admin' || m.role === 'creator');
  return list;
}

export function generateStaticParams() {
  const list = getCreatorList();
  return list.map(m => ({ slug: slugify(m.displayName) }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const list = getCreatorList();
  const creator = list.find(m => slugify(m.displayName) === slug);
  if (!creator) return {};

  return {
    title: `${creator.displayName} | Creators`,
    description: locale === 'ko'
      ? `${creator.displayName}의 HypeProof AI 크리에이터 프로필`
      : `${creator.displayName}'s HypeProof AI creator profile`,
  };
}

export default async function CreatorDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const isKo = locale === 'ko';

  const members = await getAllMembersAsync();
  const asyncList = members.length > 0
    ? members.filter(m => m.role === 'admin' || m.role === 'creator')
    : FALLBACK_MEMBERS.filter(m => m.role === 'admin' || m.role === 'creator');
  const creator = asyncList.find(m => slugify(m.displayName) === slug);
  if (!creator) notFound();

  const name = creator.displayName;
  const memberInfo = creator as MemberInfo;

  // Get columns by this creator
  const koColumns = getAllColumns('ko').filter(c =>
    (c.frontmatter.creator || c.frontmatter.author || '').toLowerCase() === name.toLowerCase()
  );
  const enColumns = getAllColumns('en').filter(c =>
    (c.frontmatter.creator || c.frontmatter.author || '').toLowerCase() === name.toLowerCase()
  );
  const columns = locale === 'ko' ? koColumns : enColumns;
  const allColumns = [...koColumns, ...enColumns];
  const uniqueColumnCount = new Set(allColumns.map(c => c.frontmatter.slug)).size;

  // Get personas by this creator
  const allPersonas = await getPersonas();
  const creatorPersonas = allPersonas.filter(p => p.creator.toLowerCase() === name.toLowerCase());

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

          <div className="flex items-center gap-4 text-sm">
            <Link href="/creators" className="text-zinc-400 hover:text-white transition-colors">
              Creators
            </Link>
            <span className="text-zinc-600">›</span>
            <span className="text-white">{name}</span>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <section className="px-6 py-16 border-b border-zinc-800/30">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-2 border-zinc-700 flex items-center justify-center text-white font-bold text-3xl mb-6">
            {name[0]}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{name}</h1>
          <span className="text-sm text-purple-400 capitalize mb-2">{creator.role}</span>

          {/* Join date & Discord */}
          <div className="flex items-center gap-3 text-xs text-zinc-500 mb-6">
            {memberInfo.joinDate && (
              <span>
                {isKo ? '가입: ' : 'Joined: '}
                {new Date(memberInfo.joinDate).toLocaleDateString(
                  isKo ? 'ko-KR' : 'en-US',
                  { year: 'numeric', month: 'short', day: 'numeric' }
                )}
              </span>
            )}
            {memberInfo.discordUsername && (
              <span className="text-indigo-400">
                Discord: {memberInfo.discordUsername}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 text-sm text-zinc-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{uniqueColumnCount}</div>
              <div>{isKo ? '발행 글' : 'Columns'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{creatorPersonas.length}</div>
              <div>{isKo ? 'AI 페르소나' : 'AI Personas'}</div>
            </div>
            {memberInfo.totalPoints != null && memberInfo.totalPoints > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{memberInfo.totalPoints}</div>
                <div>{isKo ? '포인트' : 'Points'}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Columns */}
        {columns.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6">
              {isKo ? '발행한 글' : 'Published Columns'}
            </h2>
            <div className="space-y-4">
              {columns.map(col => (
                <Link
                  key={col.slug}
                  href={`/columns/${col.slug}?lang=${locale}`}
                  className="block group"
                >
                  <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-5 hover:border-purple-500/50 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium group-hover:text-purple-300 transition-colors mb-1 truncate">
                          {col.frontmatter.title}
                        </h3>
                        <p className="text-zinc-400 text-sm line-clamp-2">{col.frontmatter.excerpt}</p>
                      </div>
                      <div className="text-xs text-zinc-500 whitespace-nowrap flex-shrink-0">
                        {new Date(col.frontmatter.date).toLocaleDateString(
                          isKo ? 'ko-KR' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {col.frontmatter.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 text-xs text-zinc-400 bg-zinc-800 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* AI Personas */}
        {creatorPersonas.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6">
              {isKo ? '등록한 AI 페르소나' : 'AI Personas'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {creatorPersonas.map(persona => (
                <div
                  key={persona.id}
                  className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {persona.avatarUrl ? (
                      <Image
                        src={persona.avatarUrl}
                        alt={persona.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-white font-bold text-sm">
                        {persona.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">{persona.name}</div>
                      <div className="text-xs text-zinc-500">{persona.status}</div>
                    </div>
                  </div>
                  {persona.signature && (
                    <p className="text-sm text-zinc-400 italic">&ldquo;{persona.signature}&rdquo;</p>
                  )}
                  {persona.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {persona.genres.map(g => (
                        <span key={g} className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded-md">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back */}
        <div className="text-center pt-8">
          <Link
            href="/creators"
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
          >
            {isKo ? '← 모든 크리에이터 보기' : '← All Creators'}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
