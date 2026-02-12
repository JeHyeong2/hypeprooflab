# GEO Implementation Design v1 — HypeProof AI Lab

> 2026-02-13

## 1. Schema Markup Enhancements

### Current State
- Basic Article JSON-LD on columns
- OG meta tags

### Target State

**A. Upgrade Article → ScholarlyArticle** for evidence-heavy columns:
```json
{
  "@type": "ScholarlyArticle",
  "headline": "...",
  "author": { "@type": "Person", "name": "Jay Lee", "url": "..." },
  "datePublished": "2026-02-10",
  "dateModified": "2026-02-12",
  "citation": [
    { "@type": "CreativeWork", "name": "Princeton KDD 2024", "url": "..." }
  ],
  "about": [
    { "@type": "Thing", "name": "AI Agent Economy" }
  ],
  "inLanguage": ["ko", "en"],
  "speakable": { "@type": "SpeakableSpecification", "cssSelector": [".excerpt", ".key-takeaway"] }
}
```

**B. Add FAQ Schema** to every column with a "Key Questions" section:
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "...", "acceptedAnswer": { "@type": "Answer", "text": "..." } }
  ]
}
```

**C. Add ClaimReview Schema** for columns that fact-check or analyze claims:
```json
{
  "@type": "ClaimReview",
  "claimReviewed": "AI will replace all jobs by 2030",
  "reviewRating": { "@type": "Rating", "ratingValue": 2, "bestRating": 5, "worstRating": 1 }
}
```

**Priority**: ScholarlyArticle (high impact, low effort) → FAQ (medium effort) → ClaimReview (only for suitable columns)

### Implementation
- Create a `generateSchema()` utility in Next.js that auto-generates based on frontmatter fields
- Add `faq`, `claims`, `citations` arrays to column frontmatter
- Validate with Google Rich Results Test on deploy (CI check)

---

## 2. Content Template (Optimal Structure for AI Citation)

Based on research: H2/H3 hierarchy (+40% citations), tables (2.5×), long-form 2000+ words (3×), inline citations (30-40% improvement), statistics (best method combo).

### HypeProof GEO Column Template

```markdown
---
title: "..."
subtitle: "..."  # NEW: one-line claim or thesis
author: "..."
date: "YYYY-MM-DD"
dateModified: "YYYY-MM-DD"  # NEW: track updates
category: "..."
tags: [...]
slug: "..."
readTime: "..."
excerpt: "..."
citations: [...]  # NEW: structured source list
faq: [...]  # NEW: Q&A pairs for schema
keyStats: [...]  # NEW: headline numbers
---

## TL;DR (Key Claim)
> One paragraph stating the core thesis with 1-2 statistics.
> "에이전트 시대에서 GEO 최적화된 콘텐츠는 비최적화 대비 30-40% 더 많이 인용된다 (Princeton KDD 2024)."

## [Section 1: Context/Problem]
- Set up the question with data
- Include ≥2 inline citations with links

## [Section 2: Analysis/Evidence]  
- Deep analysis with statistics
- Include at least one **data table**:

| Factor | Impact | Source |
|--------|--------|--------|
| Inline citations | +30-40% visibility | Princeton 2024 |
| Tables | 2.5× more citations | Research data |
| 2000+ words | 3× more citations | Research data |

