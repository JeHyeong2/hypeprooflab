import { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { getAllGlossaryTerms } from '@/lib/glossary';

const SITE_URL = 'https://hypeproof-ai.xyz';

export const metadata: Metadata = {
  title: 'Glossary | HypeProof AI Lab',
  description: 'Key terms and frameworks from HypeProof AI Lab — bilingual definitions for the concepts shaping our understanding of AI and its impact.',
  alternates: {
    canonical: `${SITE_URL}/glossary`,
  },
};

function generateGlossaryJsonLd() {
  const terms = getAllGlossaryTerms();
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'HypeProof AI Glossary',
    description: 'Key terms and frameworks from HypeProof AI Lab',
    url: `${SITE_URL}/glossary`,
    inLanguage: ['ko', 'en'],
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      alternateName: t.termKo,
      description: t.definition,
      url: `${SITE_URL}/glossary#${t.slug}`,
    })),
  };
}

export default function GlossaryPage() {
  const terms = getAllGlossaryTerms();
  const jsonLd = generateGlossaryJsonLd();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">HypeProof AI</span>
          </Link>
          <Link href="/columns" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Columns
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Glossary</h1>
        <p className="text-zinc-400 mb-10 text-lg">
          Key terms and frameworks from HypeProof AI Lab.
        </p>

        <div className="space-y-10">
          {terms.map((term) => (
            <section key={term.slug} id={term.slug} className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-white mb-1">
                {term.term}
                <span className="ml-2 text-base font-normal text-zinc-500">
                  {term.termKo}
                </span>
              </h2>

              <p className="text-zinc-300 leading-relaxed mb-1">{term.definition}</p>
              <p className="text-zinc-500 leading-relaxed text-sm">{term.definitionKo}</p>

              {term.relatedColumns.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {term.relatedColumns.map((slug) => (
                    <Link
                      key={slug}
                      href={`/columns/${slug}`}
                      className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full transition-colors"
                    >
                      {slug}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
