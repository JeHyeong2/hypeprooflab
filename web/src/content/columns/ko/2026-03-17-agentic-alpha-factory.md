---
title: "Agentic Alpha Factory: AI 트레이딩 자동화의 현실"
creator: "Ryan"
creatorImage: "/members/ryan.png"
date: 2026-03-17
category: "AI × Finance"
tags: ["quant", "agentic", "trading", "hedge fund", "claude code", "alpha"]
slug: "2026-03-17-agentic-alpha-factory"
readTime: "8분"
excerpt: "\"하루 만에 성공\"이라고? 7개월째 만들고 있는 사람의 솔직한 기록. 에이전틱 퀀트 하니스의 3가지 병목과 Pod Shop을 AI로 복제하려는 비전."
---

*"하루 만에 성공"이라고? 7개월째 만들고 있는 사람의 솔직한 기록*

---

"AI agent로 트레이딩 완전 자동화했다, 하루 만에 했다" — 이런 글이 매주 올라온다. 솔직히 부러웠다. 하지만 7개월째 이걸 직접 만들고 있는 사람으로서 말하겠다. 현실은 그렇지 않다.

오늘은 에이전틱 퀀트 하니스를 만들면서 부딪힌 3개의 병목, 그 과정에서의 멘탈, 그리고 이게 어디로 가는지에 대한 비전을 가감 없이 공유한다.

---

## Pod Shop이란 무엇인가

먼저 배경을 깔겠다. 글로벌 톱 헤지펀드들 — Citadel, Millennium, Point72, Balyasny — 은 **"Pod Shop"**이라 불리는 구조로 운영된다. 하나의 거대한 펀드 안에 수십~수백 개의 독립적인 소규모 팀(**Pod**)이 있고, 각 Pod은 자체 전략을 운영한다. 보통 1개의 Pod은 포트폴리오 매니저(PM) 1명 + 퀀트 리서처 1~2명 + 개발자 1명, 약 3명으로 구성된다. 본사는 리스크 관리, 자본 배분, 인프라를 제공하고, Pod이 일정 손실 한도(보통 -3~5%)를 넘기면 즉시 청산된다.

이 구조의 핵심은 **분산과 경쟁**이다. 서로 다른 전략을 독립적으로 돌리되, 리스크는 중앙에서 통제한다. 내가 만들려는 것은 이 Pod Shop의 구조를 AI 에이전트로 복제하는 것이다.

---

## 7개월 전의 병목: 코드 생성

