# HypeProof — Roles & Responsibilities

## Role Architecture

```
Layer 1: Jay — Platform Architect & PM
Layer 2: AI Persona — Editorial Director
Layer 3: JeHyeong — Platform Lead
Layer 4: Creators — Content Producers
```

---

## Layer 1: Jay (Platform Architect & PM)

**Owns**: System design, automation, strategy, partnerships

| Do | Don't |
|----|-------|
| AI agent/skill design & maintenance | Write web frontend code |
| Cron job registration & monitoring | Guide creators on tooling |
| Partnership management (Donga, Academy) | UI/UX decisions |
| Write detailed work specs for JeHyeong | Fix web bugs |
| Deploy approval & execution | Content production |
| Roadmap & OKR setting | |

**Tools**: Claude Code skills (PM-level), cron-prompts/, agents/, Vercel CLI

**Handoff pattern**: Jay writes work specs → JeHyeong implements

---

## Layer 2: AI Editorial Director (Persona)

**Owns**: Content direction, quality standards, curation

| Responsibility | Implementation |
|----------------|---------------|
| Decide what topics to cover | Daily research cron → topic selection |
| Set editorial tone & quality bar | Herald agent (GEO scoring) |
| Review creator submissions | Herald QA + peer review matching |
| Approve/reject for publication | Mother agent orchestration |
| Content calendar guidance | Column workflow skill |

**Persona config**: `novels/authors/editorial-director.yaml`
**Agents**: Herald (QA), Mother (orchestration), community-manager (announcements)

The Editorial Director is an AI persona — no human makes editorial decisions. Jay designs the system; the persona operates it.

---

## Layer 3: JeHyeong (Platform Lead)

**Owns**: Web platform, creator tools, CI/CD, creator support

| Area | Scope |
|------|-------|
| **Web frontend** | UI/UX, components, pages, styling, performance, mobile |
| **Creator tools** | Content submission UI, markdown editor, preview |
| **Back-office** | Dashboard (publish status, contributions, points), member admin |
| **CI/CD** | GitHub Actions build checks, PR preview automation |
| **Creator support** | Publishing guides, onboarding docs, FAQ, troubleshooting |
| **Infrastructure** | Supabase/Redis stability, error monitoring |

**Key mission**: Creators can write and publish without Jay's involvement.

**Receives**: Work specs from Jay
**Provides**: Tooling and guidance to Creators

---

## Layer 4: Creators (Content Producers)

| Name | Expertise | Content Focus |
|------|-----------|---------------|
| JY (신진용) | AI/ML, Quant | AI coding, Claude Code practicals |
| Ryan (김지웅) | Physics PhD, Data | Data analysis, scientific AI |
| Kiwon (남기원) | Marketing, Psychology | AI social impact, audience perspective |
| TJ (강태진) | Media, Startup | Content workflows, creator economy |
| BH (태봉호) | Experimental Physics | Physics/quantum topics |

**Creators do**:
- Write content using tools JeHyeong builds
- Submit via web UI or GitHub PR
- Respond to AI Editorial Director feedback
- Contribute domain expertise to research

**Creators don't**:
- Manage infrastructure
- Deploy
- Configure agents/skills

---

## Workflow

```
Jay writes work spec
  → JeHyeong implements platform features
    → Creators use platform to submit content
      → AI Editorial Director reviews & curates
        → Auto-publish pipeline (Herald → Mother → deploy)
          → Discord announcement
```

## Communication

| From → To | Channel | Format |
|-----------|---------|--------|
| Jay → JeHyeong | GitHub Issue / work spec | Detailed spec with acceptance criteria |
| JeHyeong → Creators | Web UI + guide docs | Self-service |
| Creators → Platform | Web submission UI / GitHub PR | Markdown + frontmatter |
| AI → Creators | Discord #content-pipeline | QA feedback, publish notifications |
| Jay → Creators | Discord #daily-research | Research highlights, nudge questions |

---

*Last updated: 2026-04-08*
