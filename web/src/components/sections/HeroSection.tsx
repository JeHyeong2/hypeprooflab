'use client';

import React, { useRef, useMemo, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';

import { usePerformanceOptimization, useOptimizedIntersectionObserver, getOptimizedAnimationVariants } from '@/hooks/usePerformanceOptimization';

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

const FloatingOrb = React.memo(({ className, delay = 0 }: { className: string; delay?: number }) => {
  const [ref, isIntersecting] = useOptimizedIntersectionObserver({ threshold: 0.1 });
  const { animationConfig } = usePerformanceOptimization();
  
  // Don't render on low-end devices or slow connections
  if (!animationConfig.enableFloatingOrbs) {
    return null;
  }
  
  return (
    <motion.div
      ref={ref}
      className={`absolute rounded-full blur-[100px] ${className}`}
      style={{ 
        willChange: isIntersecting ? 'transform, opacity' : 'auto',
        transform: isIntersecting ? undefined : 'translateZ(0)', // GPU layer optimization
        contain: 'layout style paint', // CSS containment for better performance
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isIntersecting && animationConfig.enableComplexEffects ? {
        y: [0, -60, 15, -40, 0],
        x: [0, 25, -10, 20, 0],
        scale: [1, 1.2, 0.95, 1.05, 1],
        opacity: [0.3, 0.7, 0.5, 0.6, 0.3],
        rotate: animationConfig.enableComplexEffects ? [0, 90, 180, 270, 360] : [0, 0, 0, 0, 0],
      } : { opacity: 0.3 }}
      transition={{
        duration: animationConfig.reducedDuration ? 5 : (10 + delay * 1.5),
        repeat: isIntersecting ? Infinity : 0,
        ease: "easeInOut",
        delay: isIntersecting ? delay : 0,
      }}
    />
  );
});

FloatingOrb.displayName = 'FloatingOrb';

function SocialProofBar() {
  const { locale } = useI18n();
  const isKo = locale === 'ko';
  const stats = [
    { label: isKo ? "팀 멤버" : "Team Members", value: "6" },
    { label: isKo ? "칼럼" : "Columns", value: "2" },
    { label: isKo ? "커뮤니티" : "Community", value: "Discord" },
  ];

  return (
    <motion.div 
      className="fixed top-16 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-purple-500/20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-center gap-8 md:gap-12 text-sm">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
            >
              <span className="text-purple-400 font-semibold">{stat.value}</span>
              <span className="text-zinc-500">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { animationConfig } = usePerformanceOptimization();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  // Conditional parallax effects for better performance
  const y = animationConfig.enableParallax 
    ? useTransform(scrollYProgress, [0, 1], [0, 300])
    : useTransform(scrollYProgress, [0, 1], [0, 0]);
    
  const yFast = animationConfig.enableParallax 
    ? useTransform(scrollYProgress, [0, 1], [0, 500])
    : useTransform(scrollYProgress, [0, 1], [0, 0]);
    
  const ySlow = animationConfig.enableParallax 
    ? useTransform(scrollYProgress, [0, 1], [0, 150])
    : useTransform(scrollYProgress, [0, 1], [0, 0]);
    
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = animationConfig.enableComplexEffects
    ? useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
    : useTransform(scrollYProgress, [0, 0.5], [1, 1]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Background floating orbs - slowest parallax */}
      <motion.div style={{ y: ySlow }}>
        <FloatingOrb className="w-[800px] h-[800px] bg-purple-600/25 -top-60 -left-60" delay={0} />
        <FloatingOrb className="w-[600px] h-[600px] bg-indigo-600/25 -bottom-40 -right-40" delay={2} />
      </motion.div>
      
      {/* Mid-layer orbs - medium parallax */}
      <motion.div style={{ y }}>
        <FloatingOrb className="w-[400px] h-[400px] bg-violet-500/30 top-1/3 left-1/3" delay={4} />
        <FloatingOrb className="w-[300px] h-[300px] bg-blue-600/25 bottom-1/4 right-1/4" delay={6} />
      </motion.div>
      
      {/* Foreground particles - fastest parallax */}
      <motion.div 
        style={{ y: yFast, opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
        className="absolute inset-0 pointer-events-none"
      >
        <motion.div 
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/60 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-indigo-400/80 rounded-full"
          animate={{ scale: [1, 2, 1], opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-violet-400/70 rounded-full"
          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
      </motion.div>
      
      <motion.div 
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        style={{ y, opacity, scale }}
      >
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp}>
            <span className="glass px-4 py-2 text-xs text-zinc-400 uppercase tracking-widest">
              Research Lab
            </span>
          </motion.div>
          
          {/* Main heading */}
          <motion.h1 
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-bold tracking-tight"
          >
            <span className="text-gradient">HypeProof AI</span>
          </motion.h1>
          
          {/* Enhanced Tagline */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <p className="text-2xl md:text-3xl text-zinc-300 max-w-3xl mx-auto leading-relaxed font-medium">
              We don't chase <span className="text-white">Hype</span>.
              <br />
              We <span className="text-purple-400">Prove</span> it.
            </p>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              Deep research, honest conversations, and practical AI insights for builders and skeptics alike.
            </p>
          </motion.div>
          
          {/* Dual CTA */}
          <motion.div variants={fadeInUp} className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href="https://discord.gg/hypeproof"
              className="glass px-8 py-4 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 transition-all duration-300 inline-flex items-center gap-2 bg-purple-600/20"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Join Discord
            </motion.a>
            <motion.a
              href="mailto:jayleekr0125@gmail.com"
              className="glass px-8 py-4 text-white font-medium rounded-full border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300 inline-flex items-center gap-2"
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const featuresSection = document.getElementById('features');
          featuresSection?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border border-zinc-700 flex justify-center pt-2 relative group-hover:border-purple-500/50 transition-colors duration-300"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div
            className="w-1 h-2 bg-zinc-500 rounded-full group-hover:bg-purple-400 transition-colors duration-300"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <motion.div
            className="absolute inset-0 rounded-full border border-purple-500/0 group-hover:border-purple-500/30"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </motion.div>
        
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
        >
          Scroll to explore
        </motion.div>
      </motion.div>
    </section>
  );
}

export { SocialProofBar, Hero, FloatingOrb };