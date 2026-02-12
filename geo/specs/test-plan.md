# GEO Test Plan — HypeProof AI Lab

> 2026-02-13

## 1. Baseline Measurement (Week 0)

### What to Measure
Run **before** any GEO changes to establish ground truth.

| Test | Method | Tool |
|------|--------|------|
| Current AI citations | Query 20 seed queries across 4 platforms | Manual + spreadsheet |
| Schema validation | Run all column URLs through Rich Results Test | Google Rich Results Test |
| Content structure audit | Score 4 existing columns against CSS checklist | Manual |
| Crawler access check | Verify robots.txt, sitemap, RSS | curl + validator tools |
| Evidence density | Count citations/stats per 1k words in existing columns | Manual |

### 20 Seed Queries (10 Korean, 10 English)

**English:**
1. "What is agent engine optimization AEO"
2. "AI agent economy 2026"
3. "future of work AI agents"
4. "digital advertising death AI agents"
5. "AI edge computing developing countries"
6. "GEO generative engine optimization best practices"
7. "AI content citation optimization"
8. "Korean AI research labs"
9. "AI replacing knowledge workers 2026"
10. "agent-first API design strategy"

**Korean:**
1. "AI 에이전트 경제 2026"
2. "에이전트 시대 직업 변화"
3. "GEO 생성형 엔진 최적화"
4. "AI 에이전트 마케팅 전략"
5. "에이전트 시대 광고 산업"
6. "AI 디지털 격차 개발도상국"
7. "한국 AI 연구 트렌드"
8. "AEO 에이전트 엔진 최적화"
9. "AI 콘텐츠 최적화 전략"
10. "에이전트 시대 1인 기업"

### Baseline Recording
Save results to `/geo/data/baseline-YYYY-MM-DD.json`:
```json
{
  "date": "2026-02-13",
  "queries": [
    {
      "query": "...",
      "language": "en",
      "platforms": {
        "chatgpt": { "cited": false, "url": null, "accuracy": null },
        "perplexity": { "cited": false, "url": null, "accuracy": null },
        "gemini": { "cited": false, "url": null, "accuracy": null },
        "google_aio": { "cited": false, "url": null, "accuracy": null }
      }
    }
  ],
  "compositeScore": 0
}
```

---

## 2. A/B Structure

### Design
Not a true A/B test (can't split AI engine traffic). Instead: **before/after comparison + optimized vs unoptimized columns published simultaneously.**

### Groups

**Control (Unoptimized):** 2 existing columns, left unchanged:
- `2026-02-10-era-of-the-chairman.md`
- `2026-02-12-electric-girl.md`

**Treatment (GEO-Optimized):** 2 new columns using the full GEO template:
- Same quality tier, similar topics, similar length
- Full schema (ScholarlyArticle + FAQ)
- Inline citations with links
- Data tables
- Named frameworks
- TL;DR and Key Takeaways sections

### Comparison Method
After 4 weeks, query both optimized and control columns by topic. Compare:
- Citation frequency across platforms
- Citation accuracy
- Which sections get quoted

---

## 3. Monitoring

### Weekly (15 min)
- Run all 20 seed queries across 4 platforms
- Log results in `baseline-YYYY-MM-DD.json` format
- Note any new citations, broken citations, or hallucinated citations

### Monthly (1 hour)
- Compute full GEO Score using evaluation metrics
- Compare against previous month
- Review Vercel analytics for AI-referred traffic (look for referrer patterns: chatgpt.com, perplexity.ai, etc.)
- Check Google Search Console for AI Overview appearances

### Tools
| Tool | Purpose | Cost |
|------|---------|------|
| Manual query audit | Citation tracking | Free (time only) |
| Google Search Console | AI Overview visibility + crawl status | Free |
| Google Rich Results Test | Schema validation | Free |
| Vercel Analytics | Traffic referrer analysis | Included |
| robots.txt tester | Crawler access verification | Free |
| Custom script (future) | Automated seed query runner | Build cost |

### Automated Monitoring (Month 2+)
Build a simple script that:
1. Queries Perplexity API with seed queries (Perplexity has an API)
2. Parses citations for HypeProof URLs
3. Logs to Supabase table
4. Alerts on Slack/Discord when citation detected

For ChatGPT/Gemini: no API-based citation checking available yet → remain manual.

---

## 4. Timeline

| Week | Action | Deliverable |
|------|--------|-------------|
| **W0** (Feb 13) | Baseline measurement | `baseline-2026-02-13.json` |
| **W0** | P0 changes: robots.txt, schema upgrade, dateModified | Deployed |
| **W1** | Adopt content template for new columns | 2 GEO-optimized columns published |
| **W1** | Start Reddit distribution | First 2 Reddit posts |
| **W2** | Retrofit top 5 existing columns | Updated columns with new structure |
| **W2** | First weekly audit | `audit-W2.json` |
| **W4** | First monthly GEO Score | `geo-score-month1.md` |
| **W4** | A/B comparison: optimized vs control | `ab-results-month1.md` |
| **W8** | Second monthly score + trend analysis | Decide: iterate or ship |
| **W12** | Third monthly score | Full iteration review |

---

## 5. Success Criteria

### Iterate (something's not working)
- GEO Score flat or declining after 4 weeks
- Zero citations detected after 4 weeks despite full implementation
- Schema validation errors persisting
- Content cadence dropped below 1 column/week

### Ship (it's working, expand)
- ≥3 AI citations detected in month 1
- GEO Score ≥40 by month 1 (from baseline ~15-20)
- At least 1 platform consistently citing HypeProof
- Any measurable AI-referred traffic in Vercel analytics

### Kill (wrong approach)
- After 12 weeks, zero citations AND no structural improvements in content quality
- This is unlikely — even if AI citations are slow, the structural improvements benefit traditional SEO

### Graduation Criteria
- GEO Score ≥60 sustained for 2 months → move from "testing" to "standard practice"
- At that point, embed GEO template as default, automate monitoring, reduce manual audits

---

## Resource Estimate

| Activity | Time/Week | Who |
|----------|-----------|-----|
| Weekly query audit | 15 min | Jay |
| New GEO-optimized columns | 4-6 hours (2 columns) | Jay + AI |
| Column retrofitting | 1-2 hours (W2-W4 only) | Jay + AI |
| Reddit/distribution | 30 min | Jay |
| Monthly scoring | 1 hour/month | Jay |
| **Total** | **~6 hours/week** | Manageable for small team |
