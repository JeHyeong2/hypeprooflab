---
name: member-schema
description: Member data schema definition, validation rules, and change conventions for data/members.json
user_invocable: false
disable-model-invocation: false
---

# member-schema

Canonical schema for `data/members.json`. All agents that read or write member data
MUST follow the rules defined here.

## JSON Schema

File: `data/members.schema.json` (formal JSON Schema draft-07).

### Member Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Discord user ID (snowflake). Empty string if unknown. |
| `username` | string | yes | Discord username. Empty string if unknown. |
| `displayName` | string | yes | Display name used across the platform. |
| `realName` | string | yes | Real name (Korean or English). |
| `email` | string | yes | Email address. Empty string if unknown. |
| `role` | enum | yes | One of: `admin`, `creator`, `advisor`. |
| `title` | string | no | Job title / position. Defaults to `""`. |
| `expertise` | string[] | yes | List of expertise areas. May be empty array. |
| `interests` | string[] | no | List of interests. Defaults to `[]`. |
| `weeklyHours` | integer | no | Weekly hour commitment. Defaults to `5`. |
| `joinDate` | string | yes | ISO date `YYYY-MM-DD`. |
| `articles` | string[] | no | List of published article slugs. Defaults to `[]`. |
| `columnType` | enum | no | One of: `A`, `B`, `C`. Defaults to `C`. |
| `status` | enum | no | One of: `active`, `inactive`. Defaults to `active`. |
| `profileImage` | string | no | Path: `/members/{username}.png`. Auto-derived if omitted. |

### Root Object

```json
{
  "version": 1,
  "updatedAt": "YYYY-MM-DD",
  "members": [ ...member objects... ]
}
```

## Role Definitions

| Role | Description |
|------|-------------|
| `admin` | Full access. Can onboard/remove members. Currently: Jay. |
| `creator` | Content creator. Can write columns, research, novels. |
| `advisor` | Advisory role. Read access, consulted on decisions. |

## Discord ID ↔ displayName Mapping

- `id` is the Discord snowflake (numeric string, 17-20 digits)
- `displayName` is the human-readable label used in UI and mentions
- Both must be present; `id` may be empty string if the user hasn't joined Discord
- Uniqueness: no two members may share the same `displayName` or non-empty `id`

## profileImage Convention

- Path: `/members/{username}.png`
- If `username` is empty, no auto-derived path — set `profileImage` explicitly or omit
- Images stored in `web/public/members/`

## Validation Rules

Agents MUST validate before writing `data/members.json`:

1. **JSON valid**: `JSON.parse()` succeeds
2. **Required fields present**: `id`, `username`, `displayName`, `realName`, `email`, `role`, `expertise`, `joinDate`
3. **Role in allowlist**: `admin | creator | advisor`
4. **columnType in allowlist**: `A | B | C` (if present)
5. **status in allowlist**: `active | inactive` (if present)
6. **joinDate format**: `YYYY-MM-DD`
7. **No duplicate displayName**: case-insensitive unique
8. **No duplicate non-empty id**: if `id` is non-empty, it must be unique

### Quick Validation Command

```bash
node -e "JSON.parse(require('fs').readFileSync('data/members.json'))"
```

For full schema validation:

```bash
npx ajv-cli validate -s data/members.schema.json -d data/members.json
```

## Change Rules

### Adding a Member

Use `/onboard` command. It follows this schema automatically.

### Updating a Member

Use `/update-member` command. Only specified fields are changed.

### Removing a Member

Set `status: "inactive"`. Do NOT delete the object — keep for historical reference.

### Schema Changes

If the schema itself needs to change:
1. Update `data/members.schema.json`
2. Update this SKILL.md
3. Migrate all existing member objects to match
4. Update `/onboard` and `/update-member` commands if field list changed

## Referencing This Schema

Other skills and agents should reference this skill when working with member data:

```
Read `.claude/skills/member-schema/SKILL.md` for the canonical member data schema.
```
