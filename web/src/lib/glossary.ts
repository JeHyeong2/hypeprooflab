export interface GlossaryTerm {
  term: string;
  termKo: string;
  slug: string;
  definition: string;
  definitionKo: string;
  relatedColumns: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Electric Girl Effect',
    termKo: '일렉트릭 걸 이펙트',
    slug: 'electric-girl-effect',
    definition: 'The phenomenon where AI becomes an indistinguishable cultural participant — producing art, music, or persona that audiences engage with as if human-made.',
    definitionKo: 'AI가 구별할 수 없는 문화 참여자가 되는 현상 — 관객이 인간이 만든 것처럼 반응하는 예술, 음악, 또는 페르소나를 생산하는 것.',
    relatedColumns: ['2026-02-12-electric-girl'],
  },
  {
    term: 'HypeProof Lens',
    termKo: '하이프프루프 렌즈',
    slug: 'hypeproof-lens',
    definition: 'Our methodology of cutting through hype to find substance — a critical framework for evaluating AI claims, products, and narratives against real-world evidence.',
    definitionKo: '과대광고를 꿰뚫어 본질을 찾는 방법론 — AI 주장, 제품, 서사를 현실 근거와 대조 평가하는 비판적 프레임워크.',
    relatedColumns: [],
  },
  {
    term: 'Intention Designer',
    termKo: '의도의 설계자',
    slug: 'intention-designer',
    definition: 'The emergent human role in the AI era — rather than executing tasks, humans become designers of intent, shaping what AI should pursue and why.',
    definitionKo: 'AI 시대에 부상하는 인간의 역할 — 작업을 실행하는 대신, 인간은 AI가 무엇을 왜 추구해야 하는지를 설계하는 의도의 설계자가 된다.',
    relatedColumns: ['2026-02-12-intent-designer'],
  },
  {
    term: 'Quiet Exit',
    termKo: '조용한 퇴장',
    slug: 'quiet-exit',
    definition: 'The phenomenon where roles, jobs, and entire professions disappear without formal announcement — no layoff notices, just gradual irrelevance.',
    definitionKo: '역할, 직업, 그리고 전체 직종이 공식 발표 없이 사라지는 현상 — 해고 통보 없이, 점진적 무관함만이 남는다.',
    relatedColumns: ['2026-02-10-quiet-exit'],
  },
  {
    term: 'Zero Blueprint AI',
    termKo: '제로 블루프린트 AI',
    slug: 'zero-blueprint-ai',
    definition: 'AI systems that design and create without pre-existing plans or templates — generating novel solutions from first principles rather than following established patterns.',
    definitionKo: '기존 계획이나 템플릿 없이 설계하고 창조하는 AI 시스템 — 확립된 패턴을 따르는 대신 제1원리에서 새로운 해법을 생성한다.',
    relatedColumns: ['2026-02-11-zero-blueprint-ai'],
  },
];

export function getAllGlossaryTerms(): GlossaryTerm[] {
  return [...glossaryTerms].sort((a, b) => a.term.localeCompare(b.term));
}
