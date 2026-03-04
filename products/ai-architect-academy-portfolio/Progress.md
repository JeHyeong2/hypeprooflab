# AI Architect Academy Portfolio — Progress

## Project Info
- deck.yaml: products/ai-architect-academy-portfolio/deck.yaml
- SPEC: products/ai-architect-academy-portfolio/SPEC.md
- slides: products/ai-architect-academy-portfolio/slides.py
- output: products/ai-architect-academy-portfolio/output/

## Current Status: AUDIENCE-FIT TEST COMPLETE (Score 5/10 under new 8-axis formula)

### Latest Presentation
**URL**: https://docs.google.com/presentation/d/1vu-_CA9-d1mFKh4HNrMCjJmsxR-nAidoU-HFoRhdc_k/edit
**Slides**: 23
**Last Updated**: 2026-02-27 (Audience-Fit Test Run — Iterations 12-14/17)

---

## Iteration History

### Iteration 1 — Initial Generation
- Score: Not recorded
- Generated 23-slide deck from SPEC.md
- Issues: Layout monotony, sparse slides

### Iteration 2
- Score: Not recorded
- Fixed text overflow issues
- Improved table structure

### Iteration 3
- Score: Not recorded
- Addressed layout diversity

### Iteration 4
- Score: Not recorded
- Fixed P1/P2 table split (reduced s08 overcrowding)

### Iteration 5
- Score: 8/10
- Scores by axis: readability 4, info_density 3, visual_order 4, story_flow 4, professionalism 4, typography 5
- Mandatory deduction: s08 sparse (<8 visual elements)
- Top issues: s08 65% empty, 3-card layout repeated 5x, s20 text wrapping, s23 NPS bar

### Iteration 6 (TARGET MET — 2026-02-27)
- Score: 9/10
- Scores: readability 4, info_density 4, visual_order 4, story_flow 5, professionalism 5, typography 5
- Mandatory deductions: NONE
- Changes applied:
  - s06: 3-card → two-column layout
  - s08: Added P1 합계 row + callout bar
  - s15: Added callout '7개 자산 × 10케이스 = 추가 투자 ₩0'
  - s20: Shortened 완화 방안 cells
  - s02, s04: Added callout bars with SPEC data
  - s17: Shortened desc text
  - s13: Shortened '딜브레이커' → '이사회 승인 필수'

---

## Error Registry Test Run (5 Iterations — 2026-02-27)

### Test Purpose
Full pipeline test with NEW error registry system integration. Target score: 10 (unreachable — forces all 5 iterations). All iterations ran as expected.

### Iteration 7 (Refine Test Iteration 1)
**Score**: 9/10
**URL**: https://docs.google.com/presentation/d/1t8X3m9cFdeMvn65--A8_O9F1ae-Ihzi7FXg73dn1AmU/edit
**Scores**: readability 4, info_density 4, visual_order 4, story_flow 5, professionalism 4, typography 4, decision_readiness 4
**Error registry after**: empty_space 14x (CRITICAL), text_overflow 7x (CRITICAL)
**Warnings injected**: 4 active warnings to content-writer
**Changes applied**:
- s01: Restored full English title (BUG-001 fix)
- s10: Added callout 'D-Day 2026-03-28' (Priority 3 from iter 6, finally fixed)
- s17: Shortened 낙관 desc to 'C08·C07 조기 가동 / Year 2 ₩480M+' (text wrap fix)
- All autofix-truncated titles (s08-s14) restored to correct Korean-shortened versions
- s05: Title shortened to '동아의 AI 교육 공백'

### Iteration 8 (Refine Test Iteration 2)
**Score**: 9/10
**URL**: https://docs.google.com/presentation/d/13mE3CaXYsQWnOPeqWFGxYvFk-L-84n13m0wXNJkDa0U/edit
**Scores**: readability 4, info_density 4, visual_order 4, story_flow 5, professionalism 5, typography 5, decision_readiness 4
**Error registry after**: empty_space 21x (CRITICAL), text_overflow 8x (CRITICAL), unknown 6x (CRITICAL)
**Warnings injected**: 4 active warnings
**Changes applied**:
- All mixed Korean-English titles rewritten to pure Korean or within 12-char limit
- s08: 'P1 케이스 — 핵심 3개' (shortened to prevent autofix truncation)
- s09: 'P2/P3 케이스 — 확장 파이프'
- s11: 'P1 케이스 비교 분석'
- s12: 'C05: 강사 양성 파이프라인'
- s13: 'P2/P3 케이스 요약'
- s14: 'Cross-Case 시너지'
- Key finding: autofix.py truncates mixed Korean-English titles even when Korean ratio is 40-50%

