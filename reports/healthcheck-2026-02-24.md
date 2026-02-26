# Healthcheck Report — 2026-02-24 23:45

## Summary
| Category | Tests | Pass | Fail | Skip |
|----------|-------|------|------|------|
| Infrastructure | 4 | 4 | 0 | 0 |
| Content | 7 | 6 | 1 | 0 |
| Build | 1 | 1 | 0 | 0 |
| Agent Dry-Run | 5 | 0 | 0 | 5 |
| E2E Pipeline | 1 | 0 | 0 | 1 |
| **Total** | **18** | **11** | **1** | **6** |

**Verdict**: PARTIAL — 1 FAILURE (frontmatter inconsistency), 6 SKIPPED (sub-agent delegation unavailable)

## T1. Infrastructure

- PASS T1.1 Agent files (7/7)
  - content-columnist, content-novelist, web-developer, qa-reviewer, research-analyst, community-manager, publish-orchestrator
  - All have valid YAML frontmatter (name, description, tools, model)
  - Additional agents present: deck-qa, slide-planner, content-writer, gslides-builder, deck-capture, deck-critic, deck-orchestrator, healthcheck (8 extra)
- PASS T1.2 Command files (7/7)
  - write-column, write-novel, qa-check, research, deploy, publish, announce
  - All have valid frontmatter with `agent:` field matching correct agent name
  - Additional commands: deck, proposal, healthcheck (3 extra)
- PASS T1.3 Headless scripts (9/9 including run-command.sh)
  - run-command.sh, write-column.sh, write-novel.sh, qa-check.sh, research.sh, deploy.sh, publish.sh, announce.sh, healthcheck.sh
  - All executable, all delegate properly through run-command.sh
- PASS T1.4 OpenClaw skill exists
  - `~/.openclaw/workspace/skills/hypeproof-headless/SKILL.md` (4281 bytes)

## T2. Content Integrity

- PASS T2.1 Column KO/EN pairs: 15/15 matched
  - All 15 KO columns have EN counterparts and vice versa
- FAIL T2.2 Column frontmatter: 4 files with field name inconsistency
  - `ai-scores-your-writing-geo-qa.md`: uses `creator` + `creatorImage` instead of `author` + `authorImage`
  - `building-ai-assistant-with-openclaw.md`: uses `creator` + `creatorImage` instead of `author` + `authorImage`
  - `building-ai-content-platform.md`: uses `creator` + `creatorImage` instead of `author` + `authorImage`
  - `lawyer-beat-developer.md`: uses `creator` instead of `author` (has `authorImage` correctly)
  - Slug vs filename: all 15 match correctly
  - All other required fields (title, date, category, tags, slug, readTime, excerpt) present in all 15 files
- PASS T2.3 Novel web versions (32 files: 30 chapters + prologue + afterword)
  - All have required frontmatter (title, author, date, slug, series, volume, chapter, authorImage, excerpt)
  - All use `authorImage: "/authors/cipher.png"` correctly
  - All slugs match filenames
- PASS T2.4 Novel originals vs web parity
  - 30 chapters + prologue + afterword: all have both original and web version
  - No missing web versions, no missing originals
- PASS T2.5 Novel summaries: 30/30
  - All chapters (01-30) have corresponding summary-NN.md files
- PASS T2.6 Research daily reports: 13 files
  - Date range: 2026-02-10 to 2026-02-24
  - All reports have substantial content (>500 chars)
- PASS T2.7 Image references: all referenced images exist in web/public/
  - `/authors/cipher.png`, `/members/bh.jpg`, `/members/jay.png`, `/members/jy.png`, `/members/kiwon.jpeg`, `/members/ryan.png`, `/members/tj.png`

## T3. Build

- PASS T3.1 Clean build passed
  - `rm -rf .next && npm run build` — success
  - All pages generated (columns, novels, API routes, static pages)

## T4. Agent Dry-Run

- SKIP T4.1 content-columnist — sub-agent delegation not available in interactive session
- SKIP T4.2 qa-reviewer — sub-agent delegation not available
- SKIP T4.3 community-manager — sub-agent delegation not available
- SKIP T4.4 research-analyst — sub-agent delegation not available
- SKIP T4.5 web-developer — sub-agent delegation not available (build verified in T3.1)

Note: Agent validation performed statically — all 7 agent files have valid frontmatter, all 7 commands map to correct agents, all headless scripts delegate properly. Full runtime dry-run requires: `bash scripts/headless/healthcheck.sh --level all`

## T5. E2E Pipeline

- SKIP T5.1 Publish dry-run — requires publish-orchestrator sub-agent delegation

Note: Run via `bash scripts/headless/healthcheck.sh --level e2e` for full E2E testing.

## Issues Found

| ID | Severity | Test | Description | Auto-fixed |
|----|----------|------|-------------|------------|
| 1 | WARN | T2.2 | `ai-scores-your-writing-geo-qa.md` (KO+EN): uses `creator`/`creatorImage` instead of `author`/`authorImage` | no |
| 2 | WARN | T2.2 | `building-ai-assistant-with-openclaw.md` (KO+EN): uses `creator`/`creatorImage` instead of `author`/`authorImage` | no |
| 3 | WARN | T2.2 | `building-ai-content-platform.md` (KO+EN): uses `creator`/`creatorImage` instead of `author`/`authorImage` | no |
| 4 | WARN | T2.2 | `lawyer-beat-developer.md` (KO+EN): uses `creator` instead of `author` | no |

## Recommendations

1. **Standardize column frontmatter** — 4 older columns use `creator`/`creatorImage` instead of the documented `author`/`authorImage` fields. The build passes (framework likely accepts both), but this inconsistency may cause issues with future features relying on `author`.
2. **Run headless healthcheck** for full agent + E2E coverage: `bash scripts/headless/healthcheck.sh --level all`
