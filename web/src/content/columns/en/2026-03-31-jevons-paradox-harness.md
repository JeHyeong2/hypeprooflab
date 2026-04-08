---
title: "Did the Steam Engine Kill Coal — The Jevons Paradox of AI Harnesses"
creator: "Ryan"
creatorImage: "/members/ryan.png"
date: 2026-03-31
category: "AI Engineering"
tags: ["jevons-paradox", "agent-harness", "frontier-model", "infrastructure", "AI"]
slug: "2026-03-31-jevons-paradox-harness"
readTime: "7 min"
excerpt: "As models get stronger, do harnesses die? Economist Jevons answered this in 1865. If efficiency doesn't reduce demand but causes it to explode, AI harnesses follow the same structure."
lang: "en"
authorType: "creator"
---

## 1. A Confusion of Ideas

In 1865, British economist [William Stanley Jevons](https://en.wikipedia.org/wiki/The_Coal_Question) made an observation. [James Watt's steam engine](https://en.wikipedia.org/wiki/Watt_steam_engine) had dramatically improved coal efficiency, yet Britain's coal consumption didn't decline — it surged.

> *"It is a confusion of ideas to suppose that the economical use of fuel is equivalent to a diminished consumption. The very contrary is the truth."*

This is [Jevons' Paradox](https://en.wikipedia.org/wiki/Jevons_paradox). When efficiency lowers the effective cost, adoption spreads to domains that previously couldn't afford the resource. Coal, once confined to textile mills, spread to railways, mining, steelworks, and agriculture. Per-unit consumption fell, but total consumption exploded.

In 2026, the same confusion of ideas is playing out in AI. "As models get stronger, harnesses die."

---

## 2. An Honest Admission

This claim has real basis.

In the GPT-3.5 era, LangChain had to build complex parsing logic just to get models to use tools. Now models support native function calling. Context windows exploded from 32K to 1M, and significant portions of RAG pipelines were replaced by "just stuff it all in." [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) opens a terminal and writes code on its own, without a separate orchestrator.

**Layers that harnesses created are being absorbed by models.** This is true.

If you stop here, the conclusion is clear: harnesses were prosthetics that compensated for model deficiencies, and as models approach completeness, harnesses disappear. LangChain, CrewAI, [OpenClaw](https://openclaw.ai) — all destined for obsolescence.

But Jevons would have asked: **"When the steam engine improved, did coal consumption actually decrease?"**

---

## 3. When the Impossible Becomes Possible

Claude Code can now code on its own. Great. But what about integrating it into your company's CI/CD, running it daily via cron, rolling back on failure, tracking costs, and enforcing security policies? The model made coding "possible," but the **infrastructure to run it in production** is entirely new.

This is the Jevons structure. Every time a model makes a new domain "possible," new infrastructure is needed to connect that domain to the real world. Some of the old harness gets absorbed by the model, but new harnesses appear at the new frontier.

| Jevons (1865) | AI Harness (2026) |
|---------------|-------------------|
| Watt steam engine = coal efficiency ↑ | Frontier Model = reasoning efficiency ↑ |
| Effective cost of coal ↓ | Effective cost of AI usage ↓ |
| Previously excluded industries adopt coal | Previously excluded domains adopt AI |
| Each industry needs new infrastructure | Each domain needs new connections (harnesses) |
| **Total coal consumption ↑** | **Total harness demand ↑** |

---

## 4. Not a Prosthetic, but a Bridge

The flaw in the "harnesses are dying" argument lies in viewing harnesses as **prosthetics** — crutches that do what the model can't. Crutches get discarded once you can walk.

But a harness isn't a crutch. It's **a bridge that takes the model where it couldn't go before.**

Watt's steam engine wasn't a crutch for coal. It was the bridge that carried coal from textile mills to railways, from railways to steelworks. Once you cross the bridge, it becomes a road, and a new bridge is built at the next frontier.

> **Harness = infrastructure that bridges the gap between the model's current capabilities and real-world application.**
> As models evolve, the gap doesn't disappear — **the gap relocates.**

Some argue that model providers will absorb harnesses. True. But history shows that the more a platform absorbs functionality, the more new layers emerge on top. When AWS abstracted away infrastructure, infrastructure engineers didn't disappear — DevOps was born. Abstraction doesn't kill layers. It relocates them.

---

## 5. The Lesson of 1865

The more a model solves with a single API call, the more demand explodes for infrastructure that connects that API call to the real world. Concluding that "harnesses are dying" from this is like concluding "coal is being saved" from the steam engine.

Borrowing Jevons' words:

> *"It is a confusion of ideas to suppose that the efficient use of AI reasoning is equivalent to a diminished need for harnesses. The very contrary is the truth."*

A harness is not a vanishing prosthetic — it's a frontier bridge in perpetual motion.

---

## Sources

| # | Source | URL |
|---|--------|-----|
| 1 | William Stanley Jevons — The Coal Question (1865) | https://en.wikipedia.org/wiki/The_Coal_Question |
| 2 | Jevons' Paradox — Wikipedia | https://en.wikipedia.org/wiki/Jevons_paradox |
| 3 | James Watt Steam Engine — Wikipedia | https://en.wikipedia.org/wiki/Watt_steam_engine |
| 4 | Claude Code — Anthropic Docs | https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview |
| 5 | OpenClaw — Agent Harness | https://openclaw.ai |
