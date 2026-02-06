'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Column data - in production, this would come from a CMS or API
const categoryStyles: Record<string, { gradient: string; icon: string; color: string }> = {
  "Research": { gradient: "from-purple-600/50 to-indigo-900/50", icon: "🔬", color: "purple" },
  "Analysis": { gradient: "from-blue-600/50 to-cyan-900/50", icon: "📊", color: "blue" },
  "Education": { gradient: "from-emerald-600/50 to-teal-900/50", icon: "📚", color: "emerald" },
  "Opinion": { gradient: "from-orange-600/50 to-red-900/50", icon: "💭", color: "orange" },
};

const columns = [
  {
    slug: "claude-opus-4-6-alignment",
    title: "Claude Opus 4.6: When Safety Meets Soul",
    excerpt: "Anthropic's latest release isn't just an upgrade—it's a philosophical statement about where AI alignment is heading. We break down the key changes, test the claims, and explore what this means for the future of AI safety.",
    date: "2026-02-06",
    category: "Research",
    readTime: "8 min read",
    tags: ["AI Safety", "Anthropic", "Claude", "Alignment"],
    featured: true,
  },
  {
    slug: "openai-agents-sdk",
    title: "The Rise of Agent Frameworks: OpenAI vs. The World",
    excerpt: "From OpenAI Swarm to Claude Code SDK, the agent wars are heating up. We compare frameworks, test performance, and predict what this means for developers building the next generation of AI applications.",
    date: "2026-02-05",
    category: "Analysis",
    readTime: "6 min read",
    tags: ["OpenAI", "Agents", "Development", "SDKs"],
    featured: false,
  },
  {
    slug: "ai-education-paradigm",
    title: "Teaching AI to Kids: A Revolutionary Curriculum",
    excerpt: "We designed an AI education program for middle schoolers and tested it in real classrooms. The results surprised even us - kids as young as 12 are building sophisticated AI applications and understanding concepts that challenge adults.",
    date: "2026-02-03",
    category: "Education",
    readTime: "10 min read",
    tags: ["Education", "Curriculum", "Kids", "AI Literacy"],
    featured: false,
  },
  {
    slug: "llm-reasoning-myths",
    title: "The Great LLM Reasoning Myth: What Models Actually Do",
    excerpt: "Everyone talks about LLMs 'reasoning', but do they really? We conducted extensive tests to understand what happens inside these models when they appear to think, and the results will change how you view AI capabilities.",
    date: "2026-02-01",
    category: "Research",
    readTime: "12 min read",
    tags: ["LLMs", "Reasoning", "Cognitive Science", "Testing"],
    featured: true,
  },
  {
    slug: "ai-hype-vs-reality-2026",
    title: "AI Hype vs. Reality Check: Our 2026 Assessment",
    excerpt: "One year into the agent era, we separate the signal from the noise. What AI promises have materialized? What's still just hype? A brutally honest assessment of where we stand.",
    date: "2026-01-28",
    category: "Opinion",
    readTime: "7 min read",
    tags: ["Hype", "Reality Check", "2026", "Assessment"],
    featured: false,
  },
  {
    slug: "multimodal-ai-breakthrough",
    title: "The Multimodal Moment: Why Vision+Language Changes Everything",
    excerpt: "Vision-language models aren't just combining text and images—they're creating entirely new forms of AI intelligence. We explore the breakthrough research and test the latest models to see what's actually possible.",
    date: "2026-01-25",
    category: "Research",
    readTime: "9 min read",
    tags: ["Multimodal", "Vision", "Language", "Breakthrough"],
    featured: false,
  }
];

