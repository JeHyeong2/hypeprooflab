import { Metadata } from 'next';
import { getAllResearch } from '@/lib/research';
import ResearchListClient from './ResearchListClient';
import { generateResearchCollectionJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Research',
  description: 'AI-generated daily research — tech trends, industry analysis, and insights curated by HypeProof Lab.',
  alternates: {
    canonical: 'https://hypeproof-ai.xyz/research',
  },
  openGraph: {
    title: 'Research | HypeProof AI',
    description: 'AI-generated daily research — tech trends, industry analysis, and insights curated by HypeProof Lab.',
    type: 'website',
  },
};

export default function ResearchPage() {
  const koResearch = getAllResearch('ko');
  const enResearch = getAllResearch('en');

  const collectionJsonLd = generateResearchCollectionJsonLd(koResearch);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <ResearchListClient koResearch={koResearch} enResearch={enResearch} />
    </>
  );
}
