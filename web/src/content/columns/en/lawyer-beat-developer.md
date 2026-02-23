---
title: "The Day a Lawyer Beat Every Developer"
creator: "Jinyong Shin"
date: "2026-02-23"
category: "Column"
tags: ["AI", "Claude", "hackathon", "expertise", "domain-knowledge"]
slug: "lawyer-beat-developer"
readTime: "10 min"
excerpt: "At the Anthropic Claude Code hackathon, a lawyer, a doctor, and a father won. No developers. In the age of AI, what's truly scarce?"
authorImage: "/members/jy.png"
---

# The Day a Lawyer Beat Every Developer

In February 2026, Anthropic held a hackathon to celebrate the first anniversary of Claude Code. The official name was **Build with Opus 4.6**. 13,000 people applied, and 500 were selected. Over six days, 277 working products were built and a total of 21 million lines of code were written. The top prize was $100,000 in Claude API credits.

When the winner list was released, the developer community quietly stirred.

| Rank | Winner | Profession | Project | Problem Solved |
|------|--------|------------|---------|----------------|
| 🥇 Gold | Mike Brown | California personal injury lawyer | CrossBeam | 90% building permit denial rate |
| 🥈 Silver | Jon McBee | Father of a 12-year-old daughter | Elisa | Barriers to coding education for kids |
| 🥉 Bronze | Michal Nedoszytko | Head of cardiology, Belgium | postvisit.ai | Patient comprehension after appointments |
| 🎨 Creative | Asep Bagja Priandana | Musician in Estonia | Conductr | Real-time MIDI-based AI band conducting |
| 🧠 Keep Thinking | Kyeyune Kazibwe | Infrastructure engineer, Uganda | TARA | Dashcam footage → road investment reports |

Software developers were virtually absent. At an AI coding tool hackathon.

---

## What They Built: Products Born in the Field

### CrossBeam — A Lawyer's Answer to California's Housing Crisis

Mike Brown's first words were these: *"Everyone thinks California has a housing crisis. It doesn't. We have a permitting crisis."*

The numbers backing his claim are brutal. Of the 429,000 ADU (Accessory Dwelling Unit) permits filed in California since 2018, over 90% were denied on first review. Each denial costs weeks of delay and thousands of dollars. An average six-month permit delay translates to $30,000 in losses per project.

Mike's friend Cameron is a contractor who builds ADUs. Mike repeatedly watched Cameron wrestle with denial letters. These letters cite California Government Code sections 66310 through 66342, reference city-specific local code provisions, and demand cross-verification with architectural plans. For a lawyer, this was familiar territory — *reading complex documents quickly, pinpointing issues, and finding solutions.*

So Mike built CrossBeam. Here's how it works: upload a building permit denial letter and architectural plans, and 13 specialized AI agents work in parallel. Each agent references a knowledge base of 28 files containing the entirety of California's ADU regulations. Decision trees covering height limits, setback distances, parking requirements, and fee structures run in real time. Because each analysis takes 10–30 minutes, agents run in isolated sandboxes with real-time database sync via Supabase.

Buena Park Mayor Connor Trout appeared personally in the demo video: *"We need to permit over 3,000 new homes by 2029. Last year we didn't even hit 100. It's impossible with current staff. We need this software."*

A lawyer built a multi-agent AI system in six days. Complete with isolated sandboxes, real-time database sync, and parallel skill execution.

### postvisit.ai — A Cardiologist Fixing What Happens After the Procedure

Michal Nedoszytko is head of cardiology in Brussels. His workplace is called the "cath lab" — where hearts are treated. He has thousands of procedures under his belt. But the problem that had haunted him for years wasn't inside the procedure room.

His words: *"The real problem starts the moment I leave the room."* Patients go home without understanding their diagnosis. Even when doctors explain, jargon-filled explanations don't stick.

Michal heard about the hackathon during his commute to the hospital. *"The best ideas come while driving."* A week later, postvisit.ai was complete. It's a tool that provides patients with a personalized AI companion after their appointment. Upload clinical notes and medical records, and it leverages Opus 4.6's million-token context window to generate patient-tailored explanations. It translates medical terminology into everyday language and provides ongoing guidance about recovery. It's the AI scribe technology that doctors use — flipped to the patient's side.

### The Other Winners: The Narrower the Problem, the Stronger the Solution