## [Section 3: Original Framework/Insight]
- Introduce a **named concept** (HypeProof's signature move)
- e.g., "AEO — Agent Engine Optimization"
- This is what gets quoted and attributed

## [Section 4: Implications/Future]
- Forward-looking analysis
- Specific predictions with reasoning

## Key Takeaways
1. Numbered list of 3-5 actionable points
2. Each with a supporting statistic
3. Formatted for easy extraction by AI

## FAQ
### Q: [Common question about this topic]?
A: [Concise answer with citation]

### Q: [Second question]?
A: [Concise answer]

---
*Sources: [Numbered reference list with full URLs]*
```

### Why This Structure Works
- **TL;DR**: AI engines extract summary claims → ours is pre-written and data-backed
- **Data tables**: 2.5× citation boost, and AI engines parse tables well
- **Named frameworks**: Become quotable entities (brandable concepts)
- **FAQ section**: Directly maps to FAQ schema + matches question-answer retrieval
- **Numbered key takeaways**: Listicles = 50% of top AI citations
- **Source list**: Inline citations = single biggest GEO lever

---

## 3. Per-Platform Optimization

Research: Only 11% of domains cited by both ChatGPT AND Perplexity. Platform-specific optimization required.

### ChatGPT
- **Citation pattern**: 80% of citations don't appear in Google top 100. Favors authoritative, well-structured content regardless of Google rank.
- **Strategy**: 
  - Ensure GPTBot has full crawl access (robots.txt)
  - Long-form content with clear claims and citations
  - Named frameworks get picked up as "according to [source]"
  - Korean content: test with Korean-language queries specifically
  - 76.4% of most-cited pages updated within 30 days → keep top content fresh

### Perplexity
- **Citation pattern**: Reddit heavy (6.6%), favors recent content with clear source links
- **Strategy**:
  - Perplexity crawls aggressively — ensure sitemap is always current
  - Include explicit source URLs (Perplexity shows inline citations)
  - Post column summaries on relevant Reddit communities (r/artificial, r/MachineLearning)
  - Perplexity has lowest error rate (37%) → accuracy matters here

### Gemini / Google AI Overviews
- **Citation pattern**: 76% of AI Overview citations from Google top 10. Gemini follows similar Google-indexed patterns.
- **Strategy**:
  - Traditional SEO still matters for Google AI Overviews
  - Schema markup directly helps (+36% citation probability)
  - FAQ schema especially effective for AI Overviews
  - Target featured snippet format (concise answer + detail)

### Cross-Platform
- Publish bilingual versions (Korean + English) to double the surface area
- Each language version should be independently optimized, not just translated
- English version targets global AI engines; Korean targets Naver + Korean-language AI queries

---

## 4. Freshness Strategy

Research: AI-cited content is 25.7% fresher than organic. 76.4% of top-cited pages updated within 30 days.

### Content Tiers

| Tier | Type | Cadence | Example |
|------|------|---------|---------|
| **Evergreen** | Foundational analysis | Update every 30 days | "What is AEO?" framework pieces |
| **Timely** | Trend analysis | Publish within 48h of event | Major AI announcements, policy changes |
| **Recurring** | Weekly/monthly series | Fixed schedule | "AI Agent 주간 브리핑" |

### Update Protocol
1. **Top 10 columns** (by citation/traffic): Review and update `dateModified` every 2 weeks
2. **All columns**: Add "Last verified: YYYY-MM-DD" note at bottom
3. **Evergreen content**: Add new statistics, update outdated claims, refresh examples
4. **Never break URLs** — redirects if slug changes

### Practical for Small Team
- 2 new columns/week (1 Korean, 1 English)
- 2 column updates/week (refresh top performers)
- Total: ~4 content actions/week — achievable for 1-2 people with AI assistance

---

## 5. Citation Architecture

### Inline Citation Format
```markdown
According to Princeton's KDD 2024 study, GEO-optimized content sees 
a **30-40% improvement** in AI engine visibility ([Aggarwal et al., 2024](https://arxiv.org/...)).
```

### Rules
1. **Every statistic must have a source** — named author/org + link
2. **Use descriptive anchor text** — "Princeton KDD 2024 study" not "this study"
3. **Cite at least 3 external sources per column** — signals authority
4. **Include at least 1 academic/official source** — Tier 1 credibility
5. **Self-cite previous HypeProof columns** when relevant — builds internal authority graph
6. **Place key citations in first 500 words** — AI engines weight early content

### Source Hierarchy
1. Academic papers (arXiv, ACL, NeurIPS)
2. Official reports (government, IGOs, company earnings)
3. Reputable journalism (NYT, Bloomberg, The Verge)
4. Industry analysis (a16z, Sequoia, McKinsey)
5. HypeProof's own prior analysis (self-citation)

---

## 6. Distribution Strategy

Goal: Maximize AI crawler visibility. Research shows each platform has different source preferences.

### Tier 1: Owned (Do Immediately)
- **Website** (hypeproof-ai.xyz): Primary canonical source
- **RSS feed**: Ensure full-text RSS (not excerpts) — many AI crawlers use RSS
- **Sitemap.xml**: Auto-update on publish, include `<lastmod>` dates
- **robots.txt**: Explicitly allow GPTBot, PerplexityBot, Google-Extended, anthropic-ai

### Tier 2: Syndication (Within 1 Month)
- **Reddit**: Post summaries (not full text) to r/artificial, r/MachineLearning, r/korea with canonical link. Reddit = 6.6% of Perplexity citations.
- **LinkedIn**: Full column reposts — LinkedIn content gets indexed by multiple AI engines
- **GitHub**: Publish research data, frameworks as repos — GitHub content is heavily indexed
- **Medium**: Cross-post with canonical URL pointing to HypeProof

### Tier 3: Community (Within 3 Months)
- **Hacker News**: Submit original analysis pieces
- **Twitter/X**: Thread key insights with link to full column
- **Korean communities**: GeekNews (Korean HN), AI Korea communities
- **Newsletter**: Weekly digest for direct relationship (not platform-dependent)

### Canonical URL Strategy
- Always set `<link rel="canonical">` to hypeproof-ai.xyz URL
- All syndicated posts link back to original
- This ensures AI engines attribute citations to HypeProof, not Medium/LinkedIn

---

## Implementation Priority (Effort vs Impact)

| Priority | Action | Effort | Impact | Timeline |
|----------|--------|--------|--------|----------|
| P0 | robots.txt + crawler access | 1 hour | High | Day 1 |
| P0 | Upgrade to ScholarlyArticle schema | 2 hours | High | Day 1 |
| P0 | Add dateModified to all columns | 1 hour | High | Day 1 |
| P1 | Content template adoption | 1 day | Very High | Week 1 |
| P1 | Add FAQ schema generation | 3 hours | High | Week 1 |
| P1 | Reddit distribution start | 30 min/post | Medium | Week 1 |
| P2 | Retrofit top 5 columns with new template | 2 days | High | Week 2 |
| P2 | Full-text RSS verification | 1 hour | Medium | Week 2 |
| P3 | Bilingual column pipeline | Ongoing | High | Month 1 |
| P3 | Automated structure linter | 1 day | Medium | Month 1 |
| P4 | ClaimReview schema | 2 hours/col | Low-Med | Month 2 |
| P4 | Medium/LinkedIn syndication | 1 hour/post | Medium | Month 2 |
