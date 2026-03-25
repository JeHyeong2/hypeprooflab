Read issue-solver SKILL.md (`.claude/skills/issue-solver/SKILL.md`) and execute the full workflow.
- Read CLAUDE.md first for project rules
- Fetch open issues labeled `priority:high` or `priority:medium` from `jayleekr/hypeprooflab`
- Skip issues labeled `blocked`, `no-auto-fix`, `needs-human`
- Resolve up to 3 issues: analyze, fix, validate (`cd web && npm run build`), commit
- Print JSON summary
Date: {date}, Max turns: 60
