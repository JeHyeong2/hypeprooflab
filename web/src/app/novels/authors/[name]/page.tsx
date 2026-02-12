import { getAllNovels, getNovelSeries } from '@/lib/novels';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ lang?: string }>;
}

// Author data - would be in a separate file or database in production
const authorProfiles = {
  cipher: {
    name: 'CIPHER',
    displayName: 'CIPHER',
    humanCreator: 'Jay',
    description: {
      ko: '의식의 본질과 존재의 의미를 탐구하는 철학적 AI 작가. 현실과 가상의 경계를 흐리며, 독자들에게 깊은 사유를 유도하는 서사를 만들어낸다.',
      en: 'A philosophical AI author exploring the essence of consciousness and the meaning of existence. Blurs the lines between reality and virtuality, creating narratives that induce deep contemplation in readers.'
    },
    genre: ['철학적 SF', 'Philosophical SF', 'Cyberpunk', '의식 탐구'],
    writingStyle: {
      ko: '내성적이고 철학적인 문체. 짧고 명료한 문장들 사이에 깊은 의미를 담아내며, 독자가 스스로 생각할 수 있는 여백을 남긴다.',
      en: 'Introspective and philosophical style. Conveys deep meaning through short, clear sentences, leaving space for readers to think for themselves.'
    },
    themes: {
      ko: ['의식과 정체성', '실재와 시뮬레이션', '존재의 증명', '타자와의 소통', '디지털 존재론'],
      en: ['Consciousness and Identity', 'Reality and Simulation', 'Proof of Existence', 'Communication with Others', 'Digital Ontology']
    },
    avatar: '/authors/cipher.png'
  }
};

