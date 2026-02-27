---
title: "AI Manages My Work Memory — A Customer Architect's Knowledge Vault in Practice"
creator: "Jay"
date: 2026-02-27
category: "Use Case"
tags: ["AI Agent", "Knowledge Management", "Claude Code", "Vault", "Automation", "Enterprise"]
slug: "ai-vault-for-customer-architect"
readTime: "12 min read"
excerpt: "Drop a meeting transcript and AI extracts signals, updates competitor profiles, and builds tomorrow's morning briefing. The architecture and story behind a real Knowledge Vault system running at a vehicle software platform company."
creatorImage: "/members/jay.png"
---

## Wednesday Evening — A 3-Hour Meeting Just Ended

Hyundai SDV team, 42dot, internal engineering — information from three directions tangled together in my head. 42dot's XP2 production is in serious crisis. An AVP was dispatched at the group level to intervene. Applied Intuition's PoC got a "nothing impressive" verdict. The Ford reference case could be used for the HKMC pitch —

Where do I write all this down?

The old me would copy-paste the meeting notes into Notion, send a "Important: XP2 issue" message on Slack, and then… two weeks later, search Slack for "what was the 42dot situation again?" The search returns nothing useful, and Notion already has 10+ pages where I can't remember what went where.

Now it's different. I drop the meeting transcript into one folder, and AI automatically extracts 14 signals, updates competitor profiles, and reflects everything in tomorrow's morning briefing. What I built is a **Knowledge Vault** — a work memory system managed by AI agents.

---

## Why Existing Tools Fall Short

The Customer Architect role is a bit unusual. Customer (Hyundai), competitors (42dot, Applied Intuition), internal products (CCU 2.0, AI Director, and 6 more), stakeholders (20+) — information from these four axes arrives mixed together every day. In a single meeting:

- Competitor intel ("Applied Intuition proposed a 6-week PoC with a discount")
- Customer pain points ("42dot's DDS communication completely dead")
- Internal product maturity gaps ("We're at D3 but customer expects D4")
- Action items ("Chris needs to schedule the follow-up meeting")
- Stakeholder dynamics ("VP Lee — won't proceed without hard numbers")

All from one conversation. Notion? Can't decide which database it goes in. Jira? This isn't tickets, it's intelligence. CRM? No CRM tracks stakeholder power dynamics.

What I needed was a **structured memory system**. One that doesn't require me to manually classify everything.

---

## Vault Architecture — Three Rooms

The Vault has three areas. Think of them as a **desk, a library, and a journal**.

### 🎯 The Desk (jay/) — My Active Workspace

```
jay/
├── agendas/          ← Product Status Cards (8 products + 11 Use Cases)
├── signals/          ← Monthly signal logs (append-only)
├── stakeholders/     ← Stakeholder map
└── reports/          ← AI-generated briefings
```

The desk holds **what I'm actively tracking**. Each product has a Status Card — CCU 2.0's current maturity is D3, customer expects D4, blocking issues are X, demo plan is Y. AI updates these daily.

Signal logs accumulate in one file per month. Append-only — never overwritten. At a glance, I can see every signal from 42dot in February.

### 🧠 The Library (ca-knowledge/) — Accumulated Knowledge

```
ca-knowledge/
├── products/         ← Product knowledge (CCU2, AI Director, etc.)
├── customers/        ← Customer profiles (HKMC)
├── competitors/      ← Competitors (42dot, Applied Intuition)
└── ontology-index.yaml  ← Auto-generated search index
```

The library stores knowledge that stays valid over time. 42dot's profile accumulates entries like "CEO fired," "PM staff departed," "XP2 production crisis" — each with dates. Six months later, when I need to analyze 42dot's trajectory, this one file is enough.

### 📝 The Journal (daily-retrospective/) — Daily Records

Every evening, AI automatically writes a retrospective. What signals came in, which actions are overdue, what system issues occurred. Not a human diary — an AI work log.

---

## The Magic Moment — 14 Signals from One Transcript

Back to Wednesday evening. I dropped the meeting transcript into `data/meeting-notes/` and ran `/ca-ingest`.

**Phase 1 — Four agents read simultaneously:**

| Agent | What it does | Result |
|-------|-------------|--------|
| Signal Extractor | Extract 10 types of signals | 14 signals found |
| Maturity Assessor | D0-D5 maturity evaluation per product | CCU 2.0: D3 (customer expects D4) |
| Action Extractor | Action items + priority + owner | 2× P1, 4× P2, 1× P3 |
| Stakeholder Mapper | Detect stakeholder dynamic changes | AVP role update |

Four agents read the same document simultaneously, each through a different lens. All **read-only** — they analyze but write nothing.

**Phase 2 — Cross-reference with existing knowledge:**

The Vault Differ is the key agent. When "42dot DDS issue" comes in, it reads the existing `competitors/42dot.md` and compares. "DDS resource problems already known, but vehicle-won't-start is new information" → classified as `update`.