Silver winner Jon McBee built a coding environment for his daughter. No typing required — combine blocks, and an AI agent writes real code behind the scenes. While the agent works, an education engine explains the process at a child's level. 39,000 lines of code, solo, in six days.

Uganda's infrastructure engineer Kyeyune Kazibwe built a pipeline that automatically converts dashcam footage into road infrastructure investment recommendation reports. It was tested on actual roads under construction in Uganda. No Big Tech company invests resources in this problem — the market is too small. But for those affected, it's urgent.

---

## Scarcity Is Shifting

| Era | Implementation (Coding) | Problem-Finding (Domain Knowledge) |
|-----|------------------------|------------------------------------|
| Before AI | High value ⬆️ | Low value ⬇️ |
| After AI | Declining value ⬇️ | Rising value ⬆️ |

Economics has a concept called "comparative advantage" — focus not on what you're absolutely best at, but on **what you're relatively best at**. As AI elevates implementation capabilities across the board, comparative advantage in implementation is rapidly disappearing. Meanwhile, domain knowledge — the experience and problem sensitivity accumulated in a specific field — remains an area AI cannot easily replace.

Supply and demand tell the same story. With tools like Claude Code, the supply of "ability to write code" has exploded. When supply increases, price (value) decreases. Conversely, "knowing which problem to solve" remains scarce. Field experience can only be earned by living it and cannot be delegated to AI.

Boris Cherny, creator of Claude Code, said in a podcast: *"I think it's fair to say that coding is largely a solved problem now."* Watching Mike Brown's demo, he added: *"What I liked was the focus on the user. Talking to users, figuring out what they want, and building it. That's how the Claude Code team actually works."*

Journalist Henk van Ess, who covered the hackathon in person, wrote: *"When I apologized for not being a coder, most replied 'me neither.' The real developers never wrote back."*

This is why this wasn't just a hackathon upset. The fact that 277 working products emerged from 500 participants, and that all top winners were domain experts, is evidence of a structural shift we're witnessing. Technical implementation is becoming commoditized, and the ability to define problems is becoming the key differentiator.

---

## Your Field Is Your Asset

Here's a question for you: **What field are you in?**

For the lawyer, it was the courtroom and clients. For the doctor, the procedure room and patients. For the father, evenings with his daughter. Your field might be a job you've held for ten years, a daily work routine, or a hobby community you've been part of for ages.

The discomforts you've taken for granted in that field. *Why is this process so inefficient? Why do I have to manually organize this information every time? Why doesn't a tool like this exist in my industry?* These questions have become real, working assets in the AI era. Thoughts that used to end with "I can't build it" are now seeds of products.

Just as the Ugandan infrastructure engineer started with roads under construction in his own country, the narrower and more specific the problem, the fewer competitors and the greater the urgency. The world is waiting for solutions focused on narrow problems.

---

## What You Can Do Right Now

No need to start big. Begin with these three steps.

**Step 1: Record today's discomfort**

Look back on your day and ask yourself:

> *"Was there a discomfort I just tolerated and moved past today?"*

The smaller, the better. A small daily inefficiency is a better starting point than a grand social problem. Start with the habit of noting these down. Collect them for a week and patterns will emerge.

**Step 2: Build your first prototype with Claude Code**

Claude Code is available right now. You don't need to know how to code. The key is **explaining what to build in words**. Like Mike Brown did — describe the problem concretely. *Who experiences it, how is it currently solved, what's frustrating about it.* The more precise your description, the higher the quality of the output.

The goal of your first prototype isn't perfection. It's **getting it in front of a real user quickly**. Jon McBee's first user was his 12-year-old daughter. Show it to the closest person first.

**Step 3: Find the intersection of your domain × AI**

Browse the hackathon gallery with its 277 projects. Look for the project closest to your field. As you examine what problems they solved and how they approached them, you'll start seeing your own unsolved problem that nobody else has tackled.

---

The tools are already here. The Claude Code hackathon proved it. AI is ready to turn what you already know into reality.

All that's needed now is the courage to surface that discomfort you've been enduring — nothing more.

---

*References*
- Anthropic Official Winners Announcement (Threads)
- Hackathon Gallery — All 277 Projects (Cerebral Valley)
- Henk van Ess Field Report (Digital Digging)
- CrossBeam GitHub
- Elisa GitHub