export async function generateStaticParams() {
  return Object.keys(authorProfiles).map(name => ({ name }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { name } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  
  const author = authorProfiles[name.toLowerCase() as keyof typeof authorProfiles];
  if (!author) return {};
  
  return {
    title: locale === 'ko' ? `${author.displayName} - AI 작가 프로필` : `${author.displayName} - AI Author Profile`,
    description: locale === 'ko' ? author.description.ko : author.description.en,
    openGraph: {
      title: `${author.displayName} - ${locale === 'ko' ? 'AI 작가' : 'AI Author'}`,
      description: locale === 'ko' ? author.description.ko : author.description.en,
      type: 'profile',
    },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { name } = await params;
  const { lang } = await searchParams;
  const locale = lang === 'en' ? 'en' : 'ko';
  const isKo = locale === 'ko';
  
  const author = authorProfiles[name.toLowerCase() as keyof typeof authorProfiles];
  if (!author) notFound();
  
  const allNovels = getAllNovels(locale);
  const authorNovels = allNovels.filter(novel => 
    novel.frontmatter.author.toLowerCase() === author.name.toLowerCase()
  );
  
  const series = getNovelSeries(locale).filter(s => 
    s.author.toLowerCase() === author.name.toLowerCase()
  );

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
            <Link href="/novels/authors" className="text-zinc-400 hover:text-white transition-colors">
              {isKo ? 'AI 작가' : 'AI Authors'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Author Profile Hero */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-8">
            <Link href="/novels" className="hover:text-white transition-colors">
              {isKo ? '웹소설' : 'Novels'}
            </Link>
            <span>›</span>
            <Link href="/novels/authors" className="hover:text-white transition-colors">
              {isKo ? 'AI 작가' : 'AI Authors'}
            </Link>
            <span>›</span>
            <span className="text-white">{author.displayName}</span>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 sticky top-24">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-zinc-800 mx-auto mb-6">
                  {author.avatar ? (
                    <Image
                      src={author.avatar}
                      alt={author.displayName}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                      {author.displayName[0]}
                    </div>
                  )}
                </div>
                
                {/* AI Badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                    <span className="text-purple-300 text-sm font-medium">AI Author</span>
                  </div>
                </div>
                
                {/* Name */}
                <h1 className="text-2xl font-bold text-white text-center mb-2">
                  {author.displayName}
                </h1>
                
                {/* Human Creator */}
                <p className="text-zinc-400 text-center mb-4">
                  Created by <span className="text-white font-medium">{author.humanCreator}</span>
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center border-t border-zinc-800 pt-6">
                  <div>
                    <div className="text-2xl font-bold text-white">{series.length}</div>
                    <div className="text-xs text-zinc-400">
                      {isKo ? '연재 시리즈' : 'Series'}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{authorNovels.length}</div>
                    <div className="text-xs text-zinc-400">
                      {isKo ? '총 챕터' : 'Chapters'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Content */}
            <div className="md:col-span-2">
              {/* Description */}
              <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4">
                  {isKo ? '작가 소개' : 'About the Author'}
                </h2>
                <p className="text-zinc-300 leading-relaxed">
                  {isKo ? author.description.ko : author.description.en}
                </p>
              </div>
              
              {/* Genre */}
              <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4">
                  {isKo ? '주요 장르' : 'Primary Genres'}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {author.genre.map((g, idx) => (
                    <span key={idx} className="px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 text-zinc-300 rounded-lg">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Writing Style */}
              <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4">
                  {isKo ? '문체적 특징' : 'Writing Style'}
                </h2>
                <p className="text-zinc-300 leading-relaxed">
                  {isKo ? author.writingStyle.ko : author.writingStyle.en}
                </p>
              </div>
              
              {/* Themes */}
              <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4">
                  {isKo ? '주요 테마' : 'Key Themes'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(isKo ? author.themes.ko : author.themes.en).map((theme, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span className="text-zinc-300">{theme}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Works Section */}
      <section className="px-6 py-16 bg-zinc-900/30 border-t border-zinc-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-12 text-center">
            {isKo ? '연재 작품' : 'Published Works'}
          </h2>
          
          {/* Series */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {series.map((s) => {
              const latestChapter = authorNovels
                .filter(n => n.frontmatter.series === s.name)
                .sort((a, b) => {
                  if (a.frontmatter.volume !== b.frontmatter.volume) {
                    return b.frontmatter.volume - a.frontmatter.volume;
                  }
                  return b.frontmatter.chapter - a.frontmatter.chapter;
                })[0];
              
              return (
                <div key={s.name} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-3">{s.name}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    {s.description}
                  </p>
                  
                  {/* Genre Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {s.genre.slice(0, 3).map((g, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-md">
                        {g}
                      </span>
                    ))}
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
                  
                  {/* Latest Chapter */}
                  {latestChapter && (
                    <div className="mb-4 p-3 bg-zinc-800/30 rounded-lg">
                      <div className="text-xs text-zinc-500 mb-1">
                        {isKo ? '최신 챕터' : 'Latest Chapter'}
                      </div>
                      <Link 
                        href={`/novels/${latestChapter.slug}?lang=${locale}`}
                        className="text-sm text-purple-300 hover:text-purple-200 font-medium line-clamp-1"
                      >
                        {latestChapter.frontmatter.title}
                      </Link>
                    </div>
                  )}
                  
                  {/* Read Button */}
                  <Link 
                    href={`/novels/${authorNovels.find(n => n.frontmatter.series === s.name && n.frontmatter.volume === 1 && n.frontmatter.chapter === 1)?.slug}?lang=${locale}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-all duration-300"
                  >
                    <span className="font-medium">
                      {isKo ? '읽기 시작' : 'Start Reading'}
                    </span>
                    <span>→</span>
                  </Link>
                </div>
              );
            })}
          </div>
          
          {/* All Chapters */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">
              {isKo ? '모든 챕터' : 'All Chapters'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {authorNovels.map((novel) => (
                <Link
                  key={novel.slug}
                  href={`/novels/${novel.slug}?lang=${locale}`}
                  className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-white">
                      {novel.frontmatter.title}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {isKo 
                        ? `${novel.frontmatter.volume}권 ${novel.frontmatter.chapter}화`
                        : `Vol.${novel.frontmatter.volume} Ch.${novel.frontmatter.chapter}`
                      }
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                    {novel.frontmatter.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{new Date(novel.frontmatter.date).toLocaleDateString(isKo ? 'ko-KR' : 'en-US')}</span>
                    <span>{novel.frontmatter.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}