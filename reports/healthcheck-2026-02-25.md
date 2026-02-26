# Healthcheck Report — 2026-02-25 (unit)

Run level: `unit` (T1 + T2 only, T3 skipped per --level unit)
Flags: none (no auto-fix applied)

## Summary

| Category | Tests | Pass | Fail | Skip |
|----------|-------|------|------|------|
| Infrastructure | 4 | 3 | 1 | 0 |
| Content | 7 | 6 | 1 | 0 |
| Build | 1 | 0 | 0 | 1 |
| Agent Dry-Run | 5 | 0 | 0 | 5 |
| E2E Pipeline | 1 | 0 | 0 | 1 |
| **Total** | **18** | **9** | **2** | **7** |

**Verdict**: FAIL — 2 test(s) failed

---

## T1. Infrastructure

- PASS T1.1 Agent files: 7/7 exist with valid frontmatter (name, tools, model)
  - content-columnist, content-novelist, web-developer, qa-reviewer,
    research-analyst, community-manager, publish-orchestrator — all present
- PASS T1.2 Command files: 7/7 exist with valid frontmatter (name, agent)
  - write-column, write-novel, qa-check, research, deploy, publish, announce — all present
- WARN T1.3 Headless scripts: 4 scripts found and all executable
  - Present (executable): run-command.sh, healthcheck.sh, publish.sh, credit-points.sh
  - Spec mentions "run-command.sh + 7 wrappers" but CLAUDE.md documents run-command.sh
    as the single entry point for all commands. Individual per-command wrapper scripts
    are not present, which matches the documented architecture. Treating as PASS (design intent).
- PASS T1.4 OpenClaw skill: ~/.openclaw/workspace/skills/hypeproof-headless/SKILL.md exists

---

## T2. Content Integrity

- PASS T2.1 Column KO/EN pairs: 16/16 matched
  - All KO columns have a corresponding EN counterpart
- FAIL T2.2 Column frontmatter: 2 files affected (same column, KO and EN)
  - `web/src/content/columns/ko/2026-02-25-ai-swallows-last-mile-of-finance.md`:
    - MISSING: `creator` field (uses deprecated `author: "Ryan"` instead)
    - MISSING: `creatorImage` field (uses deprecated `authorImage: "/members/ryan.png"` instead)
    - DEPRECATED fields present: `author`, `authorImage` (columns must use `creator`/`creatorImage`)
  - `web/src/content/columns/en/2026-02-25-ai-swallows-last-mile-of-finance.md`:
    - MISSING: `creator` field (uses deprecated `author: "Ryan"` instead)
    - MISSING: `creatorImage` field (uses deprecated `authorImage: "/members/ryan.png"` instead)
    - DEPRECATED fields present: `author`, `authorImage` (columns must use `creator`/`creatorImage`)
  - All other 15 columns (KO + EN): required fields complete, slugs match filenames
- PASS T2.3 Novel web versions: 32/32 files valid
  - All frontmatter required fields present (title, author, date, slug, series, volume, chapter, authorImage, excerpt)
  - All slugs match filenames
  - authorImage correctly set to `/authors/cipher.png` across all chapters
- PASS T2.4 Novel originals vs web parity: 30/30 chapters matched
  - Vol1 ch01-10: originals in novels/simulacra/volume-1/ + web versions present
  - Vol2 ch11-20: originals in novels/simulacra/volume-2/ + web versions present
  - Vol3 ch21-30: originals in novels/simulacra/volume-3/ + web versions present
- PASS T2.5 Novel summaries: 30/30 summaries exist
  - summary-01.md through summary-30.md all present in respective volume directories
- PASS T2.6 Research daily reports: 14/14 reports have sufficient content (>500 chars)
  - Date range: 2026-02-10 through 2026-02-25 (gaps on non-production days are expected)
  - All files exceed 500 bytes (range: 4959 – 6959 bytes)
- PASS T2.7 Image references: 7/7 image files exist in web/public/
  - /authors/cipher.png: OK
  - /members/bh.jpg: OK
  - /members/jay.png: OK
  - /members/jy.png: OK
  - /members/kiwon.jpeg: OK
  - /members/ryan.png: OK
  - /members/tj.png: OK

---

## T3. Build

- SKIP — level=unit excludes T3. Run `--level integration` or `--level all` to include build check.

---

## T4. Agent Dry-Run

- SKIP — run `bash scripts/headless/healthcheck.sh --level all` for full agent testing

---

## T5. E2E Pipeline

- SKIP — run `bash scripts/headless/healthcheck.sh --level all` for full E2E testing

---

## Issues Found

| ID | Severity | Test | Description | File | Auto-fixed |
|----|----------|------|-------------|------|------------|
| 1 | ERROR | T2.2 | Column uses deprecated `author`/`authorImage` fields; must use `creator`/`creatorImage` | web/src/content/columns/ko/2026-02-25-ai-swallows-last-mile-of-finance.md | no |
| 2 | ERROR | T2.2 | Column uses deprecated `author`/`authorImage` fields; must use `creator`/`creatorImage` | web/src/content/columns/en/2026-02-25-ai-swallows-last-mile-of-finance.md | no |

---

## Fix Guide

### Issues 1 & 2: 2026-02-25-ai-swallows-last-mile-of-finance.md (KO + EN)

In the frontmatter of both files, replace:
```yaml
author: "Ryan"
authorImage: "/members/ryan.png"
```

With:
```yaml
creator: "Ryan"
creatorImage: "/members/ryan.png"
```

Affected files:
- `web/src/content/columns/ko/2026-02-25-ai-swallows-last-mile-of-finance.md`
- `web/src/content/columns/en/2026-02-25-ai-swallows-last-mile-of-finance.md`

Use the Edit tool (not sed) to make this change. After fixing, verify with `cd web && npm run build`.
