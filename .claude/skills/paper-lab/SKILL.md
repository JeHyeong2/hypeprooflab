---
name: paper-lab
description: >
  Research paper pipeline powered by HypeProof's core value lenses.
  AI discovers topics by matching 7 philosophical lenses to emerging AI phenomena,
  community reviews and writes, publishes to arXiv. Use for any /paper command work.
  Trigger: /paper, paper pipeline, research paper, arXiv submission, literature review,
  lens-driven research, academic writing.
allowed-tools: Read Grep Glob Bash Write Task WebSearch WebFetch
---

# paper-lab

> Lens-Driven Research Paper Pipeline for HypeProof AI Lab

## Core Concept

HypeProof interprets AI phenomena through its own philosophical lenses — derived
from the community's core values — rather than chasing hot topics.

```
Lens (7 lenses)  x  Emerging AI Phenomenon  =  Novel gap only HypeProof can fill
```

## The 7 Lenses

| ID | Frame | Key References |
|----|-------|----------------|
| `mirror-loop` | AI that reflects without judging — growth through self-awareness | Arendt, Rogers |
| `doing-is-learning` | Execution itself is the curriculum | Papert, Bandura |
| `initiative-gap` | Deciding WHAT to make is the last human edge | Arendt, Csikszentmihalyi |
| `margin-eraser` | Agent removes friction = removes margin | Christensen, Coase |
| `vanilla-wins` | Simple composition > complex frameworks under stress | Brooks, Gall |
| `re-bundle` | New media unbundles, then a new leader re-bundles | Thompson, McLuhan |
| `humanities-hypothesis` | AI alignment needs humanities, not just STEM | Heidegger, Arendt |

Full lens definitions with keywords: `references/lenses.yaml`

---

## Pipeline

```
paper.yaml + daily research + arXiv / Semantic Scholar
  |
  |  PHASE 0: DISCOVER    [paper-scout]
  |  lens x phenomenon matrix → 3 candidates → HITL: team picks one
  |
  |  PHASE 1: SURVEY      [paper-surveyor]
  |  30-50 papers → lit-review.json + taxonomy.md → HITL: confirm RQ
  |
  |  PHASE 2: DRAFT       [paper-drafter]
  |  section-by-section draft.md → member assignment
  |
  |  PHASE 3: REVIEW      [paper-critic] x3 parallel
  |  methodology / novelty / readability → score < threshold? → PHASE 2
  |  → HITL: final read
  |
  |  PHASE 4: PUBLISH     [paper-publisher]
  |  LaTeX + BibTeX + arXiv metadata → HITL: submit
  |
  → output/paper.pdf + arXiv submission + Discord announce
```

---

## Agents

| Agent | Model | Role | maxTurns |
|-------|-------|------|----------|
| `paper-scout` | sonnet | Lens x Phenomenon matching — finds novel intersections | 15 |
| `paper-surveyor` | sonnet | Literature collection + taxonomy + gap analysis | 25 |
| `paper-drafter` | opus | Section-by-section academic writing with citations | 30 |
| `paper-critic` | opus | Peer reviewer simulation (3 perspectives, parallel) | 15 |
| `paper-publisher` | sonnet | LaTeX formatting + arXiv metadata generation | 10 |

Each agent's `.md` file contains its full process, output schemas, and rules.

---

## Commands

```
/paper                                 # full pipeline
/paper discover                        # Phase 0: lens x phenomenon candidates
/paper discover --lens mirror-loop     # focus on specific lens
/paper discover --phenomenon "agent drift"  # focus on specific phenomenon
/paper survey                          # Phase 1: literature review
/paper draft                           # Phase 2: write draft
/paper draft --section methodology     # specific section only
/paper review                          # Phase 3: peer review simulation
/paper refine [max_loops]              # Phase 3->2 loop (default: 3)
/paper publish                         # Phase 4: arXiv prep
/paper status                          # current progress
/paper lenses                          # list all 7 lenses
```

---

## paper.yaml Schema

```yaml
name: paper-id                         # unique identifier
title: "Paper Title TBD"               # set after Phase 0
venue: arxiv                           # arxiv | workshop | conference
category: cs.AI                        # arXiv category
format: markdown                       # markdown | latex

affiliation: "HypeProof AI Lab"

authors:
  - name: Jay Lee
    role: lead                         # lead | contributor | reviewer
  - name: TBD
    role: contributor

active_lenses:                         # pick 1-2 for this paper
  - mirror-loop

research_question: null                # set after Phase 0 HITL

lit_review:
  sources: [arxiv, semantic_scholar]
  max_papers: 50
  date_range: "2024-2026"
  keywords: []                         # auto-populated from active lens

review:
  perspectives: [methodology, novelty, readability]
  threshold: 7                         # /10, below = revise
  max_loops: 3

hitl_gates:
  discover: always                     # topic selection = always human
  survey: always                       # RQ confirmation = always human
  draft: never                         # drafting = auto
  review: on_low_score                 # escalate if stuck
  publish: always                      # name on paper = always human

output_dir: output/
```

