---
name: dashboard-components
description: Dashboard component guide — tab structure, data sources, modification rules, and how to add new tabs. Reference this skill when resolving dashboard-related issues.
user_invocable: false
disable-model-invocation: true
---

# Dashboard Components Guide

## Architecture

The dashboard is a Next.js page with auth-gated access:

| File | Role |
|------|------|
| `web/src/app/dashboard/page.tsx` | Server component. Loads `members.json`, passes data to client. |
| `web/src/app/dashboard/DashboardClient.tsx` | Client component (`'use client'`). All 12 tabs, shared components, state management. |
| `web/src/app/dashboard/types.ts` | TypeScript interfaces: `DashboardMember`, `MembersData`. |

### Data Loading

`page.tsx` reads `data/members.json` at build time (ISR, `revalidate = 300`). Paths checked:
1. `{cwd}/../data/members.json` (project root when cwd is `web/`)
2. `{cwd}/data/members.json` (fallback)

## Tab Structure

12 tabs defined in the `TABS` array in `DashboardClient.tsx`:

| # | Tab ID | Label | Component | Data Source |
|---|--------|-------|-----------|-------------|
| 1 | `roadmap` | 로드맵 | `TabRoadmap` | Static (inline arrays) |
| 2 | `d1` | 전체 워크플로우 | `TabWorkflow` | Static (inline arrays) |
| 3 | `d2` | 콘텐츠 파이프라인 | `TabContentPipeline` | Static (inline arrays) |
| 4 | `d3` | 멤버 역할 | `TabMemberRoles` | Dynamic (`members.json` via props) |
| 5 | `d4` | Mother AI | `TabMotherAI` | Static (inline arrays) |
| 6 | `d5` | 배포 채널 | `TabChannels` | Static (inline arrays) |
| 7 | `d6` | 피드백 루프 | `TabFeedback` | Static (inline arrays) |
| 8 | `d7` | 교육 Academy | `TabAcademy` | Static (inline arrays) |
| 9 | `d8` | 수익 모델 | `TabRevenue` | Static (inline arrays) |
| 10 | `d9` | 리스크 맵 | `TabRisk` | Static (inline arrays) |
| 11 | `d10` | 커뮤니티 | `TabCommunity` | Static (inline arrays) |
| 12 | `qa` | QA 리포트 | `TabQA` | Static (inline arrays) |

### Data Source Notes

- **Dynamic tabs** (Tab 4 `TabMemberRoles`): Receives `members: DashboardMember[]` from props. Reads `data/members.json` at build time. Member extras (roleDesc, peakDays, kpi, value, tags) are hardcoded in `memberExtras` inside the component.
- **Static tabs**: All data is inline in the component function. No external API or file reads at runtime.

## Type Definitions (`types.ts`)

```typescript
interface DashboardMember {
  id: string;
  username: string;
  displayName: string;
  realName: string;
  email: string;
  role: 'admin' | 'creator' | 'spectator';
  title: string;
  expertise: string[];
  interests: string[];
  weeklyHours: number;
  joinDate: string;
  articles: string[];
  columnType: string;
  status: string;          // 'active' filters into display
}

interface MembersData {
  version: number;
  updatedAt: string;
  members: DashboardMember[];
}
```

## Shared Components

All defined inside `DashboardClient.tsx`:

| Component | Props | Usage |
|-----------|-------|-------|
| `Card` | `title, sub?, barColor, desc?, owner?, onClick?` | Clickable card with left color bar. Used across most tabs. |
| `Badge` | `status: 'done' \| 'progress' \| 'wait'` | Status pill. Used in Tab 1 (Roadmap). |
| `SectionBox` | `children, className?` | Rounded container with padding. Groups related cards. |
| `DetailPanel` | `title, desc, owner` | Right sidebar detail view (desktop only, `lg:block`). |

## Color System

`MEMBER_COLORS` maps display names to hex colors. `getMemberColor(name)` returns color or fallback `#8b949e`.

Design tokens used across tabs:
- Background: `#0d1117` (page), `#161b22` (cards/panels)
- Border: `#30363d` (default), `#58a6ff` (hover/active)
- Text: `#e6edf3` (primary), `#c9d1d9` (secondary), `#8b949e` (muted)
- Accent: `#1f6feb` (blue), `#58a6ff` (light blue), `#e8734a` (coral), `#f1c40f` (yellow), `#27ae60` (green), `#8b5cf6` (purple), `#ef4444` (red)

## Responsive Rules

- **Desktop (lg+)**: Two-column layout — content area + 340px sticky detail panel on right.
- **Mobile/Tablet (<lg)**: Detail panel hidden (`hidden lg:block`). Full-width content only.
- **Tab bar**: Horizontally scrollable (`overflow-x-auto`), sticky at top (`sticky top-0 z-50`).
- **Card grids**: Use `grid-cols-[repeat(auto-fill,minmax(Xpx,1fr))]` — X varies by tab (160-260px).
- **Horizontal flows** (pipeline, journey): `overflow-x-auto` with flex layout.

## How to Add a New Tab

### Step 1: Add tab definition

In `DashboardClient.tsx`, add to the `TABS` array:

```typescript
const TABS = [
  // ... existing tabs
  { id: 'newid', label: '13. New Tab' },
];
```

### Step 2: Create tab component

Define a new function component in `DashboardClient.tsx`:

```typescript
function TabNewFeature({ onDetail }: { onDetail: (t: string, d: string, o: string) => void }) {
  // Use Card, SectionBox, Badge as needed
  return <div>...</div>;
}
```

**Convention**: If the tab needs member data, add `members: DashboardMember[]` to props. If the tab is display-only with no click interactions, omit `onDetail`.

### Step 3: Register in render switch

Add the conditional render in the content area of `DashboardClient`:

```tsx
{activeTab === 'newid' && <TabNewFeature onDetail={onDetail} />}
```

If the tab needs members: `<TabNewFeature members={members} onDetail={onDetail} />`

### Step 4: Update QA table

Update the `rows` array in `TabQA` to include the new tab.

### Step 5: Validate

```bash
cd web && npm run build
```

## Modification Rules

### DO
- Keep all tab components in `DashboardClient.tsx` (single-file architecture)
- Use shared components (`Card`, `SectionBox`, `Badge`) for consistency
- Use `onDetail` callback pattern for clickable items
- Follow the existing color system and design tokens
- Update `TabQA` rows when adding/removing tabs
- Use `Edit` tool for modifications (never `sed`)

### DO NOT
- Split tab components into separate files (current architecture is intentionally single-file)
- Hardcode member counts — use `members.filter(m => m.status === 'active').length`
- Add external data fetches in client components — data flows through `page.tsx` server component
- Modify `types.ts` without also updating `data/members.json` schema and `member-schema` skill
- Remove the `'use client'` directive
- Break the `onDetail` callback chain (cards must remain clickable for detail panel)
