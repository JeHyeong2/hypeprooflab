Read CLAUDE.md first. Then run the daily research pipeline for {date}.

Steps:
1. Read `.claude/skills/research-pipeline/SKILL.md` for pipeline rules
2. Collect AI/tech news from multiple sources (web search)
3. Apply HypeProof Lens (confidence labels, category taxonomy)
4. Write daily research file: `research/daily/{date}-daily-research-ko.md` (KO) + EN version
5. Validate frontmatter against content-standards
6. If a column-worthy topic found, note it in the report

Output JSON: {"status": "ok|fail", "files_created": [...], "column_candidates": [...]}

Date: {date}, Max turns: 25
