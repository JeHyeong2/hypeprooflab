import { Metadata } from 'next';
import { getAllResearch } from '@/lib/research';
import ResearchListClient from './ResearchListClient';

export const metadata: Metadata = {
  title: 'Research',
  description: 'AI-generated daily research — tech trends, industry analysis, and insights curated by HypeProof Lab.',
  openGraph: {
    title: 'Research | HypeProof AI',
    description: 'AI-generated daily research — tech trends, industry analysis, and insights curated by HypeProof Lab.',
    type: 'website',
  },
};

export default function ResearchPage() {
  const koResearch = getAllResearch('ko');
  const enResearch = getAllResearch('en');

  return (
    <ResearchListClient koResearch={koResearch} enResearch={enResearch} />
  );
}
