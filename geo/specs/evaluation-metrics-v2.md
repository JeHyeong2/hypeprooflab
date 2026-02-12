# GEO Evaluation Metrics v2 — Bilingual Edition

> v2 — 2026-02-13
> Changes from v1: Added Korean-specific metrics, restructured Platform Coverage, added Bilingual metrics category.

## Overview

Six metric categories, 19 total metrics. Each scored 0-100. Weighted composite = GEO Score.

**New in v2**: Category 6 (Bilingual) added. Platform Coverage expanded with Korean-specific metrics.

---

## 1. Citation Metrics (Weight: 30%)

### 1.1 AI Citation Frequency — English (ACF-EN)
- **Description**: Citations by English-language AI engines (ChatGPT EN, Perplexity EN, Gemini EN, Google AI Overviews)
- **Measurement**: Weekly audit — 20 English seed queries across 4 platforms
- **Target**: ≥3/week (3mo); ≥10/week (6mo)
- **Score**: 0=never; 50=1-5/wk; 80=6-15/wk; 100=15+/wk
- **Weight**: 8%

### 1.2 AI Citation Frequency — Korean (ACF-KO) 🆕
- **Description**: Citations by Korean-language AI queries (ChatGPT KO, Perplexity KO, Gemini KO, Naver Cue, Clova X)
- **Measurement**: Weekly audit — 20 Korean seed queries across 5 platforms
- **Target**: ≥1/week (3mo); ≥5/week (6mo) — lower targets due to unknown landscape
- **Score**: 0=never; 50=1-3/wk; 80=4-8/wk; 100=8+/wk
- **Weight**: 7%
- **Note**: Naver Cue citation behavior is unknown. Track separately and adjust targets after Month 1 data.

### 1.3 Citation Accuracy Rate (CAR)
- Unchanged from v1
- **Weight**: 4%

### 1.4 Citation Reach Ratio (CRR)
- Now measured separately for EN (20 queries) and KO (20 queries), averaged
- **Weight**: 6%

### 1.5 Platform Citation Diversity (PCD)
- Expanded platform list: ChatGPT, Perplexity, Gemini, AI Overviews, **Naver Cue**, **Clova X**
- **Score**: 0/6=0; 1/6=17; 2/6=33; 3/6=50; 4/6=67; 5/6=83; 6/6=100
- **Weight**: 5%

---

## 2. Structural Metrics (Weight: 20%)

### 2.1 Content Structure Score (CSS)
- Unchanged from v1, applied to both Korean and English columns
- Korean columns: same checklist but adapted (shorter paragraphs OK, FAQ in Korean)
- **Weight**: 10%

### 2.2 Schema Markup Score (SMS)
- Add to checklist: `hreflang` tags, `inLanguage` field, Naver meta tags
- 7 items total: Article/ScholarlyArticle, author+dates, FAQ, Speakable, Citation, **hreflang**, **Naver meta**
- **Score**: (implemented / 7) × 100
- **Weight**: 10%

---

## 3. Freshness Metrics (Weight: 15%)

Unchanged from v1. Applied equally to Korean and English content.

### 3.1 Content Update Cadence (CUC) — **Weight**: 5%
- Target: ≥8 columns/month total (mix of KO and EN)

### 3.2 Evergreen Update Ratio (EUR) — **Weight**: 5%
- Track top 5 Korean + top 5 English columns

### 3.3 Content Recency Index (CRI) — **Weight**: 5%

---

## 4. Platform Coverage Metrics (Weight: 15%)

### 4.1 Crawler Access Score (CAS)
- Expanded crawler list: GPTBot, Google-Extended, PerplexityBot, anthropic-ai, **Yeti (Naver)**, **NaverBot**
- 8 items: 6 crawlers + sitemap + RSS
- **Weight**: 5%

### 4.2 Index Presence Score — English (IPS-EN) — **Weight**: 3%
- Present in English AI engine indices (ChatGPT, Perplexity, Gemini, AI Overviews)

### 4.3 Index Presence Score — Korean (IPS-KO) 🆕 — **Weight**: 3%
- Present in Korean AI engine indices (Naver Cue, Clova X, ChatGPT KO, Perplexity KO)

### 4.4 Naver Index Status (NIS) 🆕
- **Description**: Is HypeProof indexed by Naver Search and available to Naver Cue?
- **Measurement**: Check Naver Webmaster Tools for indexed page count. Run site: query on Naver.
- **Target**: ≥80% of Korean pages indexed by Naver
- **Score**: (indexed Korean pages / total Korean pages) × 100
- **Weight**: 4%

---

## 5. Content Quality Metrics (Weight: 10%)

