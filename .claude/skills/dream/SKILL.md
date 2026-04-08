---
name: dream
description: Memory consolidation, verification, and pruning for the auto-memory system. Inspired by Claude Code's autoDream. Use when starting a session to clean up stale memories, after major project changes, periodically for memory hygiene, or when the user says "dream", "consolidate memory", "clean up memory", or "/dream".
---

# Dream — Memory Consolidation

5-phase memory maintenance cycle: orient, verify, gather, consolidate, prune.

## Memory System Context

- **Index**: `MEMORY.md` — always-loaded pointer file, 200-line hard cap, ~150 chars per entry
- **Topic files**: `*.md` with YAML frontmatter (`[[workspace/stakeholders/stakeholder-map.md|name]]`, `description`, `type`) — types: `user`, `feedback`, `project`, `reference`
- **Location**: The project-specific memory directory (found via `~/.claude/projects/*/memory/`)

## Phase 1 — Orient

1. Read `MEMORY.md` to get the full index
2. Glob `memory/*.md` (excluding MEMORY.md) to find all topic files
3. Read each topic file — note its type, description, and key claims
4. Build a mental inventory: total files, types distribution, any orphans (files not in index), any dead pointers (index entries without files)

Output a brief status table:

```
| Metric           | Count |
|------------------|-------|
| Index entries    | N     |
| Topic files      | N     |
| Orphaned files   | N     |
| Dead pointers    | N     |
```

## Phase 2 — Verify

For each topic file, extract **verifiable claims** and check them:

| Claim Type | Verification Method |
|------------|-------------------|
| File path mentioned | `Glob` — does the file exist? |
| Function/class [[workspace/stakeholders/stakeholder-map.md|name]] | `Grep` — is it still in the codebase? |
| Config key/value | `Read` the config file, confirm |
| Project state (role, structure) | Cross-check with current CLAUDE.md or source |
| Tool/CLI existence | `Bash which <tool>` or `Glob` |

For each memory, assign a status:

- **valid** — all claims verified
- **stale** — some references broken or outdated
- **obsolete** — core claim is no longer true
- **unverifiable** — no concrete claims to check (opinions, preferences) — skip

Collect findings in a verification table:

```
| File | Type | Status | Issue |
|------|------|--------|-------|
| feedback_foo.md | feedback | stale | references deleted function bar() |
```

## Phase 3 — Gather

Scan these sources for new memory-worthy signals NOT already captured:

1. **Recent daily retros**: `daily-retrospective/` — last 7 days
2. **Recent reports**: `workspace/reports/` — last 7 days
3. **Recent cron logs**: `workspace/reports/cron-*.log` — last 3 days (errors, patterns)
4. **CLAUDE.md changes**: `git diff HEAD~10 -- .claude/CLAUDE.md` — recent structural changes

**What qualifies as memory-worthy:**
- User corrections or preferences (→ `feedback` type)
- Role/responsibility changes (→ `user` type)
- Project decisions, deadlines, org changes (→ `project` type)
- New external resource locations (→ `reference` type)

**What does NOT qualify** (per memory system rules):
- Code patterns derivable from reading current code
- Git history facts (`git log` is authoritative)
- Debugging solutions (the fix is in the code)
- Anything already in CLAUDE.md
- Ephemeral task details

List candidate signals with proposed type and one-line summary.

## Phase 4 — Consolidate

Apply changes based on Phase 2 + Phase 3 findings:

### Fix stale memories
- **stale**: Update the memory content to reflect current state. Preserve the original insight, fix broken references.
- **obsolete**: Delete the topic file entirely.

### Create new memories
For each Phase 3 candidate signal:
1. Check if an existing memory covers it (update instead of create)
2. Write new topic file with proper frontmatter:

```markdown
---
name: {{kebab-case-name}}
description: {{one-line, specific enough to judge relevance in future sessions}}
type: {{user|feedback|project|reference}}
---

{{Content. For feedback/project types, include **Why:** and **How to apply:** lines.}}
```

### Merge duplicates
If two memories cover the same topic, merge into one file, delete the other.

### Normalize dates
Convert any relative dates ("last week", "yesterday") to absolute `YYYY-MM-DD`.

## Phase 5 — Prune & Index

1. Delete any topic files marked obsolete in Phase 4
2. Rebuild `MEMORY.md`:
   - One line per topic file: `- [Title](filename.md) — hook under 150 chars`
   - Remove dead pointers (files that no longer exist)
   - Add entries for newly created files
   - Order by relevance (frequently useful > rarely referenced)
   - Hard cap: 200 lines
3. Final `ls memory/` to confirm no orphans remain

## Output Report

After all phases, output a structured summary:

```
## Dream Report — {date}

### Verified: N memories checked
- Valid: N
- Stale (fixed): N
- Obsolete (deleted): N
- Unverifiable (skipped): N

### New memories created: N
- {filename} — {one-line description}

### Memories updated: N
- {filename} — {what changed}

### Memories deleted: N
- {filename} — {reason}

### Merges: N
- {file_a} + {file_b} → {merged_file}

### Index: MEMORY.md
- Total entries: N (cap: 200)
- Added: N | Removed: N
```

## Guardrails

- **Read-only on source code** — never modify project source, configs, or tests
- **Memory files only** — only write to the `memory/` directory and `MEMORY.md`
- **Preserve user intent** — when updating a memory, keep the original insight intact; only fix broken references
- **No guessing** — if a claim can't be verified (tool not available, external resource), mark as `unverifiable`, don't delete
- **One run at a time** — if another dream session appears active, abort