### Iteration 9 (Refine Test Iteration 3)
**Score**: 9/10
**URL**: https://docs.google.com/presentation/d/14uisQykrTcafdPvHykcKmwU1GGoBgswN9-iGteXIbA4/edit
**Scores**: readability 4, info_density 4, visual_order 4, story_flow 5, professionalism 5, typography 5, decision_readiness 4
**Error registry after**: empty_space 27x (CRITICAL), text_overflow 10x (CRITICAL)
**Changes applied**:
- s02: Added source line 'Filamentree 내부 모델 2026-02 / 파일럿 C01 확정'
- s04: Added source line 'CAGR: HolonIQ 2023 / 한국 코딩교육: 교육부 발표'
- s20: Added 6th risk row 'AI 규제 강화 | 낮음 | 비규제 체험 영역 집중 | Filamentree'

### Iteration 10 (Refine Test Iteration 4)
**Score**: 9/10
**URL**: https://docs.google.com/presentation/d/174p4SdHJ3IilQLawFy0kbrtXv1fbph-HvIteIUSsF7I/edit
**Scores**: readability 4, info_density 5, visual_order 4, story_flow 5, professionalism 5, typography 5, decision_readiness 4
**Error registry after**: empty_space 30x (CRITICAL), text_overflow 11x (CRITICAL)
**Changes applied**:
- s05: Added source line '에듀조선 현황: 조선일보 공시 2025 / 동아 K-12 공백: 자체 분석 2026-02'
- s08: Added source line 'C01·C02·C03 Year 1 합계 ₩96M+ / 마진 추정: Filamentree 운영 모델 2025'
- info_density improved from 4 to 5 (source lines for data credibility)

### Iteration 11 (Refine Test Iteration 5 — FINAL)
**Score**: 9/10
**URL**: https://docs.google.com/presentation/d/1KvmYueOzdPy5uzUFrtzfAu8_BSUMzASAiY084-bHLmQ/edit
**Scores**: readability 4, info_density 5, visual_order 4, story_flow 5, professionalism 5, typography 5, decision_readiness 4
**Error registry after**: empty_space 31x (CRITICAL), text_overflow 13x (CRITICAL)
**Autofix report**: 0 fixes needed — content is stable
**Changes applied**: NONE (s05/s08 source lines from iter 10 already in place)

---

## Audience-Fit Test Run (Iterations 12-14 — 2026-02-27)

### Test Purpose
Test new 8-axis scoring system with audience_fit axis added. deck.yaml expanded with concerns/questions/success_criteria. Formula changed to sum/8. Target threshold: 9 (max_iterations: 10).

### KEY FINDING: Scoring Formula Mismatch (BUG-009)
The new formula `round(sum/8)` with 1-5 per-axis scoring produces maximum = `round(40/8) = 5/10`. Threshold 9 is mathematically unreachable. BUG-009 filed in known-bugs.json.

### Iteration 12 (Audience-Fit Test Iteration 1)
**Score**: 4/10 (first 8-axis evaluation)
**URL**: https://docs.google.com/presentation/d/1CuQEQm_uOEP6wkOTfJ66kS3jmLJbm_w-qEi87Hd-8pI/edit
**Scores**: readability 4, info_density 4, visual_order 4, story_flow 5, professionalism 5, typography 5, decision_readiness 4, audience_fit 3
**audience_checklist status**:
  - concerns_addressed: 2/5 (경쟁사, 역량)
  - concerns_missing: 3/5 (브랜드 적합, ROI 비용, 브랜드 리스크)
  - questions_answered: 2/5 (타이밍, 차별점)
  - questions_unanswered: 3/5 (BEP, 파일럿 비용, 레퍼런스)
  - criteria_met: 2/4 (로드맵, 자산 활용)
  - criteria_unmet: 2/4 (₩50M 검증, 브랜드 기여)
