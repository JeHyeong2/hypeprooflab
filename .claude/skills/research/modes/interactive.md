# Interactive Mode

Additional steps when Jay runs `/research` directly.

## Phase 1 Checkpoint

After generating the research plan, present it to Jay before launching agents:

```
Research plan for: {topic}

Agent A: {scope_a} (e.g., OEM feature comparison)
Agent B: {scope_b} (e.g., ROI / monetization models)
Agent C: {scope_c} (e.g., target customer strategy)
Agent D: {scope_d} (optional, e.g., academic/patent landscape)

Vault context loaded: {N} existing files relevant
Estimated: {N} parallel agents, ~{N}K tokens total

Proceed? [yes / adjust / cancel]
```

Wait for Jay's response:
- **yes**: proceed to Phase 2
- **adjust**: revise plan based on feedback, re-present
- **cancel**: exit cleanly

## Phase 4.5: Confluence Publish

After vault write, publish the English report to Confluence:

1. Determine page title: `{YYYY-MM-DD} {topic-title}` (from the report H1)
2. Publish via confluence-publish script:
   ```bash
   python3 .claude/skills/confluence-publish/scripts/publish.py \
     jay/reports/{date}-{topic-slug}.md \
     --folder "Research" \
     --title "{YYYY-MM-DD} {topic-title}" \
     --json
   ```
3. If publish succeeds, include Confluence page URL in the output summary.
4. If publish fails, log warning but do not fail the job.
5. Only publish the English report (Korean report stays in vault only).
