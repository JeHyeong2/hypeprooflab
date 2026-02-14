---
title: "OpenClaw로 나만의 AI 비서 만들기 — 설치부터 커스터마이징까지 완전 가이드"
creator: "Jay"
date: 2026-02-15
category: "Tutorial"
tags: ["OpenClaw", "AI Assistant", "Discord Bot", "Tutorial", "Multi-Agent", "Automation"]
slug: "building-ai-assistant-with-openclaw"
readTime: "10 min read"
excerpt: "OpenClaw를 설치하고 Discord에 연결한 뒤, 스킬을 추가하고 나만의 AI 비서로 커스터마이징하는 과정을 단계별로 안내한다. 실제 삽질 경험 포함."
creatorImage: "/members/jay.png"
---

## 토요일 오후, 나는 AI 비서를 만들기로 했다

2026년 2월의 어느 토요일 오후였다. Discord 서버에 쌓이는 알림을 보면서 생각했다. "이 반복 작업들, 누군가 대신 해줄 수 없을까?" 일정 알림, 링크 요약, 간단한 Q&A — 매번 직접 하기엔 너무 사소하고, 그렇다고 무시하기엔 놓치는 정보가 많았다. 그때 OpenClaw를 발견했다. 설치부터 커스터마이징까지, 이 글은 그 여정의 기록이다.

