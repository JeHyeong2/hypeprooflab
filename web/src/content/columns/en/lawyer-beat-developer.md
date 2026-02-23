---
title: "The Day a Lawyer Beat Every Developer"
author: "JY"
date: "2026-02-23"
category: "Essay"
tags: ["AI", "Claude", "hackathon", "expertise", "domain-knowledge"]
slug: "lawyer-beat-developer"
readTime: "10 min"
excerpt: "At the Anthropic Claude Code hackathon, a lawyer, a doctor, and a father won. No developers. In the age of AI, what's truly scarce?"
authorImage: "/members/jy.png"
---

# The Day a Lawyer Beat Every Developer

In February 2026, Anthropic hosted a hackathon to celebrate the first anniversary of Claude Code. Officially named **Build with Opus 4.6**, [13,000 people applied](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist), 500 were selected, and over six days, 277 working products were built — totaling 21 million lines of code. The grand prize: $100,000 in Claude API credits.

[When the winners were announced](https://www.threads.com/@claudeai/post/DU_5tZrEoi-), the developer community went quiet.

| Rank | Winner | Profession | Project | Problem Solved |
|------|--------|-----------|---------|----------------|
| 🥇 Gold | Mike Brown | California personal injury lawyer | [CrossBeam](https://github.com/mikeOnBreeze/cc-crossbeam) | 90% building permit rejection rate |
| 🥈 Silver | Jon McBee | Father of a 12-year-old daughter | [Elisa](https://github.com/zoidbergclawd/elisa) | Barriers to kids' coding education |
| 🥉 Bronze | Michal Nedoszytko | Head of Cardiology, Belgium | [postvisit.ai](https://postvisit.ai) | Patient comprehension after appointments |
| 🎨 Creative | Asep Bagja Priandana | Musician in Estonia | Conductr | Real-time AI band conducting via MIDI |
| 🧠 Keep Thinking | Kyeyune Kazibwe | Infrastructure engineer, Uganda | TARA | Dashcam footage → road investment reports |

Software developers were virtually absent. At an AI coding tool hackathon.

---

## What They Built: Products Born in the Field

### CrossBeam — A Lawyer Takes On California's Housing Crisis

Mike Brown's opening line: *"Everyone thinks California has a housing crisis. It doesn't. We have a permitting crisis."*

[The numbers back him up](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist). Since 2018, of the 429,000 ADU (Accessory Dwelling Unit) permit applications filed in California, over 90% were rejected on first review. Each rejection costs weeks and thousands of dollars. An average six-month permit delay translates to $30,000 in losses per project.

Mike's friend Cameron is a builder who constructs ADUs. Mike watched Cameron wrestle with rejection letters over and over. Those letters cite California Government Code sections 66310 through 66342, reference varying local codes by city, and demand cross-verification with architectural plans. For a lawyer, this was familiar territory: *reading complex documents fast, identifying issues, finding solutions.*

So Mike built CrossBeam. Here's how it works: upload a building permit rejection letter and architectural plans, and 13 specialized AI agents work in parallel. Each agent references a knowledge base of 28 files covering the entire California ADU regulatory framework — height limits, setback distances, parking requirements, fee structures — running through decision trees in real time. Since each analysis takes 10–30 minutes, agents run in isolated sandboxes with real-time database sync via Supabase.

Buena Park Mayor Connor Trout appeared in the demo video himself: *"We need to permit over 3,000 new homes by 2029. Last year we didn't even hit 100. It's impossible with our current staff. We need this software."*

A lawyer built a multi-agent AI system in six days. Complete with isolated sandboxes, real-time database sync, and parallel skill execution.

### postvisit.ai — A Cardiologist Fixes What Happens After the Procedure

Michal Nedoszytko is the head of cardiology in Brussels. He works in what's called the "cath lab" — where hearts are treated. Thousands of procedures under his belt. But the problem that had haunted him for years wasn't inside the procedure room.

As he put it: *["The real problem starts the moment I leave the room."](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist)* Patients go home without understanding their diagnosis. Even when doctors explain, jargon-heavy explanations don't stick.

Michal heard about the hackathon during his commute to the hospital. *"The best ideas come while driving."* A week later, postvisit.ai was complete — a tool that gives patients a personalized AI companion after their appointment. Upload clinical notes and medical records, and it leverages Opus 4.6's million-token context window to generate patient-tailored explanations, translating medical terminology into everyday language and providing ongoing guidance about their condition. It flipped AI scribe technology — used by doctors — to face the patient instead.

### The Other Winners: The Narrower the Problem, the Stronger the Solution

Silver medalist Jon McBee built a coding environment for his daughter. No typing — combine blocks, and an AI agent writes real code behind the scenes while an education engine explains the process at a child's level. 39,000 lines of code, built solo in six days.

Uganda's infrastructure engineer Kyeyune Kazibwe built a pipeline that automatically converts dashcam footage into road infrastructure investment recommendation reports. Tested on actual under-construction roads in Uganda. No Big Tech company invests personnel in this problem — the market is too small. But for those affected, it's urgent.

---

## Scarcity Is Shifting

```
[Before AI]                         [After AI]

Implementation  ████████████ High    Implementation  ████░░░░░░░░ Declining
Problem-finding ████░░░░░░░░ Low     Problem-finding ████████████ Rising

Scarce = people who can write code   Scarce = people who know what to build
```

Economics has a concept called "comparative advantage" — focus not on what you're absolutely best at, but on what you're **relatively** best at. As AI raises implementation capabilities across the board, comparative advantage in implementation is vanishing fast. Domain knowledge, however — the experience and problem sensitivity accumulated in specific fields — remains an area AI can't easily replace.

Supply and demand tells the same story. With tools like Claude Code, the supply of "ability to write code" has exploded. When supply increases, price (value) drops. Meanwhile, "knowing which problem to solve" remains scarce. Field experience can only come from living it, and it can't be delegated to AI.

[Boris Cherny, who built Claude Code, said in a podcast](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist): *"I think it's fair to say coding is now a largely solved problem."* After watching Mike Brown's demo, he added: *"I loved the focus on the user. Talk to users, figure out what they want, and build it. That's actually how the Claude Code team works."*

Journalist Henk van Ess, who covered the hackathon firsthand, wrote: *["When I apologized for not being a coder, most replied 'me neither.' The real developers never wrote back."](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist)*

This is why it's not a simple hackathon anomaly. That 277 working products emerged from 500 participants, and that all top winners were domain experts, is evidence of a structural shift we're witnessing in real time. Technical implementation is becoming commoditized; the ability to define problems is becoming the core differentiator.

---

## Your Field Is Your Asset

Here's the question for you: **What field are you in?**

For the lawyer, it was courtrooms and clients. For the doctor, the procedure room and patients. For the father, evenings with his daughter. Your field might be the job you've held for a decade, the work routine you repeat daily, or the hobby community you've been part of for years.

The discomforts you've taken for granted in that field. *Why is this process so inefficient? Why do I have to manually organize this information every time? Why doesn't a tool like this exist in my industry?* These questions have become real, actionable assets in the AI era. Thoughts that used to end with "I can't build it" are now seeds of products.

Just as the Ugandan infrastructure engineer started with under-construction roads in his own country, the narrower and more specific the problem, the fewer competitors and the greater the urgency. The world is waiting for solutions that focus on narrow problems.

---

## What You Can Do Right Now

No need to start big. Begin with these three steps.

**Step 1: Record today's discomfort**

Look back on your day and ask yourself:

> *"Was there a discomfort I just tolerated and moved past today?"*

The smaller, the better. A tiny daily inefficiency makes a better starting point than a grand social issue. Start by noting these down. Collect them for a week and patterns will emerge.

**Step 2: Build your first prototype with Claude Code**

[Claude Code](https://claude.ai/code) is available right now. You don't need to know code. The key is **explaining what to build in words**. Like Mike Brown did — describe the problem specifically. *Who experiences it, how it's currently solved, what's painful about it.* The more precise your description, the better the output.

The goal of a first prototype isn't perfection. It's **getting it in front of a real user fast**. Jon McBee's first user was his 12-year-old daughter. Show it to the closest person first.

**Step 3: Find the intersection of your domain × AI**

Browse the [hackathon gallery](https://cerebralvalley.ai/e/claude-code-hackathon/hackathon/gallery) and its 277 projects. Look for the project closest to your field. Study what problems they solved and how they approached them — and you'll start to see your own unsolved problem that no one else has tackled.

---

The tools are already here. The Claude Code hackathon proved it. AI is ready to turn what you already know into reality.

All that's needed now is the courage to surface that discomfort you've been enduring — and nothing more.

---

*Sources*
- [Anthropic Official Winners Announcement (Threads)](https://www.threads.com/@claudeai/post/DU_5tZrEoi-)
- [Hackathon Gallery — All 277 Projects (Cerebral Valley)](https://cerebralvalley.ai/e/claude-code-hackathon/hackathon/gallery)
- [Henk van Ess Field Report (Digital Digging)](https://www.digitaldigging.org/p/a-lawyer-a-road-inspector-and-a-cardiologist)
- [CrossBeam GitHub](https://github.com/mikeOnBreeze/cc-crossbeam)
- [Elisa GitHub](https://github.com/zoidbergclawd/elisa)
