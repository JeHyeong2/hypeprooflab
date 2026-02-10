# HypeProof Deployment Workflow

## Before Every Deploy

```bash
npm run verify      # Content integrity check
npm run build       # Next.js build
# Or combined:
npm run predeploy   # verify + build together
```

## What `verify` Checks

| Check | Blocks deploy? | How to fix |
|---|---|---|
| Unverified numeric claims (N+, N%, N/5) | ✖ ERROR | Remove the number, or add `// verified: <data source>` comment |
| Exaggeration keywords (글로벌 커뮤니티, world-class, etc.) | ⚠ WARNING | Tone down, or add `// exag-ok: <reason>` |
| Team member count mismatch | ⚠ WARNING | Update `public/members/` or `KNOWN_MEMBERS` in script |
| SocialProofBar resurrection | ✖ ERROR | Do not re-enable this component |

## Rules

1. **Never fabricate numbers.** If we don't have data, don't show a stat.
2. **No exaggeration.** We're a small team (6 people). That's fine. Be honest.
3. **Suppress false positives** with inline comments:
   - `// verified: from Discord API as of 2024-01-15`
   - `// exag-ok: this is a direct quote`
4. **Update `KNOWN_MEMBERS`** in `scripts/verify_content.sh` when team changes.

## Team Members (current)

Jay, JY, Kiwon, Ryan, Sebastian, TJ
