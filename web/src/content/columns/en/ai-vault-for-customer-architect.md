---
title: "AI Manages My Work Memory — A Knowledge Vault in Practice"
creator: "Jay"
date: 2026-02-27
category: "Use Case"
tags: ["AI Agent", "Knowledge Management", "Claude Code", "Vault", "Automation", "Enterprise"]
slug: "ai-vault-for-customer-architect"
readTime: "12 min read"
excerpt: "Drop a meeting transcript and AI extracts signals, updates competitor profiles, and builds tomorrow's morning briefing. The architecture and design principles behind a real AI Knowledge Vault system."
creatorImage: "/members/jay.png"
---

## Wednesday Evening — A 3-Hour Meeting Just Ended

Customer tech leads, partner company, internal engineering — information from three directions tangled together in my head. The partner's next-gen project is in serious crisis. An executive was emergency-dispatched from the customer side. A competitor's PoC got a "nothing impressive" verdict. A reference case from another customer could be used for the pitch —

Where do I write all this down?

The old me would copy-paste the meeting notes into Notion, send an "Important: issue detected" message on Slack, and then… two weeks later, search Slack for "what was the situation again?" The search returns nothing useful, and Notion already has 10+ pages where I can't remember what went where.

Now it's different. I drop the meeting transcript into one folder, and AI automatically extracts 14 signals, updates competitor profiles, and reflects everything in tomorrow's morning briefing. What I built is a **Knowledge Vault** — a work memory system managed by AI agents.

---

## Why Existing Tools Fall Short

I work as a Customer Architect at a B2B tech company. Simply put, I propose tailored technology solutions to enterprise customers. The unique challenge — four axes of information arrive simultaneously every day.

Customers, competitors, internal products (8+), stakeholders (20+). In a single meeting:

- Competitor intel ("Company A proposed a 6-week PoC with a discount")
- Customer pain points ("Their existing system communication completely dead")
- Internal product maturity gaps ("We're at prototype but customer expects production-grade")
- Action items ("K needs to schedule the follow-up meeting")
- Stakeholder dynamics ("VP B — won't proceed without hard numbers")

All from one conversation. Notion? Can't decide which database it goes in. Jira? This isn't tickets, it's intelligence. CRM? No CRM tracks stakeholder power dynamics.

What I needed was a **structured memory system**. One that doesn't require me to manually classify everything.

---

## Vault Architecture — Three Rooms

The Vault has three areas. Think of them as a **desk, a library, and a journal**.

### 🎯 The Desk — My Active Workspace

```
workspace/
├── agendas/          ← Product Status Cards
├── signals/          ← Monthly signal logs (append-only)
├── stakeholders/     ← Stakeholder map
└── reports/          ← AI-generated briefings
```

The desk holds **what I'm actively tracking**. Each product has a Status Card — current maturity, customer expectations, blocking issues, demo plans. AI updates these daily.

Signal logs accumulate in one file per month. Append-only — never overwritten. At a glance, I can see every signal from the customer this month.

### 🧠 The Library — Accumulated Knowledge

```
knowledge/
├── products/         ← Product knowledge
├── customers/        ← Customer profiles
├── competitors/      ← Competitor analysis
└── ontology-index.yaml  ← Auto-generated search index
```

The library stores knowledge that stays valid over time. A competitor's profile accumulates entries like "CEO replaced," "key staff departed," "flagship project in crisis" — each with dates. Six months later, when analyzing strategy, this one file is enough.

`ontology-index.yaml` is the library catalog. An AI-generated search index — ask "which team owns this technology?" and it finds the relevant files and answers.

### 📝 The Journal — Daily Records

Every evening, AI automatically writes a retrospective. What signals came in, which actions are overdue, what system issues occurred. Not a human diary — an AI work log.

---

## The Magic Moment — Signals Extracted from One Transcript

Back to Wednesday evening. I dropped the meeting transcript into a folder and ran the ingestion command.

**Phase 1 — Four agents read simultaneously:**

- **Signal Extractor** → Extract 10 types of signals → 14 found
- **Maturity Assessor** → Per-product maturity evaluation → prototype vs customer expectation gap detected
- **Action Extractor** → Action items + priority + owner extracted
- **Stakeholder Mapper** → Stakeholder dynamic changes detected

Four agents read the same document simultaneously, each through a different lens. The key: all agents are **read-only**. They read and analyze only. Writing is handled by a separate skill. This separation is intentional — analysis agents can never accidentally destroy data.

**Phase 2 — Cross-reference with existing knowledge:**

The **Vault Differ** is the key agent here. When new information arrives, it reads the existing knowledge base and compares:

- `new` → Never seen before. Add new entry
- `update` → Exists but status changed. Update
- `known` → Already known. Skip

When "system communication failure" comes in — "resource shortage was already known, but full system outage is new" → classified as `update`. This classification is what lets knowledge evolve without duplication.

**Phase 3 — Write to the Vault:**

After classification, the skill writes results to the appropriate files, then auto-commits to git. **Every change has a traceable history.**

---

## 7 Minutes Every Morning

Next day, 9 AM. The cron job fires. An AI-generated morning briefing arrives via messenger:

> **Immediate Attention (P0/P1)**
> - Prepare for 2nd meeting with customer executive — architecture collaboration
> - HQ visit + tech workshop — start preparation
>
> **Key Signals**
> - Partner crisis: hardware defects, communication failure, battery issues cascading
> - Organizational gap: key staff departed, communication channels unclear
> - Opportunity detected: no owning department → area we can claim

