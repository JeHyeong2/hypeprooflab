---
name: research-pipeline
description: "Daily Research pipeline guide. Defines format, sources, confidence labels, Discord posting rules, file paths, and research-to-column conversion flow. Reference this skill when creating or reviewing daily research."
user_invocable: false
version: 1.0
updated: 2026-03-25
---

# Research Pipeline — Daily Research Guide

> Consolidated from OpenClaw's `research-columnist` and `content-quality` skills.
> Single source of truth for daily research production in hypeproof.

## Overview

Daily Research is a storytelling-format tech briefing published to `#daily-research` on Discord. AI writes it; Jay approves. Research can feed into columns via the column-workflow skill.

---

## Sources

### Required Source Types

| Source | Examples | Priority |
|--------|----------|----------|
| Web search | Google, Bing — breaking news, announcements | Primary |
| arXiv | Papers, preprints — technical depth | Primary |
| Tech blogs | TechCrunch, The Verge, Ars Technica, InfoQ | Primary |
| X (Twitter) | @AndrewYNg, industry accounts | Secondary |
| Official releases | Company blogs, press releases, CVE databases | Primary |
| GitHub trending | Trending repos, release notes | Secondary |

### Source Rules

- **Real links only** — never fabricate URLs. Every link must come from an actual web search
- **Link verification mandatory** — before publishing, test every URL:
  - `200` → keep
  - `403` (paywall) → keep with `(paywall)` note
  - `404` / `5xx` → find replacement or remove topic
- **Primary sources preferred** — official announcements, papers, CVEs over secondary coverage
- **Minimum 5 sources per article** — diverse outlets, not all from one site
- **No link = no topic** — if you can't find a real source, drop the topic entirely

---

## Confidence Labels

Use these labels to classify each source's reliability:

| Label | Emoji | Meaning | When to Use |
|-------|-------|---------|-------------|
| Observed | 🟢 | Verified fact, direct evidence | Official announcements, press releases, CVEs, reproduced results |
| Supported | 🔵 | Strong indirect evidence | Expert analysis, trusted media interpretation, peer-reviewed studies |
| Speculative | 🟡 | Inference without hard evidence | Predictions, trend extrapolation, unconfirmed roadmaps |
| Unknown | ⚪ | Insufficient information | Rumors, single anonymous source, conflicting reports |

### Distribution Rules

- **Expected distribution**: 🟢 40-50%, 🔵 30-40%, 🟡 10-20%, ⚪ 0-5%
- If 🟢 exceeds 80%, re-evaluate your classifications — you're likely under-differentiating
- Every article must use at least 2 different label types

### Placement

- **Labels go in the Sources table only** — NOT inline in body text
- Body text references sources via inline links `[text](URL)`, not confidence markers

---

## File Format

### Storage Path

- Korean: `research/daily/YYYY-MM-DD-daily-research.md`
- English: `research/daily/en/YYYY-MM-DD-daily-research.md`

### Frontmatter (KO)

```yaml
---
title: "제목"
date: YYYY-MM-DD
author: HypeProof Lab
authorType: ai-assisted
category: daily-research
tags: [AI, security, enterprise]
slug: YYYY-MM-DD-daily-research
readTime: 5
excerpt: "한 줄 요약 (Discord 요약에도 사용)"
lang: ko
---
```

### Frontmatter (EN)

```yaml
---
title: "English Title"
date: YYYY-MM-DD
author: HypeProof Lab
authorType: ai-assisted
category: daily-research
tags: [AI, security, enterprise]
slug: YYYY-MM-DD-daily-research
readTime: 5
excerpt: "One-line summary"
lang: en
---
```

### Required Frontmatter Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | YES | Storytelling-style, varied structure |
| `date` | date | YES | YYYY-MM-DD |
| `author` | string | YES | Always `HypeProof Lab` |
| `authorType` | string | YES | `ai-assisted` for daily research |
| `category` | string | YES | Always `daily-research` |
| `tags` | string[] | YES | 3-6 relevant tags |
| `slug` | string | YES | Must match filename (without `.md`) |
| `readTime` | number | YES | Estimated minutes |
| `excerpt` | string | YES | 1-line summary (reused for Discord) |
| `lang` | string | YES | `ko` or `en` |

---

## Body Template

