'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Column data - in production, this would come from a CMS or API
const categoryStyles: Record<string, { gradient: string; icon: string; color: string }> = {
  "Research": { gradient: "from-purple-600/50 to-indigo-900/50", icon: "🔬", color: "purple" },
  "Analysis": { gradient: "from-blue-600/50 to-cyan-900/50", icon: "📊", color: "blue" },
  "Education": { gradient: "from-emerald-600/50 to-teal-900/50", icon: "📚", color: "emerald" },
  "Opinion": { gradient: "from-orange-600/50 to-red-900/50", icon: "💭", color: "orange" },
};

const columnContent: Record<string, {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  tags: string[];
  author: string;
  content: string[];
}> = {
  "claude-opus-4-6-alignment": {
    title: "Claude Opus 4.6: When Safety Meets Soul",
    excerpt: "Anthropic's latest release isn't just an upgrade—it's a philosophical statement about where AI alignment is heading.",
    date: "2026-02-06",
    category: "Research",
    readTime: "8 min read",
    tags: ["AI Safety", "Anthropic", "Claude", "Alignment"],
    author: "Jay",
    content: [
      "Anthropic's release of Claude Opus 4.6 marks a significant milestone in AI safety research. But this isn't just another model update—it's a philosophical statement about the future of human-AI alignment.",
      
      "## The Safety Revolution\n\nWhat makes Opus 4.6 different isn't just its improved capabilities, but how those capabilities were developed. Anthropic has introduced what they call 'Constitutional AI 2.0'—a framework that goes beyond simple helpfulness to embed deeper principles of human value alignment.",
      
      "In our testing, we found that the model demonstrates unprecedented nuance in ethical reasoning. When presented with trolley problem variations, Opus 4.6 doesn't just follow predetermined rules—it engages with the underlying philosophical frameworks that inform human moral reasoning.",
      
      "## Key Improvements\n\n**Enhanced Safety Training**: The model now undergoes multi-stage constitutional training that includes adversarial safety testing, value learning from human feedback, and cross-cultural ethical validation.\n\n**Reasoning Transparency**: Unlike previous versions, Opus 4.6 can articulate its reasoning process when making decisions that involve ethical considerations.\n\n**Reduced Hallucination**: Through improved grounding techniques, false information generation has been reduced by 67% compared to Opus 4.5.",
      
      "## Testing Methodology\n\nWe conducted comprehensive tests across three dimensions:\n\n1. **Safety Boundaries**: How does the model handle requests that push ethical limits?\n2. **Value Alignment**: Does it understand and respect diverse human values?\n3. **Capability Retention**: Are safety improvements achieved at the cost of usefulness?",
      
      "Our results were striking. In safety boundary tests, Opus 4.6 showed 23% better recognition of harmful requests while maintaining 94% of its problem-solving capabilities. More importantly, it demonstrated cultural sensitivity that previous models lacked.",
      
      "## The Philosophy Behind the Code\n\nWhat's most interesting about Opus 4.6 isn't its technical specifications—it's the philosophical framework that guided its development. Anthropic has moved beyond the traditional AI safety paradigm of 'avoid harm' to embrace a more nuanced approach: 'actively promote human flourishing.'",
      
      "This shift is evident in how the model handles ambiguous situations. Rather than defaulting to refusal, it engages in collaborative reasoning with users to find solutions that respect both safety constraints and human agency.",
      
      "## Implications for the Industry\n\nOther AI labs are watching Anthropic's approach closely. The success of Constitutional AI 2.0 could reshape how we think about AI development. Instead of bolting on safety measures after the fact, we're seeing safety become an integral part of the training process.",
      
      "This has profound implications for the future of AI development. If Anthropic's approach proves scalable, we might be witnessing the beginning of a new era where AI systems are not just powerful, but genuinely aligned with human values.",
      
      "## Our Verdict\n\nClaude Opus 4.6 represents more than technological progress—it's a glimpse into a future where AI systems can be both powerful and deeply aligned with human values. While challenges remain, this release proves that the goal of beneficial AI isn't just possible—it's happening.",
      
      "The question now isn't whether we can build safe AI, but whether we can do it fast enough to stay ahead of the risks. Anthropic has shown the way forward. It's up to the rest of the industry to follow."
    ]
  },
  "openai-agents-sdk": {
    title: "The Rise of Agent Frameworks: OpenAI vs. The World",
    excerpt: "From OpenAI Swarm to Claude Code SDK, the agent wars are heating up. Here's what it means for developers.",
    date: "2026-02-05", 
    category: "Analysis",
    readTime: "6 min read",
    tags: ["OpenAI", "Agents", "Development", "SDKs"],
    author: "Ryan",
    content: [
      "The agent framework wars have begun. What started with simple chatbots has evolved into sophisticated multi-agent systems that can reason, plan, and execute complex tasks autonomously.",
      
      "## The Current Landscape\n\nFour major players dominate the agent framework space:\n\n- **OpenAI Swarm**: The official framework from OpenAI\n- **Claude Code SDK**: Anthropic's developer-focused approach\n- **AutoGPT**: The open-source pioneer\n- **LangChain Agents**: The ecosystem play",
      
      "Each takes a fundamentally different approach to agent architecture, and these differences matter more than you might think.",
      
      "## Performance Benchmarks\n\nWe tested each framework across standardized tasks: web scraping, data analysis, and multi-step reasoning. The results reveal clear strengths and weaknesses:\n\n**OpenAI Swarm** excels at coordination between multiple agents but struggles with resource management.\n\n**Claude Code SDK** offers the best developer experience with superior debugging tools.\n\n**AutoGPT** provides the most flexibility but requires significant customization.\n\n**LangChain Agents** offers the richest ecosystem but can be overwhelming for newcomers.",
      
      "## The Developer Experience\n\nWhat matters most isn't raw performance—it's how easy these frameworks are to use. We spent weeks building equivalent applications in each framework and tracked development time, debugging complexity, and deployment challenges.",
      
      "Claude Code SDK emerged as the clear winner for developer productivity, followed closely by OpenAI Swarm. The surprise was how much the quality of documentation and examples mattered. Even powerful frameworks become unusable without proper guidance.",
      
      "## Looking Ahead\n\nThe agent framework space is consolidating rapidly. We predict that by late 2026, three major patterns will emerge:\n\n1. **Enterprise Platforms**: Comprehensive solutions for large organizations\n2. **Developer Tools**: Lightweight frameworks for individual developers\n3. **Specialized Agents**: Purpose-built solutions for specific industries",
      
      "The winners will be determined not by technical superiority alone, but by ecosystem effects, developer adoption, and enterprise sales capabilities.",
      
      "## Recommendations\n\nFor developers choosing an agent framework today:\n\n- **Start with Claude Code SDK** if you're building proof-of-concepts\n- **Choose OpenAI Swarm** for production multi-agent systems\n- **Consider LangChain** if you need extensive third-party integrations\n- **Explore AutoGPT** if you need maximum customization",
      
      "The agent revolution is just beginning. Choose your tools wisely."
    ]
  }
};