### 5.1 Evidence Density (ED) — **Weight**: 3%
- Unchanged. Applied to both languages.

### 5.2 Original Framework Score (OFS) — **Weight**: 4%
- Track Korean-named frameworks and English-named frameworks separately
- Both count toward the score

### 5.3 Source Authority Index (SAI) — **Weight**: 3%
- Korean Tier 1: 과기정통부, KISA, KAIST, SNU, ETRI
- Korean Tier 2: 지디넷코리아, 바이라인네트워크, 블로터, KISDI
- English tiers unchanged

---

## 6. Bilingual Metrics (Weight: 10%) 🆕

### 6.1 Bilingual Coverage Ratio (BCR)
- **Description**: What % of key topics have both Korean and English versions?
- **Measurement**: Count topic pairs. Not all content needs bilingual pairs — measure against topics flagged as "bilingual-worthy."
- **Target**: ≥50% of flagship topics have both versions within 6 months
- **Score**: (bilingual topics / flagged topics) × 100
- **Weight**: 3%

### 6.2 Korean Distribution Reach (KDR) 🆕
- **Description**: Number of Korean platforms where content is actively syndicated
- **Measurement**: Count active Korean distribution channels (Naver Blog, GeekNews, Brunch, Tistory, Velog, LinkedIn KR)
- **Target**: ≥3 channels active within 3 months
- **Score**: (active channels / 6) × 100
- **Weight**: 3%

### 6.3 Cross-Language Citation Ratio (CLCR) 🆕
- **Description**: Ratio of Korean AI citations to English AI citations
- **Measurement**: ACF-KO / ACF-EN
- **Target**: ≥0.3 (Korean citations = at least 30% of English rate) within 6 months
- **Score**: (ratio / 0.5) × 100, capped at 100. 0.5+ = 100.
- **Weight**: 2%
- **Note**: This metric acknowledges English will likely outperform Korean in AI citations due to training data bias. The goal is closing the gap, not parity.

### 6.4 Korean Search Term Visibility (KSTV) 🆕
- **Description**: Does HypeProof appear for target Korean search terms in Naver and Google Korea?
- **Measurement**: Monthly check of 10 Korean target keywords in Naver Search and Google.co.kr
- **Target**: Appear in top 20 for ≥3 keywords within 6 months
- **Score**: (keywords with top-20 ranking / 10) × 100
- **Weight**: 2%

---

## Composite GEO Score v2

```
GEO Score = Σ (metric_score × metric_weight)
```

| Rating | Score |
|--------|-------|
| Excellent | 80-100 |
| Good | 60-79 |
| Needs Work | 40-59 |
| Poor | 0-39 |

### Phase 1 Weights (First 3 Months)

Same principle as v1 iteration: de-emphasize citations, emphasize controllable metrics.

| Category | v2 Weight | Phase 1 Weight |
|----------|-----------|----------------|
| Citation | 30% | 12% |
| Structural | 20% | 28% |
| Freshness | 15% | 18% |
| Platform Coverage | 15% | 17% |
| Content Quality | 10% | 15% |
| Bilingual | 10% | 10% |

---

## What We Can't Measure Yet (Updated)

1. All items from v1
2. **Naver Cue citation tracking** — No API, no known method to systematically query Naver Cue and track citations
3. **Clova X citation patterns** — Same problem
4. **Korean AI citation accuracy** — No research baseline exists
5. **Korean training data representation** — Unknown what % of Korean web content is in major LLM training sets
6. **Naver Blog → Naver Cue pipeline** — Does posting on Naver Blog increase Naver Cue citation likelihood? Unknown.

---

## Seed Queries

### English (20 queries) — from v1
(To be defined based on target keywords)

### Korean (20 queries) 🆕
1. "AI 에이전트 경제란"
2. "에이전트 시대 광고 산업"
3. "GEO 최적화 방법"
4. "AI 검색에 인용되는 콘텐츠"
5. "챗GPT 인용 패턴"
6. "퍼플렉시티 한국어 검색"
7. "AI가 바꾸는 검색 시장"
8. "LLM 시대 콘텐츠 전략"
9. "네이버 큐 vs 챗GPT"
10. "AI 오버뷰 대응 전략"
11. "에이전트 경제 규모"
12. "하이프프루프 AI랩"
13. "AI 에이전트와 디지털 광고"
14. "제로클릭 검색 한국"
15. "AI 검색 최적화 한국"
16. "GEO vs SEO 차이"
17. "AI 시대 미디어 전략"
18. "스타트업 AI 마케팅"
19. "한국 AI 검색 시장"
20. "에이전트 엔진 최적화"
