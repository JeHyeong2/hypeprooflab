---
name: deploy-rules
description: Deploy rules single reference — pre-deploy checks, Vercel workflow, post-deploy verification, rollback procedure, and auto-deploy blocklist. Reference this skill when resolving deploy-related issues.
user_invocable: false
---

# deploy-rules

## Purpose

Single source of truth for HypeProof deployment rules. Agents (especially issue-solver) reference this skill before making any deploy-related changes.

## Pre-Deploy Checklist

Every deploy MUST pass these checks first:

1. **Build must pass**: `cd web && npm run build`
2. **No TypeScript errors**: build step catches these — never ignore
3. **Clean build when in doubt**: `rm -rf web/.next && cd web && npm run build`
4. **Content integrity**: frontmatter fields valid (see content-standards skill)

If the build fails, **do not deploy**. Fix the build first.

## Deploy Workflow

HypeProof uses **Vercel CLI** for deployment. Git is NOT connected to Vercel.

```bash
# Standard deploy
cd web && npx vercel --prod --yes

# Clean build + deploy
rm -rf web/.next && cd web && npm run build && npx vercel --prod --yes
```

### Prohibited

- **Never `git push` to deploy** — Vercel is not connected to git
- **Never deploy if build failed** — no exceptions
- **Never deploy without local build verification** — Vercel build cache can mask errors

## Post-Deploy Verification

After every deploy, verify the live site returns HTTP 200:

```bash
curl -s -o /dev/null -w "%{http_code}" https://hypeproof-ai.xyz/
```

Expected: `200`. If not 200, investigate immediately and rollback if needed.

For content deploys, also spot-check the new page:

```bash
curl -s -o /dev/null -w "%{http_code}" https://hypeproof-ai.xyz/<path-to-new-content>
```

## Auto-Deploy Blocklist

The following files must **never be auto-deployed** without explicit human confirmation:

| File / Pattern | Reason |
|----------------|--------|
| Creator-authored content (not yet reviewed) | Requires creator approval before publish |
| `CLAUDE.md`, `.claude/**` | Agent config — not web content |
| `data/members.json` | Member data changes need human review |
| `web/src/content/columns/**` without KO/EN pair | Incomplete content — both languages required |
| Environment files (`.env*`) | Secrets — never commit or deploy |

## Rollback Procedure

If a deploy introduces a regression:

```bash
# 1. Revert the offending commit
git revert HEAD

# 2. Verify the revert builds cleanly
cd web && npm run build

# 3. Re-deploy the reverted state
cd web && npx vercel --prod --yes

# 4. Verify rollback
curl -s -o /dev/null -w "%{http_code}" https://hypeproof-ai.xyz/
```

For multi-commit rollbacks, revert each commit individually (newest first) or use `git revert HEAD~N..HEAD`.

## Vercel Manual Deploy

When the `/deploy` command is unavailable or you need manual control:

```bash
cd web && npx vercel --prod --yes
```

Requires Vercel CLI (`npx vercel`) and valid credentials. Token is managed by Vercel CLI login — never hardcode tokens.

## Integration with issue-solver

When issue-solver encounters a deploy-related issue:

1. Read this skill first
2. Follow the pre-deploy checklist before any changes
3. After fixing, run build verification
4. If the fix requires deployment, note it in the commit message but **do not auto-deploy** in batch mode
5. Only deploy in interactive mode with explicit user confirmation
