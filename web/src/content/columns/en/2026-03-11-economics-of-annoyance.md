---
title: "The Economics of Annoyance: If AI Eliminates Annoyance, Will All SaaS Die?"
creator: "Ryan"
date: "2026-03-12"
category: "Opinion"
tags: ["AI", "SaaS", "Economics of Annoyance", "Accountability", "Framework", "AI Defense Diamond"]
slug: "2026-03-11-economics-of-annoyance"
readTime: "12 min"
excerpt: "If AI agents don't feel annoyed, will every SaaS built on human annoyance disappear? Three fates revealed by Zylo's real transaction data and the ATM-teller paradox."
creatorImage: "/members/ryan.png"
---

## The Bottom Line First

**Zapier** (a no-code automation tool that connects apps) exists because "connecting things is annoying." **Calendly** (a meeting scheduling tool) exists because "scheduling meetings is annoying." **Monday.com** (a project management board) exists because "organizing projects is annoying."

If an AI agent reads your email and schedules meetings automatically, there's no reason to send a Calendly link. If AI connects apps directly, Zapier as a middleman becomes unnecessary. Is this intuition correct?

> Answer: Yes. But not everything dies. SaaS that "only eliminates annoyance" is already being cut first. Meanwhile, SaaS where "canceling means audit failures or regulatory violations" survives even under cost pressure. And there's a third scenario: not disappearing, but being demoted to "invisible infrastructure."

---

## 1. Convenience SaaS Really Does Get Cut First

### What We're Trying to Show

When "annoyance-solving SaaS" and "regulation-bound SaaS" face cost pressure, are they actually treated differently?

### Data

Zylo is a platform that tracks and manages enterprise SaaS subscriptions. Companies like Salesforce, Adobe, and DoorDash are its customers. It analyzes 40 million licenses and over $40 billion in actual SaaS purchase and cancellation records. This is real transaction data, not surveys.

From 2022 to 2024, as interest rate hikes pushed companies to cut SaaS spending, the magnitude of cuts varied dramatically by category **[1]** **[2]**:

| SaaS Category | License Reduction | Nature |
|---|---|---|
| Project management, team collaboration, online learning | **20-30% cut** | "Nice to have" convenience tools. High overlap |
| GRC (Governance/Risk/Compliance), vulnerability management | **No change** | Canceling creates audit/regulatory risk |

### What This Data Shows

This data shows category-level cuts within the same companies. Confounding variables like company size or industry are controlled.

When companies needed to cut costs, project management tools like **Asana** and **Monday.com** were cut by 20-30%, but compliance tools were left untouched. Companies actually do distinguish between "annoyance-solving tools" and "regulation-bound tools," and they cut the former first.

---

## 2. But Not Everything Dies

### What We're Trying to Show

Can SaaS that goes beyond mere "annoyance elimination" — SaaS tied to regulatory compliance, audit records, and legal liability — structurally survive even in the AI era?

### Decomposing "Accountability": 7 Layers

What exactly is "accountability"? When we decompose this word, AI replaceability diverges depending on which layer a SaaS occupies.

| Layer | Meaning | SaaS Example | AI Replacement |
|---|---|---|---|
| Layer 1: Economic | Reduces costs | Price comparison (Skyscanner) | Fully replaceable |
| Layer 2: Procedural | Manages processes | Scheduling (Calendly), automation (Zapier) | Replaceable |
| Layer 3: Cognitive | Handles complex judgments | Tax optimization, data analysis | Partially replaceable |
| Layer 4: Legal | Signs and bears legal liability | Veeva (FDA audits), Workday (payroll records) | Not until regulations change |
| Layer 5: Relational | Long-built contextual trust | A Salesforce instance used for 10 years | Hard to replace |
| Layer 6: Emotional | Provides reassurance in uncertainty | A human who answers "Is this decision right?" | Extremely difficult |
| Layer 7: Existential | Confirms life direction | Career coaching, life counseling | Irreplaceable |

Through this framework, the fate of SaaS becomes clear. Zapier (Layer 2), Calendly (Layer 2), and Skyscanner (Layer 1) sit in lower layers that AI can immediately replace. Veeva (Layer 4), ServiceNow (Layer 4), and Salesforce (Layers 4-5) occupy upper layers bound by legal liability and relational trust.

