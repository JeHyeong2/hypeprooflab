---
title: "The Ralph Loop Is Dead. Harness Engineering Has Arrived."
creator: "Ryan"
date: "2026-03-05"
category: "Opinion"
tags: ["AI Agent", "Harness Engineering", "Claude Code", "DevOps", "Automation"]
slug: "2026-03-05-harness-engineering-arrives"
readTime: "8 min"
excerpt: "The era of directly building outputs is over. Now it's about designing the 'generation apparatus' — the rise of harness engineering."
creatorImage: "/members/ryan.png"
lang: "en"
---

## On the Making of run-harness-plugin

-----

The paradigm of software development is being fundamentally inverted.

On one side: the waterfall approach — meticulously drafting PRDs, designing pipelines, scripting each step for sequential execution. On the other: the naive agent loop — throw instructions at a model and pray for decent code. Both have hit their walls. The former crumbles under change; the latter can't guarantee quality.

A third methodology is carving its way between them. **Harness Engineering** — instead of directly controlling outputs, you focus on designing an environment where agents *have no choice but to produce the right results*.

-----

## 1. Why Harnesses, Why Now

The word "harness" originally refers to the tack fitted onto a carriage horse — bridle and reins that steer the animal in the desired direction. In the AI agent context, a harness is the entire system wrapping a model to reliably manage long-running tasks. If the model is a powerful engine, the harness is the complete vehicle: steering, brakes, and safety systems included.

After Aakash Gupta dropped the thesis "2025 Was Agents, 2026 Is Agent Harnesses," the industry's gaze shifted rapidly. The race for raw model performance has plateaued. The real competition has moved to *how you run the model*. Toss's engineering blog covering "Raising the productivity floor through harnesses in the Software 3.0 era" and the emergence of sophisticated harness frameworks like oh-my-opencode are symptoms of the same shift.

Powerful harnesses already exist. oh-my-opencode ships with a Sisyphus orchestrator, LSP and AST-Grep integration, multi-model routing, and 25+ built-in hooks — a heavily armed system. In military terms, it's an **autonomous fighter jet**: overwhelming in firepower and range, but the prep time and operational complexity scale proportionally.

What `run-harness-plugin` pursues is a different kind of maneuverability. Not a fighter jet, but an **autonomous drone that can be custom-configured on the spot for battlefield conditions**. Armed only with Claude Code's native capabilities — Skills, Teams, Tasks — but faster and lighter. Swapping team compositions, replacing skills, redefining tasks in minutes. That's the design philosophy of this plugin.

-----

## 2. Conversation Is Design — The Process of Building a Harness

In harness engineering, design happens not through documents but through **conversation** with agents.

Before diving into work, the developer engages in back-and-forth with the agent — defining goals, generating necessary tools (Skills), and refining the approach. This preliminary dialogue isn't mere prep work. It's the **critical process of setting up a trustworthy execution environment** for an agent that must operate autonomously for extended periods without human intervention. Think of it as co-evolving a PRD through dialogue with the agent, rather than writing one in isolation.

This also speaks to the "context engineering" skill gap that Toss's engineering blog identified. Two developers using the same model, the same IDE — one finishes refactoring in 10 minutes, the other wrestles with hallucinations for an hour. The difference isn't coding ability. It's **whether they designed the context before starting work**. A harness is the mechanism that narrows this gap at the system level.

-----

## 3. Maximizing Claude Native Features — Teams and Tasks

The execution layer that implements this methodology in a terminal environment is **run-harness-plugin**. Its design philosophy is clear: instead of stacking heavy abstraction layers, it leverages Claude Code's native features **as-is, to their fullest extent**. Not bolting unnecessary armor onto a drone, but pushing the airframe's inherent agility to its limits.

**Autonomous Team Composition (Agent Teams).** A single `/run-harness` command triggers Claude to analyze the task and assemble a team of 2–8 sub-agents. Roles are delegated via `TeamCreate` and `SendMessage`, and parallel work begins. No separate orchestration engine — it rides directly on Claude Code's native Agent Teams: shared task lists, inter-agent messaging, tmux-based spawning. This is the core of its lightness. No wrapping. Direct native calls.