Seven minutes. Everything from yesterday's 3-hour meeting, distilled into what I need to focus on. What used to take 30 minutes across three tools is now 7 minutes in one briefing.

---

## 10 Signal Types — Catching Weak Signals

The core of this system is the **signal taxonomy**. 90% of what's said in meetings is noise. 10% is meaningful signal. AI classifies into 10 types:

| Signal | Meaning |
|--------|---------|
| `feature_request` | What customer wants |
| `pain_point` | Where customer hurts |
| `timeline_pressure` | Time pressure |
| `competitor_mention` | Competitor reference |
| `architecture_gap` | Technical gap |
| `satisfaction` | Positive signal |
| `escalation` | Escalation event |
| `strategic_hint` | Strategic implication |
| `budget_signal` | Budget indicator |
| `maturity_expectation` | Maturity expectation |

From one meeting: 4 `pain_point`, 2 `strategic_hint`, 1 `escalation`. That distribution alone tells a story: "they're in serious trouble, and that's our opportunity."

Aggregate a month of signals and the trends become powerful. "Early month was all `feature_request`, then mid-month `pain_point` and `escalation` spiked" — pattern recognition that's impossible to do manually.

**This is the real value. Not individual facts, but patterns.**

---

## Maturity Framework — D0 through D5

Product maturity tracked in 6 levels:

| Level | Name | One-liner |
|-------|------|-----------|
| D0 | Concept | Slides only |
| D1 | Recorded Demo | Recorded demo |
| D2 | Interactive Prototype | Live demo possible |
| D3 | Integration-Ready | Customer environment integration designed |
| D4 | Pilot-Ready | Pilot in customer environment |
| D5 | Production-Ready | Production/operations ready |

When our product is internally D3 but the customer expects D4 — that gap is explicitly written in the Status Card, and the morning briefing reminds me every day. Can't forget it.

The framework itself is simple. What matters is that **AI checks the gap automatically every day.** When someone says "it needs to be immediately applicable," AI catches it as a `maturity_expectation` signal and updates the gap analysis.

---

## Self-Improvement — AI Evaluates AI

Once a week, a quiet pipeline runs Sunday at dawn:

- **02:00** — Critic agent evaluates the entire system across 7 dimensions with scores
- **03:00** — Auto-fixes Critical/High findings
- **03:30** — Asks questions like "What's Competitor A's current situation?" and tests whether AI finds accurate answers

The last one is the most interesting. Fact accuracy, source citations, and relevance are scored. If scores drop, the search index is rebuilt. **AI testing its own memory.**

---

## Honest Failures

This system is still fragile.

**Crons die.** The morning briefing cron has been failing for two days. When AI session creation fails, the briefing simply doesn't arrive.

**Signal extraction isn't 100%.** Mixed Korean-English conversations cause context loss. Colloquial expressions, double negatives, cultural nuance — still needs a human pass.

**The vault grows forever.** No archiving policy yet. Three months in, there'll be hundreds of files.

**Single-player only.** This system is strictly for one person. Team use would require conflict resolution, permissions, concurrent editing — problems Notion already solved.

Not perfect. But I don't want to go back to life without it.

---

## So Why Use This?

With Notion, Confluence, and CRMs available — why markdown files and AI agents?

**Auto-classification.** Drop the transcript, done. AI extracts signals, maps to product cards, updates competitor profiles.

**Living context.** An issue was "resource shortage" when first reported. A month later, "full system outage." Vault Differ classifies this as `update`, and history accumulates naturally. One file shows the full timeline.

**7-minute mornings.** One briefing captures all changes. 30 minutes → 7.

**Git-managed.** Every change is a commit. "How did our assessment of this person change over two weeks?" — answerable via `git log`. Impossible in Notion.

---

## Full Architecture — One-Page Summary

```
[Daily Automation]
  09:00  Morning briefing → messenger
  09:15  Search index rebuild
  18:00  Daily retrospective
  23:00  Vault git backup

[Manual Triggers]
  /ingest   Transcript → 4 agent analysis → vault write
  /ask      Natural language question → index search → answer

[Weekly Self-Improvement]
  Sun 02:00  System self-critique (7 dimensions)
  Sun 03:00  Critical auto-fix
  Sun 03:30  Q&A quality benchmark
```

---

## What Would Your Vault Look Like?

This system is tailored for a specific role. But **any role that needs structured memory** can adapt the pattern:

- **Sales**: Customer signal tracking + deal pipeline maturity
- **PM**: Feedback classification + sprint risk detection
- **Research**: Trend signal extraction from papers/news + weekly briefing
- **Consulting**: Per-project stakeholder maps + issue tracking
- **Developer**: Code review signals + tech debt tracking + architecture decision records

The key isn't the tool — it's the **structure**. Three things to decide:

1. **What signals to track?** — 10 types? 5? What are the "weak signals" in your work?
2. **What axes to classify knowledge on?** — Customer/product/competitor? Project/team/technology?
3. **What cadence to review?** — Daily? Weekly? Automated? Manual?

Answer those three, and it works whether you implement it in markdown, Notion, or Obsidian.

But once you taste AI agents auto-classifying and generating morning briefings… going back to manual is hard.

---

*This system is built on Claude Code + OpenClaw. Want to know more about the architecture and design principles? Let's talk on HypeProof Discord.*
