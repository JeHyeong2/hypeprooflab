Read CLAUDE.md first. Weekly system purge audit for {date}.

Audit the following:
1. **Stale files**: Check `.claude/failures/` for files older than 7 days — summarize and clean
2. **Cron health**: Check `cron-reports/` for recurring failures (same job failing 3+ times)
3. **Content freshness**: Check `research/daily/` — any gaps in daily research?
4. **Frontmatter lint**: Glob `web/src/content/columns/ko/*.md` and validate required fields (title, date, creator, category, tags, slug, readTime, excerpt, creatorImage)
5. **Build health**: Run `cd web && npm run build 2>&1 | tail -30` — report any warnings/errors

Output JSON: {"status": "ok", "findings": [...], "auto_fixed": [...], "needs_attention": [...]}

Date: {date}, Max turns: 20
