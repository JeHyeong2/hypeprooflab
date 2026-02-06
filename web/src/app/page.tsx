'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback, lazy } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import { LoadingBoundary, LazySection } from '@/components/LoadingBoundary';
import { PageLoader } from '@/components/LoadingSpinner';
import { Logo, MobileMenu, NavLink } from '@/components/layout/Navigation';
import { ScrollProgress, CursorFollower } from '@/components/ui/UIEffects';
import { SocialProofBar, Hero, FloatingOrb } from '@/components/sections/HeroSection';
import { FeaturesSection, FeatureCard } from '@/components/sections/FeaturesSection';
import { LatestContentPreview, NewsletterSignup } from '@/components/sections/ContentSection';
import { 
  LazyWrapper, 
  LazyFeaturesSection, 
  LazyLatestContentPreview, 
  LazyNewsletterSignup,
  MemoizedHero,
  MemoizedSocialProofBar
} from '@/components/LazyComponents';

// Performance optimizations
const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [node, setNode] = useState<Element | null>(null);

  const observer = useMemo(
    () =>
      typeof window !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
          }, options)
        : null,
    [options]
  );

  useEffect(() => {
    if (!observer || !node) return;
    
    observer.observe(node);
    return () => observer.disconnect();
  }, [observer, node]);

  return [setNode, isIntersecting] as const;
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const slideInFromLeft = {
  initial: { x: -60, opacity: 0 },
  whileInView: { x: 0, opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: "easeOut" }
};

