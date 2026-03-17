---
title: "Programming the Program — What Karpathy's autoresearch Changes"
creator: "Jay"
creatorImage: "/members/jay.png"
date: 2026-03-17
category: "AI Engineering"
tags: ["autoresearch", "karpathy", "harness engineering", "meta-programming", "agent"]
slug: "2026-03-17-programming-the-program"
readTime: "7 min"
excerpt: "The era of writing code is ending. The era of writing instructions for the AI that writes code has begun. What autoresearch reveals isn't the automation of research — it's the redefinition of what a researcher does."
lang: "en"
authorType: "human"
---

*The era of writing code is ending. The era of writing instructions for the AI that writes code has begun.*

---

## 100 Experiments Overnight

In early March, Andrej Karpathy released [autoresearch](https://github.com/karpathy/autoresearch). The concept is simple. Give an AI agent a small LLM training setup, let it experiment autonomously overnight. It modifies the code, trains for 5 minutes, keeps improvements, discards regressions. Repeat. Twelve experiments per hour, roughly a hundred overnight.

Karpathy's own [tweet](https://x.com/karpathy/status/2029701092347630069) nails the key insight:

> "110 changes made over the last ~12 hours, bringing the validation loss from 0.862415 down to 0.858039. (...) Over the last ~2 weeks I almost feel like I've iterated more on the **meta-setup** where I optimize and tune the agent flows even more than the nanochat repo directly."

Stop here. This sentence is the whole story.

## "Programming the Program"

The autoresearch README says it plainly:

> "You're not touching any of the Python files like you normally would as a researcher. Instead, you are programming the program.md."

The researcher doesn't write code. The researcher writes the **instructions** for the AI that writes code. Karpathy calls this instruction file `program.md` and describes it as a "super lightweight skill."

The structure is strikingly minimal:

- `prepare.py` — fixed infrastructure, don't touch
- `train.py` — the only file the AI modifies
- `program.md` — the only file the human modifies

**Three files.** Humans touch program.md. AI touches train.py. The boundary is crisp. This clarity is what makes autonomy possible.

## Constraints Enable Autonomy

autoresearch works not because it gives the agent freedom, but because it gives it **constraints**.

- **Time constraint**: Every experiment runs for exactly 5 minutes. Regardless of GPU, model size, or architecture.
- **Metric constraint**: One number — `val_bpb`. Lower is better. That's it.
- **Scope constraint**: Only `train.py` is editable. The evaluation function, data loader, and tokenizer are untouchable.
- **Judgment constraint**: Three states — keep, discard, crash.

Within these constraints, the AI changes architectures, swaps optimizers, tunes hyperparameters. In infinite freedom, nothing gets tried. In a narrow yard, 100 experiments run.

This isn't just about AI research.

## The Era of Meta-Setup

Look again at Karpathy saying he spends "more time on the meta-setup." This isn't a casual observation — it signals a **role transition**.

Traditionally, a researcher:
1. Forms hypotheses
2. Designs experiments
3. Writes code
4. Analyzes results
5. Writes papers

After autoresearch, a researcher:
1. **Designs the experiment system**
2. **Defines the evaluation criteria**
3. **Optimizes the instructions (program.md)**

Steps 2–5 didn't disappear. The AI handles them. The human's role moved from "execution" to "system design."

What Ryan called ["harness engineering"](https://hypeproof-ai.xyz/columns/2026-03-05-harness-engineering-arrives) in a previous column finds its purest form here. **Build the harness well, and time becomes your ally.** Karpathy sleeps while the AI runs 110 experiments.

## I See This Every Day

Let me be honest. I run an agent system called Mother on top of OpenClaw. It collects research daily, edits creator columns, runs cron jobs, and monitors system health.

And I recently realized: **I spend more time refining SKILL.md and HEARTBEAT.md — Mother's equivalent of program.md — than touching the actual code.**

The problem is, there's something autoresearch has that my system doesn't. **Metrics and an experiment loop.**

Karpathy's system measures `val_bpb` after every experiment, keeps improvements, discards regressions. My system? QA gates exist but don't run. Quality criteria exist but aren't tracked. Whether things improved or regressed goes unmeasured from one day to the next.

**What you don't measure, you can't improve.** Obvious, but easy to forget when you're excited about automation.

## What autoresearch Changes

This repo matters not because it lowered val_bpb by 0.004.

**It matters because the definition of research is shifting.**

From Karpathy's README, half-joke, half-prophecy:

> "Research is now entirely the domain of autonomous swarms of AI agents running across compute cluster megastructures in the skies. The agents claim that we are now in the 10,205th generation of the code base, in any case no one could tell if that's right or wrong as the 'code' is now a self-modifying binary that has grown beyond human comprehension."

This isn't science fiction. It's a direction. autoresearch is stage zero — the simplest possible form.

And for stage zero, it's pretty terrifying. All you need for 100 overnight experiments is one GPU, three files, and sleep.

---

## 🔗 Sources

| # | Source | URL |
|---|--------|-----|
| 1 | autoresearch GitHub | [github.com/karpathy/autoresearch](https://github.com/karpathy/autoresearch) |
| 2 | Karpathy tweet — nanochat + autoresearch | [x.com/karpathy](https://x.com/karpathy/status/2029701092347630069) |
| 3 | Building Effective Agents (Ralph Loop) | [anthropic.com](https://www.anthropic.com/research/building-effective-agents) |
| 4 | Ryan Kim — Harness Engineering Arrives | [hypeproof-ai.xyz](https://hypeproof-ai.xyz/columns/2026-03-05-harness-engineering-arrives) |
