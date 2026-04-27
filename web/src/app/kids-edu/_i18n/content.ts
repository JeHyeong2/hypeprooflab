"use client";

import { useI18n } from "@/contexts/I18nContext";

// kids-edu는 ko/en 두 언어만 지원. 글로벌 locale이 ja/es 등일 경우 ko로 폴백.
export type Lang = "ko" | "en";

export function useKidsLang(): Lang {
  const { locale } = useI18n();
  return locale === "en" ? "en" : "ko";
}

// -----------------------------------------------------------------------------
// Bilingual content dict — kids-edu 스코프
// -----------------------------------------------------------------------------

export const c = {
  // Shared (footer)
  backHome: { ko: "HypeProof 홈으로", en: "Back to HypeProof" },
  backAcademy: {
    ko: "Future AI Leader's Academy 소개로",
    en: "Back to Future AI Leader's Academy",
  },

  // ============ Main page ============
  mainEyebrow: {
    ko: "Future AI Leader's Academy",
    en: "Future AI Leader's Academy",
  },
  heroLines: {
    ko: ["코딩은 AI가 합니다.", "아이는 \u201C무엇을 할지\u201D", "결정만 하면 됩니다."],
    en: ["AI writes the code.", "Kids just decide", "what to make."],
  },
  heroSubPrefix: {
    ko: "10~15세 청소년이 부모와 한 팀이 되어, AI를 지휘하는 ",
    en: "Youth aged 10–15 team up with a parent to grow into ",
  },
  heroSubHighlight: {
    ko: "설계자(Architect)",
    en: "Architects",
  },
  heroSubSuffix: {
    ko: "로 자라납니다.",
    en: " who direct AI.",
  },
  ctaProgram: {
    ko: "교육 프로그램 살펴보기",
    en: "See Our Programs",
  },
  ctaProjects: {
    ko: "지난 팀들의 프로젝트 보기",
    en: "Past Team Projects",
  },

  // Architect vs Laborer
  shiftEyebrow: { ko: "관점의 전환", en: "The Shift" },
  shiftTitle: {
    ko: "노동자가 아닌, 건축가를 키웁니다.",
    en: "We raise architects, not laborers.",
  },
  laborerTitle: { ko: "코드를 작성하는 노동자", en: "The Laborer Who Writes Code" },
  laborerSub: {
    ko: "정답을 외우고, 구현하는 사람",
    en: "One who memorizes answers and implements",
  },
  laborerBullets: {
    ko: ["문법을 외우고 반복 구현한다", "AI를 도구로만 본다", "기술에 끌려간다"],
    en: [
      "Memorizes syntax, repeats the pattern",
      "Sees AI as just a tool",
      "Gets dragged by technology",
    ],
  },
  architectTitle: { ko: "설계도면을 그리는 건축가", en: "The Architect Who Designs" },
  architectSub: {
    ko: "문제를 정의하고, AI를 지휘하는 사람",
    en: "One who defines problems and directs AI",
  },
  architectBullets: {
    ko: ["무엇을 만들지 결정한다", "맥락을 설계한다", "도구를 지휘한다"],
    en: [
      "Decides what to build",
      "Designs the context",
      "Directs the tools",
    ],
  },

  // Co-Founding
  coFoundingEyebrow: { ko: "Co-Founding Model", en: "Co-Founding Model" },
  coFoundingTitle: {
    ko: "셋이 하나로 움직입니다.",
    en: "Three roles. One team.",
  },
  coFoundingSub: {
    ko: "자녀의 상상력, 부모의 구조화, AI의 실행력이 한 팀으로 움직입니다.",
    en: "The child's imagination, the parent's structure, AI's execution — moving as one.",
  },
  cofChild: {
    who: { ko: "자녀", en: "The Child" },
    role: { ko: "Visionary", en: "Visionary" },
    tagline: { ko: "두려움 없는 상상력", en: "Fearless imagination" },
    description: {
      ko: '"하늘 나는 고양이"처럼, 한계를 모르는 아이디어를 던지고 AI에게 직접 지시합니다.',
      en: 'Like "a flying cat," throws out limitless ideas and commands AI directly.',
    },
  },
  cofParent: {
    who: { ko: "부모", en: "The Parent" },
    role: { ko: "Integrator", en: "Integrator" },
    tagline: {
      ko: "현실 감각, 구조화 파트너",
      en: "Reality check, structural partner",
    },
    description: {
      ko: '"날개는 어떤 버튼이야?"처럼, 아이의 상상을 논리로 다듬는 Co-Founder입니다.',
      en: 'Like "what button for wings?" — a Co-Founder who refines imagination into logic.',
    },
  },
  cofAi: {
    who: { ko: "AI", en: "AI" },
    role: { ko: "Executor", en: "Executor" },
    tagline: { ko: "지시받은 대로 실행", en: "Executes as directed" },
    description: {
      ko: "코드는 AI가 씁니다. 팀은 '무엇을 만들지' 결정에만 집중합니다.",
      en: "AI writes the code. The team focuses only on 'what to make.'",
    },
  },

  // Curriculum
  curriculumEyebrow: { ko: "Curriculum", en: "Curriculum" },
  curriculumTitle: {
    ko: "4단계로 설계된 학습 여정.",
    en: "A four-stage learning journey.",
  },
  cur1Title: { ko: "관점의 전환", en: "Perspective Shift" },
  cur1Goal: {
    ko: '"나는 코딩하는 사람이 아니라, AI를 지휘하는 설계자다"',
    en: '"I\'m not a coder. I\'m an architect who directs AI."',
  },
  cur2Title: { ko: "협업과 조율", en: "Collaboration & Alignment" },
  cur2Goal: {
    ko: "아이의 상상력과 부모의 현실감각이 기획서로 수렴",
    en: "The child's imagination and parent's realism converge into a plan.",
  },
  cur3Title: { ko: "AI 지휘와 실습", en: "Directing AI & Hands-On" },
  cur3Goal: {
    ko: "AI에게 지시를 내려 실제 작동하는 결과물 만들기",
    en: "Direct AI to build something that actually works.",
  },
  cur4Title: { ko: "발표와 시상", en: "Showcase & Recognition" },
  cur4Goal: {
    ko: '"우리가 이걸 만들었다"는 효능감의 경험',
    en: 'The experience of "we made this."',
  },

  // Beyond the Program
  beyondEyebrow: { ko: "Beyond the Program", en: "Beyond the Program" },
  beyondTitle: {
    ko: "교육이 끝나도, 이곳에 남습니다.",
    en: "When the program ends, you stay here.",
  },
  beyondSubBefore: { ko: "경험을 공유한 ", en: "A community of " },
  beyondSubAfter: {
    ko: "크리에이터끼리의 커뮤니티가 남습니다.",
    en: " Creators who share the experience remains.",
  },
  beyondBelonging: {
    label: { ko: "Belonging", en: "Belonging" },
    title: { ko: "같은 이름으로 묶입니다", en: "Bound by a shared name" },
    body: {
      ko: '세션을 지나면 아이는 "Hype크리에이터"라는 이름을 얻습니다. 혼자 배운 수강생이 아니라, 같은 경험을 공유한 커뮤니티의 구성원이 됩니다.',
      en: 'After the session, your child earns the name "Hype Creator." Not a student who learned alone, but a member of a community that shares the same experience.',
    },
  },
  beyondSelfDriven: {
    label: { ko: "Self-driven", en: "Self-driven" },
    title: { ko: "누가 시키지 않아도 만듭니다", en: "They build without being told" },
    body: {
      ko: '경쟁이나 과제가 아니라, "이번엔 이런 거 만들어볼래"가 디폴트인 분위기. 한 번 완성해본 사람은 다음 것을 스스로 꺼내 듭니다.',
      en: 'Not competition or homework — just "let\'s try making this next" as the default mood. Those who\'ve finished once pick up the next thing themselves.',
    },
  },
  beyondOngoing: {
    label: { ko: "Ongoing", en: "Ongoing" },
    title: { ko: "계속 새로운 것이 흐릅니다", en: "New things keep flowing" },
    body: {
      ko: "새로운 세션, Hype크리에이터끼리의 리서치·칼럼, 서로를 비추는 피드백 루프. 이곳은 멈추지 않습니다.",
      en: "New sessions, research and columns among Hype Creators, feedback loops that mirror each other. This place does not stop.",
    },
  },

  // Archive CTA
  archiveEyebrow: { ko: "Archive", en: "Archive" },
  archiveTitle: {
    ko: "지난 팀들이 만든 것들",
    en: "What past teams made",
  },
  archiveBody: {
    ko: "초등·중등 팀들이 AI를 지휘해 만들어낸 실제 프로젝트를 살펴보세요.",
    en: "Real projects built by elementary and middle-school teams directing AI.",
  },
  archiveLink: {
    ko: "프로젝트 아카이브 열기",
    en: "Open Project Archive",
  },

  // Closing
  closingTitle: {
    ko: "아이는 AI를 두려워하지 않는 세대입니다.",
    en: "A generation that isn't afraid of AI.",
  },
  closingButton: { ko: "교육 프로그램 보기", en: "See Programs" },

  // ============ Programs hub page ============
  progHeroEyebrow: { ko: "Programs", en: "Programs" },
  progHeroTitle: { ko: "교육 프로그램", en: "Programs" },
  progHeroSub: {
    ko: "지금 준비 중인 프로그램을 한자리에서.",
    en: "All programs in preparation, in one place.",
  },
  progNowLabel: { ko: "Now", en: "Now" },
  progNowTitle: {
    ko: "지금 진행 중인 프로그램",
    en: "Programs In Progress",
  },
  progUpcoming: { ko: "Upcoming", en: "Upcoming" },
  progCardCta: { ko: "프로그램 보기", en: "See Program" },
  progCdDate: { ko: "2026.05.05", en: "2026.05.05" },
  progCdDateLabel: { ko: "어린이날", en: "Children's Day" },
  progCdTitle: {
    ko: "나만의 마법 게임 만들기",
    en: "Make My Own Magic Game",
  },
  progCdTagline: { ko: "지휘관의 탄생", en: "Birth of a Commander" },
  progCdDesc: {
    ko: "두 시간 동안 AI를 지휘해, 내 손으로 게임 하나를 끝까지 완성하는 어린이날 특별 세션.",
    en: "A Children's Day special session where you direct AI for two hours and complete one game yourself.",
  },

  // ============ Projects page ============
  projEyebrow: { ko: "Archive", en: "Archive" },
  projTitleLine1: { ko: "Projects by", en: "Projects by" },
  projTitleLine2: { ko: "Future AI Leaders", en: "Future AI Leaders" },
  projSub: {
    ko: "부모와 자녀가 한 팀이 되어, AI를 지휘하며 만들어낸 결과물들이 여기에 모입니다.",
    en: "Results built by parent-child teams directing AI are gathered here.",
  },
  projComingTitle: {
    ko: "첫 프로그램이 마무리되면, 여기에 기록이 쌓입니다",
    en: "When the first program finishes, records will gather here",
  },
  projComingBody: {
    ko: "세션이 진행된 날짜, 그날의 장면, 함께 만든 작품들을 이 자리에서 다시 만날 수 있어요.",
    en: "The session date, moments from the day, and creations made together — you'll find them all here.",
  },
  projBack: {
    ko: "프로그램 소개로 돌아가기",
    en: "Back to Program Overview",
  },

  // ============ Event (childrens-day-2026) page ============
  evHeroEyebrow: {
    ko: "2026 · 05 · 05 · 어린이날 특별 세션",
    en: "2026 · 05 · 05 · Children's Day Special Session",
  },
  evHeroTitle: {
    ko: "나만의 마법 게임 만들기",
    en: "Make My Own Magic Game",
  },
  evHeroTagline: { ko: "지휘관의 탄생", en: "Birth of a Commander" },
  evHeroSub1: {
    ko: "두 시간 동안 AI를 지휘해, 내 손으로 게임 하나를 끝까지 완성합니다.",
    en: "Direct AI for two hours and complete one game with your own hands.",
  },
  evHeroSub2: {
    ko: "Future AI Leader's Academy가 준비한 어린이날 특별 세션.",
    en: "A Children's Day special session prepared by Future AI Leader's Academy.",
  },

  evAtGlanceEyebrow: { ko: "At a Glance", en: "At a Glance" },
  evAtGlanceTitle: {
    ko: "한 번의 오후, 오래 남을 하루.",
    en: "An afternoon once. A day that lingers.",
  },
  evInfoWhenLabel: { ko: "일시", en: "When" },
  evInfoWhenValue: {
    ko: "2026년 5월 5일 (화)",
    en: "May 5, 2026 (Tue)",
  },
  evInfoWhenDetail: {
    ko: "13:30 – 15:30 · 두 시간",
    en: "13:30 – 15:30 · Two hours",
  },
  evInfoWithLabel: { ko: "함께하는 친구들", en: "With" },
  evInfoWithValue: {
    ko: "40명의 지휘관",
    en: "40 Commanders",
  },
  evInfoWithDetail: {
    ko: "가족 · 아카데미 Hype크리에이터팀 동행",
    en: "Family · Academy Hype Creator team alongside",
  },

  evWhatEyebrow: { ko: "What You'll Do", en: "What You'll Do" },
  evWhatTitle: {
    ko: "오늘 여러분은 이런 걸 합니다.",
    en: "Here's what you'll do today.",
  },
  evWhatSub: {
    ko: "만들고 싶은 게 있었는데 어떻게 해야 할지 몰랐다면, 오늘이 바로 그 방법을 배우는 날이에요.",
    en: "If you had something you wanted to make but didn't know how — today is the day you learn.",
  },

  evAct1Title: {
    ko: "AI에게 또박또박 지시하기",
    en: "Give AI clear, precise orders",
  },
  evAct1Body: {
    ko: '"대충" 말한 AI와 "또박또박" 말한 AI의 결과를 나란히 보여드려요. AI가 내 말을 얼마나 꼼꼼히 듣는지 직접 확인하며 지휘관의 마음가짐으로 하루를 시작합니다.',
    en: 'We\'ll show side by side what AI does when you speak "vaguely" versus "precisely." See how carefully AI listens, and start the day with a commander\'s mindset.',
  },
  evAct2Title: {
    ko: "나만의 아바타 소환하기",
    en: "Summon your own avatar",
  },
  evAct2Body: {
    ko: '"기사의 칼은 어떤 빛을 내나요?" AI가 되물어 올 때마다 대답하면, 머릿속에만 있던 내 캐릭터가 화면 위로 걸어 나옵니다. 묘사하면 할수록 더 나다워져요.',
    en: '"What light does the knight\'s sword glow?" Every time AI asks back, you answer — and your character walks out of your head onto the screen. The more you describe, the more it becomes yours.',
  },
  evAct3Title: {
    ko: "내 규칙으로 세계 만들기",
    en: "Build a world by your own rules",
  },
  evAct3Body: {
    ko: '"우주에서 바이러스를 피해 별 10개 모으기!"처럼, 내가 정한 이기는 규칙이 곧 게임이 됩니다. 지휘관이 쓴 규칙대로 즉시 플레이 가능한 맵이 펼쳐집니다.',
    en: '"Dodge viruses in space and collect 10 stars!" — the winning rules you set become the game. A playable map unfolds instantly from what the commander wrote.',
  },
  evAct4Title: {
    ko: "내 이름 새긴 게임 런칭",
    en: "Launch a game with your name on it",
  },
  evAct4Body: {
    ko: '게임 타이틀과 제목을 만들고 화면 하단에 "총괄 개발자: OOO"를 또렷하게 새깁니다. 40명의 런칭 영상이 대형 스크린에 차례로 상영되는 순간, 내 작품이 모두의 앞에 공개됩니다.',
    en: 'Create the title and name of the game and engrave "Executive Developer: YOUR NAME" clearly at the bottom. When all 40 launch clips play on the big screen, your creation is revealed to everyone.',
  },
  evAct5Title: {
    ko: "마스터 개발자로 돌아가기",
    en: "Return home as a Master Developer",
  },
  evAct5Body: {
    ko: '내 게임에 바로 접속할 수 있는 마스터 키(QR), "마스터 개발자 OOO" 사원증, 그리고 실물 게임 패키지까지. 오늘의 증거를 손에 쥐고 일상으로 돌아갑니다.',
    en: 'A master key (QR) to your game, a "Master Developer" ID badge with your name, and the physical game package. You return to daily life with today\'s proof in hand.',
  },
  evActFootnote: {
    ko: "* 세부 일정과 순서는 현장 상황에 따라 조정될 수 있어요.",
    en: "* Specific schedule and order may adjust based on on-site conditions.",
  },

  evTogetherEyebrow: { ko: "Together", en: "Together" },
  evTogetherTitle: { ko: "함께 준비합니다.", en: "Prepared together." },
  evHostLabel: { ko: "Host", en: "Host" },
  evHostName: {
    ko: "Future AI Leader's Academy",
    en: "Future AI Leader's Academy",
  },
  evHostDesc: {
    ko: "HypeProof의 청소년 AI 교육 프로그램. 아이들을 AI 시대의 설계자(Architect)로 안내합니다.",
    en: "HypeProof's youth AI education program. Guides children into Architects of the AI era.",
  },
  evVenueLabel: { ko: "Venue Partner", en: "Venue Partner" },
  evVenueName: { ko: "국립암센터", en: "National Cancer Center" },
  evVenueDesc: {
    ko: "소아암 병동 친구들과 가족이 어린이날 특별 세션에 함께합니다.",
    en: "Pediatric ward friends and families join the Children's Day special session.",
  },

  evClosingTitle: {
    ko: "5월 5일, 40명의 지휘관이 탄생합니다.",
    en: "On May 5, forty commanders are born.",
  },
  evClosingSub: {
    ko: "이날 완성된 작품들은 추후 아카이브에서 다시 만날 수 있습니다.",
    en: "The works completed that day can be seen again in the archive.",
  },
  evClosingButton: {
    ko: "프로젝트 아카이브로 가기",
    en: "Go to Project Archive",
  },
} as const;
