---
title: "The Day a Lawyer Beat Every Developer"
author: "JY"
date: "2026-02-23"
category: "Essay"
tags: ["AI", "Claude", "hackathon", "expertise", "domain knowledge"]
slug: "lawyer-beat-developer"
readTime: "10 min"
excerpt: "At Anthropic's Claude Code hackathon, the winners were a lawyer, a doctor, and a father. No developers. In the age of AI, what's truly scarce?"
authorImage: "/members/jy.png"
---

# The Day a Lawyer Beat Every Developer

In February 2026, Anthropic held a hackathon to celebrate the first anniversary of Claude Code. The official name was **Build with Opus 4.6**. [13,000 people applied](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist), and 500 were selected. Over six days, 277 working products were built, totaling 21 million lines of code. The grand prize: $100,000 in Claude API credits.

[When the winners were announced](https://www.threads.com/@claudeai/post/DU_5tZrEoi-), a quiet murmur rippled through the developer community.

| Rank | Winner | Profession | Project | Problem Solved |
|------|--------|------------|---------|----------------|
| 🥇 Gold | Mike Brown | California personal injury lawyer | [CrossBeam](https://github.com/mikeOnBreeze/cc-crossbeam) | 90% building permit rejection rate |
| 🥈 Silver | Jon McBee | Father of a 12-year-old daughter | [Elisa](https://github.com/zoidbergclawd/elisa) | Barriers to entry in kids' coding education |
| 🥉 Bronze | Michal Nedoszytko | Chief of cardiology, Belgium | [postvisit.ai](https://postvisit.ai) | Post-visit patient comprehension gaps |
| 🎨 Creative | Asep Bagja Priandana | Musician based in Estonia | Conductr | Real-time AI band conducting via MIDI |
| 🧠 Keep Thinking | Kyeyune Kazibwe | Infrastructure engineer, Uganda | TARA | Dashcam footage → automated road investment reports |

There were virtually no software developers among them. At an AI coding tool hackathon.

---

## What They Built: Products Born from the Field

### CrossBeam — A Lawyer's Answer to California's Housing Crisis

Mike Brown's opening line was this: *"Everyone thinks California has a housing crisis. It doesn't. We have a permitting crisis."*

[The numbers backing his claim are brutal](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist). Of the 429,000 ADU (Accessory Dwelling Unit) permits filed in California since 2018, over 90% were rejected on first review. Each rejection costs weeks of delay and thousands of dollars. An average six-month permit delay translates to $30,000 in losses per project.

Mike's friend Cameron is a contractor who builds ADUs. Mike watched Cameron wrestle with rejection letters over and over. Those letters cite California Government Code sections 66310 through 66342, reference city-specific local code provisions, and demand cross-verification against architectural drawings. For a lawyer, this was familiar territory — *reading complex documents quickly, identifying the issues, and finding solutions.*

So Mike built CrossBeam. Here's how it works: upload a permit rejection letter and architectural plans, and 13 specialized AI agents run in parallel. Each agent references a knowledge base of 28 files covering the entirety of California's ADU regulations. Decision trees encompassing height limits, setback distances, parking requirements, and fee structures execute in real time. Because a single analysis takes 10–30 minutes, agents run in isolated sandboxes with real-time database sync via Supabase.

Connor Trout, mayor of Buena Park, appeared in the demo video and said: *"We need to permit over 3,000 new homes by 2029. Last year, we didn't even hit 100. It's impossible with our current staff. We need this software."*

A lawyer built a multi-agent AI system in six days. Complete with isolated sandboxes, real-time database sync, and parallel skill execution.

### postvisit.ai — A Cardiologist Fixes What Happens Outside the Procedure Room

Michal Nedoszytko is the chief of cardiology at a hospital in Brussels. His workplace is called the "cath lab" — where hearts are treated. He has thousands of procedures under his belt. But the problem that had haunted him for years wasn't inside the procedure room.

In his words: *["The real problem starts the moment I leave the room."](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist)* Patients go home without understanding their diagnosis. Even when the doctor explains, jargon-laden explanations don't stick.

Michal heard about the hackathon during his commute to the hospital. *"My best ideas come to me while driving."* A week later, postvisit.ai was complete — a tool that gives patients a personalized AI companion after their visit. Upload clinical notes and medical records, and it leverages Opus 4.6's one-million-token context window to generate patient-tailored explanations. It translates medical terminology into everyday language and provides ongoing guidance about what to expect next. It's the AI scribe technology doctors use — flipped to the patient's side.

### The Other Winners: The Narrower and More Specific, the Stronger

Silver medalist Jon McBee built a coding environment for his daughter. No typing required — arrange blocks, and an AI agent writes real code behind the scenes. While the agent works, an educational engine explains the process at a child's level. 39,000 lines of code, built solo in six days.

Kyeyune Kazibwe, an infrastructure engineer from Uganda, built a pipeline that automatically converts dashcam footage into road infrastructure investment recommendation reports. It was tested on actual roads under construction in Uganda. No Big Tech company allocates resources to this problem — the market is too small. But for the people who live it, it's critical.

---

## Scarcity Is Shifting

```
[Before AI]                        [After AI]

Implementation  ████████████ High   Implementation  ████░░░░░░░░ Declining
Problem-finding ████░░░░░░░░ Low    Problem-finding ████████████ Rising

Scarce = people who can code        Scarce = people who know what to build
```

In economics, there's a concept called "comparative advantage" — the principle that you should focus not on what you're absolutely best at, but on **what you're relatively best at**. As AI raises implementation capabilities across the board, comparative advantage in implementation is vanishing fast. Domain knowledge, on the other hand — the experience and problem sensitivity accumulated in a specific field — remains an area AI cannot easily replace.

Supply and demand tell the same story. Tools like Claude Code have caused an explosion in the supply of "the ability to write code." When supply surges, price (value) drops. Meanwhile, "knowing which problem to solve" remains scarce. Field experience only comes from living it, and you can't delegate that to AI.

[Boris Cherny, who created Claude Code, said on a podcast](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist): *"I think it's fair to say that coding is largely a solved problem now."* After watching Mike Brown's demo, he added: *"What I loved was the focus on the user. Talk to users, figure out what they want, and build it. That's how the Claude Code team actually works."*

Henk van Ess, the journalist who covered the hackathon firsthand, wrote: *["When I apologized for not being a coder, most replied, 'Me neither.' The real developers never wrote back."](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist)*

This is why it's more than a hackathon upset. The fact that 277 working products emerged from 500 participants, and that the top winners were all domain experts, is evidence of a structural shift unfolding before our eyes. Technical implementation is becoming commoditized, and the ability to define the right problem is becoming the key differentiator.

---

## Your Field Is Your Asset

Here's the question for you, the reader: **What field are you in?**

For the lawyer, the field was the courtroom and his clients. For the doctor, the procedure room and his patients. For the father, evenings spent with his daughter. Your field might be the job you've held for ten years, the daily routine you repeat without thinking, or the hobby community you've been part of for ages.

The frustrations you've quietly endured in that field — *Why is this process so inefficient? Why do I have to manually organize this information every single time? Why doesn't a tool like this exist in my industry?* These questions have become real, actionable assets in the age of AI. Thoughts that once ended with "I wouldn't know how to build that" are now seeds for products.

Just as the Ugandan infrastructure engineer started with roads under construction in his own country, the narrower and more specific the problem, the fewer competitors there are and the greater the urgency. The world is waiting for solutions that focus on narrow problems.

---

## What You Can Do Right Now

You don't need to start big. Begin with these three steps.

**Step 1: Record today's frustrations**

Look back on your day and ask yourself this question:

> *"Was there a frustration today that I just tolerated and moved past?"*

The smaller, the better. A minor daily inefficiency is a better starting point than a grand societal issue. Start by making a habit of jotting these down. Collect them for just one week, and patterns will emerge.

**Step 2: Build your first prototype with Claude Code**

[Claude Code](https://claude.ai/code) is available right now. You don't need to know how to code. The key is **describing what needs to be built, in words**. Do what Mike Brown did — describe the problem concretely. *Who experiences this problem? How do they currently solve it? What's painful about it?* The more precise this description, the better the output.

The goal of a first prototype isn't polish. It's **getting it in front of a real user as fast as possible**. Jon McBee's first user was his 12-year-old daughter. Show it to the closest person first.

**Step 3: Find the intersection of your domain × AI**

Browse the 277 projects in the [hackathon gallery](https://cerebralvalley.ai/e/claude-code-hackathon/hackathon/gallery). Find the project closest to your field. As you study what problems were solved and how they were approached, you'll start to see a problem that no one has tackled yet — one that's uniquely yours.

---

The tools are already here. The Claude Code hackathon proved it. AI is ready to turn what you already know into reality.

All that's needed now is the courage to pull out that frustration you've been enduring for too long — and nothing more.

---

*Sources*
- [Anthropic official winners announcement (Threads)](https://www.threads.com/@claudeai/post/DU_5tZrEoi-)
- [Hackathon gallery — all 277 projects (Cerebral Valley)](https://cerebralvalley.ai/e/claude-code-hackathon/hackathon/gallery)
- [Henk van Ess's field report (Digital Digging)](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist)
- [CrossBeam GitHub](https://github.com/mikeOnBreeze/cc-crossbeam)
- [Elisa GitHub](https://github.com/zoidbergclawd/elisa)
