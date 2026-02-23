---
name: proposal
description: "[REDIRECT] Use /deck instead. Generates academy proposal via /deck."
argument-hint: "[generate|review|fix|refine|sync|export|setup]"
context: fork
agent: deck-orchestrator
allowed-tools: Read, Grep, Glob, Bash, Write, Task, WebFetch
---

The user invoked: `/proposal $ARGUMENTS`

This is a convenience redirect. Execute as if the user ran:

```
/deck $ARGUMENTS products/ai-architect-academy
```

The project directory is `products/ai-architect-academy`.
Read `products/ai-architect-academy/deck.yaml` for configuration and proceed with the `/deck` pipeline.
