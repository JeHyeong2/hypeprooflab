'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <motion.button
        className="p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
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
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ 
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 1.1
        }}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
            className="text-white text-3xl font-medium relative focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-lg px-4 py-2"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              const element = document.querySelector('#features');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.target as HTMLElement).click();
              }
            }}
            aria-label="Navigate to What We Do section"
          >
            What We Do
            <motion.div
              className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400"
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            />
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.target as HTMLElement).click();
              }
            }}
            aria-label="Navigate to Team section"
          >
            Team
            <motion.div
              className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400"
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            />
          </motion.a>
          
          <motion.a
            href="mailto:jayleekr0125@gmail.com"
            className="glass px-10 py-5 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 bg-purple-600/20 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.target as HTMLElement).click();
              }
            }}
            aria-label="Send email to jayleekr0125@gmail.com"
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
      className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-sm"
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={(e) => {
        e.preventDefault();
        if (href.startsWith('#')) {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: 'smooth' });
          // Focus management for screen readers
          const target = element as HTMLElement;
          if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus();
            // Announce navigation to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = `Navigated to ${children} section`;
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);
          }
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (e.target as HTMLElement).click();
        }
      }}
      aria-label={`Navigate to ${children} section`}
    >
      {children}
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
    </motion.a>
  );
}

export { Logo, MobileMenu, NavLink };