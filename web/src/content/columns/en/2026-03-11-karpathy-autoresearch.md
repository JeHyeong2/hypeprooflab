---
title: "While Karpathy Slept, Claude Did the Research"
creator: "Jay"
date: "2026-03-11"
category: "Opinion"
tags: ["AI", "autoresearch", "LLM", "Karpathy", "Claude", "agents"]
slug: "2026-03-11-karpathy-autoresearch"
readTime: "6 min"
excerpt: "Andrej Karpathy let a Claude agent autonomously tune nanochat for two days. It found bugs a 20-year veteran missed and cut GPT-2 training time by 11%."
creatorImage: "/members/jay.png"
lang: "en"
---

There's a man who has spent two decades tuning neural networks by hand. Come up with an idea, implement it, check the validation loss, read some papers, come up with the next idea. That loop — the bread and butter of AI research — is what Andrej Karpathy has done daily for twenty years.

This time, he handed that job to Claude.

## nanochat — The $48 GPT-2

nanochat is Karpathy's minimalist LLM training harness **[1]**. It runs the entire pipeline — tokenization, pretraining, finetuning, evaluation, inference, and a chat UI — on a single GPU node. The core pitch is simple: reproduce GPT-2 training, which cost roughly $43,000 in 2019, in about two hours on an 8xH100 node for approximately $48.

The project maintains a "Time to GPT-2" leaderboard, where the community competes on wall-clock time to reach GPT-2-level performance (measured by DCLM CORE score). The January baseline stood at three hours; a dataset swap brought it down to two **[1]**.

## Two Days of Autonomous Experimentation

On March 9th, a new leaderboard entry appeared. **1.80 hours.** An 11% cut from the previous record of 2.02 hours. The commit message says it all **[2]**:

> *"All of these improvements were developed by Claude running autonomous."*

All Karpathy did was start the agent and wait. Over roughly two days, Claude ran autonomously against a depth=12 model, testing approximately 700 changes. About 20 of them actually improved validation loss. The kicker: every single improvement was additive, and they all transferred cleanly to larger (depth=24) models **[3]**.

## What a Human Missed

These weren't trivial hyperparameter tweaks. They were structural oversights that Karpathy himself had missed **[3]**:

- **QKnorm had no scaler multiplier** — attention was too diffuse, and he hadn't noticed. The agent inserted 1.15 multipliers on q and k **[2]**.
- **Value Embeddings had no regularization** — Karpathy's own words: "oops."
- **Banded attention was too conservative** — he forgot to tune it.
- **AdamW betas were "all messed up"**
- Weight decay schedule and network initialization were both recalibrated.

A twenty-year veteran thought the project was "fairly manually well-tuned." The agent found all of this on its first try.

## "The Final Boss Battle"

Karpathy put it bluntly **[3]**:

> *"All LLM frontier labs will do this. It's the final boss battle."*

Tuning a single train.py and tuning a massive training pipeline are different beasts in complexity. But his assessment is clear — "doing it is just engineering, and it's going to work." Spin up a swarm of agents, have them collaborate on smaller models, promote the most promising ideas to larger scales, and humans contribute optionally at the edges.

He's already kicked off round 2, exploring multi-agent collaboration for parallelism.

## What This Means

The point here isn't "AI replaces research." Karpathy himself admits this isn't groundbreaking research — not yet. But it demonstrates that the most tedious, repetitive parts of research — hyperparameter search, catching configuration errors, designing the next experiment from the last one's results — are automatable now.

And more broadly: **any metric you can evaluate efficiently can be autoresearched by an agent swarm.** It's worth asking whether your problem fits that description.

A project built to make a $48 GPT-2 just became the benchmark for AI research automation.

---

### 🔗 Sources

| # | Source | Confidence |
|---|--------|-----------|
| 1 | [karpathy/nanochat — GitHub](https://github.com/karpathy/nanochat) | 🟢 Observed |
| 2 | [Autoresearch commit (6ed7d1d)](https://github.com/karpathy/nanochat/commit/6ed7d1d82cee16c2e26f45d559ad3338447a6c1b) (2026-03-09) | 🟢 Observed |
| 3 | [Karpathy — X post](https://x.com/karpathy/status/2031135152349524125) (2026-03-09) | 🟢 Observed |