const slideInFromRight = {
  initial: { x: 60, opacity: 0 },
  whileInView: { x: 0, opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: "easeOut" }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  whileInView: { scale: 1, opacity: 1 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

// Sample columns data - in production, this would come from a CMS or API
const categoryStyles: Record<string, { gradient: string; icon: string }> = {
  "Research": { gradient: "from-purple-600/50 to-indigo-900/50", icon: "🔬" },
  "Analysis": { gradient: "from-blue-600/50 to-cyan-900/50", icon: "📊" },
  "Education": { gradient: "from-emerald-600/50 to-teal-900/50", icon: "📚" },
  "Opinion": { gradient: "from-orange-600/50 to-red-900/50", icon: "💭" },
};

const columns = [
  {
    slug: "claude-opus-4-6-alignment",
    title: "Claude Opus 4.6: When Safety Meets Soul",
    excerpt: "Anthropic's latest release isn't just an upgrade—it's a philosophical statement about where AI alignment is heading.",
    date: "2026-02-06",
    category: "Research",
  },
  {
    slug: "openai-agents-sdk",
    title: "The Rise of Agent Frameworks",
    excerpt: "From OpenAI Swarm to Claude Code SDK, the agent wars are heating up. Here's what it means for developers.",
    date: "2026-02-05",
    category: "Analysis",
  },
  {
    slug: "ai-education-paradigm",
    title: "Teaching AI to Kids: A New Curriculum",
    excerpt: "We designed an AI education program for middle schoolers. The results surprised even us.",
    date: "2026-02-03",
    category: "Education",
  }
];

function ColumnCard({ column, delay }: { column: typeof columns[0]; delay: number }) {
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
      {/* Category badge with gradient */}
      <motion.div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${style.gradient} text-white`}
        whileHover={{ scale: 1.1 }}
      >
        <span className="mr-1">{style.icon}</span>
        {column.category}
      </motion.div>
      
      <div className="space-y-3 relative z-10">
        <time className="text-xs text-zinc-500">
          {new Date(column.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </time>
        
        <motion.h3 
          className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors duration-300 leading-tight"
          whileHover={{ x: 5 }}
        >
          {column.title}
        </motion.h3>
        
        <p className="text-zinc-400 text-sm leading-relaxed">
          {column.excerpt}
        </p>
        
        <motion.div
          className="flex items-center text-purple-400 text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <span>Read article</span>
          <motion.span
            className="ml-1"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </motion.div>
      </div>
      
      {/* Hover gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1), transparent 70%)" }}
        whileHover={{
          background: [
            "radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.1), transparent 70%)",
            "radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.1), transparent 70%)",
            "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1), transparent 70%)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.article>
  );
}

// Community Section Component
function CommunityHero() {
  const stats = [
    { label: "Countries", value: "50+", icon: "🌍" },
    { label: "Expert Verification Rate", value: "95%", icon: "✅" },
    { label: "Member Satisfaction", value: "4.8/5", icon: "⭐" },
    { label: "Active Projects", value: "12+", icon: "🚀" }
  ];

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
          <motion.span 
            className="glass px-4 py-2 text-xs text-purple-400 uppercase tracking-widest inline-block mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Global Community
          </motion.span>
          
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Where AI <span className="text-gradient">Professionals</span> Connect
          </motion.h2>
          
          <motion.p 
            className="text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            HypeProof AI Community는 AI의 진짜 가치를 추구하는 전문가들이 모인 글로벌 허브입니다.
            <br />
            <span className="text-purple-400 font-medium">Signal &gt; Noise. Proof &gt; Promise.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.a
              href="https://discord.gg/hypeproof"
              className="glass px-8 py-4 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 transition-all duration-300 inline-flex items-center gap-3 bg-purple-600/20"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
              </svg>
              Join 3,500+ AI Experts
            </motion.a>
            <motion.a
              href="/community"
              className="glass px-8 py-4 text-white font-medium rounded-full border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300 inline-flex items-center gap-2"
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Community
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center glass p-6 group"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div 
                className="text-4xl mb-3"
                whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stat.icon}
              </motion.div>
              <motion.div 
                className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: i * 0.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Community Features Preview */}
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
              title: "Expert-Verified Content",
              description: "모든 콘텐츠는 현업 AI 전문가들의 검증을 거쳐 신뢰성을 보장합니다."
            },
            {
              icon: "🤝",
              title: "Global Networking",
              description: "전 세계 50+ 국가의 AI 전문가들과 실시간으로 소통하고 협업하세요."
            },
            {
              icon: "🚀",
              title: "Collaborative Projects",
              description: "아이디어를 실제 프로젝트로 발전시킬 수 있는 환경과 파트너를 제공합니다."
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="text-5xl mb-4"
                whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <LoadingBoundary>
      <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
        {/* Progress and cursor effects */}
        <ScrollProgress />
        <CursorFollower />
        
        {/* Navigation */}
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 glass bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Logo />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink href="#features">What We Do</NavLink>
              <NavLink href="#community">Community</NavLink>
              <NavLink href="#team">Team</NavLink>
              <motion.a
                href="mailto:jayleekr0125@gmail.com"
                className="glass px-4 py-2 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact
              </motion.a>
            </div>
            
            <MobileMenu />
          </div>
        </motion.nav>
        
        {/* Social Proof Bar */}
        <MemoizedSocialProofBar />
        
        {/* Hero Section */}
        <LazySection>
          <MemoizedHero />
        </LazySection>
        
        {/* Features Section */}
        <LazyWrapper>
          <LazySection>
            <LazyFeaturesSection />
          </LazySection>
        </LazyWrapper>
        
        {/* Latest Content */}
        <LazyWrapper>
          <LazySection>
            <LazyLatestContentPreview />
          </LazySection>
        </LazyWrapper>
        
        {/* Columns Preview */}
        <LazySection>
          <section className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-white mb-4">Latest Thinking</h2>
                <p className="text-zinc-500 max-w-2xl mx-auto">
                  In-depth analysis, research findings, and opinions from our team
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {columns.map((column, i) => (
                  <ColumnCard key={column.slug} column={column} delay={i * 0.1} />
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
                  <motion.span
                    className="glass px-8 py-3 text-white font-medium rounded-full border border-zinc-700/50 hover:border-purple-500/50 transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View All Articles
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </section>
        </LazySection>
        
        {/* Community Section */}
        <LazySection>
          <CommunityHero />
        </LazySection>
        
        {/* Newsletter */}
        <LazyWrapper>
          <LazySection>
            <LazyNewsletterSignup />
          </LazySection>
        </LazyWrapper>
        
        {/* Footer */}
        <footer className="py-16 px-6 border-t border-zinc-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <span className="text-white font-semibold">HypeProof AI</span>
                </div>
                <p className="text-zinc-500 text-sm">
                  Deep research, honest conversations, practical insights.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Content</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><a href="#" className="hover:text-white transition-colors">Podcast</a></li>
                  <li><a href="/columns" className="hover:text-white transition-colors">Articles</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Research</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Community</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><a href="https://discord.gg/hypeproof" className="hover:text-white transition-colors">Discord</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><a href="mailto:jayleekr0125@gmail.com" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
              <p className="text-zinc-500 text-sm">
                © 2026 HypeProof AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </LoadingBoundary>
  );
}