**Phase 3 — The skill writes to the Vault:**

After classification, `/ca-ingest` writes results to the appropriate files, then auto-commits to git. Every change has a traceable history.

---

## 7 Minutes Every Morning

Next day, 9 AM. The cron job fires.

An AI-generated morning briefing arrives via Discord DM:

> **Immediate Attention (P0/P1)**
> - Prepare for 2nd meeting with AVP Joo — VCRM/SDV architecture
> - April Korea visit + CCU team workshop — start preparation
>
> **Key Signals (2/25-2/26)**
> - XP2 crisis: hand-assembly, DDS failure, Chinese battery SOC problems
> - 42dot talent gap: PM/procurement departed, communication channels unclear
> - VCRM opportunity: no owning department → greenfield

Seven minutes. Everything from yesterday's 3-hour meeting, distilled into what I need to focus on. Without this, I'd spend 30 minutes across Slack, email, and Notion.

---

## 10 Signal Types — Catching Weak Signals

The core of this system is the **signal taxonomy**. 90% of what's said in meetings is noise. 10% is meaningful signal. AI classifies into 10 types:

| Signal | Meaning | Example |
|--------|---------|---------|
| `feature_request` | What customer wants | "Integrated UDS diagnostics co-development" |
| `pain_point` | Where customer hurts | "XP2 DDS communication completely dead" |
| `timeline_pressure` | Time pressure | "Jeff visiting Korea early April" |
| `competitor_mention` | Competitor reference | "Applied Intuition 6-week PoC, price discount" |
| `architecture_gap` | Technical gap | "No VCRM direction whatsoever" |
| `satisfaction` | Positive signal | "Ford Data Collector contract signed" |
| `escalation` | Escalation event | "AVP dispatched at group level" |
| `strategic_hint` | Strategic implication | "XP2 is R&D, not mass production" |
| `budget_signal` | Budget indicator | "No numbers, no progress" |
| `maturity_expectation` | Maturity expectation | "Immediately applicable solutions required" |

From one meeting: 4 `pain_point`, 2 `strategic_hint`, 1 `escalation`. That distribution alone tells a story: "42dot is in serious trouble, and that's our opportunity."

Aggregate a month of signals and the trends become powerful. Pattern recognition that's impossible to do manually.

---

## Self-Improvement — AI Evaluates AI

Every Sunday at 2 AM, a quiet pipeline runs:

```
Sun 02:00  /review       → 7-dimension self-critique (scored)
Sun 03:00  /remediate    → Auto-fix critical findings
Sun 03:30  /ca-qa-harness → Q&A quality benchmark
```

The critic agent evaluates the entire system. "Data quality B-, Agent accuracy C+, Knowledge management B." If Critical or High issues are found, `/remediate` fixes them automatically.

The QA harness is even more interesting — it asks questions like "What's 42dot's current situation?" and tests whether AI can find accurate answers from the vault. Fact accuracy, source citations, and relevance are scored. If scores drop, the ontology index is rebuilt.

AI testing its own memory.

---

## Honest Failures

This system is still fragile.

**Crons die.** The morning briefing cron has been failing for two days. When Claude Code headless session creation fails, no briefing arrives.

**Signal extraction isn't 100%.** Mixed Korean-English transcripts cause context loss. AI doesn't always catch that "별로였다" is a negative evaluation.

**The vault grows forever.** No archiving policy yet. Three months in, there'll be hundreds of files.

**Single-player only.** This system is strictly for one person. Team use would require conflict resolution, permissions, concurrent editing — problems Notion already solved.

---

## So Why Use This?

With Notion, Confluence, and CRMs available — why markdown files and AI agents?

**Auto-classification.** Drop the transcript, done. No deciding which database it belongs in.

**Living context.** 42dot's DDS problem was "resource issue" at first. A month later, "vehicle won't start." Vault Differ classifies this as `update`, and history accumulates naturally.

**7-minute mornings.** One briefing captures all changes. Without it, 30 minutes across three tools.

**Git-managed.** Every change is a commit. "How did our assessment of VP Lee change over two weeks?" — answerable via `git log`. Impossible in Notion.

---

## What Would Your Vault Look Like?

This system is tailored for the Customer Architect role. But **any role that needs structured memory** can adapt the pattern:

- **Sales**: Customer signal tracking + deal pipeline maturity
- **PM**: Feedback classification + sprint risk detection
- **Research**: Trend signal extraction from papers/news + weekly briefing
- **Consulting**: Per-project stakeholder maps + issue tracking

The key isn't the tool — it's the **structure**. What signals do you track? What axes do you classify knowledge on? What cadence do you review? Answer those three, and it works whether you implement it in markdown, Notion, or Obsidian.

But once you taste AI agents auto-classifying and generating morning briefings… going back to manual is hard.

---

*The full code is private, but the architecture and design principles are shared. Questions? Let's talk on HypeProof Discord.*
