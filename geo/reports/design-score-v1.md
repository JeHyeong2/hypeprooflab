# Design Self-Score v1 — Brutally Honest

> 2026-02-13

Scoring the GEO design against our own evaluation metrics. Current state (pre-implementation) + projected state after full implementation.

## Current State Scores

| Metric | Current Score | Notes |
|--------|--------------|-------|
| **1.1 AI Citation Frequency** | 5 | Likely near-zero. No evidence of citations. |
| **1.2 Citation Accuracy Rate** | N/A | Can't measure — no citations to evaluate |
| **1.3 Citation Reach Ratio** | 0 | Assume 0/20 queries return HypeProof |
| **1.4 Platform Citation Diversity** | 0 | 0/4 platforms |
| **2.1 Content Structure Score** | 35 | H2/H3 ✓, but no tables, no inline citations with links, no FAQ, no key takeaways. Columns are literary essays, not structured for AI extraction. |
| **2.2 Schema Markup Score** | 20 | Basic Article schema only. No FAQ, no dateModified, no citations, no speakable. 1/5 types. |
| **3.1 Content Update Cadence** | 50 | 4 columns in 3 days — burst pattern, not sustained. Need consistent 2/week. |
| **3.2 Evergreen Update Ratio** | 0 | No columns have been updated post-publish |
| **3.3 Content Recency Index** | 90 | Site just launched — everything is fresh |
| **4.1 Crawler Access Score** | 40 | Sitemap likely exists. Unclear if AI crawlers explicitly allowed in robots.txt. |
| **4.2 Index Presence Score** | 5 | Site is days old. Unlikely indexed by AI engines yet. |
| **4.3 Cross-Language Visibility** | 0 | No English versions exist yet |
| **5.1 Evidence Density** | 25 | Columns mention concepts but rarely link to specific sources with URLs. "전기세" column has general claims without linked citations. |
| **5.2 Original Framework Score** | 75 | Strong. "회장님의 시대", "AEO" concept, "전기세 시대" — original framings. This is HypeProof's strength. |
| **5.3 Source Authority Index** | 20 | Almost no explicit source citations in current columns. Literary/opinion style. |

### Weighted Current GEO Score: ~18/100

Breakdown:
- Citation (35% weight): ~1.5
- Structural (20%): ~5.5
- Freshness (15%): ~6.0
- Platform (15%): ~2.0
- Quality (15%): ~3.0

**Verdict: Poor (18/100)**. Expected for a brand-new site with no GEO optimization.

---

## Projected Score After Full Implementation (Month 3)

| Metric | Projected | Reasoning |
|--------|-----------|-----------|
| **1.1 ACF** | 30 | Research says challengers gain most. But site is new and niche — realistic to expect a few citations, not many. |
| **1.2 CAR** | 50 | Can't control this. AI accuracy is generally poor. |
| **1.3 CRR** | 20 | Maybe 4/20 queries — our topics are niche |
| **1.4 PCD** | 25 | Likely 1 platform (Perplexity most likely, given aggressive crawling) |
| **2.1 CSS** | 85 | Template adoption will fix structure gaps |
| **2.2 SMS** | 80 | ScholarlyArticle + FAQ + dateModified = 4/5 types |
| **3.1 CUC** | 75 | 6 columns/month realistic (not 8) |
| **3.2 EUR** | 60 | Can update top columns but discipline required |
| **3.3 CRI** | 80 | Steady publishing |
| **4.1 CAS** | 100 | Easy fix — just update robots.txt and verify |
| **4.2 IPS** | 25 | Takes time for AI engines to discover and index |
| **4.3 CLV** | 20 | English versions planned but Korean will lag in AI engines |
| **5.1 ED** | 70 | Template enforces citations |
| **5.2 OFS** | 75 | Already strong, maintain |
| **5.3 SAI** | 60 | Improvement from citing academic sources |

### Weighted Projected GEO Score: ~48/100

**Verdict: Needs Work (48/100).** Realistic. We won't hit "Good" in 3 months.

---

## Identified Gaps

### Critical Gaps

1. **Citation metrics will be hard to move** (35% of total weight). Site is new, domain authority is zero, AI index inclusion takes time. The metrics are weighted too heavily toward outcomes we can't control in the short term.

2. **No English content yet**. HypeProof is Korean-only right now. AI engines are English-dominated. Cross-Language Visibility will stay near zero until bilingual pipeline launches.

3. **Evidence density is poor in existing columns**. The writing style is literary/essay — beautiful but not AI-extractable. "전기세" column tells a story but cites zero linked sources. Need to retrofit without destroying the voice.

### Design Gaps

4. **No monitoring automation**. The test plan relies on 15-min manual weekly audits. This WILL get dropped after initial enthusiasm. Need to build even a crude automation.

5. **Reddit distribution is speculative**. Listed as Tier 2 but no evidence that posting AI analysis content on Reddit will actually lead to Perplexity citations of our site.

6. **Korean GEO is uncharted territory**. All the research is English-centric. Our metrics assume English norms apply to Korean content — they probably don't.

7. **Content template may kill the voice**. HypeProof's columns are distinctive because of their literary, narrative style. Forcing TL;DR + tables + FAQ might make them generic. Need to find balance.

### Weight Gaps

8. **Citation metrics (35%) are overweighted for early stage**. We should weight structural + freshness higher initially since those are controllable.

9. **Platform coverage (15%) includes CLV (5%)** which is basically a bilingual publishing metric, not really a GEO metric. Could be removed or replaced.
