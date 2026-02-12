# Iteration Summary — GEO Design v1 → v1.1

> 2026-02-13

## Scoring Result

- **Current GEO Score**: 18/100 (Poor)
- **Projected 3-Month Score**: 48/100 (Needs Work)
- **Target**: 60+ (Good) in 6 months

The gap is real but expected for a 3-day-old site.

---

## Metric Adjustments Needed

### 1. Reweight for Early Stage

The v1 metrics overweight citation outcomes (35%) that we can't influence quickly. For the first 3 months, use **Phase 1 weights**:

| Category | v1 Weight | Phase 1 Weight | Rationale |
|----------|-----------|----------------|-----------|
| Citation | 35% | 15% | Can't control until indexed |
| Structural | 20% | 30% | Fully controllable, highest ROI |
| Freshness | 15% | 20% | Controllable, directly impacts citations |
| Platform Coverage | 15% | 15% | Keep — crawler access is P0 |
| Content Quality | 15% | 20% | Controllable, builds foundation |

Revert to v1 weights at Month 3 when citations become measurable.

### 2. Remove Cross-Language Visibility (CLV)

Replace with **Distribution Reach** — number of platforms where content is syndicated (Reddit, LinkedIn, GitHub, etc.). More actionable, more measurable.

### 3. Add Missing Metric: "AI-Extractable Claim Density"

New metric under Content Quality: Count of explicit, quotable claims per column. Example: "에이전트가 실행을 대행하는 순간, 6천억 달러 규모의 글로벌 디지털 광고 시장이 존재 근거를 잃는다" — this is a citable claim. Current columns have these but they're buried in narrative prose. Make them extractable.

---

## Design Weaknesses & Fixes

### 1. Voice vs Structure Tension (Critical)

**Problem**: The GEO template (TL;DR, tables, FAQ) could flatten HypeProof's distinctive literary voice.

**Fix**: Hybrid approach.
- Keep the narrative body untouched — the essay is the essay
- **Add structured metadata sections** at top (TL;DR) and bottom (Key Takeaways, FAQ) as extractable "bookends"
- Think of it as: narrative core for human readers, structured bookends for AI extraction
- Tables go in the analytical sections naturally, not forced

### 2. Monitoring Will Be Dropped (High Risk)

**Problem**: Manual 15-min weekly audits won't survive past month 1.

**Fix**: 
- Build a Perplexity API query script in Week 2 (they have a search API)
- Store results in Supabase with a simple dashboard
- Manual audit only for ChatGPT/Gemini (no API)
- Set a recurring calendar event, not just a plan

### 3. Reddit Strategy Is Speculative

**Problem**: No evidence posting on Reddit leads to Perplexity citations of HypeProof.

**Fix**: 
- Test with 4 posts in Month 1
- Track whether Perplexity cites the Reddit post OR the original HypeProof article
- If Reddit posts get cited but HypeProof doesn't → canonical URL strategy needs work
- If nothing → drop Reddit, try LinkedIn or GitHub instead

### 4. Korean GEO Is Unknown Territory

**Problem**: All research is English-centric. We don't know if Korean content gets cited.

**Fix**:
- This is actually a research opportunity → write a column about it
- Track Korean vs English citation rates from Week 1
- Accept that Korean citations will lag and don't penalize the score for it
- Focus English content for GEO impact, Korean content for audience building

---

## Revised Priority Order

Based on scoring gaps and controllability:

### Immediate (This Week)
1. **robots.txt** — allow all AI crawlers (1 hour, P0)
2. **Schema upgrade** — ScholarlyArticle + dateModified (2 hours, P0)
3. **Baseline measurement** — run 20 seed queries (30 min, P0)

### Week 1-2
4. **Content template adoption** — hybrid approach (bookends + narrative core)
5. **Retrofit "era-of-the-chairman"** as first test — add TL;DR, tables, FAQ, inline citations
6. **FAQ schema** auto-generation from frontmatter

### Week 3-4
7. **First new column using full GEO template** — pick a topic where data tables are natural
8. **Reddit test** — 4 posts with tracking
9. **First monthly GEO Score**

### Month 2
10. **Perplexity API monitoring** script
11. **Bilingual pipeline** — first English column
12. **Second GEO Score + trend comparison**

### Month 3
13. **Revert to v1 metric weights** (citations become primary)
14. **Full iteration review** — keep, modify, or overhaul

---

## Key Insight

HypeProof's existing strength — **original frameworks and distinctive voice** — is exactly what GEO rewards most. The research shows that "cite sources" and "statistics addition" are the biggest levers, but the underlying content needs to be worth citing. HypeProof's columns are already worth citing. The GEO work is about making them **findable and extractable** by AI engines, not about changing what they say.

The biggest risk isn't bad GEO execution — it's that the site is too new for AI engines to have indexed it. Time and consistent publishing are the unglamorous but necessary foundation.

**Expected trajectory**: 18 → 35 (Month 1) → 48 (Month 3) → 65 (Month 6)

---

## Files Produced

| File | Path |
|------|------|
| Evaluation Metrics | `geo/specs/evaluation-metrics.md` |
| GEO Design v1 | `geo/specs/geo-design-v1.md` |
| Test Plan | `geo/specs/test-plan.md` |
| Design Score v1 | `geo/reports/design-score-v1.md` |
| This Summary | `geo/reports/iteration-summary.md` |

No v2 specs created — changes are minor enough to note here. v2 warranted after Month 1 scoring data.
