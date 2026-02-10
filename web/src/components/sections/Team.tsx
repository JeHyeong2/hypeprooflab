'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FloatingOrb } from './HeroSection';
import { useAnimationConfig } from '@/hooks/useReducedMotion';

const teamMembers = [
  {
    name: "Jay",
    role: "Lead / Tech",
    bio: "Staff Software Engineer @ Silicon Valley Tech Company",
    education: "Hanyang Univ. — CS Ph.D Cand.",
    image: "/members/jay.png",
  },
  {
    name: "Kiwon",
    role: "Marketing / Strategy",
    bio: "Global Offline Marketing Specialist",
    education: "George Washington Univ. — Psychology & Philosophy",
    image: "/members/kiwon.svg",
  },
  {
    name: "TJ",
    role: "Contents / Media Production",
    bio: "Media Specialist / Ex-Founder",
    image: "/members/tj.svg",
  },
  {
    name: "Ryan",
    role: "Research / Data Analysis",
    bio: "Quantitative Researcher @ AssetPlus (AlphaBridge)",
    education: "Ph.D in Physics — Ex-Scientist @ CERN",
    image: "/members/ryan.png",
  },
  {
    name: "JY",
    role: "Research / AI Engineering",
    bio: "AI/ML Engineer @ Remember | Ex-Quant",
    education: "M.S. in Physics",
    image: "/members/jy.png",
  },
  {
    name: "Sebastian",
    role: "Engineering / Management",
    bio: "Engineering Manager @ Silicon Valley Tech Company",
    education: "Politechnika Łódzka — M.Sc. Electronics & Telecommunications",
    image: "/members/sebastian.png",
  },
];

interface TeamMemberCardProps {
  member: typeof teamMembers[0];
  index: number;
}

const TeamMemberCard = React.memo(function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  const { shouldReduce, tap } = useAnimationConfig();

  return (
    <motion.div
      className="glass p-8 group relative overflow-hidden"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: shouldReduce ? 0.2 : 0.6, delay: shouldReduce ? 0 : index * 0.1 }}
      whileHover={shouldReduce ? {} : { y: -8, scale: 1.02 }}
    >
      {!shouldReduce && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1), transparent 70%)" }}
        />
      )}

      <div className="relative z-10 text-center">
        {/* Avatar */}
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden ring-2 ring-purple-500/30 group-hover:ring-purple-400/60 transition-all"
          whileHover={shouldReduce ? {} : { scale: 1.1 }}
          transition={shouldReduce ? {} : { type: "spring", stiffness: 300 }}
        >
          <Image
            src={member.image}
            alt={member.name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Name & Role */}
        <motion.h3
          className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors"
          whileHover={shouldReduce ? {} : { scale: 1.05 }}
        >
          {member.name}
        </motion.h3>
        <p className="text-purple-400 text-sm font-medium mb-3">
          {member.role}
        </p>

        {/* Bio */}
        <p className="text-zinc-300 text-sm leading-relaxed">
          {member.bio}
        </p>
        {member.education && (
          <p className="text-zinc-500 text-xs mt-2">
            {member.education}
          </p>
        )}
      </div>
    </motion.div>
  );
});

export function Team() {
  const { shouldReduce, tap } = useAnimationConfig();

  return (
    <section id="team" className="py-32 px-6 relative overflow-hidden">
      {!shouldReduce && (
        <>
          <FloatingOrb className="w-[600px] h-[600px] bg-purple-600/20 -left-60 top-1/4" delay={1} />
          <FloatingOrb className="w-[400px] h-[400px] bg-indigo-600/15 -right-40 bottom-1/4" delay={3} />
        </>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="glass px-4 py-2 text-xs text-purple-400 uppercase tracking-widest inline-block mb-6"
            initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.2 : 0.6 }}
          >
            Meet the Team
          </motion.span>

          <motion.h2
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.2 : 0.8, delay: shouldReduce ? 0 : 0.2 }}
          >
            <span className="text-gradient">AI 전문가</span>들이 만듭니다
          </motion.h2>

          <motion.p
            className="text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.2 : 0.6, delay: shouldReduce ? 0 : 0.4 }}
          >
            우리는 AI의 진짜 가치를 발견하고 공유하는 데 열정을 가진 전문가들입니다.
          </motion.p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: shouldReduce ? 0 : 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: shouldReduce ? 0.2 : 0.8, delay: shouldReduce ? 0 : 0.4 }}
        >
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.name} member={member} index={index} />
          ))}
        </motion.div>

        {/* Join Team CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduce ? 0.2 : 0.6, delay: shouldReduce ? 0 : 0.6 }}
        >
          <p className="text-zinc-400 mb-6">
            AI 분야의 전문가이신가요? 함께 더 나은 미래를 만들어갑시다.
          </p>
          <motion.a
            href="mailto:jayleekr0125@gmail.com"
            className="glass px-8 py-4 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 transition-all duration-300 inline-flex items-center gap-2"
            whileHover={shouldReduce ? {} : { scale: 1.05, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}
            whileTap={tap}
          >
            Join Our Team
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
