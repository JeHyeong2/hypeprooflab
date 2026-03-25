---
name: roadmap-review
description: >
  Review and adjust the HypeProof roadmap. Pulls live traffic data,
  checks action item progress, validates assumptions against reality,
  and proposes adjustments. Use with /roadmap command.
allowed-tools: Read Grep Glob Bash Write Edit WebFetch AskUserQuestion
---

# roadmap-review

> HypeProof Roadmap review and adjustment skill
> Version: 2.0 | Updated: 2026-03-24

---

## When to Use

- Periodic roadmap review (monthly or before key sessions)
- After a milestone is completed or missed
- When external context changes (market, partnership, team)
- When member asks "where are we?" or "what's next?"

---

## Roadmap File

```
products/hypeproof-roadmap-2026Q2.md
```

This is the single source of truth. All reviews read from and write back to this file.

---

## Review Pipeline

```
1. Load Current State
   ├── Read roadmap file
   ├── Read PHILOSOPHY.md (tone check)
   └── Read members.md (team status)

2. Pull Live Data
   ├── View counts: curl hypeproof-ai.xyz/api/views?slugs=...
   │   ├── Columns (web/src/content/columns/ko/*.md slugs)
   │   ├── Research (web/src/content/research/ko/*.md slugs)
   │   └── Novels (web/src/content/novels/ko/*.md slugs)
   ├── Content inventory: count files in each content directory
   └── Git log: recent commits for activity pulse

3. Progress Check
   ├── Score each action item: Done / In Progress / Not Started / Blocked
   ├── Flag overdue items (past deadline)
   └── Flag items with no owner or unclear output

4. Assumption Validation
   ├── Traffic vs targets — are we growing?
   ├── Member activity — who contributed since last review?
   ├── External dependencies — 동아일보 status, Filamentree status
   ├── Risks — did any materialize?
   └── Member identity check — verify member names across docs match (no duplicates/aliases)

4.5 Meeting Input Verification (if meeting notes exist)
   ├── Read latest meeting notes (Weekly on HypeProof *.md)
   ├── Extract each participant's key proposals/ideas
   ├── Cross-check against roadmap + workflow: is every proposal either
   │   ├── Reflected (adopted into roadmap/workflow)
   │   ├── Explicitly rejected with reason
   │   └── Or flagged as "pending decision"
   ├── Check: are there phantom members? (same person with 2 names)
   ├── Check: education pipeline present? (Academy is main revenue)
   └── Report any gaps to user before proceeding

5. Challenge & Adjust
   ├── Ask probing questions (AskUserQuestion)
   │   ├── "Is [action item] still the right priority?"
   │   ├── "This assumption changed — should we pivot?"
   │   └── "Timeline slipped — cut scope or extend?"
   └── Propose adjustments based on answers

6. Update Roadmap
   ├── Update action item statuses
   ├── Add/remove/reprioritize items
   ├── Update traffic data section
   ├── Update "Last reviewed" timestamp
   └── Summarize changes made
```

---

## Live Data Collection

### View Counts

```bash
# Collect all slugs from content directories
COLUMN_SLUGS=$(ls web/src/content/columns/ko/*.md | xargs -I{} basename {} .md | tr '\n' ',')
RESEARCH_SLUGS=$(ls web/src/content/research/ko/*.md | xargs -I{} basename {} .md | tr '\n' ',')
NOVEL_SLUGS=$(ls web/src/content/novels/ko/*.md | xargs -I{} basename {} .md | tr '\n' ',')

# Fetch from live API
curl -s "https://hypeproof-ai.xyz/api/views?slugs=${COLUMN_SLUGS%,}"
curl -s "https://hypeproof-ai.xyz/api/views?slugs=${RESEARCH_SLUGS%,}"
curl -s "https://hypeproof-ai.xyz/api/views?slugs=${NOVEL_SLUGS%,}"
```

### Content Inventory

```bash
# Count content pieces
echo "Columns KO: $(ls web/src/content/columns/ko/*.md | wc -l)"
echo "Columns EN: $(ls web/src/content/columns/en/*.md | wc -l)"
echo "Research KO: $(ls web/src/content/research/ko/*.md | wc -l)"
echo "Novels KO: $(ls web/src/content/novels/ko/*.md | wc -l)"
echo "Daily Research: $(ls research/daily/*.md | wc -l)"
```

### Activity Pulse

```bash
# Commits in last 30 days
git log --oneline --since="30 days ago" | head -20
# Contributors
git log --format='%an' --since="30 days ago" | sort | uniq -c | sort -rn
```

---

## Challenge Questions Framework

When reviewing, always challenge with these lenses:

### 1. Reality Check
- "We said X would happen by [date]. Did it? Why not?"
- "This action item has been 'not started' for N weeks. Kill it or commit?"

### 2. Incentive Check (Section 1.3 principle)
- "Who benefits from completing this item? Is the incentive real?"
- "Are we asking members to do something with no payoff for them?"

### 3. Customer Check
- "Who consumes this output? If nobody, why are we doing it?"
- "Traffic data shows X — does our priority match what readers want?"

### 4. Dependency Check
- "This item depends on [person/org]. Have we confirmed they're ready?"
- "What happens if [dependency] falls through? Is there a Plan B?"

### 5. Meeting Input Coverage
- "Every member spoke in the last meeting. Is every proposal reflected or explicitly rejected?"
- "Is the education pipeline (Academy) present in the workflow? It's the main revenue source."
- "Are member names consistent across all docs? (No aliases, no phantom members)"

### 6. Education Pipeline Check
- "Does the workflow have Academy operations steps? (curriculum, instructor prep, event execution, post-event)"
- "Is the student journey mapped? (discovery → registration → event → community → retention)"
- "Are curriculum development cycles defined? (feedback → revision → next iteration)"

---

## Output Format

After review, append a review log entry to the roadmap:

```markdown
---

## Review Log

### YYYY-MM-DD Review

**Reviewer**: [who]

**Traffic snapshot**:
- Columns: X total views (Y편), avg Z/편
- Research: X total views
- Novels: X total views

**Progress**: N/M items done, K blocked

**Key changes**:
- [Changed item]: reason
- [Added item]: reason
- [Removed item]: reason

**Next review**: YYYY-MM-DD
```

---

## Rules

- **Never delete history** — mark items as "Cancelled" with reason, don't remove
- **Always pull live data** — don't rely on stale numbers in the doc
- **Challenge before accepting** — use AskUserQuestion to probe, don't just rubber-stamp
- **One review = one commit** — after updating, suggest a commit with changes summary
- **Keep the doc under 300 lines** — if it grows too long, archive old review logs to a separate file
