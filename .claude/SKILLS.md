# Claude Code Skills Catalog

Skills available to all developers who clone this project. Run any skill with `/<skill-name>` in Claude Code.

## Content Pipeline

| Skill | Command | Description |
|-------|---------|-------------|
| column-workflow | `/write-column` | Write bilingual columns (KO/EN) with rotation and QA |
| content-standards | `/qa-check` | Frontmatter validation, category taxonomy, confidence labels |
| research-pipeline | `/research` | Daily research pipeline — sources, format, Discord posting |
| contribution-tracking | — | Track creator contributions with point-based scoring |

## Research & Knowledge

| Skill | Command | Description |
|-------|---------|-------------|
| research | `/research` | Competitive intelligence and market research |
| ingest | `/ingest` | Ingest meeting notes, PDFs, free text into knowledge vault |
| ask | `/ask` | Natural language Q&A against the knowledge vault |
| paper-lab | `/paper` | Lens-driven research paper pipeline (discover → draft → publish) |

## Development & Debugging

| Skill | Command | Description |
|-------|---------|-------------|
| investigate | `/investigate` | Structured root-cause debugging with hypothesis tracking |
| cso | `/cso` | OWASP Top 10 + STRIDE security audit |
| deploy-rules | — | Pre-deploy checks, Vercel workflow, rollback procedures |
| load | `/load` | Session health check — verify dependencies and state |
| worktree-done | `/worktree-done` | Merge worktree to main and clean up |

## Visualization & Diagrams

| Skill | Command | Description |
|-------|---------|-------------|
| diagram | `/diagram` | Generate SVG diagrams from natural language |
| diagram-export | `/diagram-export` | Extract and render Mermaid diagrams from markdown |

## Deck Generation

| Skill | Command | Description |
|-------|---------|-------------|
| gslides-kit | `/deck` | Google Slides generation pipeline (plan → build → QA → critique) |
| academy-casegen | — | AI Architect Academy case generation with self-critique |

## Collaboration

| Skill | Command | Description |
|-------|---------|-------------|
| brainstorm | `/brainstorm` | Interactive brainstorming with structured decision points |
| dream | `/dream` | Memory consolidation and pruning for auto-memory system |

## Project Management

| Skill | Command | Description |
|-------|---------|-------------|
| roadmap-review | `/roadmap` | Review and adjust roadmap with live data |
| issue-ops | — | GitHub Issue management |
| issue-filing | — | Standardized issue filing with templates and labels |
| issue-filer | — | Auto-file issues from reports and QA results |
| issue-solver | — | Fetch open issues, attempt fixes, create PRs |
| member-schema | — | Member data schema and validation rules |

## Configuration

| Skill | Command | Description |
|-------|---------|-------------|
| config | `/update-config` | Configure Claude Code settings.json |
| dashboard-components | — | Reusable dashboard UI components |

---

**Total**: 27 project-level skills

**Note**: Some skills (calendar, email, morning, weekly, meeting-prep) are user-level only as they depend on personal accounts. These are available to Jay but not shared via git.