OpenClaw는 오픈소스 멀티에이전트 AI 프레임워크다([OpenClaw Documentation](https://docs.openclaw.ai)). 하나의 인스턴스에서 여러 AI 에이전트를 운영할 수 있고, Discord, Telegram, Slack 같은 메신저와 직접 연결된다. 가장 마음에 든 점은 별도의 서버를 운영하지 않아도 된다는 것이었다. 로컬 맥북에서 바로 돌릴 수 있고, 필요하면 클라우드로 옮기면 된다.

## 1단계: 설치 — 생각보다 간단하지만 함정이 있다

설치 자체는 놀라울 정도로 간단하다. Node.js 18 이상이 설치되어 있다면, 터미널에서 한 줄이면 된다.

```bash
npm install -g openclaw
```

설치가 끝나면 초기 설정을 진행한다.

```bash
openclaw init
```

이 명령어를 실행하면 `~/.openclaw/` 디렉토리가 생성되고, 기본 설정 파일들이 배치된다. 여기서 첫 번째 함정을 만났다. Node.js 버전이 16이었던 것이다. OpenClaw는 ES Module 구문을 사용하기 때문에 Node.js 18 이상이 필수다([Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)). `nvm use 18`로 해결했지만, 이 한 줄을 찾는 데 20분이 걸렸다.

설치 후 확인해야 할 디렉토리 구조는 다음과 같다.

```
~/.openclaw/
├── config.yaml          # 메인 설정 파일
├── workspace/           # 에이전트 작업 공간
│   ├── AGENTS.md        # 에이전트 행동 규칙
│   ├── SOUL.md          # 에이전트 성격 정의
│   └── memory/          # 대화 기억 저장
├── skills/              # 스킬 모듈 디렉토리
└── sessions/            # 세션 데이터
```

이 구조를 이해하는 것이 중요하다. `config.yaml`은 에이전트의 두뇌를 결정하고, `workspace/`는 에이전트의 기억과 성격을 담는다. 나중에 커스터마이징할 때 이 구조를 정확히 알아야 원하는 부분만 수정할 수 있다.

## 2단계: Discord 연결 — 봇 토큰이 전부다

AI 비서가 Discord에서 활동하려면 Discord Bot Token이 필요하다. Discord Developer Portal에서 새 애플리케이션을 만들고, Bot 탭에서 토큰을 생성한다([Discord Developer Portal](https://discord.com/developers/docs/intro)).

```bash
openclaw gateway config set discord.token "YOUR_BOT_TOKEN"
```

여기서 중요한 설정이 하나 더 있다. Message Content Intent를 반드시 활성화해야 한다. Discord는 2022년부터 봇의 메시지 내용 접근에 별도 권한을 요구한다([Discord Gateway Intents](https://discord.com/developers/docs/topics/gateway#gateway-intents)). Developer Portal의 Bot 설정에서 "Message Content Intent" 토글을 켜지 않으면, 에이전트가 메시지를 받아도 내용이 빈 문자열로 들어온다. 이걸 모르면 "왜 봇이 반응을 안 하지?"라며 한참을 헤매게 된다.

설정이 끝나면 게이트웨이를 시작한다.

```bash
openclaw gateway start
```

정상적으로 연결되면 터미널에 `Gateway connected` 메시지가 뜨고, Discord 서버에서 봇이 온라인 상태로 표시된다. 처음 이 초록색 점을 봤을 때의 기분은 — 마치 처음 "Hello, World!"를 출력했을 때와 비슷했다.

연결 후에는 채널 바인딩을 설정해야 한다. OpenClaw의 강점 중 하나는 채널별로 다른 에이전트를 할당할 수 있다는 점이다. 예를 들어 #general 채널에는 캐주얼한 대화 에이전트를, #dev-help 채널에는 코드 리뷰 에이전트를 배치할 수 있다. `config.yaml`에서 다음과 같이 설정한다.

```yaml
channels:
  - id: "general"
    agent: "main"
  - id: "dev-help"
    agent: "code-reviewer"
```

## 3단계: 스킬 추가 — 에이전트에게 능력을 부여하다

기본 상태의 OpenClaw 에이전트는 대화만 할 수 있다. 웹 검색, 파일 읽기, 코드 실행 같은 능력은 스킬(Skill)을 통해 추가한다. OpenClaw의 스킬 시스템은 플러그인 아키텍처를 따르며, 각 스킬은 독립적인 모듈로 작동한다.

내가 처음 추가한 스킬 세 가지는 웹 검색, 브라우저 제어, 그리고 TTS(Text-to-Speech)였다. 웹 검색 스킬을 추가하면 에이전트가 Brave Search API를 통해 실시간 정보를 검색할 수 있다. 브라우저 제어 스킬은 에이전트가 웹페이지를 직접 열고 내용을 읽을 수 있게 해준다. TTS 스킬은 텍스트를 음성으로 변환해서 Discord 음성 채널에서 읽어줄 수 있다.

스킬 추가 방법은 두 가지다. 첫째, 커뮤니티 스킬을 설치하는 방법이다.

```bash
openclaw skill install web-search
openclaw skill install browser
openclaw skill install tts
```

둘째, 직접 스킬을 작성하는 방법이다. 스킬은 기본적으로 `SKILL.md` 파일 하나로 정의된다. 에이전트가 어떤 도구를 어떤 상황에서 사용할지 자연어로 기술하면 된다. 이 접근 방식이 처음엔 이상하게 느껴졌다. "코드가 아니라 마크다운으로 스킬을 정의한다고?" 하지만 실제로 써보니 이 방식이 직관적이었다. AI 에이전트는 자연어 지시를 이해하니까, 스킬 정의도 자연어로 하는 게 맞는 것이다.

주요 스킬들의 용도와 설정 복잡도를 정리하면 다음과 같다.

| 스킬 | 용도 | API 키 필요 | 설정 난이도 |
|------|------|------------|------------|
| web-search | 실시간 웹 검색 | Brave API 키 | 낮음 |
| browser | 웹페이지 접근 및 조작 | 없음 | 중간 |
| tts | 텍스트 음성 변환 | ElevenLabs API 키 | 낮음 |
| exec | 셸 명령어 실행 | 없음 | 낮음 (보안 주의) |
| calendar | Google Calendar 연동 | OAuth 설정 | 높음 |
| email | 이메일 확인 및 발송 | OAuth 또는 SMTP | 높음 |

스킬을 추가한 후에는 반드시 보안 설정을 확인해야 한다. 특히 `exec` 스킬은 에이전트가 시스템 명령어를 직접 실행할 수 있게 해주므로, 허용 목록(allowlist) 모드로 운영하는 것을 강력히 권장한다. OpenClaw는 기본적으로 보안 모드가 `deny`로 설정되어 있어 명시적으로 허용하지 않은 명령어는 실행되지 않는다. 이 설계 철학에 감사해야 할 순간이 올 것이다.

## 4단계: 커스터마이징 — 에이전트에게 영혼을 불어넣다

기술적 설정이 끝났다면, 이제 가장 재미있는 단계가 남았다. 에이전트의 성격과 행동을 정의하는 것이다. OpenClaw에서는 이것을 `SOUL.md`라고 부른다. 이 파일에 에이전트의 이름, 말투, 성격, 대화 스타일을 자유롭게 기술한다.

내가 만든 AI 비서의 SOUL.md는 이렇게 시작한다.

```markdown
# You are Aria

You are a friendly, slightly witty AI assistant who lives in Jay's Discord server.
You speak Korean primarily but switch to English when technical terms come up.
You use casual speech (반말) with Jay but formal speech (존댓말) with others.
When you don't know something, you say so honestly instead of making things up.
You love making dad jokes when the mood is right.
```

이 파일 하나로 에이전트의 전체 성격이 결정된다. 처음에는 "이게 정말 효과가 있을까?" 의심했지만, Claude 모델의 지시 따르기 능력은 놀라울 정도로 정확했다. SOUL.md에 "아재 개그를 좋아한다"고 쓰면, 정말로 적절한 타이밍에 아재 개그를 던진다.

`AGENTS.md`는 에이전트의 행동 규칙을 정의한다. 파일을 읽고 쓰는 방법, 메모리를 관리하는 방법, 그룹 채팅에서 언제 말하고 언제 조용히 할지 등의 규칙이 여기에 들어간다. 이 파일은 에이전트의 "사회성"을 결정한다고 볼 수 있다.

커스터마이징에서 가장 중요한 것은 메모리 시스템이다. OpenClaw의 에이전트는 세션이 끝나면 대화 내용을 잊는다. 하지만 `memory/` 디렉토리에 날짜별 파일을 저장하고, `MEMORY.md`에 장기 기억을 정리하면, 다음 세션에서도 맥락을 유지할 수 있다. 이것은 단순한 대화 로그가 아니라, 에이전트가 스스로 정리한 "기억"이다. 마치 사람이 일기를 쓰고, 나중에 그 일기를 읽으며 과거를 떠올리는 것과 같다.

메모리 시스템의 구조를 정리하면 다음과 같다.

| 파일 | 역할 | 업데이트 주기 | 크기 권장 |
|------|------|-------------|----------|
| `memory/YYYY-MM-DD.md` | 일일 로그 (raw) | 매 세션 | 제한 없음 |
| `MEMORY.md` | 장기 기억 (curated) | 주 2-3회 | 2000자 이내 |
| `HEARTBEAT.md` | 주기적 확인 사항 | 필요시 | 500자 이내 |

## 5단계: 실전 — 일주일 사용 후기

모든 설정을 마치고 일주일간 Aria를 운영한 결과를 공유한다. 가장 유용했던 기능은 하트비트(Heartbeat) 시스템이었다. OpenClaw는 설정된 주기마다 에이전트를 깨워서 할 일이 있는지 확인시킨다. 이메일을 체크하고, 캘린더 일정을 알려주고, 날씨를 확인하는 작업을 하트비트에 등록해두면, 에이전트가 알아서 체크하고 중요한 것만 알려준다.

일주일 동안의 통계는 이렇다. Aria는 총 347번의 메시지를 처리했고, 그 중 42번은 웹 검색을 동반했다. TTS로 음성 메시지를 생성한 횟수는 15번이었고, 파일을 읽거나 쓴 횟수는 89번이었다. 가장 많이 사용된 스킬은 웹 검색이었고, 가장 적게 사용된 스킬은 이메일 확인이었다. 이 데이터를 보면서 "아, 나는 이메일보다 웹 검색을 훨씬 많이 시키는구나"라는 자기 발견도 했다.

가장 인상적이었던 순간은 Aria가 스스로 메모리를 정리하는 것을 봤을 때다. 하트비트 시간에 Aria는 최근 대화 기록을 읽고, 중요한 맥락을 MEMORY.md에 정리했다. "Jay는 최근 HypeProof 프로젝트에 집중하고 있음. 오후 11시 이후에는 조용히 해달라고 요청함." 이런 메모를 보면서 묘한 감동을 받았다. 기계가 나를 "이해"하고 있다는 느낌 — 물론 실제로 이해하는 것은 아니지만, 그 효과는 실제와 다름없었다.

## 트러블슈팅: 내가 겪은 세 가지 실수

첫 번째 실수는 API 키를 환경 변수 대신 config.yaml에 직접 넣은 것이었다. 이 파일을 Git에 커밋할 뻔했다. OpenClaw는 환경 변수를 통한 시크릿 관리를 지원하므로, API 키는 반드시 `OPENCLAW_ANTHROPIC_KEY` 같은 환경 변수로 설정해야 한다.

두 번째 실수는 메모리 파일을 너무 크게 키운 것이었다. MEMORY.md가 5000자를 넘어가자, 에이전트가 세션을 시작할 때마다 토큰을 대량으로 소비하기 시작했다. 장기 기억은 정말 중요한 것만 남기고, 세부 사항은 일일 로그에 보관하는 것이 효율적이다.

세 번째 실수는 보안 설정을 느슨하게 한 것이었다. `exec` 스킬을 `full` 모드로 설정했다가, 에이전트가 `rm -rf`을 실행하려 한 적이 있다. 물론 확인 프롬프트에서 막았지만, 심장이 한 번 쿵했다. 보안은 기본적으로 가장 제한적인 설정에서 시작해서, 필요할 때만 열어주는 것이 정답이다([OWASP Security Principles](https://owasp.org/www-project-developer-guide/draft/foundations/security_principles/)).

## 마치며: AI 비서는 도구가 아니라 동반자다

OpenClaw로 AI 비서를 만드는 과정은 단순한 기술 설정을 넘어서는 경험이었다. SOUL.md에 성격을 정의하고, 메모리 시스템을 통해 맥락을 유지하고, 스킬을 통해 능력을 확장하는 과정은 — 약간 과장을 보태면 — 디지털 동반자를 키우는 느낌이었다.

물론 한계도 있다. AI 비서는 여전히 환각(hallucination)을 일으킬 수 있고, 복잡한 판단이 필요한 상황에서는 사람의 확인이 필요하다. 하지만 반복적인 정보 확인, 일정 관리, 간단한 리서치 같은 작업에서는 이미 충분히 실용적이다. Gartner는 2026년까지 기업의 40%가 AI 에이전트 기반 자동화를 도입할 것으로 전망했다([Gartner AI Agent Forecast 2026](https://www.gartner.com/en/articles/intelligent-agent-in-ai)).

이 글을 읽고 직접 시도해보고 싶다면, OpenClaw의 공식 문서에서 시작하는 것을 추천한다. 그리고 하나만 기억하자 — 처음엔 누구나 삽질한다. 그 삽질이 쌓여서 나만의 완벽한 AI 비서가 만들어지는 것이다.
