# Context Resolution Strategy

How ca-brainstorm automatically detects and loads relevant vault context from Jay's natural language input.

## Resolution Pipeline

```
Jay's input
    │
    v
[1. Entity Extraction]
    │  Parse input for: customer names, product names, person names,
    │  topic keywords (strategy, proposal, GTM, pricing, etc.)
    │  Example: "Jeff에게 줄 제품 미션 문서" → Jeff(stakeholder), product mission(topic)
    │
    v
[2. Topic Type Classification]
    │  Classify into one of:
    │  - Strategy/Executive: C-level audience, mission, vision, moat, GTM
    │  - Customer Deal: customer name + PoC/proposal/pricing/pilot
    │  - Meeting Prep: meeting/미팅/prep + person name or date
    │  - Product Decision: product name + priority/roadmap/feature/ship
    │  - Email/Comms: email/draft/reply + person name
    │
    v
[3. Entity Resolution via Index]
    │  Read knowledge/index-routing.yaml (preferred, ~150 lines)
    │  Fall back to ontology-index.yaml if routing table unavailable
    │  Resolve: entity name/alias → file path(s)
    │
    v
[4. Priority-Based File Loading]
    │  Load files in priority order, respecting token budget
    │
    v
[Context Bundle] → passed to Phase 2 (Decision Point Identification)
```

## Priority Levels

| Priority | Source | When to Load | Token Budget |
|----------|--------|-------------|-------------|
| P0 | `index-routing.yaml` | Always | ~500 |
| P1 | Matched product/customer cards (`knowledge/`, `workspace/agendas/`) | Entity match found | ~2K per card, max 3 cards |
| P2 | Recent signals (`workspace/signals/YYYY-MM.md`) | Related entity exists | ~1.5K (filtered) |
| P3 | Related UC cards (`workspace/agendas/uc-*.md`) | Product/customer topic | ~2K per card, max 2 cards |
| P4 | Recent retros/reports (`daily-retrospective/`, `workspace/reports/`) | Strategy/review topic | ~2K (latest 3 days) |
| P5 | Stakeholder context (`workspace/stakeholders/stakeholder-map.md`) | Specific person mentioned | ~1K (section only) |
| P6 | Calendar events (via `scan_calendar.py`) | Meeting prep topic | ~500 |

**Total budget**: ~15K tokens max. If exceeded, drop from P6 upward.

## Topic-Specific Loading Strategies

### Strategy/Executive
Load broadly: stakeholders (audience person) + all product cards (maturity overview) + recent signals (strategic_hint, budget_signal types) + latest retro.

### Customer Deal
Load deeply: customer card + related product cards + customer-filtered signals + relevant UC cards + stakeholder sections for attendees.

### Product Decision
Load focused: specific product card(s) + competitor cards + related UC cards + signals filtered by product keyword + CTO/Product stakeholder positions.

### Meeting Prep
Load person-centric: stakeholder map (attendee sections) + calendar context + recent signals mentioning attendees + relevant agenda cards.

### Email/Comms
Load minimal: stakeholder map (recipient section) + most recent relevant signals (3-5) + one product/customer card for context.

## Signal Filtering

When loading `workspace/signals/YYYY-MM.md`, do NOT load the entire file. Filter by:

1. Grep for entity names (customer, product, person)
2. Grep for topic keywords
3. Take most recent 10-15 matching signals
4. If current month has < 5 matches, also check previous month

## Entity Alias Resolution

Common aliases to handle:
- Person names: Korean [[workspace/stakeholders/stakeholder-map.md|name]] ↔ English name (resolved via stakeholder-map.md or contacts.yaml)
- Product abbreviations: [[knowledge/products/ai-technician.md|AIT]] → ai-technician, [[knowledge/products/ai-director.md|AID]] → ai-director, CCU → [[workspace/agendas/uc-log-aggregation.md|ccu2]]
- Customer abbreviations: HKMC → hkmc, HMC → hkmc, [[knowledge/customers/hkmc.md|Genesis]] → hkmc (subset)
- Org names: CDO, CO team, Network Dev → internal HKMC teams (context in hkmc.md)

The routing table and ontology index both contain alias mappings. Check both if first lookup fails.

## Context Summary Format

After loading, print exactly one line:
```
[context] Loaded: {file1}, {file2}, ... ({N} signal matches)
```

If a file was expected but not found:
```
[context] Loaded: {file1}, {file2} | Missing: {expected_file} (not in vault)
```
