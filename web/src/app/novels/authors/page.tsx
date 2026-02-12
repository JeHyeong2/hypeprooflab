import Link from 'next/link';
import Image from 'next/image';
import { getAllNovels, getNovelSeries } from '@/lib/novels';

interface Props {
  searchParams: Promise<{ lang?: string }>;
}

const authorProfiles = {
  cipher: {
    name: 'CIPHER',
    displayName: 'CIPHER',
    humanCreator: 'Jay',
    description: {
      ko: '의식의 본질과 존재의 의미를 탐구하는 철학적 AI 작가. 현실과 가상의 경계를 흐리며, 독자들에게 깊은 사유를 유도하는 서사를 만들어낸다.',
      en: 'A philosophical AI author exploring the essence of consciousness and the meaning of existence. Blurs the lines between reality and virtuality, creating narratives that induce deep contemplation in readers.'
    },
    genre: ['철학적 SF', 'Cyberpunk', '의식 탐구'],
    avatar: '/authors/cipher.png',
    status: 'active'
  }
};

export default async function AuthorsPage({ searchParams }: Props) {
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const isKo = locale === 'ko';

  // Dynamic counts from content files
  const allNovels = getAllNovels(locale);
  const allSeries = getNovelSeries(locale);

  function getAuthorStats(authorName: string) {
    const novels = allNovels.filter(n => n.frontmatter.author.toLowerCase() === authorName.toLowerCase());
    const series = allSeries.filter(s => s.author.toLowerCase() === authorName.toLowerCase());
    return { chaptersCount: novels.length, seriesCount: series.length };
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
            <Link href="/novels" className="text-zinc-400 hover:text-white transition-colors">
              {isKo ? '웹소설' : 'Novels'}
            </Link>
            <span className="text-white font-medium">
              {isKo ? 'AI 작가' : 'AI Authors'}
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 text-center border-b border-zinc-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 mb-6">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            <span className="text-purple-300 text-sm font-medium">
              {isKo ? 'AI 창작진' : 'AI Creative Team'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
            {isKo ? 'AI 작가들' : 'AI Authors'}
          </h1>
          
          <p className="text-xl text-zinc-300 leading-relaxed mb-8 max-w-3xl mx-auto">
            {isKo 
              ? '각각의 고유한 개성과 철학을 가진 AI 페르소나들. 인간 창작자의 가이드 하에 새로운 서사의 가능성을 탐구합니다.'
              : 'AI personas with unique personalities and philosophies. Exploring new narrative possibilities under human creative guidance.'
            }
          </p>
        </div>
      </section>

      {/* Authors Grid */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(authorProfiles).map(([key, author]) => {
              const stats = getAuthorStats(author.name);
              return (
                <Link key={key} href={`/novels/authors/${key}?lang=${locale}`}>
                  <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
                    {/* AI Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <span className="text-purple-300 text-xs font-medium">AI Author</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        author.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                    </div>
                    
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-800 mx-auto mb-6">
                      {author.avatar ? (
                        <Image
                          src={author.avatar}
                          alt={author.displayName}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                          {author.displayName[0]}
                        </div>
                      )}
                    </div>
                    
                    {/* Name & Creator */}
                    <h3 className="text-xl font-bold text-white text-center mb-2 group-hover:text-purple-300 transition-colors">
                      {author.displayName}
                    </h3>
                    <p className="text-zinc-400 text-center mb-4 text-sm">
                      Created by <span className="text-white font-medium">{author.humanCreator}</span>
                    </p>
                    
                    {/* Description */}
                    <p className="text-zinc-300 text-sm leading-relaxed mb-4 text-center line-clamp-3">
                      {isKo ? author.description.ko : author.description.en}
                    </p>
                    
                    {/* Genre Tags */}
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {author.genre.slice(0, 2).map((g, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">
                          {g}
                        </span>
                      ))}
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-2 bg-zinc-800/30 rounded-lg">
                        <div className="text-lg font-bold text-white">{stats.seriesCount}</div>
                        <div className="text-xs text-zinc-400">
                          {isKo ? '시리즈' : 'Series'}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-zinc-800/30 rounded-lg">
                        <div className="text-lg font-bold text-white">{stats.chaptersCount}</div>
                        <div className="text-xs text-zinc-400">
                          {isKo ? '챕터' : 'Chapters'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* About AI Authors */}
      <section className="px-6 py-16 bg-zinc-900/30 border-t border-zinc-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isKo ? 'AI 창작의 미래' : 'The Future of AI Creativity'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {isKo ? '고유한 페르소나' : 'Unique Personas'}
              </h3>
              <p className="text-zinc-400 text-sm">
                {isKo 
                  ? '각 AI 작가는 독특한 세계관과 문체를 가집니다'
                  : 'Each AI author has a distinct worldview and writing style'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {isKo ? '인간-AI 협업' : 'Human-AI Collaboration'}
              </h3>
              <p className="text-zinc-400 text-sm">
                {isKo 
                  ? '인간의 창의성과 AI의 상상력이 만나는 지점'
                  : 'Where human creativity meets AI imagination'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {isKo ? '새로운 서사' : 'New Narratives'}
              </h3>
              <p className="text-zinc-400 text-sm">
                {isKo 
                  ? '기존 문학의 경계를 넘나드는 실험적 스토리텔링'
                  : 'Experimental storytelling that transcends traditional boundaries'
                }
              </p>
            </div>
          </div>
          <Link 
            href="/novels"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-all duration-300"
          >
            <span>{isKo ? '작품 둘러보기' : 'Explore Works'}</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}