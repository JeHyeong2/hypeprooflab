'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FloatingOrb } from './HeroSection';

// Latest Content Preview Component
function LatestContentPreview() {
  const latestContent = [
    {
      type: "Podcast",
      title: "Coming Soon 🚧",
      description: "HypeProof Lab 팟캐스트를 준비하고 있습니다. AI의 실체를 파헤치는 대화, 곧 만나보세요.",
      date: "Coming Soon",
      duration: "준비중",
      icon: "🎙️",
      comingSoon: true,
    },
    {
      type: "Column",
      title: "회장님의 시대가 열리다",
      description: "에이전트가 모든 실행을 대행하는 세상에서, 인간 고유의 가치는 정확히 어디에 있는가?",
      date: "Feb 10, 2026",
      duration: "12 min read",
      icon: "📝",
      href: "/columns/2026-02-10-era-of-the-chairman?lang=ko",
    }
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">최신 콘텐츠</h2>
          <p className="text-zinc-500">연구실에서 전하는 최신 리서치와 대화</p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {latestContent.map((item, i) => {
            const Wrapper = item.href ? ({ children, ...props }: any) => <a href={item.href} {...props}>{children}</a> : 'div' as any;
            return (
              <motion.div
                key={item.title}
                className={`glass p-6 group ${item.comingSoon ? 'opacity-70' : 'cursor-pointer'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={item.comingSoon ? {} : { y: -4 }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-purple-400 uppercase tracking-wider font-medium">
                        {item.type}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-500">{item.date}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-500">{item.duration}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                    {item.comingSoon && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                        🚧 준비중
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Newsletter Signup Component
function NewsletterSignup() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <FloatingOrb className="w-[400px] h-[400px] bg-purple-600/20 -right-40 top-1/2" delay={2} />
      
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">소식 받기</h2>
          <p className="text-zinc-400 mb-8">
            AI 리서치, 도구, 그리고 기술과 인간의 교차점에 대한 주간 인사이트를 받아보세요.
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 glass px-4 py-3 text-white placeholder-zinc-500 rounded-full border border-zinc-700/50 focus:border-purple-500/50 focus:outline-none transition-colors"
            />
            <motion.button
              className="glass px-6 py-3 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 bg-purple-600/20 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              구독하기
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export { LatestContentPreview, NewsletterSignup };