import { describe, it, expect } from 'vitest';
import { calculateImpactScore, type ContentMetrics } from '../impact';

function makeMetrics(overrides: Partial<ContentMetrics> = {}): ContentMetrics {
  return {
    aiReferralCount: 0,
    totalViews: 1000,
    citationCount: 0,
    pageViews30d: 0,
    isNovel: false,
    ...overrides,
  };
}

describe('calculateImpactScore', () => {
  it('returns zero for empty metrics', () => {
    const score = calculateImpactScore(makeMetrics());
    expect(score.total).toBe(0);
    expect(score.aiReferral).toBe(0);
    expect(score.citationTest).toBe(0);
    expect(score.traffic).toBe(0);
    expect(score.novelBonus).toBe(0);
  });

  it('calculates AI referral correctly', () => {
    // 500/1000 = 50% → 50 * 0.4 = 20
    const score = calculateImpactScore(makeMetrics({ aiReferralCount: 500 }));
    expect(score.aiReferral).toBe(20);
  });

  it('caps AI referral at 40', () => {
    const score = calculateImpactScore(makeMetrics({ aiReferralCount: 5000 }));
    expect(score.aiReferral).toBe(40);
  });

  it('handles zero totalViews for AI referral', () => {
    const score = calculateImpactScore(makeMetrics({ totalViews: 0, aiReferralCount: 100 }));
    expect(score.aiReferral).toBe(0);
  });

  it('calculates citation test correctly', () => {
    // 10/20 = 0.5 → 0.5 * 30 = 15
    const score = calculateImpactScore(makeMetrics({ citationCount: 10 }));
    expect(score.citationTest).toBe(15);
  });

  it('caps citation test at 30', () => {
    const score = calculateImpactScore(makeMetrics({ citationCount: 100 }));
    expect(score.citationTest).toBe(30);
  });

  it('calculates traffic correctly', () => {
    // 5000/10000 = 0.5 → 0.5 * 20 = 10
    const score = calculateImpactScore(makeMetrics({ pageViews30d: 5000 }));
    expect(score.traffic).toBe(10);
  });

  it('caps traffic at 20', () => {
    const score = calculateImpactScore(makeMetrics({ pageViews30d: 50000 }));
    expect(score.traffic).toBe(20);
  });

  it('gives novel bonus of 10 when isNovel is true', () => {
    const score = calculateImpactScore(makeMetrics({ isNovel: true }));
    expect(score.novelBonus).toBe(10);
  });

  it('gives no novel bonus when isNovel is false', () => {
    const score = calculateImpactScore(makeMetrics({ isNovel: false }));
    expect(score.novelBonus).toBe(0);
  });

  it('sums total correctly', () => {
    const score = calculateImpactScore(makeMetrics({
      aiReferralCount: 500,  // → 20
      citationCount: 10,     // → 15
      pageViews30d: 5000,    // → 10
      isNovel: true,         // → 10
    }));
    expect(score.total).toBe(20 + 15 + 10 + 10);
  });

  it('caps total at 100', () => {
    const score = calculateImpactScore(makeMetrics({
      aiReferralCount: 5000,
      citationCount: 100,
      pageViews30d: 50000,
      isNovel: true,
    }));
    expect(score.total).toBe(100);
  });

  it('respects custom maxExpectedCitations', () => {
    // 5/10 = 0.5 → 15
    const score = calculateImpactScore(makeMetrics({
      citationCount: 5,
      maxExpectedCitations: 10,
    }));
    expect(score.citationTest).toBe(15);
  });

  it('respects custom maxExpectedViews', () => {
    // 500/1000 = 0.5 → 10
    const score = calculateImpactScore(makeMetrics({
      pageViews30d: 500,
      maxExpectedViews: 1000,
    }));
    expect(score.traffic).toBe(10);
  });

  it('handles perfect score scenario', () => {
    const score = calculateImpactScore({
      aiReferralCount: 1000,
      totalViews: 1000,
      citationCount: 20,
      pageViews30d: 10000,
      isNovel: true,
    });
    expect(score.total).toBe(100);
    expect(score.aiReferral).toBe(40);
    expect(score.citationTest).toBe(30);
    expect(score.traffic).toBe(20);
    expect(score.novelBonus).toBe(10);
  });
});