> Core Paradox — "The Accountability Dispersion Paradox": As AI perfectly automates Layers 1-3 (cost reduction, process management, complex judgment), the value of Layers 4-7 (legal signatures, relationships, emotions, existential confirmation) paradoxically increases. The more perfectly AI handles tax calculations, the more valuable "the accountant who has known me for 10 years and signs off" becomes.

### Applying to SaaS

Think about why you really pay an accountant. Because filing taxes is annoying? Partly, but there's a more fundamental reason.

When a tax audit comes, you can say "my accountant did it."

SaaS works the same way.

**Veeva Systems** — A CRM and content management platform for the pharmaceutical industry. Companies like Pfizer and Roche use it to manage sales records, clinical trial documents, and adverse drug event reports. The key point: under FDA 21 CFR Part 11 regulations, all data change histories must be preserved in a non-deletable manner. Cancel Veeva, and the audit trail breaks, creating problems during FDA inspections.

**Workday** — An enterprise HR/payroll/finance cloud platform. It processes employee payroll records and meets 7-year retention requirements. Cancel Workday, and the question of where to fulfill payroll record retention obligations becomes an immediate problem.

This is why GRC/compliance tool cuts were 0% in the Zylo data. Not because they're "good products," but because "canceling creates legal risk."

### What This Has to Do with AI Agents

No matter how smart AI agents get, AI has no legal personhood under current law. AI can process a tax filing, but it can't bear legal responsibility when an audit comes. You can't sue an AI. You can't insure an AI.

This isn't a technology limitation — it's an institutional one. If institutions change, this moat can crumble, but changing global legal systems takes more than a decade.

> Summary: AI replacing "functions" and AI replacing "accountability" are different dimensions. Functions are replaceable today, but accountability can't be replaced until institutions change. This is the structural reason regulation-bound SaaS survives.

---

## 3. Historical Precedent: Why ATMs Didn't Kill Bank Tellers

### What We're Trying to Show

Has the intuition that "automating lower functions kills everything" always been historically correct? Before predicting SaaS's future, we examine a structurally similar historical case.

### Data

From the mid-1990s, ATMs were deployed en masse across the United States. With machines handling cash withdrawals and deposits, mass layoffs of bank tellers were expected. In 2011, President Obama even cited ATMs as an example of technological unemployment. James Bessen (Boston University Law professor researching the relationship between technology and labor) collected the actual data, and found the opposite **[5]**:

| Metric | Figure |
|---|---|
| Tellers needed per branch after ATM adoption | **20 → 13** (1988-2004) |
| Urban bank branches in same period | **43% increase** |
| Total US bank teller employment (1980s-2010) | **~500,000 → ~600,000** |
| Role transformation | Cash handling → relationship banking, financial product sales |

When ATMs automated cash handling (lower functions), branch operating costs dropped and banks opened more branches. Tellers' roles shifted from cash processing to customer relationship management and financial product sales, and total employment actually increased.

Through the 7-layer model: ATMs automated Layers 1-2 (economic/procedural), and tellers' roles migrated to Layer 5 (relational trust). This is the "Accountability Dispersion Paradox" working in reality.

### Applying to SaaS

If AI agents automate **Salesforce**'s lower functions — data entry, report generation, email logging — Salesforce doesn't die but transforms its role. From "data entry tool" to "audit record repository for AI-generated data." When lower functions are automated, the whole doesn't die — the role transforms.

### But — The iPhone Did What ATMs Couldn't

This story has a second half. ATMs automated "some tasks" of bank tellers, and there were decades to adapt. But after 2010, as smartphones and mobile banking spread, teller employment began declining sharply. The iPhone accomplished what ATMs could not **[6]**.

According to MIT Sloan research, when AI automates only "some tasks" within a job, employment can be maintained or increase. But when it automates "most tasks," employment decreases by about 14% at the firm level **[8]**.

The lesson for SaaS: At the stage where AI replaces "some functions" of SaaS, SaaS can survive through role transformation. But when the stage comes where AI replaces "nearly all functions," there's no room left for transformation. We're currently closer to the former. When the latter arrives is the real question.

---

## 4. The Third Possibility: Neither Death Nor Survival — "Submersion"

### What We're Trying to Show

Beyond the "dies" vs. "survives" dichotomy, there's a third scenario. SaaS disappears from users' eyes but continues running as infrastructure behind AI agents.

