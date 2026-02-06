'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FloatingOrb } from './HeroSection';

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

export { LatestContentPreview, NewsletterSignup };