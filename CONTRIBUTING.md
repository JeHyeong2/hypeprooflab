# Contributing to HypeProof

## Prerequisites

- **Node.js** 20+ and **npm**
- **Git**
- **Claude Code** CLI (optional but recommended)

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/jayleekr/hypeprooflab.git
cd hypeprooflab

# 2. Install web dependencies
cd web
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local — ask Jay for credentials
```

### Minimum env vars for local dev

You can run the dev server with **zero env vars** — pages that don't need external services will work. For full functionality:

| Feature | Required Vars |
|---------|--------------|
| Auth (login) | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`, `NEXTAUTH_URL` |
| Auth (GitHub, optional) | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` |
| Member data | `NOTION_API_KEY`, `NOTION_MEMBERS_DB_ID` (optional — falls back to `data/members.json`) |
| Comments | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |

If Notion vars are missing, the app falls back to `data/members.json` for member data.

### Run the dev server

```bash
cd web
npm run dev
# Open http://localhost:3000
```

### Build check

Always verify builds pass before pushing:

```bash
cd web
npm run build
```

## Project Structure

```
hypeproof/
├── web/              # Next.js 15 website (Vercel)
├── data/             # Shared data (members.json)
├── research/         # Daily research content
├── novels/           # SIMULACRA novel series
├── products/         # Deck projects & business plans
├── education/        # AI Architect Academy
├── scripts/          # Tooling (Google Slides, headless)
├── papers/           # Research papers
└── .claude/          # Claude Code config, agents, skills
```

## Member Registration

1. Add your entry to `data/members.json` (follow existing format)
2. Ask Jay to add you to the Notion Members database
3. Use your registered email to log in at hypeproof-ai.xyz

Roles: `admin` (full access), `creator` (content + dashboard), `spectator` (read-only)

## Claude Code

The project includes 25+ custom skills for content, research, and deployment workflows. Run `/load` after opening the project to check your session health.

See `.claude/SKILLS.md` for the full skill catalog.

## Branching & PRs

1. Create a feature branch: `git checkout -b feature/my-change`
2. Make changes, ensure `npm run build` passes
3. Commit with descriptive messages
4. Open a PR against `main`
5. Jay triages and merges

## Deployment

Deployment is currently managed by Jay via Vercel CLI:

```bash
cd web
vercel --prod --yes
```

There is no git-push auto-deploy. If you need something deployed, push your PR and ping Jay.

## Issues

File issues at [jayleekr/hypeprooflab](https://github.com/jayleekr/hypeprooflab/issues) with the appropriate prefix:

- `[bug]` — something broken
- `[content]` — column, research, or novel request
- `[feature]` — new functionality
- `[question]` — discussion or decision needed

See `.github/ISSUE_GUIDE.md` for templates and label conventions.