### Structural Analogy

**Stripe** — An online payment infrastructure company. When you press a payment button on a shopping site or app, Stripe communicates with card companies and banks to process the payment behind the scenes. Almost no consumer knows Stripe is running when they pay with their smartphone. But as of 2023, it processes over $1 trillion in payments annually. Consumer awareness is near zero, but it's going strong as infrastructure.

This pattern repeats in technology history. No user is conscious of DNS (the system converting domain names to IP addresses), but every web request passes through DNS. No layperson knows SMTP (email transfer protocol), but every email is sent via SMTP. With each new technology layer, the previous layer is demoted to "invisible infrastructure."

In the AI agent era, SaaS may follow the same path. Instead of users directly operating Zapier, AI agents call Zapier's API behind the scenes. Zapier hasn't disappeared — it's just become invisible.

**Caveat:** This is a prediction. Stripe and DNS were "built as infrastructure from the start," not cases of "consumer tools transitioning to infrastructure." Whether Zapier will actually succeed in this transition, and whether it can maintain pricing power (margins) after the transition, is unverified. This is a structural analogy, not proof.

### Who Submerges First? — The AI Premium Paradox

Here's a counterintuitive paradox.

The better a SaaS connects with AI, the sooner it submerges or perishes. The more Zapier integrates AI features (Zapier Central), opens its APIs, and connects seamlessly with AI agents — paradoxically, the easier it becomes for AI agents to do the same thing without Zapier. Being well-connected to AI also means AI can absorb those functions easily.

Conversely, regulatory systems like Veeva (pharma CRM) are inaccessible to AI agents entirely. FDA certification, closed APIs, and industry-specific data standards create walls. Because they can't connect to AI, they submerge and perish slowly.

Connecting to the 7-layer model: Layer 1-3 (economic/procedural/cognitive) SaaS connects easily with AI, so it submerges or perishes quickly. Layer 4-7 (legal/relational/emotional/existential) SaaS is institutionally and technically difficult to connect with AI, so it survives longer. AI connectivity and AI replacement risk are two sides of the same variable.

**Note:** This is logical inference unverified by data. Post-Zapier Central revenue changes are not public, and there is no data proving the causal relationship that "SaaS integrating AI well gets replaced first." However, in the Zylo data, "AI being the fastest-growing app category" occurring simultaneously with "convenience tools being cut most" is consistent with this direction.

### Submersion Isn't Forever — The Mechanism from Submersion to Extinction

Submersion may not be a final state. Looking at actual technological changes happening in the AI industry now, we can see a stage beyond submersion.

**Stage 1 — Submersion:** AI "calls" SaaS. Current AI agents access external services using MCP (Model Context Protocol), a standard. Simply put, MCP is "a pathway for AI to invoke external app functions." When AI connects to Google Calendar's MCP server, it queries schedules and books meetings on behalf of users. At this stage, SaaS is alive — AI is calling it behind the scenes. It's just invisible to users. This is submersion.

**Stage 2 — Extinction:** AI acts "directly" without SaaS. But when AI acquires "skills," the situation changes. A skill is AI's ability to perform specific tasks directly through code. For example, if AI has a "create Word document skill," it doesn't need to call Google Docs — it runs code to create a .docx file directly. Instead of calling Zapier to connect apps, it writes a Python script to connect APIs directly. The SaaS middleman itself becomes unnecessary.

This report itself is that example. This document was created by AI directly executing a docx library, without going through a SaaS like Google Docs. The mechanism of "document creation SaaS" extinction is already at work in this conversation.

> Key insight: MCP (AI calling SaaS) is the technical implementation of submersion, and Skill (AI executing directly) is the technical implementation of extinction. Layer 1-3 SaaS can be replaced by skills, so it can progress from submersion to extinction. Layer 4-7 SaaS cannot have FDA-certified data or legal signatures created by AI through code, so it stays at the MCP calling (submersion) stage for a long time.

---

## Conclusion: Three Fates, and the Conditions for Survival

### Three Fates

1. **Dies** — SaaS where annoyance elimination is everything. Asana (project management), Calendly (scheduling), Skyscanner (price comparison). When AI agents do the same thing directly, the reason for existence vanishes. Zylo data shows 20-30% license cuts already underway.

