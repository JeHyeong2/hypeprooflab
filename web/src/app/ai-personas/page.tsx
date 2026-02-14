import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getPersonas, Persona } from '@/lib/personas';

interface Props {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';

  return {
    title: 'AI Personas',
    description: locale === 'ko'
      ? '각각의 고유한 개성과 철학을 가진 AI 페르소나들. 인간 Creator의 가이드 하에 새로운 서사의 가능성을 탐구합니다.'
      : 'AI personas with unique personalities and philosophies. Exploring new narrative possibilities under human creative guidance.',
    openGraph: {
      title: 'AI Personas | HypeProof AI',
      description: locale === 'ko'
        ? 'AI 창작 페르소나 — 고유한 개성과 철학으로 새로운 서사를 탐구합니다.'
        : 'AI creative personas exploring new narratives with unique personalities.',
      type: 'website',
    },
  };
}

const t = {
  ko: {
    badge: 'AI 창작 페르소나',
    title: 'AI Personas',
    desc: '각각의 고유한 개성과 철학을 가진 AI 페르소나들. 인간 Creator의 가이드 하에 새로운 서사의 가능성을 탐구합니다.',
    register: 'AI Persona 등록하기',
    works: '작품',
    by: 'by',
    novels: '웹소설',
    home: '홈',
    empty: '아직 등록된 AI Persona가 없습니다.',
  },
  en: {
    badge: 'AI Creative Personas',
    title: 'AI Personas',
    desc: 'AI personas with unique personalities and philosophies. Exploring new narrative possibilities under human creative guidance.',
    register: 'Register AI Persona',
    works: 'works',
    by: 'by',
    novels: 'Novels',
    home: 'Home',
    empty: 'No AI Personas registered yet.',
  },
};

function StatusBadge({ status }: { status: string }) {
  const isActive = status.toLowerCase() === 'active';
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
      isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700/50 text-zinc-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-zinc-500'}`} />
      {status}
    </span>
  );
}

function PersonaCard({ persona, locale }: { persona: Persona; locale: 'ko' | 'en' }) {
  const l = t[locale];
  return (
    <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-600/30 flex-shrink-0 overflow-hidden border border-zinc-700 group-hover:border-purple-500/50 transition-colors">
          {persona.avatarUrl ? (
            <Image src={persona.avatarUrl} alt={persona.name} width={64} height={64} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-purple-400">
              {persona.name[0]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white">{persona.name}</h3>
            <StatusBadge status={persona.status} />
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">{l.by} {persona.creator}</p>
        </div>
      </div>

      {/* Signature */}
      {persona.signature && (
        <p className="mt-4 text-sm text-zinc-400 italic leading-relaxed line-clamp-2">
          &ldquo;{persona.signature}&rdquo;
        </p>
      )}

      {/* Genres */}
      {persona.genres.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {persona.genres.map((g) => (
            <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/20">
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Works count */}
      {persona.worksCount > 0 && (
        <div className="mt-4 text-xs text-zinc-500">
          📚 {persona.worksCount} {l.works}
        </div>
      )}
    </div>
  );
}

export default async function AIPersonasPage({ searchParams }: Props) {
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const l = t[locale];
  const personas = await getPersonas();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-white font-semibold tracking-tight">HypeProof AI</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">{l.home}</Link>
            <Link href={`/novels?lang=${locale}`} className="text-zinc-400 hover:text-white transition-colors">{l.novels}</Link>
            <span className="text-white font-medium">AI Personas</span>
            <Link
              href={`/ai-personas?lang=${locale === 'ko' ? 'en' : 'ko'}`}
              className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 rounded px-2 py-1"
            >
              {locale === 'ko' ? 'EN' : 'KO'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 text-center border-b border-zinc-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 mb-6">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 text-sm font-medium">{l.badge}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
            {l.title}
          </h1>
          <p className="text-xl text-zinc-300 leading-relaxed mb-8 max-w-3xl mx-auto">{l.desc}</p>
          <Link
            href={`/ai-personas/register?lang=${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
          >
            ✨ {l.register}
          </Link>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {personas.length === 0 ? (
          <p className="text-center text-zinc-500 py-20">{l.empty}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((p) => (
              <PersonaCard key={p.id} persona={p} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
