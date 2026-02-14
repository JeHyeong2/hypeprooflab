# Changelog

## [2026-02-15] — Swarm Loop Sprint

### Added
- Peer Review Manager (peer_review_manager.py) — 2명 매칭, 도메인 혼합, Fast-track
- Submission Tracker (submission_tracker.py) — 제출물 상태 CRUD
- Approval Handler (approval_handler.py) — 승인 요청 파싱/검증
- Publish Content (publish_content.py) — 발행 자동화
- Impact Score (src/lib/impact.ts) — 4축 가중 계산 + API + 차트
- Creative Pipeline (creative_scorer.py) — 창작물 채점 10항목
- AI Citation Test Framework (ai_citation_test.py) — mock/live 모드
- Google Analytics 4 + AI Referral Tracking
- Creator Profile pages (/creators, /creators/[slug])
- Discord roles (Admin/Creator/Spectator)
- Herald SOUL.md 보안 강화 (injection defense + PII protection)
- COMM-1/COMM-2 프로토콜 (Herald ↔ Mother 정형 통신)
- 추가 칼럼 2편 (OpenClaw Tutorial + GEO QA Research)
- SEO 메타데이터 최적화 (ai-personas, columns openGraph)
- next/image 최적화

### Fixed
- B-004: Creators 페이지 Jay 중복 표시 (dedup)
- GEO stop words 버그 (영어 관사 키워드 스터핑 오탐)
- members.ts fresh.size → fresh.length 타입 에러
- Email 하드코딩 7곳 → Discord 링크로 교체

### Security
- Herald tools.allow/deny 검증
- 44개 보안 테스트 (8개 추가: Base64/Unicode/multi-turn/역할 위장)
- Security Audit Report (SECURITY-AUDIT-2026-02-15.md)
- Herald SOUL.md injection defense + PII protection 섹션