7개월 전, 채팅으로 아이디어를 내면 전략 리서치 → 백테스트 → Self-Evolution까지 이어지는 에이전틱 퀀트 하니스, **[VibeTrading](https://www.linkedin.com/posts/jiwoong-kim-b9934417a_introducing-the-prototype-of-my-new-personal-activity-7361167113148878848-quDk/)**의 시연 장면을 공개했다.

당시에는 Agent가 리서치 결과를 코드로 변환하는 데 병목이 있을 거라 생각했고, WorldQuant Brain에서 쓰는 Domain Specific Language(DSL) 방식으로 풀었다. 코드의 추상화를 올린 것이다. `ts_rank(close, 20)` 같은 expression tree를 생성하는 데 많은 시간을 썼다.

이후 이 프로젝트를 회사에 제안했고, 나까지 2명뿐인 아주 작은 팀을 리드하게 되었다. 이때 회사 상사분이 "AI는 앞으로 똑똑해질 테니 DSL 버리고 코드 생성 그대로 가는 거 어떨까요?"라고 제안해 주셨다. 정확히 맞았다.

[Claude Code](https://docs.anthropic.com/en/docs/claude-code)가 나오고, Skill, [Ralph Loop](https://www.anthropic.com/research/building-effective-agents), harness engineering... 이제 100% Claude Code 기반으로 마이그레이션했다. 적절한 가이드라인을 주면 코드 생성은 껌이다. 이제는 '논문 to 딸깍'도 되는 시대다.

---

## 현재의 병목: 에이전트 운영

코드 생성이 해결되자 다음 병목이 왔다. **"어떻게 하면 에이전트가 안 멈추게 하지?"**

Ralph Loop가 없던 시절이라 고민을 많이 했고, 유사하지만 상황에 맞는 방식으로 해결했다. 그다음은 멀티 에이전트 관리와 컨텍스트 유지 문제인데, Claude Code가 업데이트되면서 많은 부분이 해결되고 있다.

나는 Claude Code에서 출시하는 기능 — Skill, Task, Teams 등 — 의 본질을 이해하고 쓰는 데 집중한다. 또한, 다른 분야에서 사용되지만 본질은 같고 모습만 다른 개념들을 연결 지어 적용하는 데 많은 시간을 쓴다. (이걸 잘하려고 주말마다 인문학 스터디도 한다.) 그리고 [OMC(oh-my-claudecode)](https://discord.com/invite/JkT8CT5gq), OMX(oh-my-codex) 같은 커뮤니티 하니스들에서 아직 배우고 적용할 게 많다.

---

## 피할 수 없는 병목: 도메인

최근의 병목은 돌고 돌아 결국 **도메인의 영역**이다.

새로운 데이터 벤더로 마이그레이션하는데 이곳저곳에서 다 터진다. 모델 단에서 해야 할 퀄리티 체크. 거래정지 및 상장폐지 종목은 어떻게 다루지? Look-ahead bias가 생기진 않나? 데이터가 비는 이유가 여러 개인데 인프라팀과는 어떻게 소통하지? 에이전트가 이벤트 기반 백테스터와 연결할 때의 체크포인트들. Long-only 전략만 있는 걸 합성할 때 orthogonal한 알파가 나올까? 생성된 알파의 관리와 합성은? 시간이 없는데 어디를 에이전트한테 맡기고 어디를 직접 챙겨야 할지. 아이디어가 바닥났는데 어디서 가져와 증강시킬지. 어떤 평가지표를 봐야 할지.

고민이 끝이 없다.

AI가 코드를 아무리 잘 짜도, "거래정지된 종목의 가격 데이터가 비어있을 때 그게 정말 비어있는 건지 아니면 데이터 벤더의 오류인지"를 판단하는 건 도메인 지식이다. 여기는 에이전트가 대신해줄 수 없다.

---

## 멘탈: FOMO와의 싸움

새로운 기능 따라가기도 바쁜데 도메인까지. 하니스 개발은 생각보다 속 터지고, 주말마다 누가 뭘 만들었다, 다 잘된다는 멋진 성공 사례가 뜨는데 '나만 잘 못하는 건가' 하는 생각이 계속 든다.

FOMO가 오지만, 다른 분들도 무언가 만들 때 비슷한 고생을 했겠지, 원래 그런가 보다 하고 넘긴다. **나무 깎는 기계를 만들려면 손으로 직접 깎아봐야 안다**는 마음으로 내 일에 집중하기로 했다.

---

## 비전: Asymmetric한 구조

내가 바라는 것은 이 문제들이 전부 해결되고, AI 에이전트로 Pod Shop을 만드는 것이다.

숫자로 보면 구조가 명확해진다.

글로벌 헤지펀드의 퀀트 Pod 하나를 운영하려면 퀀트 리서처 + 개발자 + PM, 약 3명이 필요하다. 이들의 평균 연봉은 약 2억 원. **1개 Pod의 인건비: 연 6억 원.**

반면, 내가 지금 테스트하고 있는 구조는 Claude Max 20x 계정 4개가 각각 2개의 에이전틱 루프를 돌려 **총 8개의 AI Pod**을 운영하는 것이다. Claude Max 20x 비용은 계정당 월 $200. **8개 Pod의 연간 비용: 약 $9,600(약 1,300만 원).**

같은 8개 Pod을 사람으로 운영하면 연 48억 원. AI로 운영하면 1,300만 원. **비용 비율 약 370:1.** 물론 AI Pod의 퍼포먼스가 인간 Pod과 같다는 보장은 없다. 아직 거기까지는 갈 길이 멀다. 하지만 이 비대칭 구조 자체가 베팅할 가치가 있다고 믿는다.

그리고 내가 놀아도 실리콘밸리의 Foundation Model을 만드는 사람들은 안 논다. 모델 성능이 올라갈수록 하니스의 성능도 함께 올라간다. **내가 하니스를 잘 만들어두면, 시간이 나의 편이 된다.**

---

### 참고 자료

| # | 출처 | URL |
|---|------|-----|
| 1 | VibeTrading 시연 — Agentic Quant Research Tool | https://www.linkedin.com/posts/jiwoong-kim-b9934417a_introducing-the-prototype-of-my-new-personal-activity-7361167113148878848-quDk/ |
| 2 | Claude Code — Anthropic 공식 문서 | https://docs.anthropic.com/en/docs/claude-code |
| 3 | Building Effective Agents (Ralph Loop) — Anthropic Research | https://www.anthropic.com/research/building-effective-agents |
| 4 | OMC / OMX 커뮤니티 | https://discord.com/invite/JkT8CT5gq |
