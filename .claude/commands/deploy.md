---
name: deploy
description: Build and deploy the HypeProof website via Vercel
argument-hint: "[--skip-build] [--clean]"
context: fork
agent: web-developer
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

The user invoked: `/deploy $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS`:

- `--skip-build`: Skip the build step (assumes build was already verified)
- `--clean`: Force clean build (`rm -rf .next` before building)
- Default (no args): run build then deploy

## Execution

1. Read `CLAUDE.md` for project rules
2. Run build and deploy following the web-developer agent instructions
3. Output JSON result to stdout

## Safety

- NEVER deploy if build fails
- NEVER use `git push` — deploy via `cd web && vercel --prod --yes` only