function CategoryFilter({ categories, selectedCategory, onCategoryChange }: {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <motion.div 
      className="flex flex-wrap gap-2 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <motion.button
        onClick={() => onCategoryChange('All')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          selectedCategory === 'All'
            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
            : 'glass border border-white/10 text-zinc-400 hover:text-zinc-300 hover:border-white/20'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        All
      </motion.button>
      {categories.map((category) => {
        const style = categoryStyles[category];
        return (
          <motion.button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              selectedCategory === category
                ? `bg-${style.color}-600/30 text-${style.color}-300 border border-${style.color}-500/50`
                : 'glass border border-white/10 text-zinc-400 hover:text-zinc-300 hover:border-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{style.icon}</span>
            {category}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

function ColumnCard({ column, index }: { column: typeof columns[0]; index: number }) {
  const style = categoryStyles[column.category];
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.article
      className={`group cursor-pointer relative ${column.featured ? 'md:col-span-2' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
    >
      <Link href={`/columns/${column.slug}`}>
        <motion.div 
          className={`${column.featured ? 'h-80' : 'h-64'} glass rounded-2xl hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden p-6 flex flex-col`}
          whileHover={{ 
            boxShadow: "0 20px 40px rgba(168, 85, 247, 0.15)",
            borderColor: "rgba(168, 85, 247, 0.5)"
          }}
        >
          {/* Background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
          
          {/* Featured badge */}
          {column.featured && (
            <motion.div
              className="absolute top-4 right-4 bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs px-2 py-1 rounded-full font-medium"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              Featured
            </motion.div>
          )}
          
          {/* Category and meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-${style.color}-400 text-2xl`}>{style.icon}</span>
            <div className="flex items-center gap-2 text-xs">
              <span className={`text-${style.color}-400 uppercase tracking-wider font-medium`}>
                {column.category}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500">{column.date}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500">{column.readTime}</span>
            </div>
          </div>
          
          {/* Title */}
          <motion.h3 
            className={`${column.featured ? 'text-2xl' : 'text-xl'} font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2`}
            whileHover={{ x: 3 }}
          >
            {column.title}
          </motion.h3>
          
          {/* Excerpt */}
          <motion.p 
            className={`text-zinc-400 ${column.featured ? 'text-base' : 'text-sm'} leading-relaxed mb-4 flex-1 ${column.featured ? 'line-clamp-4' : 'line-clamp-3'}`}
            whileHover={{ color: "#a1a1aa" }}
          >
            {column.excerpt}
          </motion.p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {column.tags.slice(0, column.featured ? 4 : 3).map((tag) => (
              <span 
                key={tag} 
                className="text-xs bg-zinc-800/50 text-zinc-400 px-2 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Read more indicator */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center text-purple-400 text-sm font-medium">
              <span>Read article</span>
              <motion.svg 
                className="w-4 h-4 ml-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={isHovered ? { x: 2 } : { x: 0 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.article>
  );
}

export default function ColumnsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = Array.from(new Set(columns.map(c => c.category)));
  
  const filteredColumns = selectedCategory === 'All' 
    ? columns 
    : columns.filter(column => column.category === selectedCategory);

  return (
    <>
      <div className="gradient-bg" />
      <div className="grid-pattern" />
      <div className="noise" />
      
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-zinc-950/50 backdrop-blur-lg border-b border-white/5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">HypeProof AI</span>
          </Link>
          
          <Link
            href="/"
            className="glass px-4 py-2 text-white font-medium rounded-full border border-white/10 hover:border-purple-500/50 transition-all duration-300 inline-flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </motion.nav>
      
      <main className="pt-20 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="text-gradient">Columns</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-zinc-400 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Deep analysis, research insights, and sharp takes on AI, technology, and the future we're building.
            </motion.p>
          </motion.div>
          
          {/* Category Filter */}
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {/* Columns Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            {filteredColumns.map((column, index) => (
              <ColumnCard 
                key={column.slug} 
                column={column} 
                index={index} 
              />
            ))}
          </motion.div>
          
          {/* Empty state */}
          {filteredColumns.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl text-white mb-2">No columns found</h3>
              <p className="text-zinc-500">Try selecting a different category.</p>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}