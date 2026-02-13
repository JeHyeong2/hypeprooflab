# HypeProof Lab — Migration Checklist

> 현재 상태 → 새 구조로의 전환 액션 아이템
> Created: 2026-02-13

---

## 용어 변경

- [x] `community/VISION.md` — "Forge" → "Herald", "Author" → "Creator"
- [x] `community/CONTENT-PIPELINE.md` — "Forge" → "Herald", "Author" → "Creator"
- [ ] `community/COMMUNITY_STRATEGY.md` — "Author" → "Creator" 반영, Herald 언급 추가
- [ ] `community/CONTENT_STRATEGY.md` — Creator 용어 통일, AEO 파이프라인 반영
- [ ] `community/DISCORD_STRUCTURE.md` — 역할 구조 업데이트 (Admin/Creator/Spectator 3단계)
- [ ] `community/GROWTH_PLAYBOOK.md` — Creator 용어 반영
- [ ] `PHILOSOPHY.md` — AI Author Persona 개념 추가
- [ ] `web/` 내 모든 파일 — "Author" → "Creator" 전체 치환

## 개인정보 정리

- [ ] `members.md` — 이메일 주소 전부 제거
- [ ] `members.md` — Discord ID 추가
- [ ] `members.md` — 역할을 Admin/Creator로 명시
- [ ] GitHub 히스토리에 이메일이 남아있는지 확인 (필요 시 rebase)

## Notion DB 구축

- [ ] Notion 워크스페이스에 Members DB 생성
- [ ] SPEC.md Section A의 필드 스키마대로 테이블 생성
- [ ] 현재 멤버 7명 데이터 입력
- [ ] AI Personas DB 생성 (별도 테이블, Members와 Relation)
- [ ] Points Ledger DB 생성 (포인트 이력 추적)

## Herald Agent 구축

- [x] `community/HERALD-SOUL.md` 생성
- [ ] Discord Developer Portal에서 새 Application 생성
- [ ] Herald Bot 토큰 발급
- [ ] Bot을 HypeProof Lab Discord 서버에 초대
- [ ] Mother ↔ Herald 연동 구현 (OpenClaw 멀티 채널 or 서브에이전트)
- [ ] Herald DM 기반 제출 flow 구현
- [ ] GEO QA 자동 채점 스크립트 작성 (Python or Node.js)
- [ ] Peer Review 매칭 로직 구현
- [ ] 포인트 적립/조회 기능 구현

## AI Author Persona 시스템

- [x] `community/AI-PERSONA-TEMPLATE.md` 생성
- [ ] Notion에 AI Personas DB 생성
- [ ] Herald에 페르소나 등록 flow 구현
- [ ] Herald에 페르소나 검증 체크리스트 구현
- [ ] 웹사이트 Creator 프로필에 페르소나 표시 기능 추가
- [ ] 창작물 제출 flow 구현 (콘텐츠와 별도)
- [ ] 창작물 리뷰 기준 (페르소나 일관성 등) Herald에 내재화

## Discord 서버 업데이트

- [ ] 역할 정리: Admin, Creator, Spectator (기존 복잡한 역할 통합)
- [ ] Herald Bot 전용 채널 생성 (또는 DM 전용 안내)
- [ ] #announcements에 새 구조 공지
- [ ] Creator 온보딩 가이드 채널/핀 메시지 작성
- [ ] 기존 멤버에게 Creator 역할 부여

## 콘텐츠 인프라

- [ ] GEO QA 채점 스크립트 작성 및 테스트
- [ ] 프로세스 아카이브 저장 구조 (GitHub 경로) 확정
- [ ] Frontmatter 자동 생성 스크립트
- [ ] Schema markup (Article, FAQ) 자동 삽입 스크립트
- [ ] AI Citation Testing 자동화 (선택, Phase 2)

## 웹사이트 업데이트

- [ ] Creator 프로필 페이지 (페르소나 포함)
- [ ] 창작물 전용 섹션/레이아웃
- [ ] "Author" → "Creator" UI 전체 변경
- [ ] 프로세스 아카이브 뷰어 (선택)

## Analytics 설정

- [ ] Google Analytics에 AI referral 추적 설정
  - ChatGPT UA/referrer 필터
  - Perplexity UA/referrer 필터
  - Gemini referrer 필터
- [ ] AI Citation Testing 스프레드시트/DB 생성

## 문서 정리

- [x] `community/SPEC.md` 생성 (마스터 스펙)
- [x] `community/HERALD-SOUL.md` 생성
- [x] `community/AI-PERSONA-TEMPLATE.md` 생성
- [x] `community/MIGRATION.md` 생성 (이 문서)
- [x] `community/VISION.md` 업데이트
- [x] `community/CONTENT-PIPELINE.md` 업데이트

## 테스트 & 론칭

- [ ] Jay가 Herald로 글 1편 제출 (end-to-end 테스트)
- [ ] Creator 1~2명과 파일럿 테스트
- [ ] 피드백 수집 및 개선
- [ ] 전체 Creator에게 오픈
- [ ] 첫 AI Persona 등록 (Jay의 CIPHER)

---

*완료된 항목은 [x]로 표시. 담당자/기한은 별도 Notion 태스크로 관리.*
