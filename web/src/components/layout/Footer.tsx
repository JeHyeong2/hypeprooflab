'use client';

import { motion } from 'framer-motion';
import { useAnimationConfig } from '@/hooks/useReducedMotion';

export function Footer() {
  const { shouldReduce, fadeIn } = useAnimationConfig();

  return (
    <footer className="py-16 px-6 border-t border-zinc-800" role="contentinfo">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          initial={fadeIn.initial}
          whileInView={fadeIn.animate}
          viewport={{ once: true }}
          transition={{ ...fadeIn.transition, staggerChildren: shouldReduce ? 0 : 0.1 }}
        >
          <motion.div
            initial={fadeIn.initial}
            whileInView={fadeIn.animate}
            viewport={{ once: true }}
            transition={fadeIn.transition}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-white font-semibold">HypeProof AI</span>
            </div>
            <p className="text-zinc-500 text-sm">
              Deep research, honest conversations, practical insights.
            </p>
          </motion.div>

          <motion.nav
            aria-label="Content links"
            initial={fadeIn.initial}
            whileInView={fadeIn.animate}
            viewport={{ once: true }}
            transition={{ ...fadeIn.transition, delay: shouldReduce ? 0 : 0.1 }}
          >
            <h4 className="text-white font-medium mb-4">Content</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="/columns" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">Columns</a></li>
              <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">Research</a></li>
            </ul>
          </motion.nav>

          <motion.nav
            aria-label="Community links"
            initial={fadeIn.initial}
            whileInView={fadeIn.animate}
            viewport={{ once: true }}
            transition={{ ...fadeIn.transition, delay: shouldReduce ? 0 : 0.2 }}
          >
            <h4 className="text-white font-medium mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="https://discord.gg/hypeproof" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded" target="_blank" rel="noopener noreferrer">Discord</a></li>
              <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">Events</a></li>
              <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">Newsletter</a></li>
            </ul>
          </motion.nav>

          <motion.nav
            aria-label="Social links"
            initial={fadeIn.initial}
            whileInView={fadeIn.animate}
            viewport={{ once: true }}
            transition={{ ...fadeIn.transition, delay: shouldReduce ? 0 : 0.3 }}
          >
            <h4 className="text-white font-medium mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="mailto:jayleekr0125@gmail.com" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">LinkedIn</a></li>
            </ul>
          </motion.nav>
        </motion.div>

        <motion.div
          className="mt-12 pt-8 border-t border-zinc-800 text-center"
          initial={fadeIn.initial}
          whileInView={fadeIn.animate}
          viewport={{ once: true }}
          transition={{ ...fadeIn.transition, delay: shouldReduce ? 0 : 0.4 }}
        >
          <p className="text-zinc-500 text-sm">
            © 2026 HypeProof AI. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
