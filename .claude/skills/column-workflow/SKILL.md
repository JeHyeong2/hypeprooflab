---
name: column-workflow
description: "Column pipeline integrated guide. Covers 3 tracks (Creator-Written, Creator-Guided, Auto-Generated), rotation state machine, frontmatter rules, /write-column + /qa-check usage, KO/EN pair generation, and escalation policy."
version: 1.0
updated: 2026-03-25
---

# Column Workflow — Integrated Column Pipeline Guide

> Consolidated from OpenClaw's `column-pipeline`, `hypeproof-column`, and `content-quality` skills.
> This is the single source of truth for column production in hypeproof.

## 3 Tracks

### Track A: Creator-Written
Creator submits a complete draft (md/pdf/docx).
```
Submit → frontmatter gen → source research → creator confirm → QA gate → deploy
```

### Track B: Creator-Guided (AI ghostwrite)
Creator provides notes/keywords/outline; AI writes the draft.
```
Notes received → AI draft → creator feedback loop (max 5 rounds)
  → creator "deploy OK" text reply → source research → QA gate → deploy
```

### Track C: Auto-Generated
AI writes the column autonomously (Jay's turn or fallback).
```
/write-column <topic> → AI draft → QA gate → deploy
```

---

## rotation.json Schema

Location: `.claude/skills/column-workflow/rotation.json`

```json
{
  "startDate": "2026-03-01",
  "current": {
    "index": 0,
    "creator": "Jay",
    "status": "idle",
    "updatedAt": "2026-03-25T00:00:00Z"
  },
  "roster": [
    { "index": 0, "name": "Jay",   "discordId": "1186944844401225808", "expertise": "AI agents, automotive SW, PM", "type": "admin" },
    { "index": 1, "name": "JY",    "discordId": "390511709019832330",  "expertise": "AI/ML, quant, web frontend",   "type": "creator" },
    { "index": 2, "name": "Ryan",  "discordId": "470486268069806090",  "expertise": "quant research, physics, CERN", "type": "creator" },
    { "index": 3, "name": "Kiwon", "discordId": "1460845189793845420", "expertise": "global marketing, psychology",  "type": "creator" },
    { "index": 4, "name": "TJ",    "discordId": "1458010195228758017", "expertise": "media production, content",     "type": "creator" },
    { "index": 5, "name": "BH",    "discordId": "957957767992328213",  "expertise": "particle physics, CERN CMS",    "type": "creator" }
  ],
  "history": []
}
```

### State Machine

```
idle → nudged → accepted → in_progress → submitted → approved → deployed
                  │                                       │
                  └─ declined/skipped ───────────────────► (next creator)
```

| Event | Status transition |
|-------|-------------------|
| Nudge sent | `idle` → `nudged` |
| Creator responds/picks topic | `nudged` → `accepted` |
| Draft work begins | `accepted` → `in_progress` |
| Creator submits draft | `in_progress` → `submitted` |
| Creator approves final | `submitted` → `approved` |
| Deploy completes | `approved` → `deployed` |
| No response / declined | → `skipped`, advance to next |

Rotation formula: `dayIndex = floor((today - startDate) / 1) % 6`

---

## Frontmatter Rules

All columns require this frontmatter (KO and EN):

```yaml
---
title: "Column title"
creator: "Name"              # NOT "author"
creatorImage: "/members/{name}.{ext}"  # NOT "authorImage"
date: "YYYY-MM-DD"
category: "Opinion"
tags: ["tag1", "tag2"]
slug: "YYYY-MM-DD-kebab-case-title"
readTime: "N min"
excerpt: "One-line summary"
lang: "ko"                   # or "en"
authorType: "human"          # or "ai"
---
```

### Rules
- `slug` MUST match the filename (e.g., `2026-03-25-my-topic.md` → `slug: "2026-03-25-my-topic"`)
- `creatorImage` values: `jay.png`, `jy.png`, `ryan.png`, `kiwon.jpeg`, `tj.png`, `bh.jpg`, `sebastian.png`
- `authorType`: `"human"` for creator-written/guided, `"ai"` for auto-generated
- EN frontmatter: translate `title`, `excerpt`, `tags` to English; keep same `slug`, `date`, `creator`

---

## Commands

### `/write-column <topic> [--from-research <date>] [--author <name>]`

Writes a bilingual column (KO first, then EN translation).

| Parameter | Default | Description |
|-----------|---------|-------------|
| `topic` | (required) | Column subject |
| `--from-research` | none | Use daily research from this date as source |
| `--author` | JY | Creator name |

Agent: `content-columnist`

Steps:
1. Read CLAUDE.md for project rules
2. If `--from-research`, read `research/daily/<date>-daily-research.md`
3. Write KO version → `web/src/content/columns/ko/{slug}.md`
4. Translate to EN → `web/src/content/columns/en/{slug}.md`
5. EN tone: sharp tech-journalist, NOT literal translation
6. Run `cd web && npm run build` to validate

### `/qa-check <file> [--type column]`

Runs read-only QA validation.

Agent: `qa-reviewer`

Checks:
- Frontmatter completeness (all required fields present)
- `slug` matches filename
- `creator`/`creatorImage` used (not `author`/`authorImage`)
- KO/EN pair exists
- Inline footnotes `**[N]**` map 1:1 to Sources table
- Confidence labels present (Observed/Supported/Speculative/Unknown)
- `npm run build` passes

Pass criteria:
- All frontmatter fields present
- KO + EN pair exists
- Build succeeds
- Footnote-source mapping valid

---

## KO/EN Pair Generation

1. **KO first** — always write Korean version first
2. **EN translation** — natural tech-journalist tone, not literal
3. **Same slug** for both languages
4. **File paths**:
   - `web/src/content/columns/ko/{slug}.md`
   - `web/src/content/columns/en/{slug}.md`
5. EN frontmatter: translate `title`, `excerpt`, `tags`; keep `slug`, `date`, `creator`, `creatorImage`

---

## Source Research (Post-Submit)

After a creator submits a draft, AI performs source research:

1. **Extract** claims, facts, numbers from body text
2. **Search** for authoritative sources (official releases, papers, trusted media)
3. **Insert** inline footnotes `**[N]**` in body + Sources table at bottom
4. **Show** the annotated version to creator for confirmation
5. Creator replies "deploy OK" (text, NOT emoji reaction) → proceed to QA

Sources table format:
```markdown
### Sources
| # | Source | Confidence |
|---|--------|------------|
| 1 | [Title](URL) (date) | Observed |
| 2 | [Title](URL) (date) | Supported |
```

---

## 48h No-Response Escalation

| Elapsed | Action |
|---------|--------|
| D-3 | Send nudge with topic suggestions |
| D-1 | Send reminder (if no response) |
| D-day | AI draft proposal (not published) |
| +24h | One reminder |
| +48h | Add `needs-human` label to tracking issue, notify Jay in #content-pipeline |

Rules:
- Max 2 nudges per cycle (D-3 briefing + D-1 reminder)
- No messages 23:00-08:00 KST
- 3 consecutive no-responses → 2-week cooldown for that creator
- Declined → immediately advance to next creator
- AI never publishes autonomously without creator or Jay approval

---

## QA Gate (Mandatory)

Every column must pass before deploy. No exceptions.

| Check | Tool | Pass criteria |
|-------|------|---------------|
| Frontmatter | qa-reviewer | All required fields present |
| Links | `validate_links.py` | All URLs return 200 (403 paywall OK with note) |
| Quality | `eval_research.py --quick` | Score >= 70 (advisory for creator columns) |
| Build | `npm run build` | Exit 0 |

If any check fails → fix → re-run entire QA gate.

---

## Deploy Flow

```
QA pass → git commit → vercel --prod --yes → curl 200 check → creator notification
```

- Use `vercel --prod --yes` CLI only (Git not connected)
- Verify live URL returns 200 after deploy
- Send creator the production URL
- One deploy notification only (no duplicates)

---

## Validation

```bash
cd web && npm run build
```

Build must pass. If it fails, do not deploy.
