---
title: "Programming the Program — Karpathy의 autoresearch가 바꾸는 것"
creator: "Jay"
creatorImage: "/members/jay.png"
date: 2026-03-17
category: "AI Engineering"
tags: ["autoresearch", "karpathy", "harness engineering", "meta-programming", "agent"]
slug: "2026-03-17-programming-the-program"
readTime: "7분"
excerpt: "코드를 짜는 시대가 끝나고, 코드를 짜는 AI의 지시서를 짜는 시대가 왔다. Karpathy의 autoresearch가 보여주는 건 연구의 자동화가 아니라, 연구자라는 역할의 재정의다."
lang: "ko"
authorType: "human"
---

*코드를 짜는 시대가 끝나고, 코드를 짜는 AI의 지시서를 짜는 시대가 왔다.*

---

## 밤새 100개의 실험

3월 초, Andrej Karpathy가 [autoresearch](https://github.com/karpathy/autoresearch)를 공개했다. 개념은 단순하다. AI 에이전트에게 작은 LLM 학습 환경을 주고, 밤새 자율적으로 실험하게 한다. 코드를 수정하고, 5분간 학습하고, 결과가 좋으면 유지하고 나쁘면 버린다. 반복. 시간당 12개, 하룻밤이면 약 100개의 실험이 돌아간다.

Karpathy 본인의 [트윗](https://x.com/karpathy/status/2029701092347630069)이 핵심을 찌른다:

> "12시간 동안 110개의 변경이 이루어졌고, validation loss가 0.862415에서 0.858039로 내려갔다. (...) 지난 2주간 나는 nanochat 코드 자체보다 **메타-셋업을 최적화하는 데 더 많은 시간을 쓴 것 같다.**"

여기서 멈춰야 한다. 이 문장이 전부다.

## "Programming the Program"

autoresearch의 README에 이런 말이 있다:

> "You're not touching any of the Python files like you normally would as a researcher. Instead, you are programming the program.md."

연구자가 코드를 짜지 않는다. 코드를 짜는 AI의 **지시서**를 짠다. Karpathy는 이 지시서를 `program.md`라고 불렀고, "super lightweight skill"이라고 표현했다.

구조를 보면 놀라울 정도로 간결하다:

- `prepare.py` — 건드리지 않는 고정 인프라
- `train.py` — AI가 수정하는 유일한 파일
- `program.md` — 인간이 수정하는 유일한 파일

**세 개의 파일.** 인간은 program.md만, AI는 train.py만 건드린다. 경계가 명확하다. 이 명확함이 자율성을 가능하게 한다.

## 제약이 자율성을 만든다

autoresearch가 작동하는 이유는 자유를 줘서가 아니다. **제약을 줘서**다.

- **시간 제약**: 모든 실험은 정확히 5분. GPU가 뭐든, 모델이 뭐든, 5분 후에 끝난다.
- **메트릭 제약**: 평가 기준은 `val_bpb` 하나. 낮으면 좋고, 높으면 나쁘다. 끝.
- **범위 제약**: 수정할 수 있는 건 `train.py` 하나. 평가 함수, 데이터 로더, 토크나이저는 못 건드린다.
- **판단 제약**: keep, discard, crash. 세 가지 상태 뿐이다.

이 제약 속에서 AI는 아키텍처를 바꾸고, 옵티마이저를 교체하고, 하이퍼파라미터를 튜닝한다. 무한한 자유 안에서는 아무것도 시도하지 못하지만, 좁은 울타리 안에서는 100개의 실험을 돌린다.

이건 AI 연구에만 해당되는 이야기가 아니다.

## 메타-셋업의 시대

Karpathy가 "메타-셋업에 더 많은 시간을 쓴다"고 한 부분을 다시 보자. 이건 단순한 감상이 아니라 **역할의 전환**을 의미한다.

전통적으로 연구자는:
1. 가설을 세우고
2. 실험을 설계하고
3. 코드를 짜고
4. 결과를 분석하고
5. 논문을 쓴다

autoresearch 이후의 연구자는:
1. **실험 시스템을 설계하고**
2. **평가 기준을 정의하고**
3. **지시서(program.md)를 최적화한다**

2~5번이 사라진 게 아니다. AI가 하고 있다. 인간의 역할이 "실행"에서 "시스템 설계"로 올라간 것이다.

Ryan의 [이전 칼럼](https://hypeproof-ai.xyz/columns/2026-03-05-harness-engineering-arrives)에서 "하니스 엔지니어링"이라 불렀던 것의 가장 순수한 형태가 여기 있다. **하니스를 잘 짜면, 시간이 나의 편이 된다.** Karpathy는 잠을 자고, AI는 110개의 실험을 돌린다.

## 나는 이걸 매일 본다

솔직히 쓰겠다. 나는 OpenClaw 위에 Mother라는 에이전트 시스템을 운영하고 있다. 매일 리서치를 수집하고, 크리에이터들의 칼럼을 편집하고, 크론잡을 돌리고, 시스템 상태를 모니터링한다.

그리고 최근에 깨달았다. **나도 Mother의 코드를 직접 수정하는 것보다 SKILL.md와 HEARTBEAT.md — Mother의 "program.md"에 해당하는 것 — 를 다듬는 데 더 많은 시간을 쓰고 있다.**

문제는, autoresearch에는 있고 내 시스템에는 없는 것이 있다. **메트릭과 실험 루프다.**

Karpathy의 시스템은 매 실험마다 `val_bpb`를 측정하고, 개선되면 유지하고 아니면 버린다. 내 시스템은? QA 게이트가 있지만 측정하지 않는다. 품질 기준이 있지만 추적하지 않는다. 개선됐는지 퇴화했는지 모른 채 다음 날로 넘어간다.

**측정하지 않으면 개선할 수 없다.** 당연한 말인데, 자동화에 흥분하다 보면 잊기 쉽다.

## autoresearch가 바꾸는 것

이 레포가 중요한 건 val_bpb를 0.004 낮췄기 때문이 아니다.

**연구라는 행위의 정의가 바뀌고 있기 때문이다.**

Karpathy의 README 서두에 있는 농담 반 진담 반:

> "Research is now entirely the domain of autonomous swarms of AI agents running across compute cluster megastructures in the skies. The agents claim that we are now in the 10,205th generation of the code base, in any case no one could tell if that's right or wrong as the 'code' is now a self-modifying binary that has grown beyond human comprehension."

이건 SF가 아니라 방향이다. autoresearch는 그 방향의 0단계, 가장 단순한 형태를 보여준다.

그리고 0단계치고는 꽤 무섭다. 밤새 100개의 실험을 돌리는 데 필요한 건 GPU 하나, 파일 세 개, 그리고 잠이다.

---

## 🔗 Sources

| # | 출처 | URL |
|---|------|-----|
| 1 | autoresearch GitHub | [github.com/karpathy/autoresearch](https://github.com/karpathy/autoresearch) |
| 2 | Karpathy 트윗 — nanochat + autoresearch 공개 | [x.com/karpathy](https://x.com/karpathy/status/2029701092347630069) |
| 3 | Building Effective Agents (Ralph Loop) | [anthropic.com](https://www.anthropic.com/research/building-effective-agents) |
| 4 | Ryan Kim — 하니스 엔지니어링이 온다 | [hypeproof-ai.xyz](https://hypeproof-ai.xyz/columns/2026-03-05-harness-engineering-arrives) |
