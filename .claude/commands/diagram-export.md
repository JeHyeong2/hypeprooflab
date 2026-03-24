---
name: diagram-export
description: Extract, render, QA, and dashboard Mermaid diagrams from a markdown file
argument-hint: "<file.md> [--format png|svg|both] [--theme dark|light|neutral] [--no-qa] [--no-dashboard] [--open]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

The user invoked: `/diagram-export $ARGUMENTS`

Read `.claude/skills/diagram-export/SKILL.md` first, then follow the pipeline defined there.

Execute all 6 steps in order. For QA (step 3), spawn a sub-agent with `subagent_type: "Explore"` that reads each rendered PNG and scores it visually.
