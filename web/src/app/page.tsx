'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[100px] ${className}`}
      style={{ willChange: 'transform, opacity' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        y: [0, -60, 15, -40, 0],
        x: [0, 25, -10, 20, 0],
        scale: [1, 1.2, 0.95, 1.05, 1],
        opacity: [0.3, 0.7, 0.5, 0.6, 0.3],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 10 + delay * 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

function Logo() {
  return (
    <Link href="/">
      <motion.div 
        className="flex items-center gap-3 cursor-pointer"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">HypeProof AI</span>
      </motion.div>
    </Link>
  );
}

// Mobile Navigation Menu Component
function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <motion.button
        className="p-2 text-white"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-6 h-6 flex flex-col justify-center items-center"
          animate={isOpen ? "open" : "closed"}
        >
          <motion.span
            className="w-5 h-0.5 bg-white block"
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 6 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-5 h-0.5 bg-white block mt-1"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-5 h-0.5 bg-white block mt-1"
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -6 }
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.button>

      {/* Mobile Menu Overlay */}
      <motion.div
        className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-lg"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ 
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 1.1
        }}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Background gradient effects */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-indigo-600/10"
          animate={{
            background: isOpen ? [
              "linear-gradient(135deg, rgba(147, 51, 234, 0.1), transparent, rgba(79, 70, 229, 0.1))",
              "linear-gradient(135deg, rgba(79, 70, 229, 0.1), transparent, rgba(147, 51, 234, 0.1))",
            ] : "linear-gradient(135deg, transparent, transparent, transparent)",
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        
        <div className="flex flex-col items-center justify-center h-full space-y-12 relative z-10">
          <motion.a
            href="#features"
            className="text-white text-3xl font-medium relative"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isOpen ? 1 : 0,
              y: isOpen ? 0 : 30
            }}
            transition={{ delay: 0.1, duration: 0.4 }}
            whileHover={{ 
              scale: 1.08, 
              color: "#a855f7",
              textShadow: "0 0 20px rgba(168, 85, 247, 0.5)" 
            }}
            whileTap={{ scale: 0.95 }}
          >
            What We Do
            <motion.div
              className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400"
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
          
          <motion.a
            href="#team"
            className="text-white text-3xl font-medium relative"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isOpen ? 1 : 0,
              y: isOpen ? 0 : 30
            }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ 
              scale: 1.08, 
              color: "#a855f7",
              textShadow: "0 0 20px rgba(168, 85, 247, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            Team
            <motion.div
              className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400"
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
          
          <motion.a
            href="mailto:jayleekr0125@gmail.com"
            className="glass px-10 py-5 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 bg-purple-600/20 relative overflow-hidden"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ 
              opacity: isOpen ? 1 : 0,
              y: isOpen ? 0 : 30,
              scale: isOpen ? 1 : 0.9
            }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 0 40px rgba(168, 85, 247, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            <span className="relative z-10">Contact</span>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

function NavLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <motion.a
      href={href}
      className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm relative group cursor-pointer"
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={(e) => {
        e.preventDefault();
        if (href.startsWith('#')) {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      {children}
      <motion.div
        className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-purple-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"
      />
      <motion.div
        className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-md -m-2 transition-colors duration-300"
        whileHover={{
          boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)"
        }}
      />
    </motion.a>
  );
}

// Scroll Progress Indicator
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform-gpu z-50"
      style={{
        scaleX,
        transformOrigin: "0%"
      }}
    />
  );
}

// Enhanced Cursor Follower
function CursorFollower() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', updateMousePosition);
    
    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .cursor-pointer');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-purple-500/50 rounded-full pointer-events-none z-50 hidden md:block"
      animate={{
        x: mousePosition.x - 8,
        y: mousePosition.y - 8,
        scale: isHovering ? 1.5 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
    />
  );
}

