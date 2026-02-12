'use client';

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAnimationConfig } from '@/hooks/useReducedMotion';
import { useI18n } from '@/contexts/I18nContext';
import AuthButton from '@/components/auth/AuthButton';

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

function SimpleLanguageToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLocale('en')}
        aria-label="Switch to English"
        lang="en"
        className={`px-1.5 py-0.5 rounded transition-colors ${locale === 'en' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
      >
        EN
      </button>
      <span className="text-zinc-600">|</span>
      <button
        onClick={() => setLocale('ko')}
        aria-label="한국어로 전환"
        lang="ko"
        className={`px-1.5 py-0.5 rounded transition-colors ${locale === 'ko' ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
      >
        KO
      </button>
    </div>
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

      {/* Mobile Menu Overlay - Portal to body to escape stacking context */}
      {isOpen && createPortal(
        <div
          id="mobile-menu"
          className="fixed inset-0 z-[9999] bg-zinc-950"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#09090b' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        >
          <div className="sr-only" id="mobile-menu-title">Navigation Menu</div>
          
          {/* Close button */}
          <button
            className="absolute top-5 right-5 z-[10000] p-2 text-white hover:text-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-md"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          <div className="flex flex-col items-center justify-center h-full space-y-8 relative z-10 px-6">
            <a
              href="#features"
              className="text-white text-2xl font-medium hover:text-purple-400 transition-colors px-4 py-2"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              What We Do
            </a>
          
            <a
              href="#team"
              className="text-white text-2xl font-medium hover:text-purple-400 transition-colors px-4 py-2"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                document.querySelector('#team')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Team
            </a>
          
            <Link href="/columns" className="text-white text-2xl font-medium hover:text-purple-400 transition-colors" onClick={() => setIsOpen(false)}>
              Columns
            </Link>
          
            <Link href="/novels" className="text-white text-2xl font-medium hover:text-purple-400 transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <span>Novels</span>
              <span className="text-sm text-purple-400 font-medium">NEW</span>
            </Link>

            <Link href="/my-activity" className="text-white text-2xl font-medium hover:text-purple-400 transition-colors" onClick={() => setIsOpen(false)}>
              My Activity
            </Link>
          
            <SimpleLanguageToggle />
            <div className="mt-4"><AuthButton /></div>
          
            <a
              href="mailto:jayleekr0125@gmail.com"
              className="px-8 py-4 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 bg-purple-600/20 transition-all"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
          </div>
        </div>,
        document.body
      )}
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

export function Navigation() {
  const { shouldReduce, hover, tap } = useAnimationConfig();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50"
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
          <Link href="/novels" className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm relative group">
            <span>Novels</span>
            <div className="inline-flex items-center gap-1 ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
              <span className="text-xs text-purple-400 font-medium">NEW</span>
            </div>
          </Link>
          <SimpleLanguageToggle />
          <AuthButton />
          <motion.a
            href="mailto:jayleekr0125@gmail.com"
            rel="noopener noreferrer"
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