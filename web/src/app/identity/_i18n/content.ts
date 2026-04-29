"use client";

import { useI18n } from "@/contexts/I18nContext";

export type Lang = "ko" | "en";

export function useIdentityLang(): Lang {
  const { locale } = useI18n();
  return locale === "en" ? "en" : "ko";
}

// -----------------------------------------------------------------------------
// Identity page — bilingual content
// -----------------------------------------------------------------------------

export const c = {
  backHome: { ko: "HypeProof Lab 홈으로", en: "Back to HypeProof Lab" },

  // Hero
  heroEyebrow: { ko: "HypeProof Lab", en: "HypeProof Lab" },
  heroTension: {
    ko: "이름을 붙이기도 전에 AI는 세상을 다시 쓰고, 우리가 옳은 길로 가고 있는지 누구도 말해주지 않습니다.",
    en: "AI rewrites the world before we can name it — and whether we're on the right path, no one can say.",
  },
  heroLines: {
    ko: [
      "함께 걸어가며 남긴 당신의 발자취가,",
      "누군가의 다음 이정표가 됩니다.",
    ],
    en: [
      "Your footprint, left as we walk together,",
      "becomes someone's next signpost.",
    ],
  },
  heroSub: {
    ko: "AI 빌더·리서처·크리에이터가 모이는 곳. 기술이 아닌, 창작에 집중합니다.",
    en: "Where AI builders, researchers, and creators gather — focused on creation, not the tech itself.",
  },
  heroCtaPrimary: {
    ko: "함께하기",
    en: "Join us",
  },
  heroCtaSecondary: {
    ko: "커뮤니티 들여다보기",
    en: "Peek at the Community",
  },

  // Our Take (Before / Now)
  takeEyebrow: { ko: "Our Take", en: "Our Take" },
  takeTitle: {
    ko: "기술이 아니라, 창작에 집중합니다.",
    en: "We chase creation, not tech.",
  },
  beforeTitle: {
    ko: "기술에 끌려가는 곳",
    en: "Places that chase every tool",
  },
  beforeSub: {
    ko: "최신 모델·툴·트렌드만 쫓는 세대",
    en: "Chasing only the latest model, tool, trend",
  },
  beforeBullets: {
    ko: [
      "새 모델 나오면 전부 갈아엎는다",
      "툴 쓰는 법만 공유한다",
      "결과물 없이 소비만 한다",
    ],
    en: [
      "Rebuilds everything when a new model drops",
      "Shares only how to use tools",
      "Consumes without creating",
    ],
  },
  nowTitle: {
    ko: "창작에 집중하는 곳",
    en: "A place that focuses on creation",
  },
  nowSub: {
    ko: "AI를 공동 창작자로 두고, 과정을 쌓는 사람들",
    en: "People who treat AI as co-creator and build the record of the process",
  },
  nowBullets: {
    ko: [
      "AI를 도구가 아닌 동료로",
      "결과물이 아니라 워크플로우까지",
      "태운 토큰·실패·반복까지 공개",
    ],
    en: [
      "AI as a teammate, not a tool",
      "Workflow, not just output",
      "Tokens burned, failures, retries — shared",
    ],
  },

  // AI Philosophy (3 cards)
  aiPhilEyebrow: { ko: "AI Philosophy", en: "AI Philosophy" },
  aiPhilTitle: {
    ko: "AI는 초강력한 동료이자 도구입니다.",
    en: "AI is a superpowered teammate, and a tool.",
  },
  aiPhilSub: {
    ko: "우리는 모든 걸 함께 합니다 — 아이디어, 설계, 실행, 평가까지.",
    en: "We do everything with AI — ideation, design, execution, evaluation.",
  },
  roleHuman: {
    who: { ko: "사람", en: "Human" },
    role: { ko: "Director", en: "Director" },
    tagline: { ko: "맥락의 설계자", en: "The context designer" },
    desc: {
      ko: "무엇을 만들지 결정하고 AI에게 맥락을 건넵니다. 방향은 여전히 인간이 정합니다.",
      en: "Decides what to make and hands AI the context. The direction is still human.",
    },
  },
  roleAi: {
    who: { ko: "AI", en: "AI" },
    role: { ko: "Co-creator", en: "Co-creator" },
    tagline: { ko: "공동 창작자", en: "A creative partner" },
    desc: {
      ko: "단순한 도구가 아니라 함께 설계하고 함께 평가하는 파트너입니다.",
      en: "Not just a tool — a partner that co-designs and co-evaluates.",
    },
  },
  roleProcess: {
    who: { ko: "과정", en: "Process" },
    role: { ko: "Artifact", en: "Artifact" },
    tagline: { ko: "공개되는 흔적", en: "An open trace" },
    desc: {
      ko: "워크플로우, 토큰, 실패, 반복 — 창작의 모든 지문이 기록으로 남습니다.",
      en: "Workflow, tokens, failures, iterations — every fingerprint of creation stays on record.",
    },
  },

  // Essence — 16 capabilities distilled into 3 clusters
  essenceEyebrow: { ko: "Essence", en: "Essence" },
  essenceTitle: {
    ko: "태도 · 지휘 · 반복.",
    en: "Posture · Command · Loop.",
  },
  essenceSub: {
    ko: "AI를 잘 쓴다는 건, 이 세 가지를 동시에 해낸다는 뜻입니다.",
    en: "Using AI well means doing all three at once.",
  },
  clusterPosture: {
    label: { ko: "Posture", en: "Posture" },
    title: { ko: "태도", en: "Posture" },
    body: {
      ko: "감탄과 의심을 동시에 쥡니다. 몰입하되, 빠져나올 자리는 남겨둡니다.",
      en: "We hold wonder and doubt in the same hand. We go all-in, but leave a way out.",
    },
  },
  clusterCommand: {
    label: { ko: "Command", en: "Command" },
    title: { ko: "지휘", en: "Command" },
    body: {
      ko: "AI에게 가볍게 부탁하지 않습니다. 까다롭게 요구하고, 반대로 묻고, 되묻게 합니다.",
      en: "We don't ask AI politely. We demand rigorously, flip the question, and let it ask back.",
    },
  },
  clusterLoop: {
    label: { ko: "Loop", en: "Loop" },
    title: { ko: "반복", en: "Loop" },
    body: {
      ko: "한 번에 끝내지 않습니다. 작게 시험하고, 반복해서 돌리고, 모델끼리 부딪치게 합니다.",
      en: "We don't finish in one shot. We test small, iterate often, and let models clash.",
    },
  },

  // Four Axes
  axesEyebrow: { ko: "Four Axes", en: "Four Axes" },
  axesTitle: { ko: "우리가 만드는 네 가지.", en: "Four things we make." },
  axisResearch: {
    label: { ko: "Research", en: "Research" },
    title: {
      ko: "매일 AI 트렌드를 읽습니다",
      en: "We read AI trends every day",
    },
    desc: {
      ko: "노이즈를 걸러내고, 칼럼으로 깊이를 더합니다. 매일 쌓이는 리서치가 우리의 시야입니다.",
      en: "We filter noise and add depth through columns. Daily research is our field of view.",
    },
    href: "/columns",
  },
  axisStandards: {
    label: { ko: "Standards", en: "Standards" },
    title: {
      ko: "우리는 기준을 세웁니다",
      en: "We set the standard",
    },
    desc: {
      ko: "무엇이 잘 만든 것인지, 우리가 먼저 정의합니다. 기준이 있어야 퀄리티가 쌓입니다.",
      en: "We define what counts as well-made. Standards have to exist before quality can stack.",
    },
    href: "/glossary",
  },
  axisEducation: {
    label: { ko: "Education", en: "Education" },
    title: {
      ko: "Future AI Leader's Academy",
      en: "Future AI Leader's Academy",
    },
    desc: {
      ko: "아이들에게 코딩을 가르치지 않습니다. AI를 지휘하는 법을 가르칩니다.",
      en: "We don't teach kids to code. We teach them to direct AI.",
    },
    href: "/kids-edu",
  },
  axisCommunity: {
    label: { ko: "Community", en: "Community" },
    title: {
      ko: "자발적으로 합류하는 사람들",
      en: "People who join by choice",
    },
    desc: {
      ko: "Discord에서 누구나 합류할 수 있습니다. 해커톤과 창작대회로 함께 성장합니다.",
      en: "Anyone can join on Discord. We grow together through hackathons and creator contests.",
    },
    href: "/creators",
  },
  axisVisit: { ko: "살펴보기", en: "Take a look" },

  // Why Here — bridge between Four Axes and Community
  whyHereEyebrow: { ko: "Why Here", en: "Why Here" },
  whyHereTitle: {
    ko: "툴은 쏟아지고, 실력은 흩어집니다.",
    en: "Tools pour in. Skill scatters.",
  },
  whyHereSub: {
    ko: "매주 새 모델, 새 프레임워크가 등장합니다. 혼자서는 방향을 잃기 쉽죠. 여기선 체계적으로 쓰는 법을 배우고, 실력이 한 단계씩 쌓입니다.",
    en: "New models and frameworks land every week. Alone, it's easy to lose direction. Here, you learn systematic use — and skill stacks, step by step.",
  },

  // Community (dark section)
  communityEyebrow: { ko: "The Community", en: "The Community" },
  communityTitle: {
    ko: "소비자가 아닙니다. 빌더입니다.",
    en: "Not consumers. Builders.",
  },
  communitySubBefore: {
    ko: "자발적으로 합류한 ",
    en: "A space built by ",
  },
  communitySubAfter: {
    ko: "크리에이터들이 함께 만드는 공간.",
    en: " Creators who joined by choice.",
  },
  cardVoluntary: {
    label: { ko: "Voluntary", en: "Voluntary" },
    title: { ko: "구독자가 아니라 참가자", en: "Participants, not subscribers" },
    body: {
      ko: "HypeProof Lab 멤버는 스크롤하는 사람이 아닙니다. AI로 무언가를 직접 만들려는 사람입니다.",
      en: "Members don't scroll through. They come to make something with AI.",
    },
  },
  cardRanked: {
    label: { ko: "Ranked", en: "Ranked" },
    title: { ko: "레벨과 순위가 있습니다", en: "There are levels and rankings" },
    body: {
      ko: "AI × 인간 평가로 레벨이 나뉩니다. 창작 능력, 파이프라인 설계, AI와 대화하는 법 — 실력이 기준입니다.",
      en: "AI × human evaluation sets the levels. Creative capacity, pipeline design, how you talk to AI — skill is the standard.",
    },
  },
  cardCompeting: {
    label: { ko: "Competing", en: "Competing" },
    title: {
      ko: "해커톤·창작대회로 겨룹니다",
      en: "We compete through hackathons and creator contests",
    },
    body: {
      ko: "메달을 걸고, 순위를 매기고, 다음 기수를 끌고 옵니다. 경쟁이 성장의 언어입니다.",
      en: "Medals on the line, rankings drawn, next cohorts recruited. Competition is the language of growth.",
    },
  },

  // Closing
  closingTitle: {
    ko: "기술에 집착하지 않습니다.\n창작에 집중합니다.",
    en: "We don't obsess over tech.\nWe focus on creation.",
  },
  closingButton: { ko: "커뮤니티 합류하기", en: "Join the Community" },
} as const;