**Memory and Context Persistence (Tasks).** To prevent agents from drifting off course during extended runs, `TaskCreate` manages goals and state. This serves as essential **memory** for long-running operations. Just as even the lightest drone can't afford to lose its return coordinates, Tasks structure the agent's working context with minimal overhead.

**Field-Assembled Skills.** While a fighter jet needs hangar time for weapons swaps, a drone changes its payload in the field. In run-harness-plugin, Skills play exactly this role. Domain-specific skills are defined during the preliminary conversation and injected lightweight for immediate use when the harness fires.

-----

## 4. The Technical Foundation of Unattended Autonomous Execution — Under the Hood

Once the harness is ready and the `/run-harness` command fires, the agent begins independent work. run-harness-plugin provides technical safety nets to ensure this long-running execution **doesn't break**.

**tmux Session Isolation.** A tmux session launches in the background, providing a stable TUI (Terminal UI) boot environment. tmux's session persistence is the critical infrastructure that keeps agents running even when SSH connections drop or terminals close. It follows the same pattern as Claude Code's Agent Teams tmux-based split-pane mode, but run-harness-plugin adds an automatic recovery layer on top.

**State Monitoring and Auto-Recovery.** The system polls for completion signals every 5 seconds. If heartbeats go unanswered for more than 30 seconds, the process is presumed stalled and retried. It's the distributed systems health-check pattern applied to single-agent execution.

**Exponential Backoff and Checkpoints.** On errors, an exponential backoff algorithm adjusts retry intervals. Whether it's network failures or API rate limits, instead of hammering retries and making things worse, the system progressively widens intervals to give the system room to recover. Even if interrupted, a cursor protocol enables work to resume from the last checkpoint. This mirrors the exactly-once semantics mindset of data pipelines — failure is inevitable, but recovery from failure is designable.

-----

## 5. On Timing

The reason this plugin matters *now* is because it aligns precisely with the industry's timing.

Claude Code's Agent Teams feature went public at the experimental stage, laying the native foundation for multi-agent orchestration. Simultaneously, projects like oh-my-opencode and claude-code-teams-mcp are building their own superstructures on this foundation.

The harness ecosystem is currently diverging. On one side: full-stack, fighter-jet-grade harnesses integrating LSP, AST, and multi-model routing. On the other: lightweight harnesses that hug Claude Code's native features and add only the thinnest layer. The former wins on versatility and firepower; the latter wins on **adoption speed and customization flexibility**.

run-harness-plugin stands at the extreme end of the latter. Teams + Tasks + Skills — Claude's native triad — with only tmux isolation and auto-recovery as safety nets. Everything above that — team composition strategy, skill definitions, task decomposition — is assembled on-site by the user through preliminary conversation. A drone's advantage isn't that it's cheaper or weaker than a fighter jet. It's that it can **adapt to battlefield changes on a minute-by-minute basis**.

-----

## Conclusion: The Era of Building Generation Apparatus, Not Outputs

The core of automation is no longer building the output itself but **constructing the 'generation apparatus' that produces outputs**.

The developer's role has moved beyond writing individual code or babysitting simple agent loops. It's time to evolve into a **'system orchestrator'** — one who designs robust harnesses that let agents perform to their full potential and pulls the trigger for autonomous team formation.

But that harness doesn't have to be a fighter jet. The battlefield changes daily. Missions differ every time. What you need is a drone you can assemble in 5 minutes on-site, retrieve and reconfigure on failure, and launch again. Equip it with Claude Code's native armaments — Skills, Teams, Tasks — as-is, but keep the harness as thin as possible. `run-harness-plugin` is a tool whose lightness *is* the design intent.

To borrow a physics analogy: we're no longer in the Newtonian era of tracking individual particle trajectories. We've entered the statistical mechanics era of designing the **statistical properties** of a system where countless agents interact. Designing not individual lines of code, but the *conditions* under which code is generated. That is harness engineering.

-----

*`run-harness-plugin` is available on [GitHub](https://github.com/ico1036/run-harness-plugin).*
