# GEO Evaluation Metrics for HypeProof AI Lab

> v1 — 2026-02-13

## Overview

Five metric categories, 15 total metrics. Each scored 0-100. Weighted composite = GEO Score.

---

## 1. Citation Metrics (Weight: 35%)

### 1.1 AI Citation Frequency (ACF)
- **Description**: Number of times HypeProof content is cited/referenced by AI engines in response to relevant queries
- **Measurement**: Weekly manual query audit — 20 seed queries across ChatGPT, Perplexity, Gemini, Google AI Overviews. Record citation count.
- **Target**: ≥3 citations per week across platforms within 3 months; ≥10/week within 6 months
- **Score**: 0 = never cited; 50 = 1-5/week; 80 = 6-15/week; 100 = 15+/week
- **Weight**: 15%

### 1.2 Citation Accuracy Rate (CAR)
- **Description**: When cited, is the attribution correct? (right URL, right claim, right author)
- **Measurement**: Review each detected citation for accuracy. Given that AI engines are incorrect 37-94% of the time (research data), track what % of our citations are faithful.
- **Target**: ≥80% accurate citations
- **Score**: Percentage directly maps to score
- **Weight**: 5%

### 1.3 Citation Reach Ratio (CRR)
- **Description**: Ratio of unique queries that surface HypeProof vs total seed queries tested
- **Measurement**: From the 20-query audit, what % return HypeProof content?
- **Target**: ≥15% (3/20 queries) in 3 months; ≥30% in 6 months
- **Score**: Direct percentage × 3.3 (capped at 100)
- **Weight**: 10%

### 1.4 Platform Citation Diversity (PCD)
- **Description**: How many distinct AI platforms cite HypeProof (out of 4: ChatGPT, Perplexity, Gemini, AI Overviews)
- **Measurement**: Binary per platform from weekly audit
- **Target**: ≥2 platforms in 3 months; ≥3 in 6 months
- **Score**: 0/4=0, 1/4=25, 2/4=50, 3/4=80, 4/4=100
- **Weight**: 5%

---

## 2. Structural Metrics (Weight: 20%)

### 2.1 Content Structure Score (CSS)
- **Description**: Does each column follow the optimal structure for AI citation? Checklist:
  - [ ] Clear H2/H3 hierarchy (40% more likely to be cited — research)
  - [ ] ≥1 data table or structured list (tables = 2.5× more citations)
  - [ ] ≥2,000 words (3× more citations for long-form)
  - [ ] Inline citations with links (biggest single lever — 30-40% improvement)
  - [ ] Statistics with sources (best method for law/govt, strong everywhere)
  - [ ] FAQ section or key takeaways
- **Measurement**: Automated linter script against checklist. Each item = 16.7 points.
- **Target**: ≥80/100 average across all columns
- **Score**: Average checklist completion %
- **Weight**: 10%

### 2.2 Schema Markup Score (SMS)
- **Description**: Quality and completeness of JSON-LD structured data
- **Measurement**: Validate via Google Rich Results Test + manual review. Check for:
  - Article/ScholarlyArticle schema (base)
  - author, datePublished, dateModified fields
  - FAQ schema where applicable
  - Speakable schema for voice queries
  - Citation/reference schema
- **Target**: All 5 schema types implemented; validation passes with 0 errors
- **Score**: (implemented types / 5) × 100
- **Weight**: 10%

---

## 3. Freshness Metrics (Weight: 15%)

### 3.1 Content Update Cadence (CUC)
- **Description**: How frequently new columns are published
- **Measurement**: Count posts per month
- **Target**: ≥8 columns/month (2/week)
- **Score**: (posts / 8) × 100, capped at 100
- **Weight**: 5%

### 3.2 Evergreen Update Ratio (EUR)
- **Description**: % of existing columns updated within past 30 days. Research shows 76.4% of ChatGPT's most-cited pages updated within 30 days.
- **Measurement**: Track `dateModified` vs current date across all columns
- **Target**: Top 10 columns by traffic updated within 30 days
- **Score**: (updated top columns / 10) × 100
- **Weight**: 5%

