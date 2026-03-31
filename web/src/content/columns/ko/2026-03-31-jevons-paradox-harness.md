---
title: "증기기관이 석탄을 죽였는가 — AI 하네스의 제본스 역설"
creator: "Ryan"
creatorImage: "/members/ryan.png"
date: 2026-03-31
category: "AI Engineering"
tags: ["jevons-paradox", "agent-harness", "frontier-model", "infrastructure", "AI"]
slug: "2026-03-31-jevons-paradox-harness"
readTime: "7분"
excerpt: "모델이 강해질수록 하네스는 죽는다? 1865년 경제학자 Jevons가 이미 답했다. 효율성이 수요를 줄이지 않고 폭발시킨다면, AI 하네스도 같은 구조다."
lang: "ko"
authorType: "creator"
---

## 1. 관념의 혼동

1865년, 영국 경제학자 [William Stanley Jevons](https://en.wikipedia.org/wiki/The_Coal_Question)는 한 가지 관찰을 했다. [James Watt의 증기기관](https://en.wikipedia.org/wiki/Watt_steam_engine)이 석탄 효율을 극적으로 높였는데, 영국의 석탄 소비는 줄기는커녕 폭증했다.

> *"It is a confusion of ideas to suppose that the economical use of fuel is equivalent to a diminished consumption. The very contrary is the truth."*
> "연료의 경제적 사용이 소비의 감소와 같다고 생각하는 것은 관념의 혼동이다. 진실은 정반대다."

이것이 [제본스의 역설](https://en.wikipedia.org/wiki/Jevons_paradox)이다. 효율성이 effective cost를 낮추면, 이전에 그 자원을 쓸 수 없던 영역까지 채택이 확산된다. 방직업만 쓰던 석탄이 철도, 광업, 제철, 농업으로 퍼졌다. 단위당 소비는 줄었지만 총 소비는 폭발했다.

2026년, AI 업계에서 같은 관념의 혼동이 벌어지고 있다. "모델이 강해질수록 하네스(harness)는 죽는다."

---

## 2. 정직한 인정

이 주장에는 실제 근거가 있다.

GPT-3.5 시절, LangChain은 모델에게 도구를 쓰게 하려고 복잡한 파싱 로직을 직접 만들었다. 지금은 모델이 native function calling을 지원한다. 컨텍스트 윈도우는 32K에서 1M으로 폭발했고, RAG 파이프라인의 상당 부분이 "그냥 다 넣으면 됨"으로 대체됐다. [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)는 별도 오케스트레이터 없이 혼자 터미널을 열고 코드를 쓴다.

**하네스가 만든 레이어가 모델에 흡수되고 있다.** 이건 사실이다.

여기서 멈추면 결론은 명확하다: 하네스는 모델의 부족함을 메우는 보조기구였고, 모델이 완성에 가까워질수록 사라진다. LangChain, CrewAI, [OpenClaw](https://openclaw.ai) — 모두 도태될 운명.

하지만 Jevons라면 물었을 것이다: **"증기기관이 좋아졌을 때, 석탄 소비가 정말 줄었느냐?"**

---

## 3. 안 되던 것이 되는 순간

Claude Code가 혼자서 코딩을 할 수 있게 됐다. 좋다. 그런데 그걸 회사의 CI/CD에 붙이고, 크론으로 매일 돌리고, 실패하면 롤백하고, 비용을 추적하고, 보안 정책을 적용하려면? 모델이 코딩을 "되게" 만들었지만, 그것을 **프로덕션에서 돌리는 인프라**는 새로 필요하다.

이것이 Jevons 구조다. 모델이 한 영역을 "되게" 만들 때마다, 그 영역과 실세계를 연결하는 새로운 인프라가 필요해진다. 옛 하네스의 일부는 모델에 흡수되지만, 새 프론티어에 새 하네스가 놓인다.

| Jevons (1865) | AI Harness (2026) |
|---------------|-------------------|
| Watt 증기기관 = 석탄 효율 ↑ | Frontier Model = 추론 효율 ↑ |
| 석탄의 effective cost ↓ | AI 사용의 effective cost ↓ |
| 못 쓰던 산업이 석탄 채택 | 못 쓰던 영역이 AI 채택 |
| 산업마다 새 인프라 필요 | 영역마다 새 연결(하네스) 필요 |
| **총 석탄 소비 ↑** | **총 하네스 수요 ↑** |

---

## 4. 보조기구가 아니라 브릿지

"하네스가 죽는다"는 주장의 오류는 하네스를 **보조기구**로 보는 데 있다. 모델이 못하는 걸 대신해주는 목발. 목발이니까 걸을 수 있게 되면 버린다.

하지만 하네스는 목발이 아니다. **모델이 갈 수 없던 곳으로 가게 하는 브릿지**다.

Watt 증기기관은 석탄의 목발이 아니었다. 석탄이 방직업에서 철도로, 철도에서 제철소로 건너가게 한 브릿지였다. 브릿지를 건너면 그 자리는 도로가 되고, 다음 프론티어에 새 브릿지가 놓인다.

> **하네스 = 모델의 현재 능력과 실세계 적용 사이의 간극을 메우는 인프라.**
> 모델이 진화하면 간극이 사라지는 게 아니라 — **간극의 위치가 이동한다.**

모델 제공자가 하네스를 흡수한다는 반론도 있다. 맞다. 하지만 역사를 보면, 플랫폼이 기능을 흡수할수록 그 위에 새로운 레이어가 생긴다. AWS가 인프라를 추상화했을 때 인프라 엔지니어가 사라진 게 아니라 DevOps가 생겼다. 추상화는 레이어를 죽이지 않는다. 이동시킨다.

---

## 5. 1865년의 교훈

모델이 한 번의 API 호출로 해결하는 것이 늘어날수록, 그 API 호출을 실세계에 연결하는 인프라의 수요는 폭발한다. 이것을 보고 "하네스가 죽는다"고 결론 짓는 건, 증기기관을 보고 "석탄이 절약된다"고 결론 짓는 것과 같다.

Jevons의 말을 빌린다:

> *"AI 추론의 효율적 사용이 하네스의 축소를 의미한다고 생각하는 것은 관념의 혼동이다. 진실은 정반대다."*

하네스는 소멸하는 보조기구가 아니라, 끊임없이 이동하는 프론티어 브릿지다.

---

## Sources

| # | 출처 | URL |
|---|------|-----|
| 1 | William Stanley Jevons — The Coal Question (1865) | https://en.wikipedia.org/wiki/The_Coal_Question |
| 2 | Jevons' Paradox — Wikipedia | https://en.wikipedia.org/wiki/Jevons_paradox |
| 3 | James Watt Steam Engine — Wikipedia | https://en.wikipedia.org/wiki/Watt_steam_engine |
| 4 | Claude Code — Anthropic Docs | https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview |
| 5 | OpenClaw — Agent Harness | https://openclaw.ai |
