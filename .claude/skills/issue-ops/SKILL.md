# Issue Ops — HypeProof GitHub Issue 관리

> OpenClaw Mother와 Claude Code가 공유하는 이슈 운영 규칙.
> 이슈는 두 시스템 간 **작업 계약서**다. 누가 만들든 같은 포맷, 같은 라벨, 같은 흐름.

## 라벨 체계

### Type (필수 1개)
| 라벨 | 용도 |
|------|------|
| `bug` | 깨진 것 |
| `enhancement` | 새 기능 |
| `type:architecture` | 구조 변경 |
| `type:migration` | 데이터/코드 마이그레이션 |
| `content` | 칼럼/리서치/소설 |
| `question` | 논의 필요 |

### Area (필수 1개)
| 라벨 | 스코프 |
|------|--------|
| `area:data` | `data/` — 멤버 JSON, SSOT |
| `area:dashboard` | `/dashboard` 페이지 |
| `area:pipeline` | 콘텐츠/멤버 파이프라인 |
| `area:onboarding` | 멤버 온보딩 |
| `web` | Next.js 웹사이트 전반 |
| `columns` | 칼럼 콘텐츠 |
| `research` | 리서치 |
| `docs` | 문서 |

### Agent (실행 주체, 필수 1개)
| 라벨 | 의미 |
|------|------|
| `agent:mother` | OpenClaw Mother가 트리거/운영 |
| `agent:claude-code` | Claude Code가 구현 |
| 둘 다 | 협업 (Mother 트리거 → Claude Code 구현) |

### Priority (필수 1개)
| 라벨 | 의미 |
|------|------|
| `priority:high` | 이번 주 |
| `priority:medium` | 이번 스프린트 |

## 이슈 포맷

### 구조 변경 / 마이그레이션

```markdown
Title: [arch] 한줄 요약

## 배경
왜 이 변경이 필요한가.

## 현재 상태
지금 어떻게 동작하는가. 파일 경로 포함.

## 목표 상태
변경 후 어떻게 되어야 하는가. 파일 경로 포함.

## 작업 항목
- [ ] 구체적 TODO 1
- [ ] 구체적 TODO 2
- [ ] 검증: npm run build 통과
- [ ] 검증: (구체적 E2E 확인)

## 제약
- 절대 하면 안 되는 것
- 의존성 (다른 이슈 번호)

## 실행 주체
- 트리거: Mother / Jay / 크론
- 구현: Claude Code / Mother
```

## 워크플로우

```
이슈 생성 (Mother or Jay)
  → Jay 확인 (assign + milestone)
  → Claude Code가 구현 (worktree or headless)
  → PR 또는 직접 커밋 (#N 참조)
  → 검증 (빌드 + E2E)
  → 이슈 close
```

## 규칙

1. **한 이슈 = 한 작업**. 번들링 금지.
2. **작업 항목에 검증 단계 필수**. "빌드 통과" 최소 포함.
3. **파일 경로는 repo-relative**. `web/src/app/dashboard/` 형태.
4. **의존성 명시**. `Depends on #N` or `Blocked by #N`.
5. **이슈 없이 구조 변경 금지**. 코드 짜기 전에 이슈 먼저.
6. **Mother가 이슈 만들 때**: CLI 결과, 로그, 현재 상태를 **증거로** 첨부.
7. **Claude Code가 이슈 받을 때**: CLAUDE.md + 관련 SKILL.md 반드시 읽기.

## CLI 패턴

```bash
# 이슈 생성
gh issue create \
  --repo jayleekr/hypeprooflab \
  --title "[arch] 제목" \
  --label "type:architecture,area:data,agent:claude-code,priority:high" \
  --body "본문"

# 이슈 목록
gh issue list --repo jayleekr/hypeprooflab --label "priority:high"

# 이슈에 코멘트
gh issue comment N --repo jayleekr/hypeprooflab --body "진행 상황"
```
