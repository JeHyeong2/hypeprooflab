# Bilingual GEO Strategy — Self-Assessment Score

> 2026-02-13

## Scoring the Bilingual Design

Scored against the v2 evaluation metrics framework. Honest assessment of what we know, what we're guessing, and where we're flying blind.

---

## Design Quality Score (How Good Is This Strategy?)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **English GEO completeness** | 82/100 | Strong — built on solid research (Princeton KDD 2024, AutoGEO). Clear implementation path. |
| **Korean GEO completeness** | 45/100 | Weak — built on reasoning + ecosystem knowledge, NOT data. Major unknowns around Naver Cue. |
| **Cross-language synergy** | 65/100 | Good framework (hreflang, canonical, "don't translate — localize"). Untested. |
| **Actionability** | 75/100 | Clear priority matrix, realistic effort estimates, week-by-week plan. |
| **Measurability** | 55/100 | English metrics well-defined. Korean metrics exist but many can't be measured yet (no Naver Cue API). |
| **Risk awareness** | 85/100 | Explicitly states unknowns. Doesn't pretend Korean GEO is figured out. |
| **Weighted Average** | **66/100** | **Good — with significant Korean uncertainty** |

---

## Projected GEO Scores Under Bilingual Strategy

### Optimistic Scenario (Korean AI engines are responsive to GEO)
| Timeframe | English Score | Korean Score | Combined |
|-----------|-------------|-------------|----------|
| Now | 18 | 5 | 14 |
| Month 1 | 38 | 18 | 31 |
| Month 3 | 55 | 35 | 48 |
| Month 6 | 72 | 52 | 65 |

### Pessimistic Scenario (Naver Cue ignores external content; Korean AI citations negligible)
| Timeframe | English Score | Korean Score | Combined |
|-----------|-------------|-------------|----------|
| Now | 18 | 5 | 14 |
| Month 1 | 38 | 10 | 28 |
| Month 3 | 55 | 18 | 42 |
| Month 6 | 72 | 25 | 55 |

**Delta between scenarios**: 10 points at Month 6. The strategy is designed so that English GEO carries the score even if Korean underperforms.

---

## Per-Category Confidence

| Metric Category | Confidence in Design | Confidence in Measurement |
|----------------|---------------------|--------------------------|
| Citation — English | High (research-backed) | Medium (manual auditing) |
| Citation — Korean | **Low** (no research exists) | **Low** (no Naver Cue API) |
| Structural | High (same principles apply) | High (automated linting) |
| Freshness | High (universal principle) | High (date-based) |
| Platform Coverage — English | High | High |
| Platform Coverage — Korean | Medium (Naver known, AI engines unknown) | Medium |
| Content Quality | High | Medium (some manual) |
| Bilingual | Medium (logical framework) | Medium (trackable but new) |

---

## Biggest Risks

1. **Naver Cue walled garden** (Impact: High, Probability: Medium)
   - If Naver Cue only cites Naver ecosystem content, our Korean GEO via hypeproof-ai.xyz is dead
   - Mitigation: Naver Blog cross-posting hedge
   - Detection: Month 1 Korean seed queries will reveal this

2. **Bilingual effort overload** (Impact: Medium, Probability: Medium)
   - 1.75× effort multiplier on a small team
   - Mitigation: Not all content needs bilingual pairs. Prioritize.
   - Detection: If publishing cadence drops below 6/month total

3. **Korean content doesn't get cited by any AI engine** (Impact: Medium, Probability: Medium-Low)
   - ChatGPT/Perplexity may underweight Korean web content in training
   - Mitigation: English content carries the GEO score; Korean content serves audience building
   - Detection: Month 3 Korean citation audit

4. **Measurement blindness** (Impact: Medium, Probability: High)
   - We literally cannot systematically track Naver Cue citations yet
   - Mitigation: Manual spot checks; pivot to what we can measure
   - Detection: Ongoing

---

## What This Strategy Gets Right

1. **Treats Korean and English as separate games** — not "translate and deploy"
2. **Leverages native Korean advantage** — original content, not localized English
3. **Hedges against Korean unknowns** — English GEO is the backbone; Korean is upside
4. **Creates a research opportunity** — first to study Korean GEO = first to be cited about it
5. **Practical effort estimation** — 14 hours/week is realistic with AI assistance

## What This Strategy Gets Wrong (Probably)

1. **Korean AI engine coverage is speculative** — we're guessing about Naver Cue behavior
2. **Korean distribution channel effectiveness is untested** — GeekNews/Brunch/Tistory GEO impact unknown
3. **Schema.org impact on Korean engines is assumed, not verified**
4. **The 20 Korean seed queries are drafted without search volume data** — may not match actual user queries
5. **Missing**: Kakao ecosystem (KakaoTalk, Daum) — underweighted because Kakao's AI search play is unclear

---

## Recommendation

**Proceed with this strategy**, accepting Korean GEO as an **experiment within a framework**. The English strategy is solid and research-backed. The Korean strategy is a structured bet that:

- Costs relatively little (incremental effort on content already being created)
- Has high upside (first-mover in Korean GEO)
- Produces publishable findings regardless of outcome
- Fails gracefully (English GEO carries the portfolio)

**First checkpoint**: Month 1 — run Korean seed queries, assess Naver Cue behavior, adjust or double down.

**Overall grade: B+ (66/100)** — Strong English foundation, promising but unproven Korean extension. Honest about its gaps.