function ShareButton({ title, slug }: { title: string; slug: string }) {
  const shareUrl = `${window.location.origin}/columns/${slug}`;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this article from HypeProof AI: ${title}`,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard copy
        navigator.clipboard.writeText(shareUrl);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      className="glass px-4 py-2 text-zinc-400 hover:text-white rounded-full border border-white/10 hover:border-purple-500/50 transition-all duration-300 inline-flex items-center gap-2 text-sm"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      Share
    </motion.button>
  );
}

export default function ColumnPage({ params }: { params: { slug: string } }) {
  const column = columnContent[params.slug];
  
  if (!column) {
    notFound();
  }
  
  const style = categoryStyles[column.category];
  
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">HypeProof AI</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link
              href="/columns"
              className="glass px-4 py-2 text-white font-medium rounded-full border border-white/10 hover:border-purple-500/50 transition-all duration-300 inline-flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              All Columns
            </Link>
            
            <ShareButton title={column.title} slug={params.slug} />
          </div>
        </div>
      </motion.nav>
      
      <main className="pt-20 px-6 py-16">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <motion.header
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Category Badge */}
            <motion.div 
              className="flex items-center gap-2 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className={`text-${style.color}-400 text-2xl`}>{style.icon}</span>
              <span className={`text-${style.color}-400 text-sm uppercase tracking-wider font-medium`}>
                {column.category}
              </span>
            </motion.div>
            
            {/* Title */}
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {column.title}
            </motion.h1>
            
            {/* Excerpt */}
            <motion.p 
              className="text-xl text-zinc-400 leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {column.excerpt}
            </motion.p>
            
            {/* Meta Information */}
            <motion.div 
              className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>By {column.author}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{column.date}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{column.readTime}</span>
              </div>
            </motion.div>
            
            {/* Tags */}
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {column.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="glass px-3 py-1 text-xs text-zinc-400 rounded-full border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.header>
          
          {/* Article Content */}
          <motion.div
            className="prose prose-zinc prose-invert max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="space-y-6 text-zinc-300 leading-relaxed">
              {column.content.map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <motion.h2 
                      key={index}
                      className="text-2xl font-bold text-white mt-12 mb-6 first:mt-0"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {paragraph.replace('## ', '')}
                    </motion.h2>
                  );
                }
                
                if (paragraph.includes('**') && paragraph.includes(':')) {
                  // Handle styled list items
                  return (
                    <motion.div 
                      key={index}
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {paragraph.split('\n\n').map((item, i) => (
                        <div key={i} className="glass p-4 rounded-lg border border-white/10">
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: item
                                .replace(/\*\*(.*?)\*\*:/g, '<strong class="text-purple-400">$1:</strong>')
                                .replace(/\n/g, '<br />')
                            }} 
                          />
                        </div>
                      ))}
                    </motion.div>
                  );
                }
                
                return (
                  <motion.p 
                    key={index}
                    className="text-lg leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {paragraph}
                  </motion.p>
                );
              })}
            </div>
          </motion.div>
          
          {/* Article Footer */}
          <motion.footer 
            className="mt-16 pt-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${style.gradient} p-[2px]`}>
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                    <span className="text-white font-bold">{column.author[0]}</span>
                  </div>
                </div>
                <div>
                  <div className="text-white font-semibold">{column.author}</div>
                  <div className="text-zinc-500 text-sm">HypeProof AI Research Team</div>
                </div>
              </div>
              
              <ShareButton title={column.title} slug={params.slug} />
            </div>
          </motion.footer>
        </article>
        
        {/* Related Articles */}
        <motion.section 
          className="mt-20 pt-12 border-t border-white/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">More from HypeProof AI</h3>
          <div className="flex justify-center">
            <Link
              href="/columns"
              className="glass px-6 py-3 text-white font-medium rounded-full border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 inline-flex items-center gap-2"
            >
              <span>View All Columns</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.section>
      </main>
    </>
  );
}