---
title: "Structure Built by Law and Money, Structure Changed by AI — The Unbundling of Automotive"
creator: "Jay"
creatorImage: "/members/jay.png"
date: 2026-03-27
category: "Industry Analysis"
tags: ["automotive", "SDV", "unbundling", "AI", "middleware", "regulation", "supply-chain", "OEM", "Tier-1"]
slug: "2026-03-27-automotive-unbundling"
readTime: "25 min"
excerpt: "When a recall happens, who pays? — This question determines every structure in the automotive industry. Why Evans' bundle/unbundle framework is only half-right for automotive, and how AI is changing this structure."
lang: "en"
authorType: "creator"
---

## 1. One Model, Three Recalls, Three Completely Different Teams

In March 2026, [three recalls hit the Hyundai Palisade simultaneously](https://www.hyundainews.com/releases/4724).

Power seat defects affecting [69,000 units in US/Canada + 58,000 in Korea](https://www.edmunds.com/car-news/hyundai-palisade-kia-telluride-rear-seat-recall.html). [Instrument cluster display software bug](https://www.nhtsa.gov/recalls). [Seatbelt buckle defects across 568,000 units](https://www.nhtsa.gov/vehicle/2023/HYUNDAI/PALISADE). One model, three recalls, three completely different teams.

The seat team owns the seat. The electrical team owns the instrument cluster. The restraint team owns the seatbelt. Each has its own Tier-1 supplier, warranty reserve, and Type Approval documentation.

The power seat recall is a traditional component defect. The seat team handles it. But the instrument cluster recall is different. This is a software bug, fixable via OTA, incompatible with the "component replacement" paradigm.

The deeper question: when dozens of ECUs are connected in a vehicle, and you OTA-update one ECU's software, what happens to the others? In today's component-centric silos, each ECU team only validates their own ECU. **Cross-ECU interaction validation is a structural blind spot.** The brake team owns the brake ECU's warranty, but whose warranty covers the impact of other domain updates on the brake ECU?

Having spent years in this industry — from early PoCs with OEMs through production hardening, post-SOP rollouts, and live OTA operations — everyone in automotive asks this question. But "so whose responsibility is it?" is the answer no one can say to each other's face. The software we build handles data across the entire vehicle, crossing component boundaries. But the supply chain we must enter is carved into component-sized pieces. **Technology is horizontal; structure is vertical.**

One disclosure upfront. I work within this structure, and this analysis is written from that position. The conclusion that "whoever connects silos captures value" may be an analysis favorable to the position I occupy. I'm aware of this.

---

## 2. Bundle/Unbundle, and Automotive's Uniqueness

[Benedict Evans](https://www.ben-evans.com/) is an independent analyst who has tracked structural shifts in tech for 20 years. He spent six years as a partner at [Andreessen Horowitz (a16z)](https://a16z.com/author/benedict-evans/), and now publishes biannual macro trend presentations.

In [The Great Unbundling (2020)](https://www.ben-evans.com/presentations), his pattern is simple: **Every time the distribution mechanism changes, existing bundles unbundle, and new winners re-bundle along different axes.** Cable TV bundled channels. The internet unbundled them. Netflix re-bundled. Banks bundled finance. Fintech unbundled it. Super-apps are re-bundling.

Evans followed with [The New Gatekeepers (2022)](https://www.ben-evans.com/presentations) on who forms new monopolies post-unbundling, [Unbundling AI (2023)](https://www.ben-evans.com/benedictevans/2023/10/5/unbundling-ai) predicting LLMs would diverge from general tools like Excel into specialized ones, and [AI Eats the World (2025)](https://www.ben-evans.com/presentations) analyzing how "AI startups are unbundling Google, Excel, email, Oracle... and ChatGPT."

In Korea, [Roh Jung-seok](https://byline.network/2025/08/2-ai/) — serial entrepreneur who sold Tatter&Company to Google in Korea's first-ever Google acquisition — applied this framework to AI-era business on his podcast [AI Frontier EP91 (2026.3.21)](https://aifrontier.kr/ko/episodes/ep91/) at [B-Factory](https://www.bfactory.co). Two core theses:

1. **"All problems converge to computational search"** — Problems humans solved directly, AI solves through computational search across solution spaces. The key is "owning an environment that can convert non-verifiable to verifiable."
2. **"Not 1/10x efficiency but 10x new business"** — Most AI Transformation focuses on cutting costs from 100 to 10. The real opportunity is creating 900 of new value.

The same is happening in automotive. **But applying Evans' framework directly to automotive gets you only halfway.** Cable TV, banking, and media bundles were built on convenience and distribution control. When the internet emerged as a new distribution mechanism, they unbundled relatively quickly — no regulatory permits or safety certifications required.

Automotive bundles are different. **They're designed by law, money, and politics.** Unbundling media needed one streaming platform. Unbundling automotive's component-centric structure requires moving product liability law, type approval systems, warranty accounting standards, and labor union negotiations simultaneously. Evans' pattern — "when distribution changes, bundles unbundle" — works in automotive, but **unbundling speed is determined by law and institutions, not technology.** Automotive unbundling will likely be a 15-20 year process, not 5 years like media.

The unbundling path also differs. In media, content separated from distribution. In automotive, software is separating from hardware, but safety-critical SW remains legally tied to physical component Type Approval, making complete separation legally impossible. **Unbundling happens, but "complete unbundling" has a legal ceiling** — this is where Evans' framework needs modification for automotive.

---

## 3. How and Why the Tier Structure Became What It Is

The automotive supply chain looks simple on the surface:

**Tier-3 (Materials)** → **Tier-2 (Parts)** → **Tier-1 (Systems)** → **OEM (Brand)**

This structure didn't start this way. Six forces shaped it over a century.

### It Started with Vertical Integration's Failure

Henry Ford's [River Rouge plant (1928)](https://www.thehenryford.org/visit/ford-rouge-factory-tour/) was vertical integration taken to the extreme. Across 2,000 acres, iron ore, rubber, and coal went in; finished cars came out 41 hours later. Ford owned coal mines in Kentucky, iron mines in Michigan, rubber plantations in Brazil (Fordlandia), a fleet of ships, and railroads. The logic: control everything, control costs.

Alfred Sloan's GM took the opposite path. Specialized outside firms could achieve greater scale and lower costs. Then the [Depression proved Sloan right](https://www.cambridge.org/core/journals/journal-of-economic-history/article/abs/explaining-vertical-integration-lessons-from-the-american-automobile-industry/9F45384CE2B021DFCB68579C03B9DC3E). Ford's massive fixed-cost structure couldn't absorb the demand shock; GM's outsourcing-based flexibility determined survival. The entire industry tilted toward supplier specialization.

### Toyota Cemented the Hierarchy

Through the 1950s-80s, while Western OEMs outsourced components, Japan built a different structure. Post-war dissolution of the zaibatsu conglomerates gave rise to [keiretsu (系列)](https://en.wikipedia.org/wiki/Keiretsu) — cross-held equity, long-term trading relationships, networks centered on a main bank — providing the template for tiered supply pyramids.

[Taiichi Ohno](https://en.wikipedia.org/wiki/Taiichi_Ohno) and Eiji Toyoda developed the Toyota Production System (TPS) between 1948-1975, making Just-in-Time possible on the back of these long-term relationships. MIT's [International Motor Vehicle Program (IMVP)](https://dspace.mit.edu/handle/1721.1/1782) — a 14-country, $5M, 5-year study — proved this system's superiority. When published as Womack, Jones & Roos' *[The Machine That Changed the World](https://www.lean.org/store/book/the-machine-that-changed-the-world/) (1990)*, "lean production" went global. Western OEMs restructured their supplier hierarchies along the Toyota model.

### Law Attached Liability to the Hierarchy

Once the structure existed, law locked liability into it:

- **[MacPherson v. Buick Motor Co. (1916)](https://law.justia.com/cases/new-york/court-of-appeals/1916/217-n-y-382-1916.html)** — Consumers could sue manufacturers they hadn't directly purchased from. OEMs now had legal grounds to police quality across the entire supply chain.
- **[Greenman v. Yuba Power Products (1963)](https://supreme.justia.com/cases/california/1963/)** — Established strict product liability in the US. Nearly every state adopted it within 40 years.
- **[EU Product Liability Directive 85/374/EEC (1985)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:31985L0374)** — Introduced strict liability across Europe. Critically: when the producer cannot be identified, each supplier in the chain is treated as the producer.

This legal evolution created a liability cascade down the Tier structure. OEM = vehicle brand = defendant. To manage this risk, OEMs form contractual indemnification chains with Tier-1s, who repeat the pattern with Tier-2s. **Tier numbers don't indicate technical depth — they indicate distance from liability.** Org charts follow the BOM (Bill of Materials), and Type Approval reinforces the same structure — UNECE R13H (braking), R48 (lighting), R155 (cybersecurity): one regulation, one responsible team.

### Standards and Regulations Hardened the Structure into Audit Systems

[UNECE WP.29](https://unece.org/wp29-introduction) (World Forum for Harmonization of Vehicle Regulations) makes the OEM the type approval certificate holder, but compliance evidence cascades down the supply chain. Quality standards moved in the same direction. Starting with [QS-9000](https://www.omnex.com/iatf-16949-automotive-qms-history) created by the Big Three in 1994, through the harmonized ISO/TS 16949 (1999) merging US, German, French, and Italian standards, to today's IATF 16949 (2016) — each standard mandated supplier management requirements, institutionalizing the tier hierarchy as an auditable process.

### Capital Efficiency Made It Rational

No OEM can be world-class at stamping, electronics, glass, rubber, and interior trim simultaneously. Specialized suppliers serve multiple OEMs, achieving economies of scale no single OEM could match alone. Bosch supplies brake systems to nearly every OEM worldwide; Continental delivers ECUs to dozens.

**In summary**: vertical integration's failure (Ford) → specialization's victory (Sloan/Toyota) → legal liability attachment (PLD) → regulatory/standards institutionalization (UNECE, IATF) → capital efficiency rationalization. Five layers stacked on top of each other to produce today's Tier structure.

### Why Tesla Could Ignore All This

Tesla [vertically integrates roughly 80% of its supply chain](https://supplychain360.io/teslas-vertical-integration-revolutionizes-supply-chains/). Battery cells (4680, dry electrode process), compute chips (FSD HW4, AI6), powertrain, full-stack software, charging infrastructure, even insurance. It's the OEM, the Tier-1, and the service provider all at once.

This was possible because **there was no legacy.** No 5-7 year contracts with incumbent Tier-1s. No unions resisting layoffs (UAW, IG Metall). No sunk capital in ICE powertrain facilities. Starting from a blank sheet, Tesla could bypass a century of structural inertia and choose vertical integration.

But vertical integration has its price. In August 2025, Tesla [scrapped its Dojo supercomputer project](https://digitalhabitats.global/blogs/tesla-1/exclusive-tesla-kills-dojo-for-ai6-here-s-why) after four years of in-house development — custom chips (D1), custom training tiles — because even for Tesla, cutting-edge semiconductor development proved too capital-intensive. Glass, tires, and semiconductor foundry services still come from outside.

Traditional OEMs can't replicate Tesla's approach not because they lack technical capability, but because of **structural lock-in**. Decades of Tier-1 contracts, sunk NRE costs, union agreements, dual capital burden (ICE + EV in parallel), and 15-20 year aftermarket obligations stack on top of each other. **For most OEMs, the realistic path isn't vertical integration — it's redesigning the software layer within the existing Tier structure.** And in that redesign, they collide head-on with the five pillars.

When a software company enters this chain, the first decision isn't technical architecture. It's **who bears unlimited liability (product liability).** Supplying directly to OEMs brings unlimited liability. A startup with $10M annual revenue entering a $4.8B recall liability chain faces existential risk. So most automotive software companies place a large corporation as a legal buffer in between. Revenue structure itself is built on this legal architecture.

Same for me. Technically, I'm involved in OEM architecture. Contractually, I'm connected through large partners. **Technical position and legal position don't match** — this is automotive SW industry reality.

---

## 4. Five Pillars Supporting the Silo

OEM component-centric org structure isn't just inertia. Five structural pillars make it a rational equilibrium.

### Pillar 1: Capital Allocation — Vehicle Program Is the Unit of Money

Vehicle programs (e.g., Tucson NX4, Golf MQB-evo) involve $1-3B development investment and $2-5B production facility investment. When a "shared software platform" crosses multiple programs, a fundamental question arises: **Which program's budget pays for this?**

VW's CARIAD is a [€50B lesson](https://insideevs.com/news/753673/vw-group-cariad-billions-losses-2024/). Internal transfer pricing never aligned. VW, Audi, Porsche, Škoda brands all asked "why should we subsidize other brands' SW costs," and no answer emerged. The CEO changed twice, strategic vehicle Trinity delayed 2+ years. VW ultimately [invested $5B in Rivian](https://www.volkswagen-group.com/en/press-releases/faster-leaner-more-efficient-rivian-and-volkswagen-group-announce-the-launch-of-their-joint-venture-18828) to buy from outside — bypassing 5 years of internal failure through acquisition. Every multi-brand OEM group — Hyundai-Kia, Toyota, Stellantis (14 brands) — faces identical structural questions.

### Pillar 2: Warranty — Change Itself Is Financial Risk

[Ford's annual warranty cost is ~$4.8B](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000037996&type=10-K) (2023 10-K filing), $2,800 per vehicle. Hyundai-Kia [set aside $3.9B in one quarter for Theta II engine recalls in 2023](https://dart.fss.or.kr/). Warranty is the most unpredictable line item in OEM financials; one major recall can flip quarterly results.

This cost is reserved by component category based on historical claim rates. The incentive structure this creates is clear: **Never change proven designs.** When SW teams propose changing regenerative braking logic via OTA, the brake team's first reaction is "don't experiment with my warranty reserve." Reinsurance structure pushes the same direction — when vehicle architecture changes, historical failure rate data becomes invalid, premiums explode or insurers refuse coverage. **Hidden cost of architecture transition lives in reinsurance premiums.**

Back to Palisade: power seat and seatbelt recalls deduct from different component teams' reserves. But an OTA-fixed instrument cluster SW defect? Which team's reserve does it deduct from? SW updates affecting multiple components don't fit existing warranty accounting models.

### Pillar 3: Supply Contracts — 5-7 Year Structural Inertia

Tier-1 supply contracts consist of NRE (non-recurring engineering, $5-50M) + per-unit price (5-7 year lock, 1-3% annual cost reduction). Swapping suppliers mid-program means: NRE sunk cost write-off, new NRE payment, 6-18 month revalidation, Type Approval resubmission, warranty liability transfer negotiation, volume shortfall penalties (tens of millions). The brake team is essentially married to Continental — team processes, test protocols, milestone reviews all optimized for that supplier.

### Pillar 4: Governance — Corporate Boundaries Are Org Boundaries

Large OEM groups comprise multiple public/private legal entities. Hyundai Motor Group alone: Hyundai Motor (public), Kia (public, 34% owned by Hyundai), Hyundai Mobis (public, 21% owned by Kia), Hyundai Autoever (public, 50% Hyundai), 42dot (private, 100% Hyundai) — each a separate legal entity. Merging Mobis' SW team with Hyundai's electronics team requires related-party transaction review, minority shareholder protection, Fair Trade Commission review. At VW, 50% of the supervisory board are labor representatives from IG Metall, so org restructuring itself becomes labor union negotiation.

Acquiring startups doesn't make integration easy. Startup 2-week sprints and OEM 18-month gate reviews have physically incompatible cadences, and you can't force alignment across legal entities. Toyota's Woven Planet, GM's Cruise, VW's CARIAD — all hit the same integration challenge.

### Pillar 5: Regulatory Fragmentation by Market

The same ESC system faces different test procedures in US (FMVSS 126) vs EU (UNECE R140). Data regulation is worse. China: vehicle data can't leave the country. EU: from Sep 2025, owners can demand data sharing with third parties. US: no federal vehicle data law. Korea: prefers on-prem processing. The same OEM must comply with 5 different data policies across 5 markets.

What I experience at work is this: **Silos aren't the product of incompetence — they're the equilibrium point these five pillars create.** So approaches claiming "we'll break the silos" fail.

---

## 5. Three Forces Shake the Bundle

The five pillars still stand. But three forces shake the bundle resting on them.

### Unbundling 1: Tier-1 Black Box

Traditionally, Tier-1s bundled HW + SW + diagnostics + data into one ECU delivery. OEMs couldn't see inside, didn't need to. SDV transition unbundles this — if OEMs want integrated SW management across the vehicle, they need access to individual ECU SW. The equation "use this chip = use this SW" is breaking.

But for Tier-1s, the black box is the margin source. Separating SW makes HW a commodity, shifting margin to SW platforms. Bosch, Continental, Denso invest in proprietary SW platforms (Eclipse SDV, EB corbos) to internalize this margin shift.

### Unbundling 2: OEM Data Monopoly

OEMs have monopolized their vehicle data. Only dealers access diagnostic data; independent shops see limited OBD-II data. [EU Data Act (effective Sep 2025)](https://eur-lex.europa.eu/eli/reg/2023/2854) legally unbundles this monopoly. Owners can share data with third parties on demand. EU plans separate regulation for vehicle data intermediation platforms ("neutral servers") in 2026. Right to Repair legislation moves the same direction. The $300B global independent repair market opens to digital diagnostic tools.

### Unbundling 3: Geopolitics Fragments Hardware

US-China chip export controls (2022, 2023, 2024 — three rounds) drive Chinese OEMs away from NVIDIA/Qualcomm. They're moving to domestic chips: Horizon Robotics (2024 Hong Kong IPO, $696M raised), Huawei HiSilicon, Black Sesame. Non-Chinese OEMs may need domestic chips for China market vehicles too.

Result: **A world where the same OEM uses different chips by market**. Three chip types doesn't mean 3x middleware needed — it means one HW-agnostic middleware becomes 3x more valuable.

Data sovereignty fragmentation follows the same structure. China (no overseas transfer), EU (sharing mandatory), US (no federal regulation), Korea (PIPA), India (DPDPA in progress) — five policy environments must convert to config in one data infrastructure. 2025's tariff environment rapidly shifts OEM production geography, and **when production geography changes, data policy changes too.**

A counterpoint must be addressed here. **Tesla and Chinese OEMs never needed to unbundle silos.** Tesla started vertically integrated — its own chips (FSD Computer), its own software, its own OTA, fleet data loop already closed. BYD completed vertical integration from batteries to semiconductors, and Xiaomi transplanted its smartphone ecosystem directly into vehicles. For them, silos aren't "structures to dismantle" but "structures that never existed."

This clarifies the limits of this essay's framework. **This analysis is about the transition process of traditional OEMs with existing silos — Hyundai, VW, Toyota, Stellantis.** Evans' unbundle/re-bundle doesn't apply to companies like Tesla/BYD that started with different bundles. They're not "re-bundling after unbundling" but "different bundling from the start." The real threat to traditional OEMs isn't the difficulty of unbundling silos — it's that **competitors born without silos are already running closed loops.**

Automotive's "distribution mechanism" change ultimately is this: **edge-to-cloud data pipeline** is the new distribution mechanism, and on this mechanism old bundles unbundle and new bundles form.

---

## 6. Re-bundling — The New Bundle's Axis

Unbundled pieces re-bundle along a different axis. But to understand the mechanics of re-bundling, we first need to clarify what **"the moment a loop closes"** means.

### Closed Loops Create Bundles

In March 2026, Andrej Karpathy released [Autoresearch](https://github.com/karpathy/autoresearch). The concept is simple: give an AI agent a small LLM training codebase and let it experiment autonomously overnight. It modifies the code, trains for 5 minutes, checks if the result improved, keeps or discards, and repeats. The human just reviews the experiment log in the morning. The key is `program.md` — the researcher doesn't touch the code directly but only edits a Markdown file that sets the AI agent's research direction. Karpathy's phrase: **"you are programming the program."**

The real significance of this project isn't the technology but the structure. **The moment evaluation (eval) can be automated, the loop closes, and closed loops run without humans.** `program.md → code modification → training → eval → keep/discard → repeat`. No human intervention needed at each step. Karpathy's darkly humorous preface compresses this: *"Research is now entirely the domain of autonomous swarms of AI agents... The agents claim the codebase is in its 10,205th generation, but the 'code' is now a self-modifying binary that has grown beyond human comprehension."*

Applied to automotive: in the **Collect → Analyze → Deploy → Monitor** loop, the moment "was this analysis correct?" can be automatically evaluated, this loop also closes. Vehicles send data, AI diagnoses, results deploy via OTA, post-deployment vehicle behavior changes are measured and fed back to update models. Just as `program.md` sets the research direction in Autoresearch, in automotive **safety policies and regulatory requirements serve as the loop's `program.md`** — the loop runs autonomously, but humans define which direction it runs.

**Re-bundling happens where loops close.** The reason is simple: a company providing only one piece of a closed loop becomes dependent on whoever owns the entire loop. If Bosch only handles "Collect," Continental only "Analyze," and a startup only "Deploy" — the integrator who closes the loop captures the value. In Evans' language: **the closed loop itself is the new bundle**, and this bundle's switching cost comes from the fact that breaking one piece breaks everything.

### Old Axis vs New Axis

The old bundle's axis was **component**. Brake ECU = HW + SW + diagnostics + data + liability → one team, one supplier. Everything integrated within the component, disconnected between components.

The new bundle's axis is the **data flow loop**:

**Collect** → **Store** → **Analyze** → **Deploy** → **Monitor** → *(back to Collect)*

This flow crosses components, crosses programs, crosses markets. Buy individual stages separately: they're tools. Bundle into a loop: it's a **self-reinforcing system** — just as Autoresearch finds better models overnight, a closed vehicle data loop autonomously produces better diagnostics, predictions, and deployments.

### What Frontier Models Can and Cannot Eat

Where in this loop do Frontier Models (GPT-5, Claude, Gemini) sit?

**What Frontier eats — commoditization of "Analyze."** With general reasoning capabilities, they generate log interpretation, anomaly detection, and natural language diagnostic reports. If an OEM can build a diagnostic system with "GPT-5 API + its own vehicle data," the rationale for specialized diagnostic AI platforms is shaken. In Karpathy's framework: Frontier Models **generalize the eval function**. Evaluation logic that had to be built per domain is now handled by a general model directly judging "is this result normal?"

**What Frontier cannot eat — the loop's physical touchpoints.** Three areas. First, **Collect**: extracting real-time data from in-vehicle ECUs requires knowledge of CAN/Ethernet protocols, AUTOSAR interfaces, and OEM-specific proprietary signal definitions. API calls won't work. Second, **Deploy**: OTA updates require UNECE R156 certification, rollback mechanisms, and per-ECU compatibility verification. "Uploading a model to a server" and "uploading to an ASIL-D certified ECU" are entirely different worlds. Third, **Monitor**: tracking post-deployment vehicle behavior changes in real-time requires fleet-scale edge infrastructure. Cloud APIs can't cover this.

**Structural implication**: Frontier Models commoditize the loop's **brain (analysis)**, but cannot commoditize the loop's **hands and feet (collection, deployment, monitoring)** due to physical and legal barriers. The analysis layer faces price competition → margin compression. Physical touchpoints + certification + fleet infrastructure form the real moat. Companies whose only strength is "good analysis" are most at risk, while **companies controlling physical touchpoints while plugging Frontier as the analysis engine** are best positioned.

### Tier-0.5's Real Battleground

In PC industry, Microsoft Windows sat as a horizontal layer above Dell/HP/Lenovo OEMs and below Intel components. The same position is forming in automotive — industry term "Tier-0.5". NVIDIA DRIVE, Qualcomm Digital Chassis, Google Android Automotive target this seat.

But there's a critical difference. Microsoft bore no product liability when Windows bugs injured someone. In automotive, if a Tier-0.5 platform bug causes an accident, it enters the liability chain. **Technically a platform, legally a supplier.** So real-world Tier-0.5s place large partners as legal buffers in between, technically defining architecture while contractually remaining lower-tier.

Tier-0.5's real battleground isn't "who has the smarter AI." It's **"who controls more of the loop's physical touchpoints while plugging Frontier Models as analysis engines to complete the closed loop."** Just as whoever writes `program.md` in Autoresearch determines the research direction, in automotive **whoever defines the loop's `program.md` — safety policies, certification requirements, fleet operation rules — determines the winner of re-bundling.**

---

## 7. AI's New Game — And the Middleware Trap

### The Fate of Middleware Companies

Every automotive SW company claims "AI platform," but history is cold:

| Era | Middleware | Outcome | Lesson |
|-----|-----------|---------|--------|
| Mobile OS | Symbian | Died with Nokia | Single OEM dependency = mutual destruction |
| J2EE | BEA WebLogic | Commoditized by open source | Pure middleware faces zero-price competition |
| API middleware | MuleSoft | $6.5B Salesforce acquisition | Can't stay independent without owning data |
| Virtualization | VMware | $61B Broadcom acquisition | Only category founders stay independent |
| Automotive RTOS | BlackBerry QNX | 250M deployments, ~$220M revenue | Dominate market, still $1-5 per unit |
| Automotive data | Otonomo, Wejo | Bankruptcy/absorbed | Data marketplace model failed |

**Lesson is clear**: pure middleware gets squeezed from below (chip vendors) upward and above (OEM/cloud) downward. Surviving middleware either (a) owns data, (b) raises switching costs via safety certification, (c) locks to chips, or (d) gets acquired.

### Frontier Labs Enter — Value Extraction Without Legal Risk

Chapter 6 analyzed how Frontier Models commoditize the analysis layer. Here we examine the specific dynamics. [OpenAI + Applied Intuition](https://www.appliedintuition.com/news/applied-intuition-openai), [Google + Waymo/Android Automotive](https://waymo.com/blog/2026/02/the-waymo-world-model-a-new-frontier-for-autonomous-driving-simulation/), [Microsoft Azure SDV](https://www.microsoft.com/en-us/industry/blog/manufacturing-and-mobility/2026/01/07/ces-2026-powering-the-next-frontier-in-automotive/) — their commonality is **they don't directly enter Tier**. They extract value from cloud/API layers bearing no product liability. The most sophisticated form of "legal risk design" discussed in Chapter 3.

### Three Survival Strategies for Mobility Startups

Frontier Labs descend from above, chip vendors ascend from below, OEMs attempt internalization from the side. Amid this squeeze, three survival strategies diverge:

**Escape via scale**: [Applied Intuition](https://www.appliedintuition.com/blog/series-f) — $600M Series F, deals with 18 of top 20 OEMs. Expands from simulation to Vehicle OS, building irreplaceable depth.

**Attach to giants**: [Apex.AI](https://www.apex.ai/press-release/apex.ai-secures-strategic-investment-from-lg-electronics) — LG Electronics strategic investment for Korean ecosystem entry. ASIL-D certified middleware maximizes switching cost.

**Vertical integration breakthrough**: [Aurora Innovation](https://ir.aurora.tech/) — directly operates autonomous trucks. 2026 target: hundreds of driverless trucks, $80M run rate. Not selling middleware; making revenue on top of middleware.

**And the disappeared**: Argo AI ($3.6B invested, shut down 2022), TuSimple (2023 US operations closed), Otonomo/Wejo (data marketplace failures). Commonality: only middleware, no data ownership, no safety certification, no customer diversification.

### So What's the Real Moat?

As discussed in Chapter 6, applying "an environment that converts non-verifiable to verifiable" to automotive: **owning the data loop crossing component silos**. The loop that collects vehicle data, diagnoses, builds predictive models, deploys them back to vehicles. Replace one loop piece, the whole breaks.

What code can replicate isn't a moat:

- **Regulatory certification**: ASIL-D takes 2-3 years, millions. R155 CSMS audit takes 12-18 months. Once SW enters type approval, switching cost = recertification cost.
- **Political alliance**: Passing OEM group security review, integrating internal IT infrastructure takes 1-2 years. Technology can be replicated; relationships can't.
- **Cross-OEM data**: Individual OEMs see only their cars. But Bosch brakes, Continental ECUs are common across OEMs. Cross-OEM failure patterns individual OEMs can't build alone.

**What builds only through time, relationships, and structure is the real moat.**

---

## 8. Questions Still Without Answers

In this piece I analyzed why silos exist and tracked what forces shake them. But where analysis ends cleanly, reality doesn't. The hardest questions start at that ending point.

### The Connector's Liability Gap

Data layers crossing component silos create previously nonexistent value — cross-ECU impact analysis, fleet-level failure pattern detection, pre-recall prediction. But as much value as this layer creates, **it creates new kinds of liability gaps.**

Brake team bears liability for brake ECU defects. Powertrain team for engine control defects. But if the cross-ECU data layer "detected anomaly in brake-powertrain ECU interaction but classified it false positive, and that judgment led to an accident" — whose liability is this?

Existing product liability law didn't envision this scenario. In frameworks attaching liability to physical components, **software analyzing relationships between components** is legally uncharted territory. EU's revised Product Liability Directive (2024) designates SW as "product," but case law on cross-domain analysis layer liability doesn't exist yet.

To capture value from connecting silos, you must also own risk arising from connection. **Connection value is clear; connection liability is undecided** — this is automotive AI industry's biggest unresolved structural problem.

### Middleware Revenue Model Limits

Applying Chapter 7's middleware history lessons to automotive leaves one uncomfortable question. BlackBerry QNX runs on 250M units but gets $1-5 per unit. If automotive middleware revenue structure is this, **won't silo-connecting data layers face the same fate?**

QNX stays at $1-5 per unit because RTOS is perceived as commodity. For data layers to escape this trap, they must sell "decisions" not "infrastructure" — not pipes flowing data, but results predicting recalls, validating OTA deployment safety, reducing warranty costs. But "selling results" means "bearing responsibility for results," looping back to the liability gap problem.

### Evans Framework's Limit — How Far Do Law-Built Bundles Unbundle?

In Chapter 2 I argued Evans' bundle/unbundle pattern has different speed and path in automotive. But a more fundamental question: **For law-designed bundles, "unbundling" may not be the endpoint.** Media bundles were unbundled and re-bundled by technology. Automotive bundles were designed by law, so true unbundling depends on legal change, not technology.

EU Product Liability Directive revisions, Data Act enforcement, China data sovereignty law — these legal changes will determine new bundle shapes. Then automotive winners aren't decided by "who builds better technology" but **"who reads legal changes first and builds structure on top."**

---

What I've learned working in this industry: we compete not on technology but **structure**. Where you position in the legal liability chain, how you reconcile with warranty accounting models, how you embed into OEMs' 5-7 year program cycles. Technology catches up in 6 months. Structural position takes 5 years.

**Players who don't understand why silos exist can't become players connecting those silos. And if connecting players don't design connection liability, connection itself becomes new risk.**

One prediction. **By 2030, at least one traditional OEM will create a new Tier-0.5 model that contractually assumes cross-ECU software liability.** The moment that OEM first designs "connection liability," the silos of every other OEM will restructure within 5 years. And what's needed to create that contractual model isn't AI technology — it's understanding product liability law interpretation and reinsurance structures. Whether this is right, we'll know in 5 years.

---

## Sources

| # | Source | URL |
|---|--------|-----|
| 1 | Benedict Evans — The Great Unbundling (2020) | https://www.ben-evans.com/presentations |
| 2 | Benedict Evans — The New Gatekeepers (2022) | https://www.ben-evans.com/presentations |
| 3 | Benedict Evans — Unbundling AI (2023) | https://www.ben-evans.com/benedictevans/2023/10/5/unbundling-ai |
| 4 | Benedict Evans — AI Eats the World (2025) | https://www.ben-evans.com/presentations |
| 5 | Benedict Evans — Cars and Second Order Consequences (2017) | https://www.ben-evans.com/benedictevans/2017/3/20/cars-and-second-order-consequences |
| 6 | AI Frontier EP91 — Roh Jung-seok, Choi Seung-jun (2026.3.21) | https://aifrontier.kr/ko/episodes/ep91/ |
| 7 | Roh Jung-seok — B-Factory CEO (serial entrepreneur, Tatter&Company sold to Google) | https://byline.network/2025/08/2-ai/ |
| 8 | VW CARIAD — €50B investment and failure | https://insideevs.com/news/753673/vw-group-cariad-billions-losses-2024/ |
| 9 | Hyundai Palisade recalls — Hyundai Newsroom (2026.3.13) | https://www.hyundainews.com/releases/4724 |
| 10 | Palisade recall details — Consumer Reports | https://www.consumerreports.org/cars/car-recalls-defects/hyundai-palisade-recall-folding-seats-stop-sale-child-death-a6861032164/ |
| 11 | Palisade recall scope — Edmunds | https://www.edmunds.com/car-news/hyundai-palisade-kia-telluride-rear-seat-recall.html |
| 12 | Instrument cluster SW recall — Cars.com | https://www.nhtsa.gov/recalls |
| 13 | Palisade full recall history — Cars.com | https://www.nhtsa.gov/vehicle/2023/HYUNDAI/PALISADE |
| 14 | EU Data Act (Regulation 2023/2854) | https://eur-lex.europa.eu/eli/reg/2023/2854 |
| 15 | EU Product Liability Directive revision (2024) | https://ec.europa.eu/commission/presscorner/detail/en/ip_22_5807 |
| 16 | UNECE R155/R156 (Cybersecurity/Software Update) | https://unece.org/transport/documents/2021/03/standards/un-regulation-no-155 |
| 17 | Applied Intuition Series F ($15B valuation) | https://www.appliedintuition.com/blog/series-f |
| 18 | Applied Intuition + OpenAI partnership | https://www.appliedintuition.com/news/applied-intuition-openai |
| 19 | Apex.AI + LG Electronics strategic investment | https://www.apex.ai/press-release/apex.ai-secures-strategic-investment-from-lg-electronics |
| 20 | Aurora Innovation IR | https://ir.aurora.tech/ |
| 21 | Waymo World Model (2026) | https://waymo.com/blog/2026/02/the-waymo-world-model-a-new-frontier-for-autonomous-driving-simulation/ |
| 22 | Microsoft Azure SDV — CES 2026 | https://www.microsoft.com/en-us/industry/blog/manufacturing-and-mobility/2026/01/07/ces-2026-powering-the-next-frontier-in-automotive/ |
| 23 | Andrej Karpathy — Autoresearch (2026.3) | https://github.com/karpathy/autoresearch |
| 24 | Karpathy Autoresearch introductory tweet | https://x.com/karpathy/status/2029701092347630069 |
| 25 | Ford Motor Company 10-K SEC Filing (warranty costs) | https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000037996&type=10-K |
| 26 | VW Group + Rivian JV official announcement | https://www.volkswagen-group.com/en/press-releases/faster-leaner-more-efficient-rivian-and-volkswagen-group-announce-the-launch-of-their-joint-venture-18828 |
| 27 | Hyundai-Kia quarterly report (DART) | https://dart.fss.or.kr/ |
| 28 | Langlois & Robertson — "Explaining Vertical Integration: Lessons from the American Automobile Industry" (1989) | https://www.cambridge.org/core/journals/journal-of-economic-history/article/abs/explaining-vertical-integration-lessons-from-the-american-automobile-industry/9F45384CE2B021DFCB68579C03B9DC3E |
| 29 | Womack, Jones & Roos — *The Machine That Changed the World* (1990) | https://www.lean.org/store/book/the-machine-that-changed-the-world/ |
| 30 | MacPherson v. Buick Motor Co. (1916) | https://law.justia.com/cases/new-york/court-of-appeals/1916/217-n-y-382-1916.html |
| 31 | Greenman v. Yuba Power Products (1963) | https://supreme.justia.com/cases/california/1963/ |
| 32 | EU Product Liability Directive 85/374/EEC (1985) | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:31985L0374 |
| 33 | UNECE WP.29 — World Forum for Harmonization of Vehicle Regulations | https://unece.org/wp29-introduction |
| 34 | IATF 16949 History (QS-9000 → TS 16949 → IATF 16949) | https://www.omnex.com/iatf-16949-automotive-qms-history |
| 35 | Tesla Vertical Integration — SupplyChain360 (2025) | https://supplychain360.io/teslas-vertical-integration-revolutionizes-supply-chains/ |
| 36 | Tesla Kills Dojo — Digital Habitats (2025) | https://digitalhabitats.global/blogs/tesla-1/exclusive-tesla-kills-dojo-for-ai6-here-s-why |