// Social Proof Bar Component
function SocialProofBar() {
  const stats = [
    { label: "Episodes", value: "12+" },
    { label: "Researchers", value: "5" },
    { label: "Active Projects", value: "3" },
    { label: "Countries", value: "2" }
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const yFast = useTransform(scrollYProgress, [0, 1], [0, 500]);
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

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
              href="https://podcasts.apple.com/podcast/hypeproof-ai"
              className="glass px-8 py-4 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 transition-all duration-300 inline-flex items-center gap-2 bg-purple-600/20"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10l.707.707a7 7 0 01-7.071 12.586L1 16l.414-.414A4 4 0 013.828 13H6V5.414A2 2 0 017.414 4H18v6z" />
              </svg>
              Listen Now
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
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
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
          transition={{ duration: 0.6, delay: delay + 0.3, ease: [0.25, 0.1, 0.25, 1] }}
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
          transition={{ duration: 0.5, delay: delay + 0.6, ease: [0.25, 0.1, 0.25, 1] }}
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

// Latest Content Preview Component
function LatestContentPreview() {
  const latestContent = [
    {
      type: "Episode",
      title: "The AI Safety Debate: Are We Solving the Right Problem?",
      description: "A deep dive into Anthropic's Constitutional AI and what it means for the future of alignment.",
      date: "Feb 6, 2026",
      duration: "42 min",
      icon: "🎙️"
    },
    {
      type: "Research",
      title: "Claude Opus 4.6 Performance Analysis",
      description: "Comprehensive benchmarks and practical testing of Anthropic's latest model release.",
      date: "Feb 5, 2026",
      duration: "8 min read",
      icon: "🔬"
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
          <h2 className="text-3xl font-bold text-white mb-4">Latest Content</h2>
          <p className="text-zinc-500">Fresh research and conversations from the lab</p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {latestContent.map((item, i) => (
            <motion.div
              key={item.title}
              className="glass p-6 group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
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
                </div>
              </div>
            </motion.div>
          ))}
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
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-zinc-400 mb-8">
            Get weekly insights on AI research, tools, and the intersection of technology and humanity.
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
              Subscribe
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: "🔬",
      title: "Research",
      description: "Pushing AI boundaries through daily experiments and rigorous validation methods."
    },
    {
      icon: "🎙️",
      title: "Podcast",
      description: "Deep-dive conversations on AI trends, tools, and the people building tomorrow."
    },
    {
      icon: "📖",
      title: "Education",
      description: "Designing new paradigms for learning in the age of artificial intelligence."
    }
  ];

  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">What We Do</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Three tracks to explore the future of AI
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.article
      className="group cursor-pointer relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
    >
      <Link href={`/columns/${column.slug}`}>
        <motion.div 
          className="flex flex-col md:flex-row gap-6 p-6 glass rounded-2xl hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden"
          whileHover={{ 
            boxShadow: "0 20px 40px rgba(168, 85, 247, 0.15)",
            borderColor: "rgba(168, 85, 247, 0.5)"
          }}
        >
          {/* Enhanced background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
          
          {/* Scanning line effect */}
          <motion.div
            className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100"
            animate={isHovered ? { x: ["-100%", "100%"] } : {}}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          {/* Enhanced image placeholder with category-specific gradient */}
          <motion.div 
            className={`w-full md:w-64 h-40 bg-gradient-to-br ${style.gradient} rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative`}
            whileHover={{ 
              scale: 1.03,
              rotateY: 5,
              rotateX: 2,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full opacity-0 group-hover:opacity-100"
              animate={isHovered ? { x: ["0%", "200%"] } : {}}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            
            <motion.span 
              className="text-5xl opacity-60 relative z-10"
              whileHover={{ 
                scale: 1.2,
                rotate: 10,
                textShadow: "0 0 20px rgba(255,255,255,0.5)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {style.icon}
            </motion.span>
            
            {/* Category indicator */}
            <motion.div
              className="absolute top-2 right-2 text-xs bg-black/20 px-2 py-1 rounded-full text-white/80 opacity-0 group-hover:opacity-100"
              initial={{ scale: 0, opacity: 0 }}
              animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              {column.category}
            </motion.div>
          </motion.div>
          
          {/* Enhanced Content */}
          <div className="flex flex-col justify-center flex-1 relative z-10">
            <motion.div 
              className="flex items-center gap-3 mb-3"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
            >
              <motion.span 
                className="text-xs text-purple-400 uppercase tracking-wider font-medium"
                whileHover={{ scale: 1.05, color: "#c084fc" }}
              >
                {column.category}
              </motion.span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-500">{column.date}</span>
              <span className="text-zinc-600">•</span>
              <motion.span 
                className="text-xs text-zinc-500"
                initial={{ opacity: 0 }}
                animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
              >
                3 min read
              </motion.span>
            </motion.div>
            
            <motion.h3 
              className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors overflow-hidden"
              whileHover={{ x: 3 }}
            >
              <motion.div
                initial={{ y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {column.title}
              </motion.div>
            </motion.h3>
            
            <motion.p 
              className="text-zinc-400 text-sm leading-relaxed"
              whileHover={{ color: "#a1a1aa" }}
              transition={{ duration: 0.3 }}
            >
              {column.excerpt}
            </motion.p>
            
            <motion.div 
              className="mt-4 flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center text-purple-400 text-sm font-medium">
                <motion.span whileHover={{ x: 2 }}>Read more</motion.span>
                <motion.svg 
                  className="w-4 h-4 ml-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={isHovered ? { x: 2 } : { x: 0 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              </div>
              
              {/* Share indicator */}
              <motion.div
                className="flex items-center gap-1 text-zinc-600 text-xs"
                whileHover={{ color: "#9ca3af" }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.article>
  );
}

function Columns() {
  return (
    <section id="columns" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Columns</h2>
            <p className="text-zinc-500">Sharp takes on AI, tech, and the future</p>
          </div>
          <Link 
            href="/columns" 
            className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
        
        <div className="space-y-6">
          {columns.map((column, i) => (
            <ColumnCard key={column.slug} column={column} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

const memberColors: Record<string, string> = {
  "Jay": "from-purple-500 to-indigo-600",
  "Ryan": "from-blue-500 to-cyan-500",
  "JY": "from-emerald-500 to-teal-500",
  "TJ": "from-orange-500 to-red-500",
  "Kiwon": "from-pink-500 to-rose-500",
};

function TeamMember({ name, role, credential, delay }: { 
  name: string; 
  role: string; 
  credential?: string;
  delay: number;
}) {
  const gradient = memberColors[name] || "from-purple-500 to-indigo-600";
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="text-center group cursor-pointer relative"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${gradient} p-[2px] cursor-pointer relative overflow-hidden`}
        whileHover={{ 
          scale: 1.15, 
          rotate: 10,
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br opacity-0 group-hover:opacity-100"
          style={{
            background: `conic-gradient(from 0deg, ${gradient.replace('from-', '').replace(' to-', ', ')}, ${gradient.replace('from-', '').replace(' to-', ', ')})`,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div 
          className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center relative z-10"
          whileHover={{ 
            boxShadow: "inset 0 0 20px rgba(168, 85, 247, 0.3)" 
          }}
        >
          <motion.span 
            className="text-2xl font-bold text-white"
            whileHover={{ 
              scale: 1.1,
              rotate: -10,
              color: "#a855f7"
            }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {name[0]}
          </motion.span>
        </motion.div>
      </motion.div>
      
      <motion.h4 
        className="text-white font-semibold text-lg group-hover:text-purple-400 transition-colors duration-300"
        whileHover={{ 
          scale: 1.05,
          y: -2
        }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {name}
      </motion.h4>
      
      <motion.p 
        className="text-zinc-400 text-sm mt-1 group-hover:text-zinc-300 transition-colors duration-300"
        whileHover={{ scale: 1.02 }}
      >
        {role}
      </motion.p>
      
      {credential && (
        <motion.p 
          className="text-zinc-600 text-xs mt-1 max-w-[180px] mx-auto leading-relaxed group-hover:text-zinc-500 transition-colors duration-300"
          initial={{ opacity: 0.7 }}
          whileHover={{ 
            opacity: 1,
            scale: 1.05,
            y: -1
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {credential}
        </motion.p>
      )}
      
      <motion.div
        className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-purple-500/20 transition-colors duration-500 pointer-events-none"
        whileHover={{
          boxShadow: "0 8px 32px rgba(168, 85, 247, 0.15)"
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Enhanced hover card */}
      <motion.div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 glass p-4 rounded-xl border border-white/10 backdrop-blur-xl pointer-events-none z-50"
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10,
          scale: isHovered ? 1 : 0.9
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center">
          <h5 className="text-white font-semibold text-sm mb-1">{name}</h5>
          <p className="text-purple-400 text-xs font-medium mb-2">{role}</p>
          {credential && (
            <p className="text-zinc-400 text-xs leading-relaxed">{credential}</p>
          )}
          
          {/* Skills/Interests based on name */}
          <div className="mt-3 flex flex-wrap gap-1 justify-center">
            {name === "Jay" && (
              <>
                <span className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">React</span>
                <span className="text-[10px] px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">AI/ML</span>
              </>
            )}
            {name === "Ryan" && (
              <>
                <span className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">Physics</span>
                <span className="text-[10px] px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full">Quant</span>
              </>
            )}
            {name === "JY" && (
              <>
                <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">AI Research</span>
                <span className="text-[10px] px-2 py-1 bg-teal-500/20 text-teal-300 rounded-full">Physics</span>
              </>
            )}
            {name === "TJ" && (
              <>
                <span className="text-[10px] px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full">Content</span>
                <span className="text-[10px] px-2 py-1 bg-red-500/20 text-red-300 rounded-full">Media</span>
              </>
            )}
            {name === "Kiwon" && (
              <>
                <span className="text-[10px] px-2 py-1 bg-pink-500/20 text-pink-300 rounded-full">Marketing</span>
                <span className="text-[10px] px-2 py-1 bg-rose-500/20 text-rose-300 rounded-full">Strategy</span>
              </>
            )}
          </div>
        </div>
        
        {/* Arrow pointing down */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-r border-b border-white/10"></div>
      </motion.div>
    </motion.div>
  );
}

function Philosophy() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <FloatingOrb className="w-[500px] h-[500px] bg-indigo-600/20 -left-40 top-0" delay={1} />
      <FloatingOrb className="w-[300px] h-[300px] bg-purple-600/15 -right-20 bottom-20" delay={3} />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="text-center relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          {/* Glass container */}
          <motion.div
            className="glass p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 relative overflow-hidden"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover={{
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 32px 64px rgba(168, 85, 247, 0.1)",
            }}
          >
            {/* Dynamic background gradient */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1), transparent 70%)",
              }}
              animate={{
                background: [
                  "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.1), transparent 70%)",
                  "radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1), transparent 70%)",
                  "radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1), transparent 70%)",
                  "radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1), transparent 70%)",
                  "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.1), transparent 70%)",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Decorative quote marks */}
            <motion.div
              className="absolute -top-4 -left-4 text-6xl text-purple-500/20 font-serif leading-none"
              initial={{ opacity: 0, scale: 0, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              "
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -right-4 text-6xl text-purple-500/20 font-serif leading-none rotate-180"
              initial={{ opacity: 0, scale: 0, rotate: 170 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 180 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              "
            </motion.div>
            
            <motion.p 
              className="text-xl sm:text-2xl md:text-3xl text-zinc-300 leading-relaxed font-light relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                We don&apos;t chase{' '}
              </motion.span>
              <motion.span 
                className="text-white font-medium relative cursor-pointer"
                whileHover={{
                  scale: 1.08,
                  textShadow: "0 0 30px rgba(255, 255, 255, 0.7)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {['H', 'y', 'p', 'e'].map((letter, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: 20, rotateX: -90 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    whileHover={{ 
                      y: -5,
                      color: "#f3f4f6",
                      scale: 1.1
                    }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.5 + (i * 0.1),
                      type: "spring",
                      stiffness: 400
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/15 to-transparent rounded blur-sm"
                  whileHover={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                .
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                We{' '}
              </motion.span>
              <motion.span 
                className="text-purple-400 font-medium relative cursor-pointer"
                whileHover={{
                  scale: 1.08,
                  textShadow: "0 0 30px rgba(168, 85, 247, 0.9)",
                  color: "#c084fc"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {['P', 'r', 'o', 'v', 'e'].map((letter, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: 20, rotateX: -90 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    whileHover={{ 
                      y: -5,
                      color: "#d8b4fe",
                      scale: 1.1
                    }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 1.3 + (i * 0.1),
                      type: "spring",
                      stiffness: 400
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-transparent via-purple-500/25 to-transparent rounded blur-sm"
                  whileHover={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
              >
                {' '}it.
              </motion.span>
            </motion.p>
            
            <motion.div 
              className="mt-12 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent relative"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.6 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-0"
                animate={{
                  opacity: [0, 0.8, 0],
                  scaleY: [1, 2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Team() {
  const members = [
    { name: "Jay", role: "Lead / Tech", credential: "Staff Engineer @ Silicon Valley" },
    { name: "Ryan", role: "Research / Data", credential: "Physics PhD, Quant Dev" },
    { name: "JY", role: "Research / AI", credential: "AI Engineer, M.S. Physics" },
    { name: "TJ", role: "Content / Media", credential: "Ex-Founder, Media Specialist" },
    { name: "Kiwon", role: "Marketing", credential: "GWU, Global Marketing" },
  ];

  return (
    <section id="team" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">The Team</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-12 xs:gap-8 md:gap-6">
          {members.map((member, i) => (
            <TeamMember key={member.name} {...member} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <motion.footer 
      className="py-12 px-6 border-t border-white/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Subtle background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Logo />
        </motion.div>
        
        <div className="flex items-center gap-8">
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link 
              href="/columns" 
              className="text-zinc-500 hover:text-purple-400 text-sm transition-all duration-300 relative group"
            >
              Columns
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300"
              />
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link 
              href="#team" 
              className="text-zinc-500 hover:text-purple-400 text-sm transition-all duration-300 relative group"
            >
              Team
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300"
              />
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <a 
              href="mailto:jayleekr0125@gmail.com" 
              className="text-zinc-500 hover:text-purple-400 text-sm transition-all duration-300 relative group flex items-center gap-1"
            >
              <motion.svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                whileHover={{ scale: 1.2, rotate: 15 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </motion.svg>
              Contact
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300"
              />
            </a>
          </motion.div>
        </div>
        
        <motion.p 
          className="text-zinc-600 text-sm"
          whileHover={{ 
            color: "#71717a",
            scale: 1.02 
          }}
          transition={{ duration: 0.3 }}
        >
          © 2026 HypeProof AI. All rights reserved.
        </motion.p>
      </div>
      
      {/* Decorative elements */}
      <motion.div
        className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.div
        className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.7 }}
      />
    </motion.footer>
  );
}

function DynamicGradientMesh() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Animated gradient meshes */}
      <motion.div
        className="absolute inset-0 opacity-15"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, #9333ea 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%),
            radial-gradient(circle at 40% 90%, #8b5cf6 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, #06b6d4 0%, transparent 50%)
          `,
        }}
        animate={{
          background: [
            `
              radial-gradient(circle at 20% 50%, #9333ea 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%),
              radial-gradient(circle at 40% 90%, #8b5cf6 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, #06b6d4 0%, transparent 50%)
            `,
            `
              radial-gradient(circle at 40% 30%, #9333ea 0%, transparent 50%),
              radial-gradient(circle at 60% 70%, #3b82f6 0%, transparent 50%),
              radial-gradient(circle at 20% 60%, #8b5cf6 0%, transparent 50%),
              radial-gradient(circle at 80% 40%, #06b6d4 0%, transparent 50%)
            `,
            `
              radial-gradient(circle at 80% 70%, #9333ea 0%, transparent 50%),
              radial-gradient(circle at 20% 40%, #3b82f6 0%, transparent 50%),
              radial-gradient(circle at 60% 20%, #8b5cf6 0%, transparent 50%),
              radial-gradient(circle at 30% 90%, #06b6d4 0%, transparent 50%)
            `,
            `
              radial-gradient(circle at 20% 50%, #9333ea 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%),
              radial-gradient(circle at 40% 90%, #8b5cf6 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, #06b6d4 0%, transparent 50%)
            `,
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="gradient-bg" />
      <div className="grid-pattern" />
      <div className="noise" />
      <DynamicGradientMesh />
      
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      {/* Cursor Follower */}
      <CursorFollower />
      
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-zinc-950/50 backdrop-blur-lg border-b border-white/5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">What We Do</NavLink>
            <NavLink href="#team">Team</NavLink>
          </div>
          <MobileMenu />
        </div>
        
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-purple-500 to-indigo-500 origin-left"
          style={{ scaleX: useTransform(useScroll().scrollYProgress, [0, 1], [0, 1]) }}
        />
      </motion.nav>
      
      {/* Social Proof Bar */}
      <SocialProofBar />
      
      <main role="main" aria-label="Main content">
        <Hero />
        <LatestContentPreview />
        <Features />
        <NewsletterSignup />
        <Philosophy />
        <Team />
        <Columns />
      </main>
      
      <Footer />
    </>
  );
}
