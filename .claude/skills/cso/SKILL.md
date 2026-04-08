---
name: cso
description: OWASP Top 10 + STRIDE security audit — zero-noise, actionable findings only. Use when auditing code for security vulnerabilities.
user_invocable: true
triggers:
  - "security audit"
  - "owasp"
  - "threat model"
---

## Purpose
Combined OWASP Top 10 + STRIDE threat model audit. Severity-rated, actionable findings with 17 false-positive exclusion patterns.

## Usage
```
/cso              → scan project root
/cso src/         → scan specific directory
/cso --stride-only / --owasp-only
```

## Workflow

### Phase 1: Scope & Inventory
Inventory codebase: file types, entry points, data flows, auth boundaries, external integrations, config files.

### Phase 2: OWASP Top 10
Check each category per [references/owasp-stride-tables.md](references/owasp-stride-tables.md#owasp-top-10).

### Phase 3: STRIDE Threat Model
Per component/data flow, evaluate per [references/owasp-stride-tables.md](references/owasp-stride-tables.md#stride).

### Phase 4: False-Positive Filtering
Apply 17 exclusion patterns from [references/owasp-stride-tables.md](references/owasp-stride-tables.md#false-positive-exclusions).

### Phase 5: Report
Write to `workspace/reports/{date}-cso-audit.md`:
- Summary table (CRITICAL/HIGH/MEDIUM/LOW/INFO counts)
- Per-finding: severity, file:line, description, impact, fix recommendation
- STRIDE per-component table
- Excluded count

### Phase 6: Output
Standard JSON block. P0 for CRITICAL, P1 for HIGH, P2 for MEDIUM.

## Severity
| Level | Criteria |
|-------|----------|
| CRITICAL | Exploitable now, data loss/RCE, no auth required |
| HIGH | Moderate effort, significant impact |
| MEDIUM | Specific conditions, limited impact |
| LOW | Theoretical, defense-in-depth |

## Dependencies
- Tools: Read, Glob, Grep