---

## Key Schemas

### opportunity-brief.json (Phase 0 output)

```json
{
  "generated": "2026-03-23",
  "candidates": [
    {
      "rank": 1,
      "lens": "mirror-loop",
      "phenomenon": "Agent Drift in production multi-agent systems",
      "proposed_title": "Mirror, Not Judge: ...",
      "research_question": "Can non-corrective reflection...?",
      "why_novel": "All existing approaches are corrective.",
      "hypeproof_advantage": "6 weeks of production agent data",
      "estimated_effort": "medium",
      "key_references": ["arxiv:2601.04170"],
      "target_venue": "NeurIPS Workshop"
    }
  ]
}
```

### lit-review.json (Phase 1 output)

```json
{
  "research_question": "...",
  "papers_reviewed": 42,
  "taxonomy": {
    "categories": [
      {
        "name": "Corrective Monitoring",
        "papers": ["ref-001", "ref-005"],
        "shared_assumption": "Drift is always negative",
        "limitation": "Reactive, not preventive"
      }
    ]
  },
  "gap": {
    "description": "No non-corrective reflective mechanisms explored",
    "our_contribution": "Mirror Loop framework"
  }
}
```

### review-summary.json (Phase 3 output)

```json
{
  "average_score": 6.3,
  "verdict": "revise",
  "critical_issues": ["..."],
  "revision_prompt": "Strengthen methodology section..."
}
```

Verdict rules:
- `average >= threshold` → "accept"
- `average >= threshold - 2` → "revise"
- `average < threshold - 2` → "reject" (HITL escalation)

---

## Output Structure

```
papers/<paper-id>/
  paper.yaml                          # config + lens selection
  output/
    opportunity-brief.json            # Phase 0
    lit-review.json                   # Phase 1
    taxonomy.md                       # Phase 1
    draft.md                          # Phase 2
    reviews/                          # Phase 3
      methodology.json
      novelty.json
      readability.json
    review-summary.json               # Phase 3
    paper.tex                         # Phase 4
    paper.pdf                         # Phase 4
    arxiv-metadata.json               # Phase 4
    discord-announce.md               # Phase 4
  references/                         # collected paper summaries
    ref-001.json ... ref-NNN.json
  pipeline-log.md
```

---

## HITL Gates

| Gate | Phase | Condition | Why |
|------|-------|-----------|-----|
| `DISCOVER` | 0 | always | What to write = human decision |
| `SURVEY` | 1 | always | Research Question = human confirmation |
| `REVIEW` | 3 | on_low_score | Stuck loop = human intervention |
| `PUBLISH` | 4 | always | Name on paper = human approval |

---

## Infrastructure Reuse

| Existing | Reused As |
|----------|-----------|
| `research-analyst` | paper-scout reads `research/daily/` as input |
| `qa-reviewer` pattern | paper-critic follows same read-only scoring pattern |
| `academy-casegen` loop | review-revise loop is same architecture |
| `publish-orchestrator` | paper-publisher reuses Discord announce pattern |
| `scripts/headless/run-command.sh` | headless: `run-command.sh paper discover` |

---

## Headless Execution

```bash
bash scripts/headless/run-command.sh paper discover
bash scripts/headless/run-command.sh paper discover --lens initiative-gap
bash scripts/headless/run-command.sh paper review
```

---

## Cost Estimate

| Phase | Agent | Worst Case | Realistic |
|-------|-------|-----------|-----------|
| Discover | scout (sonnet) | $2 | $1 |
| Survey | surveyor (sonnet) | $8 | $5 |
| Draft | drafter (opus) | $15 | $10 |
| Review | critic (opus) x3 x3 | $30 | $15 |
| Publish | publisher (sonnet) | $2 | $1 |
| **Total** | | **$57** | **$32** |

---

## Adding a New Paper

1. Create `papers/<paper-id>/paper.yaml` — pick lenses, set venue
2. Run `/paper discover` — AI finds lens x phenomenon match
3. Team picks topic at HITL gate
4. Run `/paper` — full pipeline

No new agents, commands, or skills needed per paper.

---

## Lens Evolution

Lenses grow with the community. To add: update `references/lenses.yaml`
and the summary table above.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Scout returns generic topics | Lens keywords too broad | Narrow `active_lenses` in paper.yaml |
| Surveyor finds <10 papers | Topic too niche | Expand `date_range` or broaden keywords |
| Critic score stuck at 5-6 | Methodology weak | Human intervention: clarify framework |
| LaTeX compile fails | Missing packages | `tlmgr install <package>` |
| arXiv endorsement needed | First submission | Use member with existing arXiv history |
