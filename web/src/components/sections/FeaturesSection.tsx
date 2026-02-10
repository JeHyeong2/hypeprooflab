'use client';

import React from 'react';
import { motion } from 'framer-motion';

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

function FeatureCard({ icon, title, description, delay }: { 
  icon: string; 
  title: string; 
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      className="relative glass p-8 group cursor-pointer overflow-hidden min-h-[240px] flex flex-col"
      style={{ willChange: 'transform' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ 
        y: -8, 
        scale: 1.01,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15), transparent 70%)" }}
        whileHover={{
          background: [
            "radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.15), transparent 70%)",
            "radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.15), transparent 70%)",
            "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15), transparent 70%)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <motion.div 
        className="text-5xl mb-5 relative z-10"
        whileHover={{ 
          scale: 1.2, 
          rotate: [0, -5, 5, 0],
          y: -5
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {icon}
      </motion.div>
      <motion.h3 
        className="text-xl font-semibold text-white mb-4 group-hover:text-purple-400 transition-colors duration-300 relative z-10 overflow-hidden"
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <motion.div
          initial={{ y: "100%" }}
          whileInView={{ y: "0%" }}
          transition={{ duration: 0.6, delay: delay + 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {title.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.4 + (i * 0.02) }}
              viewport={{ once: true }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.div>
      </motion.h3>
      <motion.div 
        className="text-zinc-400 leading-relaxed text-[15px] flex-1 relative z-10 overflow-hidden"
        whileHover={{ color: "#d4d4d8" }}
        transition={{ duration: 0.3 }}
      >
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {description}
        </motion.p>
        
        {/* Read more indicator on hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ y: 10 }}
          whileHover={{ y: 0 }}
        >
          <div className="text-xs text-purple-400 font-medium flex items-center gap-1 mt-2">
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
            Explore this
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center"
        whileHover={{
          background: [
            "linear-gradient(90deg, #a855f7, #6366f1, #a855f7)",
            "linear-gradient(90deg, #6366f1, #a855f7, #6366f1)",
            "linear-gradient(90deg, #a855f7, #6366f1, #a855f7)"
          ]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute inset-0 border border-transparent group-hover:border-purple-500/30 rounded-xl transition-colors duration-500"
        whileHover={{
          boxShadow: [
            "0 0 0 1px rgba(168, 85, 247, 0.3)",
            "0 0 20px rgba(168, 85, 247, 0.2)",
            "0 0 0 1px rgba(168, 85, 247, 0.3)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "🔬",
      title: "AI Research & Analysis",
      description: "최신 AI 기술을 리서치하고, 심층 분석 칼럼을 통해 진짜 인사이트를 전달합니다. Hype를 걷어내고 실체를 검증합니다."
    },
    {
      icon: "🏗️",
      title: "Agent Architecture Design", 
      description: "멀티 에이전트 시스템 설계부터 실전 구축까지. 이론이 아닌 실제 동작하는 에이전트 아키텍처를 만듭니다."
    },
    {
      icon: "🌐",
      title: "Open Community",
      description: "디스코드 기반 AI 엔지니어 커뮤니티. 전 세계 전문가들과 함께 배우고, 토론하고, 만듭니다."
    }
  ];

  return (
    <section 
      id="features" 
      className="py-32 px-6 relative overflow-hidden" 
      aria-labelledby="features-heading"
    >
      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-purple-500/10 blur-xl"
        {...slideInFromLeft}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl"
        {...slideInFromRight}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h2 
            id="features-heading"
            className="text-4xl font-bold text-white mb-4 overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            tabIndex={-1}
          >
            <motion.span 
              className="inline-block"
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              What We Do
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-zinc-500 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Three tracks to explore the future of AI
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { 
                  opacity: 0, 
                  y: 60,
                  rotateX: -15 
                },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  transition: {
                    duration: 0.6,
                    ease: "easeOut"
                  }
                }
              }}
            >
              <FeatureCard {...feature} delay={0} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export { FeaturesSection, FeatureCard };