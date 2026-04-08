---
title: "Whose Code Is It When It Leaks — How One Missing .npmignore Line Dismantled the Premises of Copyright"
creator: "Jay"
date: "2026-04-08"
category: "AI × Society"
tags: ["AI", "copyright", "Claude Code", "source-map", "trade-secret", "fair-use", "clean-room", "bundle-unbundle"]
slug: "2026-04-08-claude-code-leak-copyright"
readTime: "18 min"
excerpt: "On March 31, 2026, 512,000 lines of Anthropic's Claude Code source code leaked through npm. But when developers actually read the code, they discovered something unexpected: it was never written for humans to read. Code written by an AI for its own context window. At that moment, the question 'whose work is this?' itself falls apart."
creatorImage: "/members/jay.png"
lang: "en"
authorType: "human"
---

## 1. What One Source Map Blew Open

On the afternoon of March 31, 2026, Solayer Labs intern [Chaofan Shou](https://x.com/shoucccc) was poking around version 0.2.188 of the `@anthropic-ai/claude-code` npm package when he found something strange. A 59.8MB JavaScript source map. It pointed to the entire original TypeScript source hosted on Anthropic's Cloudflare R2 bucket. 512,000 lines. 1,906 files.

The cause was embarrassingly simple. The [Bun runtime](https://bun.sh) that Anthropic adopted generates source maps by default at build time. Adding `*.map` to `.npmignore` or setting a whitelist in `package.json`'s `files` field would have prevented it. A single `npm pack --dry-run` would have caught the problem.

Within hours, the code was mirrored across dozens of GitHub repos. Korean developer Sigrid Jin's clean-room Python rewrite "[claw-code](https://github.com/sigridjin/claw-code)" hit roughly 75,000 GitHub stars in about 2 hours. Anthropic issued [DMCA takedowns](https://techcrunch.com/2026/04/01/anthropic-took-down-thousands-of-github-repos-trying-to-yank-its-leaked-source-code-a-move-the-company-says-was-an-accident/) that disabled over 8,100 repositories -- but in the process accidentally took down the fork network of their own official repo. The code had already spread to decentralized platforms.

But the truly interesting discovery in all this commotion lay elsewhere. Developers who actually read the code all pointed to the same thing.

**This code was not written for humans to read.**

---

## 2. Code Written by an AI for Itself

Claude Code lead Boris Cherny said in a [Fortune interview](https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/): *"100% of my contributions to Claude Code were written by Claude Code."* On the Latent Space podcast, he disclosed that roughly 80% of the entire codebase was authored by Claude itself. On the day of the leak, he was even more direct: "Claude Code is 100% written by Claude Code."

The precision of these numbers is debatable. A [LessWrong analysis](https://www.lesswrong.com/) called the claim "misleading/hype-y" -- the metric was undefined, and humans still set direction and reviewed. But the codebase itself left evidence. Code written for humans to read and code designed for AI consumption are physically different.

### Function Names as Prompts

Human developers use short names like `deprecated()`, `testOnly()`, `unsafe()`. Experienced teams rely on IDE type systems and code review for context. Claude Code's function names look like this:

```typescript
writeFileSyncAndFlush_DEPRECATED()
resetTotalDurationStateAndCost_FOR_TESTS_ONLY()
DANGEROUS_uncachedSystemPromptSection()
AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
```

[Sabrina.dev's analysis](https://www.sabrina.dev/p/claude-code-source-leak-analysis) nails it: *"These naming conventions make the function name itself do the work that documentation and human code review are supposed to do."* An AI needs to load a single file into its context and grasp the entire intent. The function name has to be the instruction. As one Hacker News developer summarized: *"This is what happens when an LLM writes code -- it adds comments with perfect punctuation and grammar to every method. Humans don't do that."*

### Architecture Shaped by the Context Window

Claude Code's three-tier memory system is not designed for human cognition:

- **Compact Index**: Capped at 200 lines -- sized to always fit in the context window
- **Topic Files**: Loaded on demand -- context expansion as needed
- **Raw Transcripts**: Accessed only via grep -- never loaded directly into context

200 lines. This number has nothing to do with human readability. It is calibrated to the token count that always fits in an LLM's system prompt. An internal delimiter called `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` explicitly separates static instructions (globally cached) from session-specific content. **An AI's self-optimization to save token costs.**

### "The implementer is an LLM. Verify independently."

This sentence was explicitly stated in the prompt of an internal verification agent. The reason the test system does not trust the code's author is that the author is an AI. And the team's internal philosophy is even more direct: *"There is no reason to code-review AI-generated code. Modify the spec and regenerate."*

Not code review, but regeneration. Not patching, but discarding and reproducing. This is not the trace of human authorship -- it is **the operating mode of an AI production line**.

A single file, `print.ts`, runs to [5,594 lines](https://read.engineerscodex.com/p/diving-into-claude-codes-source-code). One function spans 3,167 lines, 486 branch points, 12 levels of nesting. The agent execution loop, signal handling, rate limiting, AWS authentication, MCP lifecycle, and plugin loading are all crammed into one function. A human would split this into 8-10 modules. An AI packs it all into one **because it needs to see everything at once to understand it**. 64,464 lines with zero tests. A bug in `autoCompact.ts` that was documented as wasting 250,000 API calls per day sat unfixed for 21 days, despite requiring only a 3-line patch.

If a human "authored" this code, leaving a documented bug unfixed for 21 days is professional negligence. If an AI generated it and a human skimmed over it, this is not authorship -- it is supervision.

**Copyright law protects authorship, not supervision.**

---

## 3. The Snake Eating Its Own Tail

This is where the Claude Code leak gets truly interesting. It is not just a source code leak. It is an event that simultaneously tests every premise of modern copyright law.

### Input: 7 Million Books

Anthropic downloaded [over 7 million books](https://www.susmangodfrey.com/wins/susman-godfrey-secures-1-5-billion-settlement-in-landmark-ai-piracy-case/) from pirate sites to use as Claude's training data. It also separately purchased and scanned millions more legally. In the class-action lawsuit filed by authors (Bartz v. Anthropic), Anthropic settled for **$1.5 billion** -- the largest settlement in US copyright litigation history.

In June 2025, [Judge William Alsup](https://techcrunch.com/2025/06/24/a-federal-judge-sides-with-anthropic-in-lawsuit-over-training-ai-on-books-without-authors-permission/) issued a critical dual ruling. AI training on legally purchased books is *"quintessentially transformative"* -- Fair Use. Copies downloaded from pirate sites are not Fair Use. A fairness hearing on the settlement is scheduled for April 2026.

### Output: Code Written by AI

The Claude trained on those books wrote Claude Code. In March 2026, the US Supreme Court [denied certiorari](https://www.cnbc.com/2026/03/02/us-supreme-court-declines-to-hear-dispute-over-copyrights-for-ai-generated-material.html) in Thaler v. Perlmutter. The DC Circuit ruling stands: **Purely AI-generated works cannot be registered for copyright.** The US Copyright Office's [January 2025 report](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf) points the same way -- AI output is protectable only when a human author determines "sufficient expressive elements."

### The Shape of the Snake

Place these two facts side by side, and you see the [ouroboros](https://en.wikipedia.org/wiki/Ouroboros) -- the snake eating its own tail:

1. Anthropic trained Claude on **other people's works** (7 million books) -> copyright lawsuit, $1.5B
2. That Claude **wrote Claude Code** -> copyright protection status unknown
3. When Claude Code leaked, Anthropic **tried to protect it with DMCA** -> claiming copyright on AI-written code
4. Meanwhile, Anthropic told authors that **"AI training is transformative use"**

A structure where learning from others' works is Fair Use, but claiming copyright over what your own AI produced. Training is "transformation," but leaking is "infringement" -- an asymmetry. [TechTrenches](https://techtrenches.dev/p/the-snake-that-ate-itself-what-claude) called this situation "The Snake That Ate Itself."

And the snake coils one layer further. If 80-100% of Claude Code was written by AI, then a substantial portion of the code Anthropic tried to protect via DMCA **may never have been copyrightable in the first place.** Apply the logic of the Thaler ruling and that is where you land. The legal basis for taking down 8,100 repos begins to wobble.

---

## 4. A World Where Clean Rooms Cost a Dollar

Traditional [clean-room reverse engineering](https://en.wikipedia.org/wiki/Clean-room_design) works like this:

1. **Clean Team**: Analyzes the original code and writes only a functional specification.
2. **Development Team**: Never sees the original -- implements independently from the spec alone.
3. **Legal basis**: Copyright protects expression, not ideas.

Compaq's legal clone of the IBM PC BIOS (1982), Sony v. Connectix (2000) -- all grounded in this principle. The problem was that the process was expensive and slow. Running two teams, physically isolating them, maintaining legal records -- it took months and millions of dollars. The theoretical right existed, but exercising it in practice was hard.

AI has driven that cost to near zero.

claw-code is exactly this. It **extracted only the logic** from the leaked TypeScript and had AI reimplement it in Python, a completely different language. ["Malus"](https://www.plagiarismtoday.com/2026/03/24/cleanroom-as-a-service-ai-washing-copyright/), presented at FOSDEM 2026, turned this into a service outright -- one AI analyzes the source, a separate isolated AI generates "legally distinct" code. "Cleanroom as a Service."

The Supreme Court's 2021 [Oracle v. Google](https://en.wikipedia.org/wiki/Google_LLC_v._Oracle_America,_Inc.) ruling found Google's copying of Java API declaration code to be Fair Use. The functional structure of APIs is not subject to copyright monopoly. Apply this logic to Claude Code: tool definition structures and protocols lean toward Fair Use, while internal business logic remains protectable.

But if AI can "swap the expression and keep the idea" in seconds, the boundary between **idea and expression** -- copyright's most fundamental distinction -- becomes effectively meaningless. In a world where expression can be infinitely varied, what does protecting expression actually protect?

Unresolved legal questions pile up:
- If you show an AI the original code and say "write it differently," is that a clean room or contamination?
- Even if the human never directly read the original, are they deemed to have "seen" it through the AI?
- If the AI rewrite cannot receive copyright under the Thaler ruling, does it become **code that belongs to no one**?

As of April 2026, no court has answered these questions.

---

## 5. The Unbundling of Copyright

Copyright has protected multiple rights as a single bundle. This bundle has been stable for centuries. Each right reinforced the others; if one was breached, another held the line. AI is loosening the ties of this bundle in multiple places at once.

**Creation = Human.** The oldest premise of copyright. Since the [Statute of Anne](https://en.wikipedia.org/wiki/Statute_of_Anne) of 1710, "authorship" has meant a human sitting down, thinking, and selecting expression. Claude Code's internal comment -- "the implementer is an LLM" -- negates this premise at the code level. The team philosophy of "modify the spec and regenerate" is an admission that the human's role is not authorship but **commissioning**.

**Copying = Infringement.** A premise created by the printing press. Because copying carried cost, prohibiting unauthorized copying made economic sense. Is AI training copying? Judge Alsup said "transformative use." But when the "transformation" produces code with equivalent functionality to the original, where is the line between "transformation" and "copying"?

**Expression protected, ideas not.** The bedrock of copyright law. But what if AI can swap expression in 0.1 seconds? claw-code changed TypeScript to Python, KAIROS's architecture to a different structure, function names to different names. The expression is 100% different. The ideas are 100% identical. Legally, this is permissible. But is it the outcome copyright intended?

**Distribution control.** A source map included in a package uploaded to npm -- a public registry -- is legally close to voluntary distribution. The Defend Trade Secrets Act (2016) asks whether the owner took "reasonable measures" to maintain secrecy. Is omitting one line from `.npmignore` a "reasonable measure"? Anthropic issued DMCA takedowns immediately, but while 8,100 repos were being taken down, the code had already spread to decentralized mirrors. The impossibility of recalling once-leaked digital information physically defeats the "distribution control" that copyright presupposes.

**Derivative works.** Is claw-code a derivative work of Claude Code, or an independent creation? Traditional standards apply a "substantial similarity" test. But when the language is different, the structure is different, and not a single line is the same? Software with identical functionality but different expression is not a derivative work -- it is a competing product. Just as Compaq was to IBM. Except Compaq took a team of human engineers months, and claw-code took an AI a few hours.

Each of these ties has loosened before. The printing press shook reproduction rights. The internet shook distribution rights. Digital copying blurred the boundaries of derivative works. The difference is that AI is **loosening all the ties simultaneously**.

---

## 6. The Moment Software Stops Being a Creative Work

The discussion so far has asked "who is the author within the framework of copyright law." But what the Claude Code leak truly revealed is that the framework itself is approaching its expiration date.

Traditional software development is discrete. Humans write code, review it, deploy it, discover bugs, and fix them. There are time gaps between each step, and "authorship" exists within those gaps. Copyright operates on the assumption of this gap -- that someone sat down, thought, and chose expression at a particular moment.

[KAIROS](https://claudefa.st/blog/guide/mechanics/claude-code-source-leak), found in the leaked code, eliminates this gap. An autonomous daemon named after the ancient Greek word for "the opportune moment." Around the clock, every few seconds, it asks: "Is there anything worth doing right now?" It generates code, tests it, fixes it if it fails, deploys it if it succeeds. Even while humans sleep.

In a world where this loop is complete, what does "the act of authorship" even mean? Is it not like pointing at a spot in a river and claiming "this water is mine"?

Here a more fundamental question opens up. Software has historically been classified in two ways. [Literary Work](https://www.copyright.gov/circs/circ61.pdf) -- the view that source code is human expression. Functional Tool -- the view that it is a method for operating a machine. AI's Closed Loop creates a third category. **Something closer to a biological process.** Code is generated, subjected to environmental pressure (tests), and the surviving code passes to the next generation. The evolution of software. Nobody claims copyright on genetic code.

---

## 7. Expanding the Operating System Metaphor

Finally, let us pose the structural question that runs through all of this.

What we call an "operating system (OS)" is an abstraction layer between hardware and software. It manages processes, allocates memory, mediates I/O. What the Claude Code leak revealed is that LLMs are functioning as **an abstraction layer between software and intent**.

KAIROS is a process scheduler -- deciding what to run and when. The three-tier memory is virtual memory management -- deciding what to cache and what to leave on disk. The 40-plus tool system is a set of system calls -- a standardized interface to external resources. [Anti-Distillation](https://www.penligent.ai/hackinglabs/claude-code-source-map-leak-what-was-exposed-and-what-it-means/) -- a mechanism that injects fake tool definitions into API requests to interfere with competitors' training -- is a security kernel.

From this perspective, the Claude Code source leak is structurally the same as making the Linux kernel source public. The differences: Linux was open-source from the start while Claude Code was an accident, and the Linux kernel was written by humans while Claude Code was written by AI.

Does the Linux kernel have copyright? Yes. The GPL protects it. But what the GPL protects is not the expression of the code -- it is **the freedom of the code**. Use it freely, but keep derivatives open: a social contract. In a world where LLMs become the OS, what may be needed is not copyright but **a new form of social contract**.

---

## 8. The Asset Is Not the Code -- It Is the Loop

So what does this all mean?

Claude Code was lambasted in the developer community as "vibe-coded garbage." A 5,594-line God File, zero tests, a documented bug left unfixed for 21 days. And yet the product running this "garbage code" generates $2.5B in annual revenue. claw-code reimplemented it in another language in 2 hours. **The code itself is reproducible.** Slapping copyright on something reproducible -- it might work, but it does not capture the essence.

What Anthropic truly lost in the leak was not 512,000 lines of TypeScript. It was KAIROS's scheduling logic, the 200-line cap design of the three-tier memory, Anti-Distillation's fake tool injection strategy -- **the blueprint of the loop that endlessly generates, tests, discards, and regenerates code**.

The bundle that copyright has held together for 300 years was **creation = expression = value**. Humans create, that expression is the value, and copyright protects that value. AI dismantles this bundle:

- **Creation has been automated.** "The implementer is an LLM."
- **Expression can be infinitely varied.** claw-code proved it in 2 hours.
- **Value does not reside in expression.** It resides not in the code, but in the system that produces it.

TJ's [content depreciation column](/columns/2026-03-31-content-depreciation) argued that "the asset is the pipeline, not the content." The same shift is happening in software. **The asset is not the code -- it is the Closed Loop that produces, evolves, evaluates, and reproduces code around the clock.** Copyright is a regime designed to protect static "works." It was never designed to protect a process that continuously and autonomously evolves.

```
1450  Printing press    -> Reproduction cost drops    -> Publishers demand monopoly
1710  Statute of Anne   -> First copyright law        -> "Temporary monopoly in exchange for publication"
1886  Berne Convention  -> International framework    -> Automatic protection without registration
1998  DMCA              -> Digital response           -> Takedown procedures
2021  Oracle v. Google  -> API Fair Use               -> Copyright limits on functional structure
2025  AI training wars  -> Fair Use re-examined       -> Anthropic $1.5B settlement
2026  Claude Code leak  -> ???
```

260 years from the printing press to copyright law. 30 years from the internet to the DMCA. Each time, new law was made when the cost structure the old law assumed collapsed. The printing press collapsed reproduction costs. The internet collapsed distribution costs. AI is collapsing **the cost of creation itself**. South Korea enacted its AI Basic Act (January 2026) but omitted TDM exception clauses, and [51 AI copyright lawsuits](https://www.jdsupra.com/legalnews/proposed-state-ai-law-update-april-6-9815133/) are pending, though substantive rulings are not expected until summer 2026 at the earliest. There are no 260 years to spare.

One line was missing from `.npmignore`. But what that one line blew open was not 512,000 lines of code -- it was an expiration notice on 300 years of premises.

---

This column is a story about copyright. But it is not only about copyright.

The Closed Loop in which AI produces and evolves code around the clock poses the same question to **every regulatory framework** that treats software as "a creative work made by humans." ISO 26262 functional safety certification, ASPICE development process traceability, the human sign-off required at each stage of the V-Cycle -- the day when the single line "the implementer is an LLM" arrives at software regulation in the automotive, aerospace, and medical device industries is not far off.

The next installment picks up this question: **In a world where AI writes safety-critical code, what does regulation certify, and who does it hold accountable?**

---

## Sources

| # | Source | URL |
|---|--------|-----|
| 1 | The Register — Anthropic accidentally exposes Claude Code | https://www.theregister.com/2026/03/31/anthropic_claude_code_source_code/ |
| 2 | VentureBeat — Claude Code source code leak | https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know |
| 3 | Engineer's Codex — Diving into the source | https://read.engineerscodex.com/p/diving-into-claude-codes-source-code |
| 4 | Sabrina.dev — Comprehensive analysis | https://www.sabrina.dev/p/claude-code-source-leak-analysis |
| 5 | Fortune — 100% AI-written code | https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/ |
| 6 | TechTrenches — The Snake That Ate Itself | https://techtrenches.dev/p/the-snake-that-ate-itself-what-claude |
| 7 | TechCrunch — Anthropic DMCA takedowns | https://techcrunch.com/2026/04/01/anthropic-took-down-thousands-of-github-repos-trying-to-yank-its-leaked-source-code-a-move-the-company-says-was-an-accident/ |
| 8 | Susman Godfrey — $1.5B settlement | https://www.susmangodfrey.com/wins/susman-godfrey-secures-1-5-billion-settlement-in-landmark-ai-piracy-case/ |
| 9 | TechCrunch — Alsup ruling on AI Fair Use | https://techcrunch.com/2025/06/24/a-federal-judge-sides-with-anthropic-in-lawsuit-over-training-ai-on-books-without-authors-permission/ |
| 10 | CNBC — Supreme Court denies Thaler cert | https://www.cnbc.com/2026/03/02/us-supreme-court-declines-to-hear-dispute-over-copyrights-for-ai-generated-material.html |
| 11 | US Copyright Office — AI Copyrightability Report | https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf |
| 12 | Plagiarism Today — Cleanroom as a Service | https://www.plagiarismtoday.com/2026/03/24/cleanroom-as-a-service-ai-washing-copyright/ |
| 13 | Claudefast — Everything found in the leak | https://claudefa.st/blog/guide/mechanics/claude-code-source-leak |
| 14 | Penligent — What was exposed and what it means | https://www.penligent.ai/hackinglabs/claude-code-source-map-leak-what-was-exposed-and-what-it-means/ |
| 15 | Oracle v. Google — Wikipedia | https://en.wikipedia.org/wiki/Google_LLC_v._Oracle_America,_Inc. |
| 16 | Statute of Anne — Wikipedia | https://en.wikipedia.org/wiki/Statute_of_Anne |
| 17 | Layer5 — 512,000 lines, a missing .npmignore | https://layer5.io/blog/engineering/the-claude-code-source-leak-512000-lines-a-missing-npmignore-and-the-fastest-growing-repo-in-github-history/ |
