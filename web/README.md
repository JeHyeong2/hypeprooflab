# HypeProof Web

Next.js 15 website for [HypeProof Lab](https://hypeproof-ai.xyz) — an AI-focused content and research community.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Auth**: NextAuth.js (Google + GitHub OAuth, JWT sessions)
- **Data**: Notion API (members, personas, points) with JSON fallback
- **Database**: Supabase (comments, interactions)
- **Cache**: Upstash Redis (rate limiting, session cache)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel CLI (`vercel --prod --yes`)

## Directory Structure

```
web/
├── src/
│   ├── app/                  # App Router pages
│   │   ├── academy-timeline/ # AI Architect Academy dashboard
│   │   ├── ai-personas/      # AI persona profiles
│   │   ├── api/              # API routes
│   │   ├── auth/             # Auth pages (signin, error)
│   │   ├── columns/          # Bilingual columns (KO/EN)
│   │   ├── creators/         # Creator profiles
│   │   ├── dashboard/        # Member dashboard
│   │   ├── glossary/         # AI glossary
│   │   ├── novels/           # SIMULACRA novel series
│   │   └── research/         # Daily research
│   ├── components/           # React components
│   ├── content/              # Markdown content (columns, novels, research)
│   └── lib/                  # Core libraries
│       ├── auth.ts           # NextAuth config + role callbacks
│       ├── members.ts        # Notion → member lookup + JSON fallback
│       ├── personas.ts       # AI persona data
│       ├── points.ts         # Contribution points
│       ├── redis.ts          # Upstash Redis client
│       ├── supabase.ts       # Supabase client
│       ├── columns.ts        # Column content loader
│       ├── novels.ts         # Novel content loader
│       └── research.ts       # Research content loader
└── public/                   # Static assets (images, fonts)
```

## Auth & Roles

Three roles: `admin`, `creator`, `spectator`

1. User signs in via Google or GitHub OAuth
2. `getRoleForEmail()` in `lib/members.ts` looks up email in Notion DB
3. Falls back to `data/members.json` if Notion is unavailable
4. Unknown emails default to `spectator` (read-only)

To add a new member: update `data/members.json` and ask Jay to add them to Notion.

## Setup

```bash
npm install
cp .env.example .env.local   # Fill in credentials (ask Jay)
npm run dev                   # http://localhost:3000
```

See `.env.example` for all required/optional environment variables.

The app runs without env vars for basic content pages. Auth, comments, and member features require credentials.

## Content

Markdown files in `src/content/` with YAML frontmatter:

- `columns/ko/`, `columns/en/` — bilingual columns
- `novels/ko/` — SIMULACRA novel chapters
- `research/` — daily research reports

Content is managed via Claude Code skills (`/write-column`, `/write-novel`, `/research`).

## Build & Deploy

```bash
npm run build     # Must pass before deploy
```

Deployment is via Vercel CLI (no git-push deploy):

```bash
vercel --prod --yes
```

See `CONTRIBUTING.md` in the project root for the full workflow.
