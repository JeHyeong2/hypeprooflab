/**
 * Impact Score — AI 시대 콘텐츠 영향력 측정
 *
 * 4가지 축:
 *   AI Referral (40%) — AI가 우리 콘텐츠를 참조해서 트래픽을 보내는 비율
 *   Citation Test (30%) — AI 검색엔진이 우리 콘텐츠를 인용하는 횟수
 *   Traffic (20%) — 30일간 page views (정규화)
 *   Novel Bonus (10%) — 소설/창작 콘텐츠 보너스
 */

export interface ContentMetrics {
  /** GA4 ai_referral 이벤트 수 */
  aiReferralCount: number;
  /** 총 페이지뷰 */
  totalViews: number;
  /** AI 검색엔진 인용 횟수 (수동 입력 또는 API) */
  citationCount: number;
  /** 최대 기대 인용 수 (정규화 기준, default 20) */
  maxExpectedCitations?: number;
  /** 30일간 page views */
  pageViews30d: number;
  /** 트래픽 정규화 기준 (default 10000) */
  maxExpectedViews?: number;
  /** 소설/창작 콘텐츠 여부 */
  isNovel: boolean;
}

export interface ImpactScore {
  /** 종합 점수 0~100 */
  total: number;
  /** AI Referral 점수 (0~40) */
  aiReferral: number;
  /** Citation Test 점수 (0~30) */
  citationTest: number;
  /** Traffic 점수 (0~20) */
  traffic: number;
  /** Novel Bonus 점수 (0 or 10) */
  novelBonus: number;
}

/**
 * 값을 [0, max] 범위로 클램프
 */
function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}

/**
 * Impact Score 계산
 */
export function calculateImpactScore(metrics: ContentMetrics): ImpactScore {
  const maxCitations = metrics.maxExpectedCitations ?? 20;
  const maxViews = metrics.maxExpectedViews ?? 10000;

  // AI Referral: (ai_referral / total_views) 비율 → 0~40
  const referralRatio =
    metrics.totalViews > 0
      ? metrics.aiReferralCount / metrics.totalViews
      : 0;
  const aiReferral = clamp(Math.round(referralRatio * 100 * 0.4), 40);

  // Citation Test: (count / maxExpected) → 0~30
  const citationRatio =
    maxCitations > 0 ? metrics.citationCount / maxCitations : 0;
  const citationTest = clamp(Math.round(citationRatio * 30), 30);

  // Traffic: (pageViews30d / maxExpected) → 0~20
  const trafficRatio =
    maxViews > 0 ? metrics.pageViews30d / maxViews : 0;
  const traffic = clamp(Math.round(trafficRatio * 20), 20);

  // Novel Bonus: 소설이면 10, 아니면 0
  const novelBonus = metrics.isNovel ? 10 : 0;

  const total = clamp(aiReferral + citationTest + traffic + novelBonus, 100);

  return { total, aiReferral, citationTest, traffic, novelBonus };
}
