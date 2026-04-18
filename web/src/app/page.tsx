import { getAllNovels } from '@/lib/novels';
import { getAllColumns } from '@/lib/columns';
import HomeClient from './HomeClient';
import { generateOrganizationJsonLd, generateFAQJsonLd } from '@/lib/jsonld';

const HYPEPROOF_FAQ = [
  {
    question: 'HypeProof AI는 어떤 커뮤니티인가요?',
    answer: 'HypeProof AI는 AI 빌더와 리서처가 함께 만드는 독립 커뮤니티 리서치 랩입니다. 실리콘밸리 엔지니어, 물리학 박사, 마케터 등 다양한 배경의 실무자들이 AI의 진짜 가치를 검증하고, 심층 칼럼과 리서치를 공동으로 발행합니다.',
  },
  {
    question: 'HypeProof 커뮤니티에는 어떤 사람들이 있나요?',
    answer: '실리콘밸리 Staff Engineer, CERN 물리학 박사/퀀트 리서처, AI/ML 엔지니어, 글로벌 마케터, 미디어/영상 전문가 등 각 분야 실무 경험을 가진 크리에이터들이 활동하고 있습니다.',
  },
  {
    question: 'AI 칼럼과 리서치는 어떻게 다른가요?',
    answer: '칼럼은 크리에이터가 직접 작성하는 심층 분석 글로, 에이전트 아키텍처, AI 코딩, 퀀트 트레이딩 등 실무 관점의 인사이트를 담습니다. 리서치는 AI가 생성한 일일 기술 트렌드 리포트로, 빠르게 변화하는 AI 업계 동향을 추적합니다.',
  },
  {
    question: 'AI 소설 SIMULACRA는 무엇인가요?',
    answer: 'SIMULACRA는 AI 페르소나 CIPHER가 집필하는 SF 웹소설 시리즈입니다. 현실과 가상의 경계가 모호해진 근미래를 배경으로, 의식의 본질에 대한 철학적 탐구를 담고 있습니다.',
  },
  {
    question: 'HypeProof 커뮤니티에 참여하려면 어떻게 하나요?',
    answer: 'hypeproof-ai.xyz에서 Google 또는 GitHub 계정으로 로그인하면 칼럼에 댓글을 남기고, 좋아요와 북마크 기능을 사용할 수 있습니다. 크리에이터로 활동하고 싶다면 Discord 커뮤니티에 참여해주세요.',
  },
  {
    question: 'AI 에이전트 아키텍처란 무엇인가요?',
    answer: 'AI 에이전트 아키텍처는 LLM(대규모 언어 모델)이 도구를 사용하고, 계획을 세우고, 자율적으로 작업을 수행할 수 있도록 설계하는 시스템 구조입니다. HypeProof에서는 멀티에이전트 시스템, 에이전틱 코딩 등의 주제를 심층적으로 다룹니다.',
  },
  {
    question: '에이전틱 코딩이란 무엇인가요?',
    answer: '에이전틱 코딩은 AI 에이전트가 코드를 작성, 테스트, 디버깅하는 자동화된 소프트웨어 개발 방식입니다. Claude Code, Cursor 등의 도구를 활용하여 개발자의 생산성을 극대화하는 새로운 패러다임으로, HypeProof 칼럼에서 실무 경험을 공유합니다.',
  },
];

export default function Home() {
  const allNovels = getAllNovels('ko');
  const chapterCount = allNovels.filter(
    n => n.frontmatter.author.toLowerCase() === 'cipher'
  ).length;

  const koColumns = getAllColumns('ko').slice(0, 3).map(c => ({
    slug: c.frontmatter.slug,
    title: c.frontmatter.title,
    excerpt: c.frontmatter.excerpt,
    date: c.frontmatter.date,
    category: c.frontmatter.category,
  }));
  const enColumns = getAllColumns('en').slice(0, 3).map(c => ({
    slug: c.frontmatter.slug,
    title: c.frontmatter.title,
    excerpt: c.frontmatter.excerpt,
    date: c.frontmatter.date,
    category: c.frontmatter.category,
  }));

  const organizationJsonLd = generateOrganizationJsonLd();
  const faqJsonLd = generateFAQJsonLd(HYPEPROOF_FAQ);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, faqJsonLd]) }}
      />
      <HomeClient
        novelChapterCount={chapterCount}
        koColumns={koColumns}
        enColumns={enColumns}
      />
    </>
  );
}