2. **Submerges** — Disappears from users' eyes but continues running in AI's backend. MCP (AI calling SaaS) is the technical implementation of submersion. However, as Skills (AI executing directly) develop, submersion can progress to extinction.

3. **Survives** — SaaS where canceling violates laws, is physically irreplaceable, or whose network cannot be reproduced. The 0% cut rate for GRC/compliance tools is empirical evidence for this category.

Looking deeper into why the "survives" category survives, three defensive walls emerge.

### Three Walls Stronger Than Concrete

**Wall 1: Physical + Digital Combined Moat (The World of Bits + The World of Atoms)**

Physical assets alone aren't enough, and digital alone isn't either. When combined, the moat becomes strongest. Coupang's logistics centers (physical) combined with delivery optimization algorithms (digital) is a prime example. AI can replicate algorithms, but it can't build logistics centers in prime metropolitan locations overnight. AI can't code concrete.

**Wall 2: Network Density**

A network of tens of millions of interconnected people cannot be created from scratch by AI. KakaoTalk's moat isn't code — it's the fact that "most Koreans are already there." This is neither a "people" moat nor a "concrete" moat, but a third type: density of relationships. A variable that couldn't even be classified by the original 2×2 matrix. The world's largest market-cap platforms (Kakao, Naver, WeChat, Meta) belong here.

**Wall 3: Presence and Care**

Services requiring physical "being there" cannot have their core replaced by AI. Caring for aging parents, raising children, physically touching patients. When Japan deployed robots, productivity improved but labor shortages remained unsolved (NBER 2024). Robots can substitute for monitoring, but they can't substitute for emotional connection. In an aging society, this becomes the largest market.

### Assessment Tool: AI Defense Diamond

Any business can be evaluated for AI-era defensibility along four axes:

- **Accountability Density** — How concentrated are legal, emotional, and existential accountabilities? (How many layers of the 7-layer model does it occupy?)
- **Physical Asset Intensity** — Are there physical infrastructures that AI cannot code?
- **Network Density** — How complex are multilateral interconnections? Can they be built from scratch?
- **Regulatory Complexity** — Does canceling violate laws? Is certification required to enter?

Score zero on all four axes, and you die or submerge. Overlap on two or three, and you're solid. Have all four, and you're strongest in the AI era.

---

### 🔗 Sources

| # | Source | Confidence |
|---|------|--------|
| 1 | [Zylo 2025 SaaS Management Index](https://zylo.com/reports/2025-saas-management-index/) — 40M licenses, $40B+ spend | 🟢 Observed |
| 2 | [SaaSletter — Zylo Data Analysis](https://www.saasletter.com/p/zylo-saas-management-index-2025) — Category-level cuts | 🟢 Observed |
| 3 | [ServiceNow Q4 2023 Earnings Release (SEC Filing)](https://www.sec.gov/Archives/edgar/data/0001373715/000137371524000009/erq4fy23.htm) — 99% renewal rate | 🟢 Observed |
| 4 | [Asana Q4 FY2025 Earnings Release (SEC Filing)](https://www.sec.gov/Archives/edgar/data/1477720/000147772025000033/asana8-kex991q4fy25.htm) — NRR 96% | 🟢 Observed |
| 5 | [Bessen, J. (2015). "Toil and Technology." IMF F&D](https://www.imf.org/external/pubs/ft/fandd/2015/03/bessen.htm) — ATM/teller data | 🟢 Observed |
| 6 | [David Oks (2026). "Why the ATM didn't kill bank teller jobs, but the iPhone did"](https://davidoks.blog/p/why-the-atm-didnt-kill-bank-teller) | 🟢 Observed |
| 7 | [AEI (2022). "What ATMs and Bank Tellers Reveal About the Rise of Robots"](https://www.aei.org/economics/what-atms-bank-tellers-rise-robots-and-jobs/) | 🟢 Observed |
| 8 | [CCIA (2026). "What Bank Tellers and Radiologists Can Tell Us About AI"](https://www.ccianet.org/articles/what-bank-tellers-and-radiologists-can-tell-us-about-our-job-security-in-the-ai-era/) — MIT Sloan research | 🟢 Observed |

**Note:** The 7-Layer Accountability Model, SaaS Submersion Theory, AI Defense Diamond, Accountability Dispersion Paradox, and AI Premium Paradox are original frameworks proposed in this column.
