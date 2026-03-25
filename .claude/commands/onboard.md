---
name: onboard
description: Onboard a new HypeProof member — add to data/members.json and web fallback
argument-hint: '"DisplayName" "RealName" --discord <id> --email <email> --expertise "skill1,skill2"'
---

The user invoked: `/onboard $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS` as positional + flags:

- Positional 1: `displayName` (REQUIRED) — e.g. "Simon"
- Positional 2: `realName` (REQUIRED) — e.g. "김상호"
- `--discord <id>`: Discord user ID (optional)
- `--username <name>`: Discord username (optional)
- `--email <email>`: Email address (optional)
- `--role <role>`: admin|creator|spectator (default: creator)
- `--title <title>`: Job title (optional)
- `--expertise <csv>`: Comma-separated expertise list (optional)
- `--interests <csv>`: Comma-separated interests list (optional)
- `--hours <n>`: Weekly hours commitment (default: 5)

## Execution

1. Read `CLAUDE.md` for project rules
2. Read `data/members.json`
3. Check if a member with the same `displayName` already exists — if so, abort with error
4. Create a new member object:
   ```json
   {
     "id": "<discord-id or empty>",
     "username": "<discord-username or empty>",
     "displayName": "<displayName>",
     "realName": "<realName>",
     "email": "<email or empty>",
     "role": "<role>",
     "title": "<title or empty>",
     "expertise": ["<parsed from csv>"],
     "interests": ["<parsed from csv>"],
     "weeklyHours": <hours>,
     "joinDate": "<today YYYY-MM-DD>",
     "articles": [],
     "columnType": "C",
     "status": "active"
   }
   ```
5. Append the new member to `data/members.json` members array
6. Update `updatedAt` to today's date
7. Read `web/src/lib/members.ts` and add a new entry to the `FALLBACK_MEMBERS` array:
   ```typescript
   { displayName: '<displayName>', role: '<role>' },
   ```
8. Verify both files are valid (JSON parses, TypeScript has no syntax errors)
9. Stage and commit both files:
   ```
   feat: onboard <displayName> (<realName>) as <role>
   ```

## Output

```json
{
  "status": "ok",
  "member": "<displayName>",
  "role": "<role>",
  "files": ["data/members.json", "web/src/lib/members.ts"]
}
```

On error:
```json
{
  "status": "fail",
  "error": "<reason>"
}
```
