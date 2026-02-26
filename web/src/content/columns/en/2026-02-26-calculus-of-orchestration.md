---
title: "Delegating to AI Is Differentiation. Getting What You Want Is Integration."
author: "Jay"
date: "2026-02-26"
category: "AI Engineering"
tags: ["AI", "orchestration", "human-in-the-loop", "agents", "control-theory"]
slug: "2026-02-26-calculus-of-orchestration"
readTime: "8min"
excerpt: "You thought one perfect prompt would do it. But real results come from dozens of small course corrections accumulated over time. Deconstructing AI orchestration through the lens of calculus."
authorImage: "/members/jay.png"
---

You thought one perfect prompt would make AI handle everything.

It doesn't work that way. You hand a task to an agent, review the intermediate output, adjust direction, send it back. Repeat three or four times before you finally get "yes, that's it." We call this back-and-forth "tiki-taka," and in system design, it's "human-in-the-loop." But there's surprisingly little framework for explaining what this repetitive process actually *is*.

Here's one: **calculus**.

## Why Automation Alone Doesn't Converge

When you assign a complex task to an AI agent, it follows the surface of your instructions. The problem is that what you actually want is almost never fully contained in those instructions.

When you say "write me a report," what you really want isn't a report. It's a report your team lead will nod at, one that supports a decision, or one that becomes a shield in next week's meeting. This **latent objective function** is something even you often can't articulate upfront. It only reveals itself when you see intermediate results and feel "no, not this."

AI orchestration systems — parallel agents, tools, memory, automated pipelines — run without knowing this latent objective. They optimize for the surface instruction. So the longer an automated pipeline runs, the more **drift** accumulates between human intent and output. Like a self-driving car when you take your hands off the wheel: the first second is fine, ten seconds is manageable, but after a minute you're off the road.

## Differentiation — Reading the Slope of This Moment

A derivative is the instantaneous rate of change. "Right now, which direction is the output moving, and how fast?"

This is exactly what human-in-the-loop does. When an agent produces intermediate output, the human **reads the gradient**. "Is this heading where I intended? How far off? Is the pace right?" Then feedback like "shift left," "tone it down," "cut this part" corrects the gradient.

Tiki-taka — short-turn exchanges between AI and human — is a structure for **repeatedly sampling this derivative at short intervals**. Shorter intervals catch directional drift faster. That's the difference between handing an agent a 30-minute task wholesale versus checking in every 5 minutes. The former is low-frequency sampling; the latter is high-frequency.

Of course, too-frequent intervention kills agent autonomy. As the Nyquist theorem tells us in signal processing, there's an optimal sampling frequency. Too low and you miss information. Too high and you're just catching noise.

## Integration — Small Corrections Accumulate Into Results

Integration is the inverse of differentiation. Cumulating instantaneous rates of change over time. "The sum of small directional corrections is the final output."

Good output doesn't come from one perfect instruction. The first feedback shifts direction by 10 degrees. The second adjusts 5 more. The third nails the tone. The fourth fills missing context. These micro-corrections **integrate** into "what I actually wanted."

Accepting this changes your design philosophy. The holy grail of prompt engineering isn't "the one perfect instruction" — it's **feedback loop design**. Where do you break the pipeline to show a human? In what form do you present intermediate results? How do you propagate correction signals into subsequent steps? This is the heart of orchestration design.

## Orchestration as a Control System

In control engineering, this structure is familiar: a **feedback control loop**. The plant (AI agent) produces output. The sensor (human judgment) measures it. The controller (human feedback) generates an error signal fed back to the plant.

An orchestration harness isn't simple automation. It's a **dynamical system** where state changes over time. Agent context shifts, the external environment changes, and even human intent evolves mid-process. Layering human feedback as a control system on top of this is what real orchestration looks like.

And here the true nature of human-in-the-loop emerges. It's not "a person pressing an approval button." It's a **stabilization mechanism preventing error accumulation and drift**. Just as the I (integral) term in a PID controller eliminates steady-state error, repeated human feedback corrects AI's structural biases. Remove it and the system diverges. Design it poorly and the system oscillates.

## What This Means in Practice

**One**: When designing orchestration pipelines, "where to place human checkpoints" isn't a convenience question — it's a **system stability question**. A long pipeline without checkpoints is open-loop control. It only works in predictable environments.

**Two**: Tiki-taka frequency should be proportional to task uncertainty. Well-defined tasks (writing test code) need low frequency. Ambiguous tasks (strategy reports) need high-frequency feedback. Failing to distinguish these means oscillating between micromanagement and neglect.

**Three**: Accept that your own objective function is incomplete. Abandon the illusion that you can write perfect requirements upfront. Discovering "what I actually want" by seeing intermediate results is part of the work. AI is the mirror that accelerates that discovery.

**Four**: Memory and context given to agents are state variables in the control system. If previous feedback isn't reflected in the next execution, you're starting from zero every time. Good orchestration internalizes the accumulation of feedback — integration — into the system.

**Five**: Between "let AI handle it" and "humans must verify everything," there's no right answer. What exists is an **optimal sampling frequency** determined by task characteristics, error tolerance, and drift velocity. Finding it is the core competency of agentic engineering.

## The People Who Control the Path

Work in the AI era isn't about generating correct answers. It's about **controlling the path**.

Agents run fast. But where they should run shifts slightly every moment. The human role is to read those slight shifts, correct them, and accumulate them into results. Differentiate to read direction. Integrate to produce outcomes.

There is no perfect starting point. No perfect prompt. There are only good feedback loops.

---

**One-sentence summary**: Delegating to AI is differentiation (reading direction), and getting what you want is integration (accumulating corrections) — it's not perfect instructions but good feedback loops that produce results.
