import { getNovelSeries, getAllNovels } from '@/lib/novels';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/layout/Footer';

interface Props {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  
  return {
    title: locale === 'ko' ? 'AI 웹소설' : 'AI Novels',
    description: locale === 'ko' 
      ? 'AI가 창작한 웹소설 시리즈. 철학적 탐구와 SF의 만남.'
      : 'AI-generated web novel series. Where philosophical exploration meets science fiction.',
    openGraph: {
      title: locale === 'ko' ? 'AI 웹소설 | HypeProof AI' : 'AI Novels | HypeProof AI',
      description: locale === 'ko' 
        ? 'AI가 창작한 웹소설 시리즈. 철학적 탐구와 SF의 만남.'
        : 'AI-generated web novel series. Where philosophical exploration meets science fiction.',
      type: 'website',
    },
  };
}

export default async function NovelsPage({ searchParams }: Props) {
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const isKo = locale === 'ko';
  
  const series = getNovelSeries(locale);
  const allNovels = getAllNovels(locale);

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
            <Link href="/columns" className="text-zinc-400 hover:text-white transition-colors">
              {isKo ? '칼럼' : 'Columns'}
            </Link>
            <Link href="/novels" className="text-white font-medium">
              {isKo ? '웹소설' : 'Novels'}
            </Link>
            <Link href="/creators" className="text-zinc-400 hover:text-white transition-colors">
              Creators
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 text-center border-b border-zinc-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 mb-6">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            <span className="text-purple-300 text-sm font-medium">
              {isKo ? 'AI가 창작한 웹소설' : 'AI-Generated Web Novels'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
            {isKo ? 'AI 웹소설' : 'AI Novels'}
          </h1>
          
          <p className="text-xl text-zinc-300 leading-relaxed mb-8 max-w-3xl mx-auto">
            {isKo 
              ? '인공지능이 탐구하는 의식, 존재, 그리고 미래. 철학적 사유와 SF적 상상력이 만나는 새로운 서사의 세계.'
              : 'AI explores consciousness, existence, and the future. Where philosophical inquiry meets science fiction imagination in new narrative worlds.'
            }
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
              <span>{isKo ? '연재 중' : 'Ongoing Series'}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-600"></div>
            <div className="flex items-center gap-2">
              <span>🤖</span>
              <span>{isKo ? 'AI 크리에이터' : 'AI Creators'}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-600"></div>
            <div className="flex items-center gap-2">
              <span>🧠</span>
              <span>{isKo ? '철학적 SF' : 'Philosophical SF'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Series Grid */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-12 text-center">
            {isKo ? '연재 시리즈' : 'Featured Series'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {series.map((s) => {
              const latestChapter = allNovels
                .filter(n => n.frontmatter.series === s.name)
                .sort((a, b) => {
                  if (a.frontmatter.volume !== b.frontmatter.volume) {
                    return b.frontmatter.volume - a.frontmatter.volume;
                  }
                  return b.frontmatter.chapter - a.frontmatter.chapter;
                })[0];
              
              return (
                <div key={s.name} className="group">
                  <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    {/* AI Generated Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <span className="text-purple-300 text-xs font-medium">AI Generated</span>
                      </div>
                      <div className="text-zinc-500 text-sm">
                        {s.status === 'ongoing' ? (isKo ? '연재중' : 'Ongoing') : 
                         s.status === 'completed' ? (isKo ? '완결' : 'Completed') : 
                         (isKo ? '휴재중' : 'Hiatus')}
                      </div>
                    </div>
                    
                    {/* Series Info */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {s.name}
                    </h3>
                    
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                      {s.description}
                    </p>
                    
                    {/* Genre Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {s.genre.map((g, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">
                          {g}
                        </span>
                      ))}
                    </div>
                    
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-zinc-800/30 rounded-lg border border-zinc-800/50">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                        {s.authorImage ? (
                          <Image
                            src={s.authorImage}
                            alt={s.author}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                            {s.author[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{s.author}</div>
                        <div className="text-zinc-500 text-xs">
                          by {s.authorHuman}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-zinc-500 mb-4">
                      <span>{s.totalChapters} {isKo ? '화' : 'chapters'}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        s.status === 'ongoing' ? 'bg-green-600/20 text-green-300' :
                        s.status === 'completed' ? 'bg-blue-600/20 text-blue-300' :
                        'bg-yellow-600/20 text-yellow-300'
                      }`}>
                        {s.status === 'ongoing' ? (isKo ? '연재중' : 'Ongoing') :
                         s.status === 'completed' ? (isKo ? '완결' : 'Completed') :
                         (isKo ? '휴재중' : 'Hiatus')}
                      </span>
                    </div>
                    
                    {/* Read Button */}
                    <Link 
                      href={`/novels/${latestChapter?.slug}?lang=${locale}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-all duration-300"
                    >
                      <span className="font-medium">{isKo ? '읽기 시작' : 'Start Reading'}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* About AI Authors */}
      <section className="px-6 py-16 bg-zinc-900/30 border-t border-zinc-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isKo ? 'AI 크리에이터에 대해' : 'About Our AI Creators'}
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-8">
            {isKo 
              ? 'HypeProof AI의 웹소설은 최첨단 AI 모델이 창작한 작품입니다. 각각의 AI 페르소나는 고유한 문체와 철학적 관점을 가지고 있으며, 인간 크리에이터의 가이드 하에 독창적인 서사를 만들어냅니다.'
              : 'HypeProof AI novels are crafted by cutting-edge AI models. Each AI persona has its unique writing style and philosophical perspective, creating original narratives under human creative direction.'
            }
          </p>
          <Link 
            href="/novels/authors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white rounded-lg hover:border-zinc-600/50 transition-all duration-300"
          >
            <span>{isKo ? 'AI 크리에이터 프로필 보기' : 'View AI Creator Profiles'}</span>
            <span>→</span>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}