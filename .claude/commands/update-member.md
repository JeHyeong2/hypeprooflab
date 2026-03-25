---
name: update-member
description: Update an existing HypeProof member's info in data/members.json
argument-hint: '"DisplayName" --hours 5 --expertise "skill1,skill2" --status active'
---

The user invoked: `/update-member $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS` as positional + flags:

- Positional 1: `displayName` (REQUIRED) — member to update (case-insensitive match)
- `--discord <id>`: Update Discord user ID
- `--username <name>`: Update Discord username
- `--email <email>`: Update email
- `--role <role>`: Update role (admin|creator|spectator)
- `--title <title>`: Update job title
- `--expertise <csv>`: Replace expertise list (comma-separated)
- `--interests <csv>`: Replace interests list (comma-separated)
- `--hours <n>`: Update weekly hours
- `--status <status>`: Update status (active|inactive)
- `--realName <name>`: Update real name
- `--columnType <type>`: Update column type (A|B|C)

## Execution

1. Read `CLAUDE.md` for project rules
2. Read `data/members.json`
3. Find the member by `displayName` (case-insensitive) — if not found, abort with error
4. Apply only the provided flag updates to the member object (do not touch unspecified fields)
5. Update `updatedAt` to today's date
6. Write back `data/members.json`
7. If `--role` was changed, also update `web/src/lib/members.ts` FALLBACK_MEMBERS
8. If `--status inactive` was set, consider removing from FALLBACK_MEMBERS
9. Stage and commit:
   ```
   chore: update member <displayName> — <changed fields summary>
   ```

## Output

```json
{
  "status": "ok",
  "member": "<displayName>",
  "updated": ["<field1>", "<field2>"],
  "files": ["data/members.json"]
}
```

On error:
```json
{
  "status": "fail",
  "error": "<reason>"
}
```
