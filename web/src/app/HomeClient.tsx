'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ScrollProgress, CursorFollower } from '@/components/ui/UIEffects';
import { Hero } from '@/components/sections/Hero';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { NewsletterSignup } from '@/components/sections/ContentSection';
import { Team } from '@/components/sections/Team';
import { FloatingOrb } from '@/components/sections/HeroSection';
import { useAnimationConfig } from '@/hooks/useReducedMotion';
import { useI18n } from '@/contexts/I18nContext';

export interface ColumnPreview {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

const categoryStyles: Record<string, { gradient: string; icon: string }> = {
  "Research": { gradient: "from-purple-600/50 to-indigo-900/50", icon: "🔬" },
  "Analysis": { gradient: "from-blue-600/50 to-cyan-900/50", icon: "📊" },
  "Education": { gradient: "from-emerald-600/50 to-teal-900/50", icon: "📚" },
  "Opinion": { gradient: "from-orange-600/50 to-red-900/50", icon: "💭" },
};

function ColumnCard({ column, delay, locale }: { column: ColumnPreview; delay: number; locale?: string }) {
  const style = categoryStyles[column.category] || categoryStyles["Research"];

  return (
    <motion.article
      className="glass p-6 group cursor-pointer relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4 }}
    >
      <motion.div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${style.gradient} text-white`}
      >
        <span className="mr-1">{style.icon}</span>
        {column.category}
      </motion.div>
      
      <div className="space-y-3 relative z-10">
        <time className="text-xs text-zinc-500">
          {new Date(column.date).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { 
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </time>
        
        <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors duration-300 leading-tight">
          {column.title}
        </h3>
        
        <p className="text-zinc-400 text-sm leading-relaxed">
          {column.excerpt}
        </p>
        
        <div className="flex items-center text-purple-400 text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>{locale === 'ko' ? '칼럼 읽기' : 'Read column'}</span>
          <span className="ml-1">→</span>
        </div>
      </div>
    </motion.article>
  );
}

function ColumnsPreview({ koColumns, enColumns }: { koColumns: ColumnPreview[]; enColumns: ColumnPreview[] }) {
  const { locale } = useI18n();
  const columns = locale === 'ko' ? koColumns : (enColumns.length > 0 ? enColumns : koColumns);
  const isKo = locale === 'ko';

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            {isKo ? '최신 칼럼' : 'Latest Columns'}
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            {isKo ? '팀의 심층 분석, 리서치, 그리고 인사이트' : 'Deep analysis, research, and insights from the team'}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {columns.map((column, i) => (
            <Link key={column.slug} href={`/columns/${column.slug}?lang=${locale}`}>
              <ColumnCard column={column} delay={i * 0.1} locale={locale} />
            </Link>
          ))}
        </div>
        
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/columns">
            <span className="glass px-8 py-3 text-white font-medium rounded-full border border-zinc-700/50 hover:border-purple-500/50 transition-all duration-300 inline-flex items-center gap-2 cursor-pointer">
              {isKo ? '모든 칼럼 보기' : 'View all columns'}
              <span>→</span>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function NovelsPreview({ chapterCount }: { chapterCount: number }) {
  const { locale } = useI18n();
  const isKo = locale === 'ko';

  return (
    <section className="py-24 px-6 bg-zinc-900/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            <span className="text-purple-300 text-sm font-medium">NEW</span>
          </motion.div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            {isKo ? 'AI 웹소설' : 'AI Novels'}
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            {isKo 
              ? '인공지능이 탐구하는 의식과 존재의 이야기. 철학적 사유와 SF적 상상력이 만나는 새로운 서사.'
              : 'AI explores consciousness and existence. Where philosophical inquiry meets science fiction imagination.'
            }
          </p>
        </motion.div>
        
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border border-zinc-700/50 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-indigo-600/10"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="text-purple-300 text-sm font-medium">AI Generated</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">SIMULACRA</h3>
                  <p className="text-zinc-300 leading-relaxed mb-4">
                    {isKo 
                      ? '현실과 가상의 경계가 모호해진 근미래, 디지털 의식의 탄생과 존재의 본질에 대한 철학적 탐구.'
                      : 'In a near future where the boundaries between reality and virtuality blur, a philosophical exploration of the birth of digital consciousness and the essence of existence.'
                    }
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['철학적 SF', 'Cyberpunk', '의식 탐구'].map((genre, idx) => (
                      <span key={idx} className="px-3 py-1 text-xs bg-zinc-800/50 text-zinc-300 rounded-full border border-zinc-700">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                    <img src="/authors/cipher.png" alt="CIPHER" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <div className="text-white font-semibold">CIPHER</div>
                      <div className="text-zinc-400 text-sm">by Jay</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="p-3 bg-zinc-800/20 rounded-lg">
                      <div className="text-xl font-bold text-white">{chapterCount}</div>
                      <div className="text-xs text-zinc-400">{isKo ? '챕터' : 'Chapters'}</div>
                    </div>
                    <div className="p-3 bg-zinc-800/20 rounded-lg">
                      <div className="text-xl font-bold text-white">15</div>
                      <div className="text-xs text-zinc-400">min read</div>
                    </div>
                    <div className="p-3 bg-zinc-800/20 rounded-lg">
                      <div className="text-xl font-bold text-green-400">{isKo ? '연재중' : 'Ongoing'}</div>
                      <div className="text-xs text-zinc-400">Status</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/novels/simulacra-vol1-ch01?lang=${locale}`}>
                  <span className="px-8 py-3 bg-purple-600/20 border border-purple-500/40 text-purple-300 rounded-lg hover:bg-purple-600/30 hover:border-purple-400/60 transition-all duration-300 text-center cursor-pointer inline-block font-medium">
                    {isKo ? '첫 화부터 읽기' : 'Start Reading'}
                  </span>
                </Link>
                <Link href="/novels">
                  <span className="px-8 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white rounded-lg hover:border-zinc-600/70 transition-all duration-300 text-center cursor-pointer inline-block">
                    {isKo ? '모든 소설 보기' : 'Browse All Novels'}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CommunityHero() {
  const { locale } = useI18n();
  const isKo = locale === 'ko';

  return (
    <section id="community" className="py-32 px-6 relative overflow-hidden">
      <FloatingOrb className="w-[600px] h-[600px] bg-purple-600/20 -left-60 top-1/4" delay={1} />
      <FloatingOrb className="w-[400px] h-[400px] bg-indigo-600/15 -right-40 bottom-1/4" delay={3} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="glass px-4 py-2 text-xs text-purple-400 uppercase tracking-widest inline-block mb-6">
            {isKo ? '커뮤니티' : 'Community'}
          </span>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {isKo ? <>AI를 함께 <span className="text-gradient">탐구</span>하는 공간</> : <>Exploring AI <span className="text-gradient">Together</span></>}
          </h2>
          
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed mb-8">
            {isKo ? 'HypeProof AI Community는 AI의 진짜 가치를 함께 탐구하는 팀입니다.' : 'HypeProof AI Community is a team exploring the real value of AI together.'}
            <br />
            <span className="text-purple-400 font-medium">Signal &gt; Noise. Proof &gt; Promise.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="https://discord.gg/hypeproof"
              className="glass px-8 py-4 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 transition-all duration-300 inline-flex items-center gap-3 bg-purple-600/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
              </svg>
              {isKo ? 'Discord 참여하기' : 'Join Our Discord'}
            </a>
          </div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            {
              icon: "🎯",
              title: isKo ? "팩트체크 콘텐츠" : "Fact-Checked Content",
              description: isKo ? "팀이 직접 리서치하고 검증한 콘텐츠를 제공합니다." : "Content researched and verified by our team."
            },
            {
              icon: "🤝",
              title: isKo ? "함께 배우기" : "Learn Together",
              description: isKo ? "AI에 관심 있는 사람들과 소통하고 협업하세요." : "Connect and collaborate with people who share your interest in AI."
            },
            {
              icon: "🚀",
              title: isKo ? "협업 프로젝트" : "Collaborative Projects",
              description: isKo ? "아이디어를 실제 프로젝트로 발전시킬 수 있는 환경과 파트너를 제공합니다." : "We provide the environment and partners to turn ideas into real projects."
            }
          ].map((feature) => (
            <div key={feature.title} className="text-center group">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default function HomeClient({ novelChapterCount, koColumns, enColumns }: { novelChapterCount: number; koColumns: ColumnPreview[]; enColumns: ColumnPreview[] }) {
  const { shouldReduce } = useAnimationConfig();

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {!shouldReduce && (
        <>
          <ScrollProgress />
          <CursorFollower />
        </>
      )}
      
      <Navigation />
      <Hero />
      <FeaturesSection />
      <ColumnsPreview koColumns={koColumns} enColumns={enColumns} />
      <NovelsPreview chapterCount={novelChapterCount} />
      <CommunityHero />
      <Team />
      <NewsletterSignup />
      <Footer />
    </div>
  );
}
