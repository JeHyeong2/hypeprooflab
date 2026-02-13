# Herald Bot 생성 가이드

> Discord Developer Portal에서 Herald 🔔 봇을 만들고 HypeProof Lab 서버에 배포하는 단계별 가이드

---

## 1. Discord Application 생성

1. [Discord Developer Portal](https://discord.com/developers/applications) 접속
2. 우측 상단 **New Application** 클릭
3. 이름: `Herald` 입력
4. Terms of Service 동의 → **Create**
5. General Information 페이지에서:
   - **Description**: `HypeProof Lab의 콘텐츠 전령관 🔔 — 크리에이터 온보딩, 글 접수, GEO QA, Peer Review 조율`
   - **App Icon**: Herald 아바타 이미지 업로드 (512×512+, 중세 전령관 컨셉 권장)
   - **Save Changes**

---

## 2. Bot 설정

1. 좌측 메뉴 → **Bot** 클릭
2. **Add Bot** → 확인
3. Bot 설정:
   - **Username**: `Herald` (또는 `Herald 🔔`)
   - **Icon**: 아바타 업로드 (Application 아이콘과 동일하거나 별도)
4. **Privileged Gateway Intents** 활성화:
   - ✅ **Presence Intent** — 멤버 온라인 상태 추적
   - ✅ **Server Members Intent** — 멤버 목록 접근 (온보딩에 필요)
   - ✅ **Message Content Intent** — DM/메시지 내용 읽기 (제출물 접수에 필수)
5. **Public Bot** → ❌ 비활성화 (HypeProof Lab 전용)
6. **Save Changes**

---

## 3. Bot 토큰 발급

1. Bot 페이지 → **Reset Token** 클릭
2. 토큰 복사 → **안전한 곳에 보관**
   - ⚠️ 토큰은 한 번만 표시됨
   - ⚠️ GitHub에 절대 커밋하지 않기
   - 저장 위치: 환경변수 또는 비밀 관리 시스템

```bash
# .env 파일 (gitignore에 포함 필수)
HERALD_BOT_TOKEN=your-token-here
```

---

## 4. OAuth2 & 서버 초대

### 권한 설정

1. 좌측 메뉴 → **OAuth2** → **URL Generator**
2. **Scopes** 선택:
   - ✅ `bot`
   - ✅ `applications.commands` (슬래시 커맨드용)
3. **Bot Permissions** 선택:

| 권한 | 용도 |
|------|------|
| Send Messages | 채널에 메시지 전송 |
| Send Messages in Threads | 스레드 내 메시지 |
| Embed Links | 임베드 메시지 |
| Attach Files | 파일 첨부 (리뷰 결과 등) |
| Read Message History | 메시지 이력 읽기 |
| Add Reactions | 리액션 추가 (승인/거절 등) |
| Use Slash Commands | `/submit`, `/review` 등 |
| Manage Messages | 메시지 관리 (핀 등) |
| Manage Threads | 스레드 관리 |
| Create Public Threads | 리뷰 스레드 생성 |
| Create Private Threads | 비공개 리뷰 스레드 |
| Mention Everyone | 공지용 @everyone |
| Manage Roles | Creator 역할 부여 (온보딩 완료 시) |

**Permission Integer**: `328565073920` (위 권한 조합)

### 서버 초대

4. 생성된 URL 복사
5. 브라우저에서 열기 → **HypeProof Lab** 서버 선택 → **Authorize**

---

## 5. 서버 내 설정

### Herald 역할 위치

Discord 서버 설정 → Roles에서 Herald 봇 역할을 **Creator 역할 위에** 배치 (역할 부여를 위해 필수)

### Herald 전용 채널 (선택)

- `#herald-log` — Herald의 활동 로그 (Admin만 열람)
- `#submit-queue` — 제출물 대기열 확인 (Admin만 열람)

---

## 6. Mother (OpenClaw) 연동

Herald는 독립 봇이지만, Mother(OpenClaw)가 오케스트레이터 역할을 한다.

### 연동 옵션

#### Option A: OpenClaw 서브에이전트 (권장)

Mother가 Herald를 서브에이전트로 직접 조율:
- Herald 봇 토큰을 OpenClaw에 등록
- Mother가 Herald의 로직 (GEO QA, 리뷰 매칭) 실행
- Herald는 Discord 인터페이스만 담당

```
Creator ←→ Herald (Discord) ←→ Mother (OpenClaw)
                                    ↓
                              GEO QA, 리뷰 매칭, 
                              발행 준비, 포인트 관리
```

#### Option B: Webhook 연동

Herald 봇이 독립적으로 작동하되, 주요 이벤트를 Mother에게 webhook으로 알림:
- 제출물 접수 → Mother에 알림
- 리뷰 완료 → Mother에 알림  
- Mother가 최종 승인 후 Herald에게 발행 지시

#### Option C: 단순 Discord Bot (Phase 1 최소 구현)

Herald를 기본 Discord 봇으로만 운영:
- DM으로 제출물 접수
- 수동으로 GEO QA 실행
- Admin(Jay)이 직접 리뷰어 배정
- Mother 연동 없이 시작, 점진적으로 자동화

### 권장 순서

1. **Phase 1**: Option C로 시작 (빠른 론칭)
2. **Phase 2**: Option A로 전환 (자동화)
3. **Phase 3**: 완전 자동 파이프라인

---

## 7. 슬래시 커맨드 (계획)

Herald가 지원할 주요 커맨드:

| 커맨드 | 설명 | 권한 |
|--------|------|------|
| `/submit` | 글/창작물 제출 | Creator |
| `/status` | 제출물 상태 확인 | Creator |
| `/review` | 리뷰 대기 목록 확인 | Creator |
| `/points` | 내 포인트 조회 | Creator |
| `/leaderboard` | 포인트 랭킹 | All |
| `/persona register` | AI 페르소나 등록 | Creator |
| `/persona list` | 등록된 페르소나 목록 | All |
| `/admin approve` | 제출물 승인 | Admin |
| `/admin reject` | 제출물 반려 | Admin |
| `/admin points` | 포인트 수동 조정 | Admin |

---

## 체크리스트

- [ ] Discord Developer Portal에서 Application 생성
- [ ] Bot 추가 및 Intents 활성화
- [ ] Bot 토큰 발급 및 안전하게 보관
- [ ] HypeProof Lab 서버에 초대
- [ ] Herald 역할 위치 조정
- [ ] (선택) OpenClaw 연동 설정
- [ ] 테스트: Herald에게 DM 보내기

---

*SPEC.md Section B, H 기준으로 작성됨.*
