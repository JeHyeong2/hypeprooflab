---
name: academy-casegen
description: >
  Self-evolving case generation pipeline for AI Architect Academy.
  Generates deployment-specific business plans (hospital, corporate CSR, school, etc.)
  with self-critique loops, automated testing, partner perspective review,
  and human-in-the-loop gates. Use for /academy-casegen commands.
allowed-tools: Read Grep Glob Bash Write Task
---

# academy-casegen

> Self-Evolving HITL Case Generation Pipeline for AI Architect Academy
> Version: 1.0 | Created: 2026-02-26

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 0: SEED                                │
│  Generate case registry → Self-critique → 🧑 HITL Gate         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ approved cases
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: GENERATE (per case)                 │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │ Planner  │───▶│ Tester   │───▶│ Critic   │                  │
│  │ (sonnet) │    │ (haiku)  │    │ (sonnet) │                  │
│  └──────────┘    └──────────┘    └────┬─────┘                  │
│       ▲                               │                         │
│       │          score < threshold     │                         │
│       └───────────────────────────────┘                         │
│                  (max N loops)                                   │
│                                                                 │
│  After loop:                                                    │
│  ┌──────────────────┐                                           │
│  │ Partner Reviewer  │ ← 동아일보 임원 시뮬레이션               │
│  │ (sonnet)          │                                           │
│  └────────┬─────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  score < threshold OR verdict=reject?                           │
│     YES → 🧑 HITL Escalation                                   │
│     NO  → ✅ Next case                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ all cases done
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 2: INTEGRATE                           │
│  Cross-case tests → Portfolio packaging → 🧑 HITL Final        │
└─────────────────────────────────────────────────────────────────┘
```

## Agents

| Agent | Model | Role |
|-------|-------|------|
| `academy-case-planner` | sonnet | Generates 5 documents per case |
| `academy-case-critic` | sonnet | Scores and critiques each case |
| `academy-case-tester` | haiku | Automated pass/fail validation |
| `academy-partner-reviewer` | sonnet | 동아일보 perspective adversarial review |

## HITL Gates

| Gate | When | Mode |
|------|------|------|
| `SEED` | After case registry generated | always |
| `CASE-{id}` | After max loops with low score, or partner rejection | on_low_score |
| `FINAL` | After portfolio packaging | always |

## Commands

### Interactive (within Claude Code session)

```
/academy-casegen                    # full pipeline
/academy-casegen seed               # phase 0 only
/academy-casegen generate           # phase 1 only
/academy-casegen integrate          # phase 2 only
/academy-casegen generate --cases pediatric-ward,corporate-csr
```

### Headless (shell script)

```bash
bash scripts/headless/academy-casegen.sh                          # full pipeline (interactive HITL)
bash scripts/headless/academy-casegen.sh --phase seed             # seed only
bash scripts/headless/academy-casegen.sh --no-hitl                # skip all HITL gates
bash scripts/headless/academy-casegen.sh --max-loops 3            # fewer iterations
bash scripts/headless/academy-casegen.sh --cases "pediatric-ward" # specific case
```

## Config

Pipeline config: `products/ai-architect-academy/cases/casegen.yaml`

Key parameters:
- `loop.max_iterations`: max self-critique loops per case (default: 5)
- `loop.critic_threshold`: score to auto-proceed (default: 7/10)
- `hitl.gate_*`: when to ask human (always / on_low_score / never)

## Output Structure

```
products/ai-architect-academy/cases/
├── casegen.yaml            # pipeline config
├── registry.yaml           # approved case list (Phase 0 output)
├── PORTFOLIO.md            # full portfolio summary (Phase 2)
├── PORTFOLIO-SUMMARY.md    # 1-pager for 동아일보 (Phase 2)
├── cross-case-report.json  # cross-case test results
├── pipeline-log-YYYY-MM-DD.md
├── donga-standard/
│   ├── plan.md
│   ├── timeline.md
│   ├── budget.md
│   ├── logistics.md
│   ├── partner-brief.md
│   ├── test-report.json
│   ├── critic-log.json
│   └── partner-review.json
├── pediatric-ward/
│   └── ...
├── corporate-csr/
│   └── ...
└── ...
```

## Self-Evolution Mechanism

The loop is self-improving:

1. **Planner** generates → **Tester** finds structural failures → **Planner** fixes
2. **Critic** scores on 6 axes → low axis feeds **revision_prompt** → **Planner** targets weak areas
3. **Partner Reviewer** catches blind spots the internal critic misses (brand risk, revenue skepticism)
4. Each iteration's **critic-log.json** is read by the next iteration's Planner
5. If score stagnates after N loops → **HITL** brings human judgment

The critic escalates severity when the same issue persists across iterations,
forcing the planner to address root causes rather than surface fixes.

## Cost Estimate

Per case (worst case, all 5 loops):
- Planner: 5 × $2.00 = $10.00
- Tester: 5 × $0.50 = $2.50
- Critic: 5 × $1.00 = $5.00
- Partner Reviewer: 1 × $1.50 = $1.50
- **Total per case: ~$19.00 max**

For 6 cases full pipeline: ~$120 max (realistic: ~$60-80 with early convergence)
