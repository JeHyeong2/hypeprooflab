# /cal Skill — Setup

HypeProof Lab dashboard 캘린더(`data/project-timeline.json`)를 자연어/슬래시로
관리하고 Google Calendar와 양방향 동기화하는 Claude Code skill.

상세 사용법은 [`SKILL.md`](./SKILL.md), 데이터 스키마는 [`schema.md`](./schema.md) 참고.

## 설치 (1회)

Claude Code는 `~/.claude/skills/<name>/SKILL.md` 경로만 자동 로드함. 이 폴더를
사용자 skills 디렉토리에 심볼릭 링크 걸어주면 끝:

```bash
# repo root에서 실행
mkdir -p ~/.claude/skills
ln -s "$(pwd)/skills/cal" ~/.claude/skills/cal
```

source는 프로젝트 안에 그대로 유지되고(팀 공유), Claude Code는 심볼릭 링크를
따라 같은 SKILL.md를 읽음.

설치 확인:

```bash
ls -la ~/.claude/skills/cal
# lrwxr-xr-x ... ~/.claude/skills/cal -> .../hypeprooflab/skills/cal
```

새 Claude Code 세션을 열면 `/cal` 호출 가능.

## Google Calendar 연동 (선택)

처음 `/cal sync` 호출 시 Anthropic의 `claude.ai Google Calendar` MCP가
OAuth 인증 URL을 안내함. 브라우저에서 인증 → callback URL 회신하면 활성화.

지정한 calendar에 이벤트 push/pull 양방향 동기화. 자세한 매핑·충돌 정책은
SKILL.md의 "Google Calendar 양방향 동기화" 섹션 참고.

## 사용 예시

```text
# 자연어 (권장)
보아치과 일정 5/30으로 바꿔줘
동아일보 6월 일정 취소해줘
5/15 오후 3시 새 미팅 추가
캘린더 동기화

# 슬래시
/cal add 5월 5일 어린이날 모임
/cal update <대상>
/cal cancel <대상>     # 이력 보존, status='cancelled'
/cal delete <id>       # 완전 삭제, 두 번 confirm
/cal sync              # gcal 양방향 reconcile
```

## 주요 파일 의존

skill은 dashboard 코드의 storage abstraction을 사용:

- `web/src/lib/timeline/store.ts` — `defaultStore()` (JSON file ↔ 추후 Supabase)
- `web/src/lib/timeline/gcalSync.ts` — push/pull/reconcile
- `data/project-timeline.json` — source of truth

따라서 `/cal`은 dashboard와 동일한 데이터를 보고/쓰며, dashboard "🔄 동기화"
버튼은 reconcile만 트리거(실제 gcal MCP 호출은 Claude Code 컨텍스트 필요).
