---
name: content-standards
description: Unified content quality standards for columns and research. Defines frontmatter schema, category taxonomy, confidence labels, and validation rules. Reference this skill when creating or reviewing content.
user_invocable: false
---

# content-standards

## Purpose

Single source of truth for HypeProof content quality standards. Consolidates rules previously scattered across multiple OpenClaw skills (column-pipeline, content-quality, hypeproof-column) into one referenceable standard within the hypeproof repo.

## Frontmatter Schema

Every column and research article MUST include these frontmatter fields:

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `title` | string | YES | `"AI Agent Economy"` |
| `creator` | string | YES | `"Jay"` |
| `date` | string (YYYY-MM-DD) | YES | `"2026-02-10"` |
| `slug` | string | YES | `"2026-02-10-era-of-the-chairman"` |
| `excerpt` | string | YES | 1-2 sentence summary |
| `category` | string | YES | Must be from allowed list (see below) |
| `tags` | string[] | YES | 2-6 tags |
| `readTime` | string | YES | `"10 min"` or `"10분"` |
| `creatorImage` | string | YES | `/members/{name}.png` (or `.jpg`/`.jpeg`) |
| `lang` | string | YES | `"ko"` or `"en"` |
| `authorType` | string | YES | `"human"` or `"ai"` |
| `citations` | object[] | NO | Array of `{title, url, author, year}` |

### Slug Rules

- Slug MUST match the filename (without `.md` extension)
- Format: `YYYY-MM-DD-kebab-case-title` or `kebab-case-title`
- No spaces, no uppercase, no special characters except hyphens

### creatorImage Path Rules

- Path: `/members/{name}.{ext}` where `{ext}` is `png`, `jpg`, or `jpeg`
- Valid examples: `/members/jay.png`, `/members/ryan.png`, `/members/kiwon.jpeg`, `/members/bh.jpg`
- NEVER use `/authors/` path for columns (that path is for novel author personas like CIPHER)
- Image file MUST exist in `web/public/members/`

## Category Taxonomy

Allowed categories for columns:

| Category | Use When |
|----------|----------|
| `Opinion` | Personal perspective, editorial, thought piece |
| `Column` | General column format |
| `Analysis` | Data-driven or systematic examination |
| `Research` | Research summary or deep dive |
| `AI Engineering` | Technical AI/ML implementation topics |
| `AI × Society` | AI's impact on society, culture, politics |
| `AI × Science` | AI applied to scientific domains |
| `AI × Philosophy` | AI and philosophical questions |
| `AI × Psychology` | AI and human cognition, behavior |
| `AI × Finance` | AI in finance, economics, markets |
| `Tutorial` | Step-by-step how-to guide |
| `Use Case` | Real-world application showcase |

Use the `AI × {Domain}` pattern for cross-domain topics. New domains can be added following this pattern.

## Tag Conventions

- Use 2-6 tags per article
- Prefer lowercase English for technical terms: `"AI"`, `"Claude"`, `"LLM"`, `"hackathon"`
- Korean terms allowed when no English equivalent exists
- No duplicate tags within an article
- Keep tags concise (1-3 words each)

## KO/EN Pair Rule

Every published column MUST have both language versions:

- Korean: `web/src/content/columns/ko/{slug}.md`
- English: `web/src/content/columns/en/{slug}.md`

Both files must share the same `slug` value. The `lang` field must be `"ko"` or `"en"` respectively.

## Confidence Labels

Use these labels to mark claims and predictions in article body text:

| Label | Meaning | When to Use |
|-------|---------|-------------|
| Observed | Verified fact with direct evidence | Published data, official announcements, reproduced results |
| Supported | Strong indirect evidence | Peer-reviewed studies, multiple credible sources, expert consensus |
| Speculative | Reasonable inference without hard evidence | Trend extrapolation, author's hypothesis, early signals |
| Unknown | Insufficient information to judge | Emerging topics, conflicting sources, no data available |

### Usage in Content

Inline: `This trend will accelerate (Speculative)` or as a section marker.

## Source Citation Rules

- Every factual claim SHOULD link to its source
- Prefer `citations` array in frontmatter for formal references
- Inline links acceptable for supplementary references
- Required citation fields: `title`, `url`
- Recommended citation fields: `author`, `year`
- Prefer primary sources (papers, official docs) over secondary coverage

## GEO Score (Content Quality Gate)

GEO (Good Enough to Output) score evaluates content readiness on a 0-100 scale:

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Accuracy | 30% | Claims supported by sources, no factual errors |
| Originality | 25% | Unique perspective, not just summarizing others |
| Readability | 20% | Clear structure, engaging prose, appropriate length |
| Completeness | 15% | Topic adequately covered, no obvious gaps |
| Technical depth | 10% | Appropriate level of detail for the category |

**Pass threshold: 70/100**

Articles scoring below 70 should not be published without revision.

## Validation Checklist

Before publishing any content, verify:

- [ ] All required frontmatter fields present
- [ ] `slug` matches filename
- [ ] `category` is from the allowed list
- [ ] `creatorImage` file exists in `web/public/members/`
- [ ] KO and EN versions both exist
- [ ] `lang` field matches the file's directory (`ko/` or `en/`)
- [ ] 2-6 tags present
- [ ] `date` is valid YYYY-MM-DD format
- [ ] `npm run build` passes
- [ ] Key claims have source citations
