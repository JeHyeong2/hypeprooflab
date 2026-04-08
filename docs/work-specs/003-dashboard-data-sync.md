# Work Spec #003: Dashboard Data Sync & Cleanup

## Assignee: JeHyeong
## Depends on: Work Spec #001 (CI)
## Priority: P1
## Due: 2026-05-02

---

## Goal

대시보드 `/dashboard`의 모든 탭 데이터가 현재 상태를 반영하도록 업데이트.
현재 대부분의 탭이 3/23 기준 하드코딩 데이터로, 4/8 역할 재정비 이후 내용과 불일치.

## Background

- 대시보드: `web/src/app/dashboard/DashboardClient.tsx` — 단일 파일, 12개 탭
- 데이터: 전부 하드코딩 (JS 객체 리터럴)
- Source of truth: `products/hypeproof-roadmap-2026Q2.md` (로드맵), `ROLES.md` (역할)
- 탭 1(로드맵)은 4/8에 테이블로 교체됨. 나머지 탭은 3/23 기준 그대로

## 현재 탭별 상태

| 탭 | 이름 | 상태 | 문제 |
|----|------|------|------|
| 1 | 로드맵 | **4/8 업데이트됨** | S-1~S-11 반영, 테이블 형식 |
| 2 | 전체 워크플로우 | 3/23 기준 | 역할 구조 반영 안 됨 |
| 3 | 콘텐츠 파이프라인 | 3/23 기준 | 파이프라인 장애 현황 미반영 |
| 4 | 멤버 역할 | 3/23 기준 | **4-layer 구조 반영 안 됨. JeHyeong=Platform Lead, Jay=Platform Architect 미반영** |
| 5 | Mother AI | 3/23 기준 | AI Editorial Director 미반영 |
| 6 | 배포 채널 | 3/23 기준 | - |
| 7 | 피드백 루프 | 3/23 기준 | - |
| 8 | 교육 Academy | 3/23 기준 | 소아암병동 타임라인 있음 (별도 페이지) |
| 9 | 수익 모델 | 3/23 기준 | - |
| 10 | 리스크 맵 | 3/23 기준 | Jay 의존도 대응 업데이트 필요 |
| 11 | 커뮤니티 | 3/23 기준 | - |
| 12 | QA 리포트 | 3/23 기준 | - |

## Spec

### Phase 1: 데이터 구조 분리 (필수)

현재 `DashboardClient.tsx`에 데이터와 UI가 섞여 있음.
데이터를 별도 파일로 분리:

**파일**: `web/src/app/dashboard/data.ts`

```typescript
// 로드맵, 멤버, 파이프라인 등 대시보드 데이터 
// DashboardClient.tsx에서 import
export const roadmapShort = [...]
export const roadmapMid = [...]
export const members = [...]
// ...
```

이렇게 하면:
- 데이터 업데이트 시 UI 코드 건드릴 필요 없음
- 향후 API/마크다운에서 동적 로드로 전환 가능
- 리뷰가 쉬워짐

### Phase 2: 핵심 탭 업데이트

**우선순위 높은 탭:**

1. **탭 4 (멤버 역할)** — `ROLES.md` 기준으로 업데이트:
   - Jay: Platform Architect & PM
   - JeHyeong: Platform Lead (admin)
   - AI Editorial Director (AI 페르소나)
   - Creators: JY, Ryan, Kiwon, TJ, BH

2. **탭 3 (콘텐츠 파이프라인)** — 현재 상태 반영:
   - Cron: daily-research, morning/evening 복구됨
   - Discord 자동 감지: 미구현
   - Herald/Mother: 대기 중 (submissions 비어있음)

3. **탭 5 (Mother AI)** — AI Editorial Director 추가:
   - `novels/authors/editorial-director.yaml` 참고
   - Mother = 운영 AI, Editorial Director = 콘텐츠 판단 AI

4. **탭 10 (리스크 맵)** — Jay 의존도 업데이트:
   - 웹 → JeHyeong 이관 완료
   - 콘텐츠 → AI Editorial Director + 크리에이터 셀프서비스 진행 중

### Phase 3: 나머지 탭 (Stretch)

나머지 탭(2, 6, 7, 8, 9, 11, 12)은 데이터 검증 후 필요한 것만 업데이트.
3/23에서 크게 바뀌지 않은 탭은 그대로 둬도 됨.

## Acceptance Criteria

- [ ] `data.ts` 분리 완료 — DashboardClient.tsx에서 import
- [ ] 탭 4 (멤버 역할): 4-layer 구조 반영
- [ ] 탭 3 (콘텐츠 파이프라인): 파이프라인 현황 반영
- [ ] 탭 5 (Mother AI): AI Editorial Director 포함
- [ ] 탭 10 (리스크): Jay 의존도 대응 업데이트
- [ ] 유니코드 이스케이프 잔여분 없음 (전체 파일 grep 확인)
- [ ] `npm run build` 통과

## Reference

- `web/src/app/dashboard/DashboardClient.tsx` — 현재 대시보드 (단일 파일)
- `ROLES.md` — 4-layer 역할 구조
- `products/hypeproof-roadmap-2026Q2.md` — Q2 로드맵 (source of truth)
- `novels/authors/editorial-director.yaml` — AI Editorial Director 정의
- `data/members.json` — 멤버 데이터