```markdown
# [Title]

[Hook: 1-2 sentences. Short and punchy.]

[Background: 2-3 sentences. Why this matters now.]

## [Section Title 1]

[Storytelling body. Inline links mandatory — at least 1 per section.]
[Example: [Atlassian laid off 1,400 employees](https://...). This isn't just restructuring.]
[Numbers need context. Critical commentary required.]

## [Section Title 2]

[...]

## What to Watch Tomorrow

[Forward-looking 1-2 sentences]

---

### Sources
| # | Source | Confidence |
|---|--------|------------|
| 1 | [Title](URL) (date) | 🟢 Observed |
| 2 | [Title](URL) (date) | 🔵 Supported |
| 3 | [Title](URL) (date) | 🟡 Speculative |
```

### Writing Rules

- **Storytelling only** — no bullet-point lists in body. Narrative paragraphs
- **Title variety** — no repeating patterns (e.g., "~war", "~paradox") within 3 days
- **Inline links mandatory** — zero links in body = QA fail. Minimum 1 per section
- **Critical voice** — don't just report; analyze and question motivations
- **Korean first, then English** — EN is a rewrite for English-speaking audience, not a literal translation

---

## Discord Posting Rules (`#daily-research`)

Channel ID: `1468135779271180502`

### Format

```
📰 **[Title]**

[excerpt — 1-2 sentences]

🔗 [link to published article on hypeproof-ai.xyz]

---
Key topics: tag1, tag2, tag3
```

### Rules

- Post to **channel**, never to a thread
- Maximum 2000 characters (Discord limit)
- Include the `excerpt` from frontmatter as the summary
- Link to the live article URL, not the raw file
- One post per day — no duplicates
- Posting time: after QA pass and deploy, ideally 09:00-10:00 KST

---

## Research → Column Conversion

Daily research can be promoted to a full column via the column-workflow skill.

### Flow

```
research/daily/YYYY-MM-DD-daily-research.md
  → identify column-worthy topic
  → /write-column <topic> --from-research YYYY-MM-DD
  → column-workflow takes over (KO/EN pair, QA, deploy)
```

### When to Promote

- Topic has enough depth for 800+ word analysis
- Strong reader interest signal (Discord reactions, creator discussion)
- Unique HypeProof perspective available (one of the 7 lenses)
- Not just news summary — requires original analysis

### How to Promote

1. Use `/write-column <topic> --from-research <date>` command
2. The `content-columnist` agent reads the research file as source material
3. Column follows column-workflow rules (different frontmatter, different paths)
4. Research file is NOT modified — it stays as-is in `research/daily/`

---

## Validation

### Format Check

Before publishing, verify:

- [ ] All required frontmatter fields present
- [ ] `slug` matches filename
- [ ] `date` is valid YYYY-MM-DD
- [ ] `category` is `daily-research`
- [ ] `author` is `HypeProof Lab`
- [ ] KO and EN versions both exist
- [ ] Every section has at least 1 inline link
- [ ] Sources table present with confidence labels
- [ ] Confidence label distribution is reasonable (not all 🟢)
- [ ] All source URLs verified (200 or 403-with-note)
- [ ] `npm run build` passes (if published to web)

### Lint Rules (for automated checking)

| Rule | Check | Severity |
|------|-------|----------|
| `frontmatter-complete` | All required fields present | Error |
| `slug-match` | Slug matches filename | Error |
| `inline-links` | At least 1 link per H2 section | Warning |
| `sources-table` | Sources table exists at end | Error |
| `confidence-diversity` | At least 2 different label types | Warning |
| `title-variety` | No repeated title pattern within 3 days | Warning |
| `link-alive` | All URLs return 200 or 403 | Error |

---

## Commands

### `/research [--topic X]`

Runs the daily research pipeline.

Agent: `research-analyst`

Steps:
1. Read CLAUDE.md for project rules
2. Search sources (web, arXiv, tech blogs, X)
3. Write KO version → `research/daily/YYYY-MM-DD-daily-research.md`
4. Write EN version → `research/daily/en/YYYY-MM-DD-daily-research.md`
5. Verify all links
6. Run format validation checklist

### `/qa-check <file> --type research`

Runs read-only QA on a research file.

Agent: `qa-reviewer`

Checks: frontmatter, slug match, inline links, sources table, confidence labels, link verification.
