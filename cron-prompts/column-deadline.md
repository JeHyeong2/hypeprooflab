Read CLAUDE.md first. Column deadline check for {date}.

1. Check `data/submissions.json` for submissions with status "in_review" or "approved"
2. Check if any approved columns haven't been published yet
3. Validate any pending columns: frontmatter, KO/EN pairs, build check
4. If columns are ready, report them as deployment-ready

Output JSON: {"status": "ok", "ready_to_publish": [...], "in_review": [...], "overdue": [...]}

Date: {date}, Max turns: 10
