---
name: contribution-tracking
description: Track creator contributions (columns, feedback, topics, reviews, etc.) with point-based scoring. Manages the contributions ledger and the track-contribution.sh CLI tool.
user_invocable: false
disable-model-invocation: false
---

# contribution-tracking

## Purpose

Record and query creator contributions to the HypeProof project. Every contribution earns points based on type. The canonical ledger is `products/contributions.json`.

## Schema

Each contribution entry:

| Field | Required | Description |
|-------|----------|-------------|
| `creator` | yes | Display name from `data/members.json` (e.g. "Jay", "Ryan", "JY") |
| `type` | yes | `column` \| `feedback` \| `topic` \| `comment` \| `meeting` \| `idea` \| `review` |
| `contribution` | yes | Verb: `wrote` \| `gave` \| `suggested` \| `commented` \| `attended` \| `proposed` \| `reviewed` |
| `slug` | no | Content slug (for columns/reviews) |
| `channel` | no | Discord channel name (e.g. `#daily-research`) |
| `summary` | no | Short description of the contribution |
| `date` | yes | ISO date `YYYY-MM-DD` |
| `points` | yes | Auto-calculated from type (can be overridden) |

## Point Rules

| Type | Points |
|------|--------|
| `column` | 10 |
| `feedback` | 5 |
| `review` | 5 |
| `topic` | 3 |
| `meeting` | 3 |
| `idea` | 3 |
| `comment` | 2 |

## CLI Tool

`scripts/headless/track-contribution.sh` — jq-based, appends to the ledger.

```bash
# Record a column
bash scripts/headless/track-contribution.sh \
  --creator "Ryan" --type "column" --slug "my-slug" --contribution "wrote"

# Record feedback with channel
bash scripts/headless/track-contribution.sh \
  --creator "JY" --type "feedback" --contribution "gave" \
  --channel "#daily-research" --summary "Suggested alternative framing"

# Dry-run (validate without writing)
bash scripts/headless/track-contribution.sh \
  --creator "Kiwon" --type "idea" --contribution "proposed" \
  --summary "Marketing-angle column series" --dry-run
```

Points are auto-calculated from `--type`. Use `--points N` to override.

## Validation Rules

1. `creator` must match a `displayName` in `data/members.json`
2. `type` must be one of the 7 valid types
3. `contribution` verb must be one of the 7 valid verbs
4. `date` must be `YYYY-MM-DD` format
5. `slug` should match an existing content file when `type` is `column`

## Files

| File | Purpose |
|------|---------|
| `products/contributions.json` | Canonical ledger (version, updatedAt, contributions array) |
| `scripts/headless/track-contribution.sh` | CLI tool for appending entries |
| `data/members.json` | Creator name SSOT for validation |
