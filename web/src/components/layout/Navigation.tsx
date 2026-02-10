'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAnimationConfig } from '@/hooks/useReducedMotion';
import { useI18n } from '@/contexts/I18nContext';

function Logo() {
  const { hover, tap } = useAnimationConfig();

  return (
    <Link href="/">
      <motion.div
        className="flex items-center gap-3 cursor-pointer"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        whileHover={hover}
        whileTap={tap}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">HypeProof AI</span>
      </motion.div>
    </Link>
  );
}

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { shouldReduce, tap } = useAnimationConfig();

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <motion.button
        className="p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={tap}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && isOpen) {
            setIsOpen(false);
          }
        }}
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
        id="mobile-menu"
        className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-lg"
        initial={{ opacity: 0, scale: shouldReduce ? 1 : 1.1 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : (shouldReduce ? 1 : 1.1)
        }}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        transition={{ duration: shouldReduce ? 0.2 : 0.4, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      >
        <div className="sr-only" id="mobile-menu-title">Navigation Menu</div>
        {/* Background gradient effects - disabled on reduced motion */}
        {!shouldReduce && (
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
        )}
        
        <div className="flex flex-col items-center justify-center h-full space-y-12 relative z-10">
          <motion.a
            href="#features"
            className="text-white text-3xl font-medium relative focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-lg px-4 py-2"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              const element = document.querySelector('#features');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              y: isOpen ? 0 : (shouldReduce ? 0 : 30)
            }}
            transition={{ delay: shouldReduce ? 0 : 0.1, duration: shouldReduce ? 0.2 : 0.4 }}
            whileHover={shouldReduce ? {} : {
              scale: 1.08,
              color: "#a855f7",
              textShadow: "0 0 20px rgba(168, 85, 247, 0.5)"
            }}
            whileTap={tap}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.target as HTMLElement).click();
              }
            }}
            aria-label="Navigate to What We Do section"
          >
            What We Do
            {!shouldReduce && (
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400"
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
                aria-hidden="true"
              />
            )}
          </motion.a>
          
          <motion.a
            href="#team"
            className="text-white text-3xl font-medium relative focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-lg px-4 py-2"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              const element = document.querySelector('#team');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              y: isOpen ? 0 : (shouldReduce ? 0 : 30)
            }}
            transition={{ delay: shouldReduce ? 0 : 0.2, duration: shouldReduce ? 0.2 : 0.4 }}
            whileHover={shouldReduce ? {} : {
              scale: 1.08,
              color: "#a855f7",
              textShadow: "0 0 20px rgba(168, 85, 247, 0.5)"
            }}
            whileTap={tap}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.target as HTMLElement).click();
              }
            }}
            aria-label="Navigate to Team section"
          >
            Team
            {!shouldReduce && (
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400"
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
                aria-hidden="true"
              />
            )}
          </motion.a>
          
          <Link
            href="/columns"
            className="text-white text-3xl font-medium relative"
            onClick={() => setIsOpen(false)}
          >
            Columns
          </Link>
          
          <motion.a
            href="mailto:jayleekr0125@gmail.com"
            className="glass px-10 py-5 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 bg-purple-600/20 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0, y: shouldReduce ? 0 : 30, scale: shouldReduce ? 1 : 0.9 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              y: isOpen ? 0 : (shouldReduce ? 0 : 30),
              scale: isOpen ? 1 : (shouldReduce ? 1 : 0.9)
            }}
            transition={{ delay: shouldReduce ? 0 : 0.3, duration: shouldReduce ? 0.2 : 0.4 }}
            whileHover={shouldReduce ? {} : {
              scale: 1.1,
              boxShadow: "0 0 40px rgba(168, 85, 247, 0.4)"
            }}
            whileTap={tap}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.target as HTMLElement).click();
              }
            }}
            aria-label="Send email to jayleekr0125@gmail.com"
          >
            {!shouldReduce && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
            <span className="relative z-10">Contact</span>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

interface NavLinkProps {
  children: string;
  href: string;
}

const NavLink = React.memo(function NavLink({ children, href }: NavLinkProps) {
  const { shouldReduce, hover, tap } = useAnimationConfig();

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
      // Focus management for screen readers
      const target = element as HTMLElement;
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    }
  }, [href]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  }, []);

  return (
    <motion.a
      href={href}
      className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-sm"
      whileHover={shouldReduce ? {} : { y: -2, scale: 1.05 }}
      whileTap={tap}
      transition={shouldReduce ? {} : { type: "spring", stiffness: 400, damping: 25 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Navigate to ${children} section`}
    >
      {children}
      {!shouldReduce && (
        <>
          <motion.div
            className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-purple-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"
            aria-hidden="true"
          />
          <motion.div
            className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-md -m-2 transition-colors duration-300"
            whileHover={{
              boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)"
            }}
            aria-hidden="true"
          />
        </>
      )}
    </motion.a>
  );
});

function SimpleLanguageToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLocale('en')}
        className={`px-1.5 py-0.5 rounded transition-colors ${locale === 'en' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
      >
        EN
      </button>
      <span className="text-zinc-600">|</span>
      <button
        onClick={() => setLocale('ko')}
        className={`px-1.5 py-0.5 rounded transition-colors ${locale === 'ko' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
      >
        KO
      </button>
    </div>
  );
}

export function Navigation() {
  const { shouldReduce, hover, tap } = useAnimationConfig();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 glass bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50"
      initial={{ y: shouldReduce ? 0 : -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: shouldReduce ? 0.2 : 0.8 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#features">What We Do</NavLink>
          <NavLink href="#community">Community</NavLink>
          <NavLink href="#team">Team</NavLink>
          <Link href="/columns" className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm">
            Columns
          </Link>
          <SimpleLanguageToggle />
          <motion.a
            href="mailto:jayleekr0125@gmail.com"
            className="glass px-4 py-2 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 transition-all duration-300"
            whileHover={hover}
            whileTap={tap}
          >
            Contact
          </motion.a>
        </div>

        <MobileMenu />
      </div>
    </motion.nav>
  );
}

export { Logo, MobileMenu, NavLink };