# HypeProof Issue Guide

> For creators and agents — how to file actionable GitHub Issues on `jayleekr/hypeprooflab`.

## Labels

Use exactly one **type** label and one **area** label per issue.

### Type

| Label | When to use |
|-------|-------------|
| `bug` | Something is broken or behaves incorrectly |
| `content` | New column, research, novel chapter, or content edit |
| `feature` | New functionality or enhancement |
| `question` | Need clarification or discussion before acting |
| `infra` | Build, deploy, CI/CD, config changes |

### Area

| Label | Scope |
|-------|-------|
| `web` | Next.js site (`web/`) |
| `columns` | Columns in `web/src/content/columns/` |
| `novels` | Novel content (`novels/`, `web/src/content/novels/`) |
| `research` | Daily research, templates (`research/`) |
| `deck` | Slide generation system (`scripts/gslides/`, `products/`) |
| `docs` | Documentation, CLAUDE.md, guides |

## Issue Templates

### Bug Report

```
Title: [bug] <short description>

**URL or page**: (e.g., https://hypeproof-ai.xyz/columns/my-slug)
**What happened**:
**What I expected**:
**Screenshot**: (paste or drag image if available)
**Browser/OS**: (if relevant)
```

### Content Request

```
Title: [content] <topic or title>

**Type**: column / research / novel chapter
**Author**: (creator name)
**Language**: ko / en / both
**Topic/outline**:
  -
**Target date**: (optional)
**Related research**: (link to daily research or source if any)
```

### Feature Request

```
Title: [feature] <short description>

**Problem**: (what's missing or inconvenient)
**Proposed solution**:
**Alternatives considered**: (optional)
**Affected area**: (web / deck / infra)
```

### Question / Discussion

```
Title: [question] <topic>

**Context**:
**Options I see**:
  1.
  2.
**Who should weigh in**: (creator names by expertise)
```

## Rules

1. **One issue, one thing.** Don't bundle multiple bugs or requests.
2. **Search first.** Check open issues before filing a duplicate.
3. **Korean or English.** Both are fine for issue body. Titles should include the bracket prefix in English.
4. **No secrets.** Never paste API keys, tokens, or credentials.
5. **Link sources.** Reference related columns, research files, or commits when relevant.
6. **Mention people by GitHub handle** in the issue body if their input is needed.

## Creator → Expertise Routing

When an issue needs domain review, tag the right person:

| Creator | Expertise | Route these issues |
|---------|-----------|-------------------|
| JY (신진용) | AI/ML, Claude Code, Quant | AI feature design, model integration, coding workflow |
| Ryan (김지웅) | Physics, Quant, Data analysis | Data pipelines, analytics, research methodology |
| Kiwon (남기원) | Marketing, Psychology | UX copy, audience strategy, growth features |
| TJ (강태진) | Media, Content production | Video/media features, content workflow, creator tools |
| BH (태봉호) | Particle physics, CERN | Physics-domain content accuracy, data analysis |
| Sebastian | Engineering management | Architecture decisions, scalability, eng process |

## For Agents

When an agent creates an issue on behalf of a creator:

- **Prefix the title** with the bracket tag (`[bug]`, `[content]`, etc.)
- **Set labels** using `gh issue create --label "bug,web"`
- **Assign** the creator as author context in the body: `> Filed on behalf of **{creator}**`
- **Link related files** with repo-relative paths (e.g., `web/src/content/columns/ko/my-slug.md`)
- **Cross-reference** other issues with `#N` syntax
- **Don't auto-assign** — let Jay (admin) triage and assign

### Agent CLI example

```bash
gh issue create \
  --repo jayleekr/hypeprooflab \
  --title "[bug] Column page 404 for published slug" \
  --label "bug,columns" \
  --body "$(cat <<'EOF'
> Filed on behalf of **JY**

**URL**: https://hypeproof-ai.xyz/columns/my-slug
**What happened**: Page returns 404 despite file existing at `web/src/content/columns/ko/my-slug.md`
**What I expected**: Column renders normally
**Possible cause**: slug mismatch in frontmatter — see `slug:` field
EOF
)"
```

## Workflow

```
Creator spots issue → files GitHub Issue
  → Jay triages (label + assign)
  → Agent or Jay implements fix
  → PR or direct commit references issue (#N)
  → Close issue on merge/deploy
```