### 3.3 Content Recency Index (CRI)
- **Description**: Average age (days) of the 10 most recent columns
- **Measurement**: Simple date math
- **Target**: Average age ≤14 days (indicates steady publishing)
- **Score**: 100 if ≤7 days; 80 if ≤14; 50 if ≤30; 20 if >30
- **Weight**: 5%

---

## 4. Platform Coverage Metrics (Weight: 15%)

### 4.1 Crawler Access Score (CAS)
- **Description**: Can AI crawlers successfully access and index HypeProof content?
- **Measurement**: Check robots.txt allows GPTBot, Google-Extended, PerplexityBot, anthropic-ai. Verify sitemap.xml is current. Check RSS feed validity.
- **Target**: All 4 major crawlers allowed; sitemap current; RSS valid
- **Score**: Checklist (6 items: 4 crawlers + sitemap + RSS) × 16.7
- **Weight**: 5%

### 4.2 Index Presence Score (IPS)
- **Description**: Is HypeProof content actually in AI training/retrieval indices?
- **Measurement**: Query each platform with site-specific queries (e.g., "HypeProof AI Lab opinion on agent economy"). Record if any content is retrieved.
- **Target**: Present in ≥2 platform indices within 3 months
- **Score**: Same as PCD scoring
- **Weight**: 5%

### 4.3 Cross-Language Visibility (CLV)
- **Description**: Visibility in both Korean and English queries
- **Measurement**: Run seed queries in both languages; compare citation rates
- **Target**: Korean citation rate ≥50% of English rate (English expected to be higher due to training data bias)
- **Score**: (Korean rate / English rate) × 100, capped at 100
- **Weight**: 5%

---

## 5. Content Quality Metrics (Weight: 15%)

### 5.1 Evidence Density (ED)
- **Description**: Number of cited statistics, named sources, or data points per 1,000 words
- **Measurement**: Automated count of numbers-with-sources, named references, linked citations
- **Target**: ≥5 evidence points per 1,000 words
- **Score**: (evidence points / 5) × 100 per 1k words, averaged, capped at 100
- **Weight**: 5%

### 5.2 Original Framework Score (OFS)
- **Description**: Does the column introduce a named, original framework or concept? (e.g., "회장님의 시대", "AEO") — original concepts get cited as authoritative
- **Measurement**: Manual review — does the column coin a term or present a novel framework?
- **Target**: ≥50% of columns introduce an original framework
- **Score**: (columns with frameworks / total columns) × 100
- **Weight**: 5%

### 5.3 Source Authority Index (SAI)
- **Description**: Quality of cited sources — academic papers, official reports, named experts vs anonymous blogs
- **Measurement**: Categorize each source: Tier 1 (academic/official) = 3pts, Tier 2 (reputable media) = 2pts, Tier 3 (blogs/social) = 1pt. Average per column.
- **Target**: Average ≥2.0 (mostly Tier 1-2 sources)
- **Score**: (average / 3.0) × 100
- **Weight**: 5%

---

## Composite GEO Score

```
GEO Score = Σ (metric_score × metric_weight)
```

| Rating | Score |
|--------|-------|
| Excellent | 80-100 |
| Good | 60-79 |
| Needs Work | 40-59 |
| Poor | 0-39 |

**Initial target**: 60+ within 3 months, 75+ within 6 months.

---

## What We Can't Measure Yet

1. **Direct attribution tracking** — No standardized way to know when an AI cites you without manual querying
2. **Training data inclusion** — Can't verify if content is in model training sets vs RAG retrieval
3. **Conversion from AI citations** — No referrer header from AI-generated responses (unless user clicks a link)
4. **Competitor benchmarking** — Limited ability to compare our GEO metrics vs competitors
5. **Korean language AI citation rates** — Very little research exists on non-English GEO effectiveness