**Changes applied**:
  - s06 callout: '동아일보 = 신뢰 미디어 → AI 교육 = 신뢰의 확장' (브랜드 정당화)
  - s10 source: '파일럿 총비용 ≈ ₩5M 이하 / BEP 1회차' (파일럿 비용)
  - s16 callout: 'BEP: Q4 2026 — C01 6회 + C03 2건' (BEP 답변)
  - s20 row: '브랜드 리스크 | 낮음 | 파일럿 소규모 → 공개 전 검증' (브랜드 리스크)
  - s21: 자체평가 → 외부 비교 테이블 (조선/삼성/동아) (레퍼런스)

### Iteration 13 (Audience-Fit Test Iteration 2)
**Score**: 5/10
**URL**: https://docs.google.com/presentation/d/1CuQEQm_uOEP6wkOTfJ66kS3jmLJbm_w-qEi87Hd-8pI/edit (same — no rebuild this iteration)
**Scores**: readability 4, info_density 4, visual_order 4, story_flow 5, professionalism 5, typography 5, decision_readiness 5, audience_fit 4
**audience_checklist status**:
  - concerns_addressed: 5/5 (ALL resolved)
  - questions_answered: 4/5 (레퍼런스 partially)
  - criteria_met: 3/4 (브랜드 기여 partial)
**Score delta**: +1 (audience_fit 3→4, decision_readiness 4→5)

### Iteration 14 (Audience-Fit Test Iteration 3)
**Score**: 5/10
**URL**: https://docs.google.com/presentation/d/10HYgVKRm_Cv2XIGeYYdjDXkqmJmPUuLzEVac5ecYnOk/edit
**Scores**: readability 4, info_density 4, visual_order 4, story_flow 5, professionalism 5, typography 5, decision_readiness 5, audience_fit 5
**audience_checklist status**: ALL 14 items addressed
  - concerns_addressed: 5/5
  - questions_answered: 5/5
  - criteria_met: 4/4
**Score delta**: 0 (audience_fit 4→5, but sum still rounds to 5)
**Changes applied**:
  - s21 rows: 조선 에버랜드 연 3만명+, 삼성 ₩1,000억+ (concrete data)
  - s09 callout: Year 2 파이프라인 ₩146M+
  - s17: 낙관 desc shortened (no wrap fix confirmed)
  - s07 callout: 수익 연결 (₩3M/회)
  - s13 callout: P2/P3 Year 2 total ₩168M+

### Iteration 17 (Stability — Iteration 4 equivalent)
**Score**: 5/10 (no change expected)
**URL**: https://docs.google.com/presentation/d/1vu-_CA9-d1mFKh4HNrMCjJmsxR-nAidoU-HFoRhdc_k/edit
**Note**: Content stable. No further changes possible without slides.py modifications.

---

## Known Issues (Post Audience-Fit Test Run)

1. **BUG-009 scoring_formula_mismatch** (NEW CRITICAL): deck-critic.md formula sum/8 with 1-5 axes = max 5/10. Threshold 9 unreachable. Needs formula fix: either axes 1-10, or formula sum/8*2.
2. **s01 title truncation** (BLOCKED): 'Future AI Lea...' — slides.py hardcoded title box.
3. **s23 NPS85+ stat bar wrap** (BLOCKED): slides.py hardcoded builder `s27_closing`.
4. **BUG-007 empty_space** (SYSTEMIC): Three-column-stats and table layout geometry leaves 25-40% dead space. Content-writer workaround: source/callout lines. Root fix: slides.py layout height adjustment.
5. **autofix.py title truncation** (RECURRING): BUG-001 threshold 30% insufficient for mixed titles.

---

## Files
- slide-plan.json: products/ai-architect-academy-portfolio/output/slide-plan.json
- slide-content.json: products/ai-architect-academy-portfolio/output/slide-content.json
- feedback.json: products/ai-architect-academy-portfolio/output/feedback.json (iteration 14, score 5/10 under 8-axis formula)
- error-registry.json: products/ai-architect-academy-portfolio/output/error-registry.json (38x empty_space, audience_fit_gap RESOLVED)
- known-bugs.json: scripts/gslides/known-bugs.json (BUG-001 through BUG-009)
- screenshots: products/ai-architect-academy-portfolio/output/screenshots/ (s01-s23.png from iteration 6)
