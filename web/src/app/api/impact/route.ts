import { NextRequest, NextResponse } from 'next/server';
import { calculateImpactScore, type ContentMetrics } from '@/lib/impact';

/**
 * Mock 데이터 — GA4 실데이터 연동 전까지 사용
 */
const MOCK_METRICS: Record<string, ContentMetrics> = {
  'ai-search-optimization-guide': {
    aiReferralCount: 450,
    totalViews: 1200,
    citationCount: 12,
    pageViews30d: 5800,
    isNovel: false,
  },
  'perplexity-vs-google': {
    aiReferralCount: 800,
    totalViews: 2000,
    citationCount: 18,
    pageViews30d: 9200,
    isNovel: false,
  },
  'midnight-library-review': {
    aiReferralCount: 30,
    totalViews: 600,
    citationCount: 2,
    pageViews30d: 1500,
    isNovel: true,
  },
};

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'slug parameter is required' },
      { status: 400 },
    );
  }

  const metrics = MOCK_METRICS[slug];

  if (!metrics) {
    return NextResponse.json(
      { error: `No data found for slug: ${slug}` },
      { status: 404 },
    );
  }

  const score = calculateImpactScore(metrics);

  return NextResponse.json({
    slug,
    score,
    metrics,
    generatedAt: new Date().toISOString(),
    source: 'mock',
  });
}
