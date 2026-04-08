'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';
import { Footer } from '@/components/layout/Footer';
import type { DashboardMember } from './types';

// ── Color map for members ──
const MEMBER_COLORS: Record<string, string> = {
  Jay: '#1f6feb',
  Kiwon: '#e8734a',
  Ryan: '#f1c40f',
  JY: '#e74c3c',
  TJ: '#8b4513',
  '\uC7AC\uD615': '#9b59b6',
  BH: '#27ae60',
  '\uC815\uC6B0': '#3498db',
  Sebastian: '#6c757d',
  Simon: '#20c997',
  Mother: '#58a6ff',
};

function getMemberColor(name: string): string {
  return MEMBER_COLORS[name] || '#8b949e';
}

// ── Tab definitions ──
const TABS = [
  { id: 'roadmap', label: '1. \uB85C\uB4DC\uB9F5' },
  { id: 'd1', label: '2. \uC804\uCCB4 \uC6CC\uD06C\uD50C\uB85C\uC6B0' },
  { id: 'd2', label: '3. \uCF58\uD150\uCE20 \uD30C\uC774\uD504\uB77C\uC778' },
  { id: 'd3', label: '4. \uBA64\uBC84 \uC5ED\uD560' },
  { id: 'd4', label: '5. Mother AI' },
  { id: 'd5', label: '6. \uBC30\uD3EC \uCC44\uB110' },
  { id: 'd6', label: '7. \uD53C\uB4DC\uBC31 \uB8E8\uD504' },
  { id: 'd7', label: '8. \uAD50\uC721 Academy' },
  { id: 'd8', label: '9. \uC218\uC775 \uBAA8\uB378' },
  { id: 'd9', label: '10. \uB9AC\uC2A4\uD06C \uB9F5' },
  { id: 'd10', label: '11. \uCEE4\uBBA4\uB2C8\uD2F0' },
  { id: 'qa', label: '12. QA \uB9AC\uD3EC\uD2B8' },
];

// ── Shared Components ──
function Card({ title, sub, barColor, desc, owner, onClick }: {
  title: string; sub?: string; barColor: string;
  desc?: string; owner?: string;
  onClick?: (title: string, desc: string, owner: string) => void;
}) {
  return (
    <div
      className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 cursor-pointer relative transition-all hover:border-[#58a6ff] hover:-translate-y-0.5 hover:shadow-lg"
      onClick={() => onClick?.(title, desc || '', owner || '')}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ background: barColor }} />
      <div className="text-[0.8rem] font-semibold leading-snug">{title}</div>
      {sub && <div className="text-[#8b949e] text-[0.68rem] mt-0.5">{sub}</div>}
    </div>
  );
}

function Badge({ status }: { status: 'done' | 'progress' | 'wait' }) {
  const styles = {
    done: 'bg-[rgba(39,174,96,0.2)] text-[#27ae60]',
    progress: 'bg-[rgba(31,111,235,0.2)] text-[#58a6ff]',
    wait: 'bg-[rgba(139,148,158,0.2)] text-[#8b949e]',
  };
  const labels = { done: 'Done', progress: '\uC9C4\uD589\uC911', wait: '\uB300\uAE30' };
  return (
    <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-full font-semibold inline-block mb-0.5 ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function SectionBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl p-3 mb-3 ${className}`}>{children}</div>;
}

function DetailPanel({ title, desc, owner }: { title: string; desc: string; owner: string }) {
  if (!title) {
    return (
      <div className="text-[#8b949e] text-sm text-center py-8">
  {'← 항목을 클릭하면'}<br />{'상세 설명이 여기에 표시됩니다'}
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-[0.95rem] font-semibold mb-1">{title}</h3>
      <div className="text-sm leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: desc }} />
      {owner && <div className="text-[#8b949e] text-[0.72rem] mt-2">{'담당: '}{owner}</div>}
    </div>
  );
}

// ── Tab 1: Roadmap ──
function RoadmapTable({ items, color }: { items: { id: string; title: string; desc: string; owner: string; deadline: string; status: 'done' | 'progress' | 'wait' }[]; color: string }) {
  return (
    <table className="w-full text-[0.78rem] border-collapse">
      <thead>
        <tr className="text-left text-[#8b949e] text-[0.7rem] border-b border-[#30363d]">
          <th className="py-1.5 px-2 w-[40px]"></th>
          <th className="py-1.5 px-2">항목</th>
          <th className="py-1.5 px-2 hidden md:table-cell">설명</th>
          <th className="py-1.5 px-2 w-[120px]">담당</th>
          <th className="py-1.5 px-2 w-[90px]">기한</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id} className="border-b border-[#21262d] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
            <td className="py-2 px-2"><Badge status={item.status} /></td>
            <td className="py-2 px-2 font-medium">{item.id} {item.title}</td>
            <td className="py-2 px-2 text-[#8b949e] hidden md:table-cell">{item.desc}</td>
            <td className="py-2 px-2 text-[#8b949e]">{item.owner}</td>
            <td className="py-2 px-2 text-[#8b949e]">{item.deadline}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TabRoadmap({ onDetail }: { onDetail: (t: string, d: string, o: string) => void }) {
  const shortItems = [
    { id: 'S-1', title: '멤버 의사 확인', desc: '3/23 미팅 전원 관점 공유 완료. 교육이 본질.', owner: 'Jay', deadline: '3/23 완료', status: 'done' as const },
    { id: 'S-2', title: '동아일보 임직원 교육', desc: '사업계획서 제출 완료. 일정 확정 대기.', owner: 'Jay', deadline: '4월 중순', status: 'progress' as const },
    { id: 'S-3', title: '무료 파일럿 1-2회', desc: '후기, 영상, NPS 데이터 확보.', owner: 'Team', deadline: '4-5월', status: 'wait' as const },
    { id: 'S-4', title: '기술 준비', desc: 'AI 환경, 데모 게임, 테스트.', owner: 'Jay + JY', deadline: '파일럿 2주 전', status: 'wait' as const },
    { id: 'S-5', title: '웹 SEO + 디자인 리뉴얼', desc: '트래픽 개선, 네이버 노출. JeHyeong 전권.', owner: 'JeHyeong', deadline: '4-5월', status: 'progress' as const },
    { id: 'S-6', title: '콘텐츠 파이프라인 유지', desc: '리서치/칼럼 자동 발행. 8 에이전트 운영.', owner: 'Mother', deadline: 'Ongoing', status: 'progress' as const },
    { id: 'S-7', title: '개인 채널 홍보', desc: 'LinkedIn, Reddit 개인 브랜딩.', owner: '각자', deadline: '4월~', status: 'wait' as const },
    { id: 'S-8', title: '멀티 개발자 온보딩', desc: 'ROLES, CONTRIBUTING, 스킬 27개, work specs.', owner: 'Jay', deadline: '4/8 완료', status: 'done' as const },
    { id: 'S-9', title: 'CI/CD 파이프라인', desc: 'GitHub Actions + branch protection.', owner: 'JeHyeong', deadline: '4/18', status: 'wait' as const },
    { id: 'S-10', title: '크리에이터 셀프서비스', desc: '발행 가이드 + 템플릿 + 제출 플로우.', owner: 'JeHyeong', deadline: '4/25', status: 'wait' as const },
    { id: 'S-11', title: 'Cron 파이프라인 복구', desc: 'run-job.sh 수정 완료. Discord 감지 미구현.', owner: 'Jay', deadline: '4/10', status: 'progress' as const },
  ];
  const midItems = [
    { id: 'M-1', title: '유료 과정 전환', desc: '파일럿 NPS/후기 기반 수강료 도입.', owner: 'Jay', deadline: 'Q3', status: 'wait' as const },
    { id: 'M-2', title: '정기 과정화 (투 트랙)', desc: 'Track 1: Kids, Track 2: 전문직 성인.', owner: 'Team', deadline: 'Q3', status: 'wait' as const },
    { id: 'M-3', title: '멤버 → 운영진 전환', desc: '강사비/조교비 지급 시작.', owner: 'Jay', deadline: 'Q3', status: 'wait' as const },
    { id: 'M-4', title: '기업 AX 워크숍', desc: '리더가 직접 프로토타입 만드는 B2B 과정.', owner: 'Team', deadline: 'Q3-Q4', status: 'wait' as const },
    { id: 'M-5', title: '9월 부산 AI 축제', desc: '성공 사례 창출, 외부 노출.', owner: 'Team', deadline: '9월', status: 'wait' as const },
    { id: 'M-6', title: '커뮤니티 점진적 개방', desc: '코어 → 선별 초대 → 진입장벽 설계.', owner: 'Kiwon', deadline: 'Q3-Q4', status: 'wait' as const },
    { id: 'M-7', title: 'Jay → Platform Architect', desc: '운영은 멤버, Jay는 시스템 설계/전략.', owner: 'Jay', deadline: 'Q4', status: 'wait' as const },
    { id: 'M-8', title: '콘텐츠 자동 운영', desc: 'Mother 리서치/칼럼 자동 발행.', owner: 'Mother', deadline: 'Q3', status: 'wait' as const },
    { id: 'M-9', title: 'Mother Mirror Loop', desc: '멤버 산출물 분석 → 패턴 → 성찰.', owner: 'Mother', deadline: 'Q4', status: 'wait' as const },
  ];
  const longItems = [
    { id: 'L-1', title: '외부 강사 양성', desc: 'Academy 수료자 중 강사 후보.', owner: 'Team', deadline: '2027', status: 'wait' as const },
    { id: 'L-2', title: '기업 CSR 확장', desc: '동아일보 DBR에듀 B2B.', owner: 'Team', deadline: '2027', status: 'wait' as const },
    { id: 'L-3', title: '학교 제휴', desc: '정규 교육 과정 편입.', owner: 'Team', deadline: '2027', status: 'wait' as const },
    { id: 'L-4', title: '해커톤/창작대회', desc: '커뮤니티 성장 엔진.', owner: 'Team', deadline: '2027', status: 'wait' as const },
    { id: 'L-5', title: '수익 분배 구조', desc: '기여도 기반 지분/배당.', owner: 'Team', deadline: '2027', status: 'wait' as const },
    { id: 'L-6', title: '콘텐츠 IP 확장', desc: 'SIMULACRA 웹툰, 칼럼 구독.', owner: 'Team', deadline: '2027', status: 'wait' as const },
    { id: 'L-7', title: '에이전트 인프라 판매', desc: '파이프라인 SaaS/컨설팅.', owner: 'Team', deadline: '2027', status: 'wait' as const },
  ];

  return (
    <div>
      <SectionBox className="bg-[rgba(31,111,235,0.08)] border border-[rgba(31,111,235,0.25)]">
        <h2 className="text-[0.9rem] font-semibold mb-2 flex items-center gap-1.5">
          <span style={{ color: '#1f6feb' }}>&#9632;</span> {'단기 (Q2 2026) — 파일럿 실행 + 증거 확보'}
        </h2>
        <RoadmapTable items={shortItems} color="#1f6feb" />
      </SectionBox>

      <SectionBox className="bg-[rgba(241,196,15,0.08)] border border-[rgba(241,196,15,0.25)]">
        <h2 className="text-[0.9rem] font-semibold mb-2 flex items-center gap-1.5">
          <span style={{ color: '#f1c40f' }}>&#9632;</span> {'중기 (Q3-Q4 2026) — 유료 전환 + 수익 발생'}
        </h2>
        <RoadmapTable items={midItems} color="#f1c40f" />
      </SectionBox>

      <SectionBox className="bg-[rgba(39,174,96,0.08)] border border-[rgba(39,174,96,0.25)]">
        <h2 className="text-[0.9rem] font-semibold mb-2 flex items-center gap-1.5">
          <span style={{ color: '#27ae60' }}>&#9632;</span> {'장기 (2027) — 커뮤니티/길드 플랫폼'}
        </h2>
        <RoadmapTable items={longItems} color="#27ae60" />
      </SectionBox>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div className="rounded-xl p-3 bg-[rgba(232,115,74,0.1)] border border-[rgba(232,115,74,0.3)]">
          <h3 className="text-[0.85rem] font-semibold mb-1" style={{ color: '#e8734a' }}>{'Track 1: Kids/학부모'}</h3>
          <div className="text-[0.78rem] leading-relaxed">
            <strong>{'타겟:'}</strong> {'대치동 학원가'}<br />
            <strong>{'전략:'}</strong> {'동아일보 네임밸류 + 리뷰 축적'}<br />
            <strong>{'드라이버:'}</strong> {'공포(FOMO) + 신뢰(동아일보)'}
          </div>
        </div>
        <div className="rounded-xl p-3 bg-[rgba(241,196,15,0.1)] border border-[rgba(241,196,15,0.3)]">
          <h3 className="text-[0.85rem] font-semibold mb-1" style={{ color: '#f1c40f' }}>{'Track 2: 전문직 성인'}</h3>
          <div className="text-[0.78rem] leading-relaxed">
            <strong>{'타겟:'}</strong> {'치과의사, 변호사 등 고소득 전문직'}<br />
            <strong>{'전략:'}</strong> {'AI 시대 위기감 활용'}<br />
            <strong>{'드라이버:'}</strong> {'"뒤처지면 도태" 위기감'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div>
          <h3 className="text-[0.82rem] font-semibold mb-2 flex items-center gap-1"><span className="text-[#27ae60] font-bold">&#10003;</span> {'확정 사항'}</h3>
          <table className="w-full text-[0.75rem]">
            <tbody>
              {['멤버 의사 확인 (3/23 미팅)', '방향성: 교육이 본질', '커뮤니티: 초기 폐쇄 → 점진 개방', 'JeHyeong 웹 리드 위임', '4-layer 역할 구조 확정', 'Jay: Platform Architect & PM', 'AI Editorial Director 정의', 'KO/EN 항상 필수', 'Cron 버그 수정 완료'].map(d => (
                <tr key={d} className="border-b border-[#21262d]">
                  <td className="py-1 px-2 w-5 text-[#27ae60]">&#10003;</td>
                  <td className="py-1 px-2">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-[0.82rem] font-semibold mb-2 flex items-center gap-1"><span className="text-[#e8734a] font-bold">?</span> {'미결정 사항'}</h3>
          <table className="w-full text-[0.75rem]">
            <tbody>
              {['법인 구조', '멤버 법적 지위', '수익 배분 기준', '첫 유료 과정 형태', 'Discord 자동 감지 복구', 'Vercel 배포 권한', '역할 계층 확장 (Kiwon+TJ)'].map(d => (
                <tr key={d} className="border-b border-[#21262d]">
                  <td className="py-1 px-2 w-5 text-[#e8734a]">?</td>
                  <td className="py-1 px-2">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Workflow ──
function TabWorkflow({ onDetail }: { onDetail: (t: string, d: string, o: string) => void }) {
  const layers = [
    { title: '\uC785\uB825 \uACC4\uCE35', color: '#58a6ff', bg: 'bg-[rgba(88,166,255,0.06)] border-[rgba(88,166,255,0.2)]',
      items: [
        { title: '\uC77C\uC77C \uB9AC\uC11C\uCE58', desc: '\uB9E4\uC77C 06:00 AI/\uD14C\uD06C \uB274\uC2A4 \uC218\uC9D1, \uBD84\uC11D, \uB9AC\uD3EC\uD2B8 \uC790\uB3D9 \uC0DD\uC131', owner: 'Mother', color: '#58a6ff' },
        { title: '\uBA64\uBC84 \uC544\uC774\uB514\uC5B4', desc: '8\uBA85 \uBA64\uBC84\uAC00 \uC790\uAE30 \uC804\uACF5/\uAD00\uC810\uC5D0\uC11C \uC81C\uC548\uD558\uB294 \uD1A0\uD53D\uACFC \uC778\uC0AC\uC774\uD2B8', owner: '\uC804\uC6D0', color: '#8b949e' },
        { title: '\uC678\uBD80 \uC2DC\uADF8\uB110', desc: 'SANS \uB124\uD2B8\uC6CC\uD06C, LinkedIn, \uC5C5\uACC4 \uD2B8\uB80C\uB4DC \uB4F1 \uC678\uBD80 \uC815\uBCF4 \uC720\uC785', owner: 'Ryan', color: '#f1c40f' },
      ] },
    { title: '\uC81C\uC791 \uACC4\uCE35', color: '#8b5cf6', bg: 'bg-[rgba(139,92,246,0.06)] border-[rgba(139,92,246,0.2)]',
      items: [
        { title: '\uCF58\uD150\uCE20 \uD30C\uC774\uD504\uB77C\uC778', desc: '\uB9AC\uC11C\uCE58 -> \uCE7C\uB7FC -> KO/EN \uC790\uB3D9 \uC0DD\uC131/\uBC1C\uD589 (8 \uC5D0\uC774\uC804\uD2B8)', owner: 'Mother', color: '#58a6ff' },
        { title: '\uC774\uBCA4\uD2B8 \uAE30\uD68D', desc: '\uC624\uD504\uB77C\uC778 \uC774\uBCA4\uD2B8, \uC138\uBBF8\uB098, \uD574\uCEE4\uD1A4 \uAE30\uD68D \uBC0F \uC2E4\uD589', owner: 'Kiwon + TJ', color: '#e8734a' },
        { title: '\uC6F9 \uAC1C\uBC1C', desc: 'hypeproof-ai.xyz SEO, \uB514\uC790\uC778, \uD504\uB860\uD2B8\uC5D4\uB4DC \uAC1C\uBC1C', owner: 'JeHyeong', color: '#9b59b6' },
        { title: 'YouTube/\uC601\uC0C1', desc: '\uBC14\uC774\uBE0C\uCF54\uB529 \uC2DC\uB9AC\uC988, \uAD50\uC721 \uC601\uC0C1 \uC81C\uC791', owner: 'JY + TJ', color: '#e74c3c' },
        { title: 'Discord \uC6B4\uC601', desc: '\uCEE4\uBBA4\uB2C8\uD2F0 \uAD00\uB9AC, \uACF5\uC9C0, \uD1A0\uB860 \uCD09\uC9C4', owner: 'BH', color: '#27ae60' },
        { title: '\uB3C4\uBA54\uC778 \uBE44\uD3C9', desc: '\uBE44\uD310\uC801 \uAD00\uC810\uC5D0\uC11C \uD300 \uBC29\uD5A5 \uAC80\uC99D, \uB3C4\uBA54\uC778 \uB9AC\uC11C\uCE58', owner: 'JUNGWOO', color: '#3498db' },
      ] },
    { title: '\uBC30\uD3EC \uACC4\uCE35', color: '#fbbf24', bg: 'bg-[rgba(251,191,36,0.06)] border-[rgba(251,191,36,0.2)]',
      items: [
        { title: '\uC6F9\uC0AC\uC774\uD2B8', owner: '', color: '#9b59b6', desc: 'hypeproof-ai.xyz - SEO \uAE30\uBC18 \uC720\uAE30\uC801 \uD2B8\uB798\uD53D' },
        { title: 'Discord', owner: '', color: '#27ae60', desc: '\uCEE4\uBBA4\uB2C8\uD2F0 \uD5C8\uBE0C, \uC2E4\uC2DC\uAC04 \uC18C\uD1B5' },
        { title: 'YouTube', owner: '', color: '#e74c3c', desc: '\uC601\uC0C1 \uCF58\uD150\uCE20, \uBC14\uC774\uBE0C\uCF54\uB529 \uC2DC\uB9AC\uC988' },
        { title: 'LinkedIn', owner: '', color: '#f1c40f', desc: '\uC804\uBB38\uAC00 \uB124\uD2B8\uC6CC\uD06C, B2B \uC811\uC810' },
        { title: '\uC624\uD504\uB77C\uC778', owner: '', color: '#e8734a', desc: '\uC138\uBBF8\uB098, \uD574\uCEE4\uD1A4, \uB300\uBA74 \uC774\uBCA4\uD2B8' },
      ] },
    { title: '\uD53C\uB4DC\uBC31 \uACC4\uCE35', color: '#27ae60', bg: 'bg-[rgba(39,174,96,0.06)] border-[rgba(39,174,96,0.2)]',
      items: [
        { title: '\uC131\uACFC \uC218\uC9D1', desc: 'KPI \uB300\uC2DC\uBCF4\uB4DC, \uD2B8\uB798\uD53D/NPS/\uC804\uD658\uB960 \uC815\uB7C9 \uBD84\uC11D', owner: 'Ryan', color: '#f1c40f' },
        { title: 'Mother Mirror', desc: '\uBA64\uBC84 \uC0B0\uCD9C\uBB3C \uD328\uD134 \uBD84\uC11D, \uC131\uC7A5 \uADA4\uC801 \uCD94\uC801, \uC778\uC0AC\uC774\uD2B8 \uC5F0\uACB0', owner: 'Mother', color: '#58a6ff' },
        { title: '\uC8FC\uAC04 \uB9AC\uBDF0', desc: '\uB9E4\uC8FC \uC77C\uC694\uC77C 21:00, \uBC29\uD5A5 \uC124\uC815/\uC758\uC0AC\uACB0\uC815/\uB9AC\uC2A4\uD06C \uC810\uAC80', owner: 'Jay', color: '#1f6feb' },
      ] },
  ];

  return (
    <div>
      {layers.map((layer, i) => (
        <div key={layer.title}>
          <SectionBox className={`border ${layer.bg}`}>
            <h2 className="text-[0.85rem] font-semibold mb-2 flex items-center gap-1.5">
              <span style={{ color: layer.color }}>&#9650;</span> {layer.title}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
              {layer.items.map(item => (
                <Card key={item.title} title={item.title} sub={item.owner} barColor={item.color} desc={item.desc} owner={item.owner} onClick={onDetail} />
              ))}
            </div>
          </SectionBox>
          {i < layers.length - 1 && (
            <div className="text-center text-[#30363d] text-xl tracking-wider my-0.5">&#9660; &#9660; &#9660; &#9660; &#9660;</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tab 4: Member Roles (DYNAMIC from members.json) ──
function TabMemberRoles({ members, onDetail }: { members: DashboardMember[]; onDetail: (t: string, d: string, o: string) => void }) {
  const memberExtras: Record<string, { roleDesc: string; peakDays: string; kpi: string; value: string; tags: string[] }> = {
    Jay: { roleDesc: 'Initiative Provider, Mother ops', peakDays: 'Mon, Sun', kpi: '\uD30C\uC774\uD504\uB77C\uC778 \uD5EC\uC2A4, \uBA64\uBC84 \uD65C\uC131\uC728, Mother \uAC00\uB3D9\uB960 95%+', value: '\uB9AC\uB354\uC2ED, \uCCA0\uD559\uC801 \uC0AC\uACE0', tags: ['All (oversight)'] },
    Kiwon: { roleDesc: 'GTM \uC804\uB7B5 + \uC624\uD504\uB77C\uC778 \uC774\uBCA4\uD2B8', peakDays: 'Mon, Sat', kpi: '\uC774\uBCA4\uD2B8 \uC6D4 3-4\uD68C, NPS>40', value: '\uB9C8\uCF00\uD305 \uC2EC\uB9AC\uD559, \uCEE4\uBBA4\uB2C8\uD2F0 \uC124\uACC4', tags: ['Offline', 'Marketing'] },
    Ryan: { roleDesc: '\uC804\uB7B5 + LinkedIn + SANS + \uB370\uC774\uD130', peakDays: 'Mon, Thu, Sat', kpi: 'LinkedIn \uC778\uAC8C\uC774\uC9C0\uBA3C\uD2B8>3%, SANS 10\uBA85', value: '\uC804\uB7B5\uC801 \uC0AC\uACE0, \uC2DC\uC7A5 \uBD84\uC11D', tags: ['LinkedIn', 'SANS', 'Analytics'] },
    JY: { roleDesc: 'YouTube + \uBC14\uC774\uBE0C\uCF54\uB529 + \uAE30\uC220 \uCE7C\uB7FC', peakDays: 'Mon-Wed', kpi: '\uAD6C\uB3C5\uC790 100, \uD3C9\uADE0\uC870\uD68C 50, CTR>5%', value: '\uAD50\uC721\uD559, \uC9C0\uC2DD \uACF5\uC720', tags: ['YouTube', 'Tech columns'] },
    TJ: { roleDesc: '\uC601\uC0C1 \uC81C\uC791 + \uD31F\uCE90\uC2A4\uD2B8', peakDays: 'Tue-Thu', kpi: '\uC601\uC0C1 12\uD3B8, \uD31F\uCE90\uC2A4\uD2B8 6\uD3B8, Shorts 30\uD3B8', value: '\uC2A4\uD1A0\uB9AC\uD154\uB9C1, \uB0B4\uB7EC\uD2F0\uBE0C \uAD6C\uC870', tags: ['YouTube (production)', 'Podcast'] },
    '\uC7AC\uD615': { roleDesc: '\uC6F9 \uB9AC\uB4DC (SEO, \uB514\uC790\uC778, \uD504\uB860\uD2B8)', peakDays: 'Tue-Wed, Sat', kpi: '\uC77C 50 PV, \uC774\uD0C8\uB960<60%, SEO \uC778\uB371\uC2F1 100%', value: '\uC81C\uD488 \uC0AC\uACE0, UX', tags: ['Website', 'Reddit'] },
    BH: { roleDesc: 'Discord \uCEE4\uBBA4\uB2C8\uD2F0 \uC6B4\uC601', peakDays: 'Mon, Thu', kpi: '\uC8FC\uAC04 \uBA54\uC2DC\uC9C0 50+, \uD65C\uC131\uBA64\uBC84 15+', value: '\uD604\uC7A5 \uAC10\uAC01, \uB2C8\uC988 \uBC1C\uACAC', tags: ['Discord'] },
    '\uC815\uC6B0': { roleDesc: '\uB3C4\uBA54\uC778 \uBE44\uD3C9\uAC00 + \uB9AC\uC11C\uCE58', peakDays: 'Tue-Wed, Thu', kpi: '\uB3C4\uBA54\uC778 \uBE0C\uB9AC\uD504 6\uD3B8, \uCE7C\uB7FC 3\uD3B8', value: '\uBE44\uD310\uC801 \uC0AC\uACE0', tags: ['Research', 'Strategic feedback'] },
  };

  const activeMembers = members.filter(m => m.status === 'active');

  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">\uBA64\uBC84 \uC5ED\uD560 \uB9E4\uD2B8\uB9AD\uC2A4 ({activeMembers.length}\uBA85)</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2.5">
        {activeMembers.map(member => {
          const color = getMemberColor(member.displayName);
          const extras = memberExtras[member.displayName];
          const roleDesc = extras?.roleDesc || member.title || member.role;
          const hours = member.weeklyHours > 0 ? `${member.weeklyHours}h` : 'TBD';

          return (
            <div key={member.displayName}
              className="bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2.5 cursor-pointer transition-all hover:border-[#58a6ff] hover:-translate-y-0.5 hover:shadow-lg"
              style={{ borderTopColor: color, borderTopWidth: '3px' }}
              onClick={() => onDetail(
                `${member.displayName} \u2014 ${roleDesc}`,
                extras ? `<strong>\uC8FC\uAC04 \uC2A4\uCF00\uC904:</strong><br>\uD53C\uD06C \uC694\uC77C: ${extras.peakDays}<br>KPI: ${extras.kpi}` : member.title,
                `${hours} / \uD53C\uD06C: ${extras?.peakDays || 'N/A'}`
              )}>
              <div className="text-[0.9rem] font-bold mb-0.5" style={{ color }}>{member.displayName}</div>
              <div className="text-[#8b949e] text-[0.72rem] mb-1.5">{roleDesc}</div>
              <div className="flex justify-between text-[0.7rem] mb-0.5"><span className="text-[#8b949e]">\uC8FC\uAC04 \uD22C\uC785</span><span>{hours}</span></div>
              {extras && (
                <>
                  <div className="flex justify-between text-[0.7rem] mb-0.5"><span className="text-[#8b949e]">\uD53C\uD06C \uC694\uC77C</span><span>{extras.peakDays}</span></div>
                  <div className="text-[0.68rem] text-[#c9d1d9] mb-0.5">{extras.kpi}</div>
                  <div className="flex justify-between text-[0.7rem] mb-1"><span className="text-[#8b949e]">\uCCB4\uB4DD \uAC00\uCE58</span><span className="text-[#8b5cf6]">{extras.value}</span></div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {extras.tags.map(tag => (
                      <span key={tag} className="text-[0.6rem] px-1.5 py-0.5 rounded-lg bg-[rgba(88,166,255,0.12)] text-[#58a6ff]">{tag}</span>
                    ))}
                  </div>
                </>
              )}
              {!extras && member.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.expertise.map(tag => (
                    <span key={tag} className="text-[0.6rem] px-1.5 py-0.5 rounded-lg bg-[rgba(88,166,255,0.12)] text-[#58a6ff]">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 5: Mother AI ──
function TabMotherAI({ onDetail }: { onDetail: (t: string, d: string, o: string) => void }) {
  const rings = [
    { title: '\uC790\uB3D9 -- Mother\uAC00 \uC54C\uC544\uC11C', desc: '\uD30C\uC774\uD504\uB77C\uC778\uC774 \uAC80\uC99D\uB428. 24\uC2DC\uAC04 \uC790\uB3D9 \uC6B4\uC601.', bg: 'bg-[rgba(88,166,255,0.08)] border-[rgba(88,166,255,0.3)]', dot: '#58a6ff', bar: '#58a6ff',
      items: [
        { title: '\uC77C\uC77C \uB9AC\uC11C\uCE58 \uC0DD\uC131', sub: 'Mother - \uB9E4\uC77C 06:00', desc: '\uB9E4\uC77C 06:00\uC5D0 AI/\uD14C\uD06C \uB274\uC2A4\uB97C \uC218\uC9D1, \uBD84\uC11D, HypeProof Lens \uC801\uC6A9 \uD6C4 \uB9AC\uC11C\uCE58 \uB9AC\uD3EC\uD2B8\uB97C \uC790\uB3D9 \uC0DD\uC131.' },
        { title: '\uB9AC\uC11C\uCE58 -> \uC6F9 \uBC1C\uD589', sub: 'Mother - \uC790\uB3D9', desc: '\uC0DD\uC131\uB41C \uB9AC\uC11C\uCE58\uB97C \uC6F9\uC0AC\uC774\uD2B8\uC5D0 \uC790\uB3D9 \uBC1C\uD589. \uBE4C\uB4DC, \uBC30\uD3EC, URL \uC0DD\uC131\uAE4C\uC9C0 \uC804\uBD80 \uC790\uB3D9.' },
        { title: 'SEO \uBA54\uD0C0\uB370\uC774\uD130', sub: 'Mother - \uBC1C\uD589 \uC2DC', desc: '\uBC1C\uD589\uB418\uB294 \uBAA8\uB4E0 \uCF58\uD150\uCE20\uC5D0 SEO \uBA54\uD0C0\uD0DC\uADF8 \uC790\uB3D9 \uC0DD\uC131.' },
        { title: '\uC870\uD68C\uC218 \uD2B8\uB798\uD0B9', sub: 'Mother - \uC2E4\uC2DC\uAC04', desc: 'Upstash Redis\uB85C \uBAA8\uB4E0 \uD398\uC774\uC9C0\uC758 \uC870\uD68C\uC218\uB97C \uC2E4\uC2DC\uAC04 \uCD94\uC801.' },
        { title: '\uBE4C\uB4DC & \uBC30\uD3EC', sub: 'Mother - \uC790\uB3D9', desc: 'npm run build + vercel --prod. \uCF54\uB4DC \uBCC0\uACBD \uC2DC \uC790\uB3D9 \uBE4C\uB4DC, \uD14C\uC2A4\uD2B8, \uBC30\uD3EC.' },
      ] },
    { title: '\uAC70\uC6B8 -- Mother\uAC00 \uAD00\uCC30\uD558\uACE0 \uBE44\uCDB0\uC90C', desc: '\uD310\uB2E8\uD558\uC9C0 \uC54A\uB294\uB2E4. \uBA64\uBC84\uC758 \uC0B0\uCD9C\uBB3C\uC5D0\uC11C \uD328\uD134\uC744 \uBC1C\uACAC\uD574\uC11C \uBCF4\uC5EC\uC904 \uBFD0.', bg: 'bg-[rgba(139,92,246,0.08)] border-[rgba(139,92,246,0.3)]', dot: '#8b5cf6', bar: '#8b5cf6',
      items: [
        { title: '\uBA64\uBC84 \uC0B0\uCD9C\uBB3C \uD328\uD134 \uAC10\uC9C0', sub: 'Mother Mirror - \uC8FC\uAC04', desc: '\uBA64\uBC84\uAC00 \uC4F4 \uCE7C\uB7FC\uC5D0\uC11C \uBC18\uBCF5 \uD0A4\uC6CC\uB4DC, \uAD00\uC2EC \uC8FC\uC81C, \uB17C\uC870 \uBCC0\uD654\uB97C \uC790\uB3D9 \uAC10\uC9C0.' },
        { title: '\uBA64\uBC84 \uAC04 \uC778\uC0AC\uC774\uD2B8 \uC5F0\uACB0', sub: 'Mother Mirror - \uAC10\uC9C0 \uC2DC', desc: 'Ryan\uC758 \uBD84\uC11D\uACFC BH\uC758 \uAD00\uC810\uC774 \uC815\uBC18\uB300\uC77C \uB54C, \uADF8 \uCC28\uC774\uB97C \uBC1C\uACAC\uD574\uC11C \uC591\uCABD\uC5D0\uAC8C \uC54C\uB824\uC90C.' },
        { title: '\uC131\uC7A5 \uADA4\uC801 \uCD94\uC801', sub: 'Mother Mirror - \uC6D4\uAC04', desc: '\uC9C0\uB09C \uB2EC \uD0A4\uC6CC\uB4DC vs \uC774\uBC88 \uB2EC \uD0A4\uC6CC\uB4DC. \uBCC0\uD654\uB97C \uCD94\uC801\uD574\uC11C \uBCF4\uC5EC\uC90C.' },
        { title: '\uCCA0\uD559\uC801 \uC5F0\uACB0 \uC81C\uC548', sub: 'Mother Mirror - \uC120\uD0DD\uC801', desc: '\uBA64\uBC84 \uAE00\uC758 \uD328\uD134\uC744 \uC778\uBB38\uD559/\uCCA0\uD559 \uAC1C\uB150\uACFC \uC5F0\uACB0 \uC81C\uC548.' },
      ] },
    { title: '\uBCF4\uC870 -- \uC0AC\uB78C\uC774 \uACB0\uC815\uD558\uBA74 AI\uAC00 \uC2E4\uD589', desc: '\uBA64\uBC84\uAC00 "\uBB58 \uD560\uC9C0"\uB97C \uC815\uD558\uBA74, Mother\uAC00 \uCD08\uC548/\uBCC0\uD658/\uC801\uC6A9\uC744 \uD574\uC90C.', bg: 'bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.3)]', dot: '#fbbf24', bar: '#fbbf24',
      items: [
        { title: '\uB9AC\uC11C\uCE58 \uAE30\uBC18 \uCE7C\uB7FC \uCD08\uC548', sub: '\uBA64\uBC84 \uACB0\uC815 -> Mother \uC791\uC131', desc: '\uBA64\uBC84\uAC00 \uC8FC\uC81C\uB97C \uC120\uD0DD\uD558\uBA74, Mother\uAC00 \uB9AC\uC11C\uCE58 \uB370\uC774\uD130\uB97C \uAE30\uBC18\uC73C\uB85C \uCE7C\uB7FC \uCD08\uC548\uC744 \uC791\uC131.' },
        { title: '\uCE7C\uB7FC -> LinkedIn \uAE00', sub: 'Ryan \uC120\uD0DD -> Mother \uBCC0\uD658', desc: '\uC791\uC131\uB41C \uCE7C\uB7FC\uC744 LinkedIn \uC804\uBB38\uAC00 \uD1A4\uC73C\uB85C \uBCC0\uD658.' },
        { title: 'Discord \uACF5\uC9C0', sub: 'BH \uACB0\uC815 -> Mother \uC0DD\uC131', desc: '\uC0C8 \uCF58\uD150\uCE20 \uBC1C\uD589 \uC2DC Discord \uACF5\uC9C0 \uCF58\uD150\uCE20\uB97C Mother\uAC00 \uC0DD\uC131.' },
        { title: 'YouTube \uC2A4\uD06C\uB9BD\uD2B8 \uAC1C\uC694', sub: 'JY \uC8FC\uC81C -> Mother \uAC1C\uC694', desc: 'YouTube \uC5D0\uD53C\uC18C\uB4DC\uC758 \uC2A4\uD06C\uB9BD\uD2B8 \uAC1C\uC694\uB97C Mother\uAC00 \uC791\uC131.' },
        { title: 'KPI \uB300\uC2DC\uBCF4\uB4DC \uC5C5\uB370\uC774\uD2B8', sub: 'Ryan \uD574\uC11D -> Mother \uC815\uB9AC', desc: '\uC8FC\uAC04 KPI \uB370\uC774\uD130\uB97C \uC218\uC9D1\uD574\uC11C \uB300\uC2DC\uBCF4\uB4DC \uD615\uD0DC\uB85C \uC815\uB9AC.' },
      ] },
    { title: '\uC0AC\uB78C\uB9CC -- Mother \uB300\uCCB4 \uBD88\uAC00', desc: '\uC778\uAC04 \uAD00\uACC4, \uD604\uC7A5 \uC874\uC7AC, \uC9C1\uAD00\uC801 \uD310\uB2E8\uC774 \uD544\uC694\uD55C \uC601\uC5ED.', bg: 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)]', dot: '#ef4444', bar: '#ef4444',
      items: [
        { title: '\uC8FC\uAC04 \uBBF8\uD305 \uC9C4\uD589', sub: 'Jay - \uC77C 21:00', desc: '\uB9E4\uC8FC \uC77C\uC694\uC77C 21:00 \uC8FC\uAC04 \uBBF8\uD305. \uBC29\uD5A5 \uC124\uC815, \uC758\uC0AC\uACB0\uC815.' },
        { title: '\uC2DC\uB4DC \uBA64\uBC84 1:1 \uC811\uCD09', sub: 'Kiwon', desc: '1:1 DM\uC73C\uB85C "\uB2F9\uC2E0\uB9CC \uCD08\uB300\uD569\uB2C8\uB2E4" \uBA54\uC2DC\uC9C0 \uBC1C\uC1A1.' },
        { title: '\uC624\uD504\uB77C\uC778 \uC774\uBCA4\uD2B8', sub: 'Kiwon - \uC774\uBCA4\uD2B8\uBCC4', desc: '\uBB3C\uB9AC\uC801 \uD604\uC7A5 \uC874\uC7AC. \uCC38\uAC00\uC790\uC640 \uB300\uBA74 \uC18C\uD1B5.' },
        { title: '\uC804\uB7B5\uC801 \uC758\uC0AC\uACB0\uC815', sub: 'Jay', desc: '\uAD50\uC721\uC774\uB0D0 \uB3C4\uBA54\uC778\uC774\uB0D0 \uAC19\uC740 \uADFC\uBCF8 \uACB0\uC815.' },
        { title: 'SANS \uB124\uD2B8\uC6CC\uD06C \uAD00\uACC4', sub: 'Ryan', desc: 'SANS \uD074\uB7FD \uBA64\uBC84\uB4E4\uACFC\uC758 \uAD00\uACC4 \uD615\uC131. \uC2E0\uB8B0 \uAD6C\uCD95.' },
        { title: '\uD31F\uCE90\uC2A4\uD2B8 \uD638\uC2A4\uD305', sub: 'TJ - \uACA9\uC8FC', desc: '\uD31F\uCE90\uC2A4\uD2B8 \uB179\uC74C, \uB300\uD654, \uAC8C\uC2A4\uD2B8 \uCD08\uB300.' },
      ] },
  ];

  return (
    <div>
      <div className="mb-3">
        <div className="flex rounded-lg overflow-hidden h-1.5 mb-1">
          <div className="flex-1 bg-[#58a6ff]" /><div className="flex-1 bg-[#8b5cf6]" /><div className="flex-1 bg-[#fbbf24]" /><div className="flex-1 bg-[#ef4444]" />
        </div>
        <div className="flex justify-between text-[0.65rem] text-[#8b949e]"><span>AI \uC790\uB3D9</span><span>\uAC70\uC6B8 (\uAD00\uCC30)</span><span>\uBCF4\uC870 (\uC0AC\uB78C \uACB0\uC815)</span><span>\uC0AC\uB78C\uB9CC</span></div>
      </div>
      {rings.map(ring => (
        <SectionBox key={ring.title} className={`border ${ring.bg}`}>
          <h2 className="text-[0.85rem] font-semibold mb-1 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ring.dot }} /> {ring.title}
          </h2>
          <p className="text-[#8b949e] text-[0.73rem] mb-2">{ring.desc}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2">
            {ring.items.map(item => (
              <div key={item.title} className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 cursor-pointer relative transition-all hover:border-[#58a6ff] hover:-translate-y-0.5"
                onClick={() => onDetail(item.title, item.desc, item.sub)}>
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ background: ring.bar }} />
                <div className="text-[0.8rem] font-semibold leading-snug">{item.title}</div>
                <div className="text-[#8b949e] text-[0.68rem] mt-0.5 clear-left">{item.sub}</div>
              </div>
            ))}
          </div>
        </SectionBox>
      ))}
    </div>
  );
}

// ── Tab 6: Channels ──
function TabChannels() {
  const channels = [
    { name: '\uC6F9\uC0AC\uC774\uD2B8', color: '#9b59b6', owner: 'JeHyeong', kpi: '\uC77C 50 PV, \uC6D4 UV 1,000', content: 'Daily Research, \uCE7C\uB7FC KO/EN', freq: '\uB9E4\uC77C' },
    { name: 'Discord', color: '#27ae60', owner: 'BH', kpi: '\uC8FC\uAC04 \uBA54\uC2DC\uC9C0 50+, \uD65C\uC131\uBA64\uBC84 15+', content: '\uB9AC\uC11C\uCE58 \uC694\uC57D, \uCE7C\uB7FC \uACF5\uC9C0, \uD1A0\uB860', freq: '\uB9E4\uC77C' },
    { name: 'YouTube', color: '#e74c3c', owner: 'JY + TJ', kpi: '\uAD6C\uB3C5\uC790 100, \uC601\uC0C1 12\uD3B8', content: '\uBC14\uC774\uBE0C\uCF54\uB529 + Shorts', freq: '\uC8FC 1+3\uD68C' },
    { name: 'LinkedIn', color: '#f1c40f', owner: 'Ryan', kpi: '\uC778\uAC8C\uC774\uC9C0\uBA3C\uD2B8>3%, \uD314\uB85C\uC6CC 200', content: '\uCE7C\uB7FC \uC804\uBB38\uAC00 \uD1A4', freq: '\uC8FC 2\uD68C' },
    { name: 'Reddit', color: '#9b59b6', owner: 'JeHyeong', kpi: '\uC8FC 1-2 \uD3EC\uC2A4\uD2B8', content: '\uCE7C\uB7FC \uCEE4\uBBA4\uB2C8\uD2F0 \uC575\uAE00', freq: '\uC8FC 1-2\uD68C' },
    { name: '\uC624\uD504\uB77C\uC778', color: '#e8734a', owner: 'Kiwon', kpi: '\uC774\uBCA4\uD2B8 \uC6D4 3-4\uD68C, NPS>40', content: '\uC6CC\uD06C\uC20D, \uBC0B\uC5C5', freq: '\uC6D4 1-2\uD68C' },
    { name: 'SANS \uB124\uD2B8\uC6CC\uD06C', color: '#f1c40f', owner: 'Ryan', kpi: '\uD65C\uC131 \uCEE8\uD0DD 10', content: '\uAD00\uB828 \uCF58\uD150\uCE20 \uACF5\uC720', freq: '\uC0C1\uC2DC' },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">\uBC30\uD3EC \uCC44\uB110 \uB9F5</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
        {channels.map(ch => (
          <div key={ch.name} className="bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2.5" style={{ borderTopColor: ch.color, borderTopWidth: '3px' }}>
            <h4 className="text-[0.82rem] font-semibold mb-1">{ch.name}</h4>
            <div className="text-[0.7rem] leading-relaxed text-[#c9d1d9]">
              <strong className="text-[#58a6ff]">\uB2F4\uB2F9:</strong> <span style={{ color: ch.color }}>{ch.owner}</span><br />
              <strong className="text-[#58a6ff]">KPI:</strong> {ch.kpi}<br />
              <strong className="text-[#58a6ff]">\uCF58\uD150\uCE20:</strong> {ch.content}<br />
              <strong className="text-[#58a6ff]">\uBE48\uB3C4:</strong> {ch.freq}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 7: Feedback ──
function TabFeedback() {
  const steps = [
    { title: '1. \uBA64\uBC84 \uC2E4\uD589', desc: '\uCE7C\uB7FC \uC791\uC131, \uC601\uC0C1 \uC81C\uC791, \uC774\uBCA4\uD2B8 \uC6B4\uC601, LinkedIn, Discord', color: '#58a6ff', bg: 'rgba(88,166,255,0.08)', border: 'rgba(88,166,255,0.25)' },
    { title: '2. \uC131\uACFC \uC218\uC9D1 (Ryan)', desc: 'Page views, YouTube analytics, Discord activity, LinkedIn impressions, Event NPS', color: '#f1c40f', bg: 'rgba(241,196,15,0.08)', border: 'rgba(241,196,15,0.25)' },
    { title: '3. Mother \uBD84\uC11D', desc: '\uCF58\uD150\uCE20 \uC131\uACFC \uB7AD\uD0B9, \uD1A0\uD53D \uD788\uD2B8\uB9F5, \uBA64\uBC84 \uD65C\uB3D9 \uD328\uD134, \uCC44\uB110 ROI \uBE44\uAD50', color: '#58a6ff', bg: 'rgba(88,166,255,0.08)', border: 'rgba(88,166,255,0.25)' },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">\uD53C\uB4DC\uBC31 \uB8E8\uD504</h2>
      <div className="flex flex-col items-center max-w-[600px] mx-auto gap-0">
        {steps.map(step => (
          <div key={step.title}>
            <div className="w-full rounded-xl p-3" style={{ background: step.bg, border: `1px solid ${step.border}` }}>
              <h4 className="text-[0.82rem] font-semibold mb-0.5" style={{ color: step.color }}>{step.title}</h4>
              <p className="text-[0.72rem] text-[#c9d1d9] leading-snug">{step.desc}</p>
            </div>
            <div className="text-[#30363d] text-xl text-center py-0.5">&#9660;</div>
          </div>
        ))}
        <div className="w-full rounded-xl p-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.35)]">
          <h4 className="text-[0.82rem] font-semibold mb-1 text-[#8b5cf6]">4. Mirror Loop</h4>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {['\uD328\uD134 \uAC10\uC9C0: \uBA64\uBC84 \uC0B0\uCD9C\uBB3C\uC5D0\uC11C \uBC18\uBCF5 \uD0A4\uC6CC\uB4DC/\uB17C\uC870 \uBCC0\uD654 \uBC1C\uACAC', '\uAD50\uCC28 \uCC38\uC870: \uBA64\uBC84 \uAC04 \uC0C1\uBC18\uB41C \uAD00\uC810 \uC5F0\uACB0', '\uC131\uC7A5 \uADA4\uC801: \uC9C0\uB09C\uB2EC vs \uC774\uBC88\uB2EC \uD0A4\uC6CC\uB4DC \uBCC0\uD654 \uCD94\uC801', '\uCCA0\uD559 \uC5F0\uACB0: \uC778\uBB38\uD559/\uC2EC\uB9AC\uD559 \uAC1C\uB150\uACFC \uD328\uD134 \uC5F0\uACB0 \uC81C\uC548'].map(f => (
              <div key={f} className="text-[0.68rem] px-1.5 py-1 bg-[rgba(139,92,246,0.15)] rounded-md text-[#c4b5fd]">{f}</div>
            ))}
          </div>
        </div>
        <div className="text-[#30363d] text-xl text-center py-0.5">&#9660;</div>
        <div className="w-full rounded-xl p-3" style={{ background: 'rgba(31,111,235,0.08)', border: '1px solid rgba(31,111,235,0.25)' }}>
          <h4 className="text-[0.82rem] font-semibold mb-0.5 text-[#1f6feb]">5. \uC8FC\uAC04 \uB9AC\uBDF0 (Jay)</h4>
          <p className="text-[0.72rem] text-[#c9d1d9] leading-snug">\uB9E4\uC8FC \uC77C 21:00. \uCF58\uD150\uCE20 \uBFF9\uC2A4 \uC870\uC815, \uCC44\uB110 \uB178\uB825 \uC7AC\uBC30\uBD84</p>
        </div>
        <div className="text-[#30363d] text-xl text-center py-0.5">&#9660;</div>
        <div className="w-full rounded-xl p-3" style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)' }}>
          <h4 className="text-[0.82rem] font-semibold mb-0.5 text-[#27ae60]">6. \uB2E4\uC74C \uC0AC\uC774\uD074</h4>
          <p className="text-[0.72rem] text-[#c9d1d9] leading-snug">\uC870\uC815\uB41C \uACC4\uD68D\uC73C\uB85C \uBA64\uBC84\uAC00 \uB2E4\uC2DC \uC2E4\uD589. \uD53C\uB4DC\uBC31 \uB8E8\uD504 \uBC18\uBCF5.</p>
        </div>
      </div>
    </div>
  );
}

// ── Tab 8: Academy ──
function TabAcademy({ onDetail }: { onDetail: (t: string, d: string, o: string) => void }) {
  const preItems = [
    { title: 'T-14 \uCEE4\uB9AC\uD050\uB7FC \uB9AC\uBDF0', sub: 'Jay + Ryan', color: '#1f6feb' },
    { title: 'T-10 \uB9C8\uCF00\uD305 \uB860\uCE6D', sub: 'Kiwon + Ryan', color: '#e8734a' },
    { title: 'T-5 \uAD50\uC7AC \uC900\uBE44', sub: 'Jay + Mother', color: '#1f6feb' },
    { title: 'T-2 \uAE30\uC220 \uB9AC\uD5C8\uC124', sub: 'Jay + JY', color: '#e74c3c' },
  ];
  const ddayItems = [
    { title: '13:00 Part1 \uAD00\uC810\uC804\uD658', sub: 'Jay', color: '#1f6feb' },
    { title: '13:40 Part2 \uD611\uC5C5 PRD', sub: 'Jay + \uC870\uAD50', color: '#1f6feb' },
    { title: '14:30 Part3 AI \uC9C0\uD718', sub: 'Jay + JY + BH', color: '#e74c3c' },
    { title: '16:00 Part4 \uBC1C\uD45C+\uC2DC\uC0C1', sub: 'Jay MC + TJ \uCD2C\uC601', color: '#8b4513' },
  ];
  const journey = ['\uBC1C\uACAC', '\uB4F1\uB85D', '\uC0AC\uC804 \uC548\uB0B4', '\uC218\uC5C5', 'NPS', '\uCEE4\uBBA4\uB2C8\uD2F0 \uCD08\uB300', '\uC628\uBCF4\uB529', '\uD65C\uB3D9', '\uAE30\uC5EC\uC790'];
  const journeyColors = ['#8b949e', '#e8734a', '#e8734a', '#1f6feb', '#f1c40f', '#e8734a', '#27ae60', '#27ae60', '#8b5cf6'];

  return (
    <div>
      <SectionBox className="bg-[rgba(88,166,255,0.06)] border border-[rgba(88,166,255,0.2)]">
        <h3 className="text-[0.85rem] font-semibold mb-2">\uC0AC\uC804 \uC900\uBE44 (T-14 ~ T-1)</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
          {preItems.map(item => <Card key={item.title} title={item.title} sub={item.sub} barColor={item.color} onClick={onDetail} />)}
        </div>
      </SectionBox>
      <div className="text-center text-[#30363d] text-xl tracking-wider my-0.5">&#9660; D-Day &#9660;</div>
      <SectionBox className="bg-[rgba(232,115,74,0.08)] border border-[rgba(232,115,74,0.3)]">
        <h3 className="text-[0.85rem] font-semibold mb-2">D-Day \uC2E4\uD589</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
          {ddayItems.map(item => <Card key={item.title} title={item.title} sub={item.sub} barColor={item.color} onClick={onDetail} />)}
        </div>
      </SectionBox>
      <SectionBox className="bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.2)] mt-3">
        <h3 className="text-[0.85rem] font-semibold mb-2">\uC218\uAC15\uC0DD \uC5EC\uC815</h3>
        <div className="flex gap-0 items-stretch overflow-x-auto pb-1">
          {journey.map((step, i) => (
            <div key={step} className="contents">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-2 py-1.5 min-w-[90px] max-w-[130px] shrink-0 relative">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ background: journeyColors[i] }} />
                <div className="text-[0.75rem] font-semibold">{step}</div>
              </div>
              {i < journey.length - 1 && <div className="flex items-center text-[#30363d] text-xl min-w-5 shrink-0 justify-center">&#9654;</div>}
            </div>
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

// ── Tab 9: Revenue ──
function TabRevenue() {
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">\uC218\uC775 \uBAA8\uB378</h2>
      <h3 className="text-[0.82rem] font-semibold mb-2 text-[#58a6ff]">\uC218\uC775\uD654 \uC21C\uC11C</h3>
      <div className="flex gap-0 items-stretch overflow-x-auto pb-2 mb-3">
        {[
          { t: '\u2460 \uC720\uB8CC \uAC15\uC758/\uC6CC\uD06C\uC20D', s: '15-30\uB9CC\uC6D0', c: '#58a6ff', bg: 'rgba(88,166,255,0.1)', b: 'rgba(88,166,255,0.3)' },
          { t: '\u2461 \uC138\uBBF8\uB098/\uC624\uD504\uB77C\uC778', s: '\uBE0C\uB79C\uB4DC \uD655\uC7A5', c: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', b: 'rgba(139,92,246,0.3)' },
          { t: '\u2462 \uAE30\uC5C5 \uAD50\uC721/\uCEE8\uC124\uD305', s: 'B2B \uB9E4\uCD9C', c: '#f1c40f', bg: 'rgba(241,196,15,0.1)', b: 'rgba(241,196,15,0.3)' },
          { t: '\u2463 \uC6D4 \uAD6C\uB3C5 \uBA64\uBC84\uC2ED', s: '5-10\uB9CC\uC6D0', c: '#27ae60', bg: 'rgba(39,174,96,0.1)', b: 'rgba(39,174,96,0.3)' },
        ].map((item, i, arr) => (
          <div key={item.t} className="contents">
            <div className="flex-1 min-w-[140px] rounded-xl p-2 text-center" style={{ background: item.bg, border: `1px solid ${item.b}` }}>
              <h4 className="text-[0.78rem] font-semibold mb-0.5" style={{ color: item.c }}>{item.t}</h4>
              <p className="text-[0.68rem] text-[#c9d1d9]">{item.s}</p>
            </div>
            {i < arr.length - 1 && <div className="flex items-center text-[#30363d] text-xl min-w-6 shrink-0 justify-center">&#9654;</div>}
          </div>
        ))}
      </div>
      <h3 className="text-[0.82rem] font-semibold mb-2 text-[#58a6ff]">MOU \uC218\uC775 \uC2DC\uB098\uB9AC\uC624 (Year 1)</h3>
      <div className="overflow-x-auto mb-3">
        <table className="w-full border-collapse text-[0.78rem]">
          <thead><tr>{['\uC2DC\uB098\uB9AC\uC624', 'Year 1 \uB9E4\uCD9C', '\uB3D9\uC544\uC77C\uBCF4 (10%)', '\uC6B4\uC601 \uBC95\uC778 (90%)'].map(h => (
            <th key={h} className="bg-[#161b22] border border-[#30363d] px-2 py-1.5 text-left font-semibold text-[#58a6ff]">{h}</th>
          ))}</tr></thead>
          <tbody>
            <tr><td className="border border-[#30363d] px-2 py-1.5 text-[#27ae60] font-semibold">\uBCF4\uC218\uC801</td><td className="border border-[#30363d] px-2 py-1.5">8,000\uB9CC \uC6D0</td><td className="border border-[#30363d] px-2 py-1.5">800\uB9CC \uC6D0</td><td className="border border-[#30363d] px-2 py-1.5">7,200\uB9CC \uC6D0</td></tr>
            <tr><td className="border border-[#30363d] px-2 py-1.5 text-[#f1c40f] font-semibold">\uBAA9\uD45C</td><td className="border border-[#30363d] px-2 py-1.5">1\uC5B5 3,400\uB9CC \uC6D0</td><td className="border border-[#30363d] px-2 py-1.5">1,340\uB9CC \uC6D0</td><td className="border border-[#30363d] px-2 py-1.5">1\uC5B5 2,060\uB9CC \uC6D0</td></tr>
            <tr><td className="border border-[#30363d] px-2 py-1.5 text-[#e74c3c] font-semibold">\uB099\uAD00\uC801</td><td className="border border-[#30363d] px-2 py-1.5">1\uC5B5 7,000\uB9CC \uC6D0</td><td className="border border-[#30363d] px-2 py-1.5">1,700\uB9CC \uC6D0</td><td className="border border-[#30363d] px-2 py-1.5">1\uC5B5 5,300\uB9CC \uC6D0</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 10: Risk ──
function TabRisk() {
  const risks = [
    { level: 'HIGH', lc: '#ef4444', title: '\uBA64\uBC84 \uC804\uD658 \uC2E4\uD328', desc: '\uBAA8\uB4E0 \uBA64\uBC84\uB294 \uBCF8\uC5C5\uC774 \uC788\uB2E4. \uAE08\uC804\uC801 \uC778\uC13C\uD2F0\uBE0C\uB3C4 \uC57D\uD558\uB2E4.', resp: '\uC804\uC6D0 \uCC38\uC5EC\uB97C \uAE30\uB300\uD558\uC9C0 \uC54A\uB294\uB2E4. 2-3\uBA85 \uCF54\uC5B4 + AI \uC790\uB3D9\uD654\uAC00 \uD604\uC2E4\uC801 \uAD6C\uC870.', bg: 'rgba(239,68,68,0.08)', b: 'rgba(239,68,68,0.3)' },
    { level: 'HIGH', lc: '#e8734a', title: 'Jay \uC758\uC874\uB3C4', desc: '\uD30C\uC774\uD504\uB77C\uC778, \uCF58\uD150\uCE20, \uAD50\uC721, \uC778\uD504\uB77C \uC804\uBD80 Jay 1\uC778\uC5D0 \uC758\uC874.', resp: '\uC911\uAE30\uC5D0 \uBC18\uB4DC\uC2DC "Jay \uC5C6\uC774 \uB3CC\uC544\uAC00\uB294" \uC601\uC5ED\uC744 1\uAC1C \uC774\uC0C1 \uB9CC\uB4E0\uB2E4.', bg: 'rgba(232,115,74,0.08)', b: 'rgba(232,115,74,0.3)' },
    { level: 'MED', lc: '#f1c40f', title: '\uD30C\uC77C\uB7FF \uBBF8\uC2E4\uD589', desc: '29\uAC1C \uC561\uC158\uC544\uC774\uD15C\uC774 \uBBF8\uCC29\uC218 \uC0C1\uD0DC\uC600\uB2E4.', resp: '\uC0AC\uC5C5\uACC4\uD68D\uC11C \uC81C\uCD9C \uC644\uB8CC. 4\uC6D4 \uC911\uC21C \uC784\uC9C1\uC6D0 \uAD50\uC721\uC774 \uCCAB \uC2E4\uD589.', bg: 'rgba(241,196,15,0.08)', b: 'rgba(241,196,15,0.25)' },
    { level: 'LOW', lc: '#58a6ff', title: '\uAD00\uC810 \uBD84\uC0B0', desc: '8\uBA85\uC758 \uBA64\uBC84\uAC00 \uAC01\uC790 \uB2E4\uB978 \uBC29\uD5A5\uC744 \uC81C\uC2DC.', resp: 'Jay\uAC00 Initiative Provider\uB85C\uC11C \uBC29\uD5A5 \uD655\uC815. \uAD50\uC721\uC774 \uBCF8\uC9C8.', bg: 'rgba(88,166,255,0.08)', b: 'rgba(88,166,255,0.25)' },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">\uB9AC\uC2A4\uD06C \uB9F5</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {risks.map(r => (
          <div key={r.title} className="rounded-xl p-3" style={{ background: r.bg, border: `1px solid ${r.b}` }}>
            <h4 className="text-[0.82rem] font-semibold mb-1 flex items-center gap-1.5">
              <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(0,0,0,0.3)', color: r.lc }}>{r.level}</span>{r.title}
            </h4>
            <div className="text-[0.72rem] text-[#c9d1d9] mb-1.5 leading-snug">{r.desc}</div>
            <div className="text-[0.72rem] p-1.5 bg-[rgba(0,0,0,0.3)] rounded-md" style={{ borderLeft: `3px solid ${r.lc}` }}>
              <strong className="text-[#e6edf3]">\uB300\uC751 \uC804\uB7B5:</strong><br />{r.resp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 11: Community ──
function TabCommunity() {
  const phases = [
    { tag: 'CURRENT', tc: '#ef4444', title: 'Phase 1: \uD3D0\uC1C4', sub: '\uCF54\uC5B4 \uBA64\uBC84 8\uBA85', desc: '\uD604\uC7AC \uB2E8\uACC4. \uBC00\uB3C4\uC640 \uBE0C\uB79C\uB4DC \uAD6C\uCD95.', bg: 'rgba(239,68,68,0.08)', b: 'rgba(239,68,68,0.3)', hl: true },
    { tag: 'PLANNED', tc: '#e8734a', title: 'Phase 2: \uC2DC\uB4DC 30\uBA85', sub: '1:1 DM \uCD08\uB300', desc: '\uC2DC\uB4DC \uBA64\uBC84 30\uBA85\uC758 \uD038\uB9AC\uD2F0\uAC00 \uC774\uD6C4 300\uBA85\uC744 \uACB0\uC815.', bg: 'rgba(232,115,74,0.08)', b: 'rgba(232,115,74,0.3)', hl: false },
    { tag: 'PLANNED', tc: '#f1c40f', title: 'Phase 3: \uC810\uC9C4\uC801 \uAC1C\uBC29', sub: '\uCE7C\uB7FC \uC81C\uCD9C \uC9C4\uC785\uC7A5\uBCA1', desc: '\uAC15\uC758 \uC218\uAC15 \uD6C4 \uC2E4\uBB34\uC801\uC6A9 \uD6C4 \uACE0\uBBFC\uACF5\uC720 \uC21C\uD658 \uB8E8\uD504.', bg: 'rgba(241,196,15,0.08)', b: 'rgba(241,196,15,0.25)', hl: false },
    { tag: 'PLANNED', tc: '#27ae60', title: 'Phase 4: \uAE38\uB4DC', sub: '\uD0C8\uC911\uC559 \uD50C\uB7AB\uD3FC', desc: '\uBA64\uBC84\uB4E4\uC774 \uAC01\uC790 \uD504\uB85C\uC81D\uD2B8 \uC6B4\uC601. HypeProof Lab\uC740 \uD50C\uB7AB\uD3FC\uC774 \uB41C\uB2E4.', bg: 'rgba(39,174,96,0.08)', b: 'rgba(39,174,96,0.25)', hl: false },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">\uCEE4\uBBA4\uB2C8\uD2F0: Closed-First \uBAA8\uB378</h2>
      <div className="flex gap-0 items-stretch overflow-x-auto pb-2 mb-3">
        {phases.map((p, i) => (
          <div key={p.title} className="contents">
            <div className="flex-1 min-w-[160px] rounded-xl p-3" style={{ background: p.bg, border: `1px solid ${p.b}`, boxShadow: p.hl ? `0 0 0 2px ${p.tc}` : undefined }}>
              <span className="text-[0.6rem] px-1.5 py-0.5 rounded-lg inline-block mb-1 font-semibold" style={{ background: 'rgba(0,0,0,0.3)', color: p.tc }}>{p.tag}</span>
              <h4 className="text-[0.78rem] font-semibold mb-0.5">{p.title}</h4>
              <div className="text-[0.72rem] mb-0.5" style={{ color: p.tc }}>{p.sub}</div>
              <p className="text-[0.68rem] text-[#c9d1d9] leading-snug">{p.desc}</p>
            </div>
            {i < phases.length - 1 && <div className="flex items-center text-[#30363d] text-xl min-w-6 shrink-0 justify-center">&#9654;</div>}
          </div>
        ))}
      </div>
      <h3 className="text-[0.85rem] font-semibold mb-2">\uC628\uBCF4\uB529 \uC5EC\uC815</h3>
      <div className="flex gap-0 items-stretch overflow-x-auto pb-1">
        {['\uBC1C\uACAC', '\uAD00\uC2EC', '\uCC38\uC5EC', '\uAE30\uC5EC', '\uCF54\uC5B4'].map((step, i) => (
          <div key={step} className="contents">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-2 py-1.5 min-w-[90px] shrink-0 relative">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ background: ['#8b949e', '#58a6ff', '#e8734a', '#8b5cf6', '#27ae60'][i] }} />
              <div className="text-[0.75rem] font-semibold">{step}</div>
            </div>
            {i < 4 && <div className="flex items-center text-[#30363d] text-xl min-w-5 shrink-0 justify-center">&#9654;</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 12: QA ──
function TabQA() {
  const rows = [
    { n: 1, name: '\uB85C\uB4DC\uB9F5', note: '\uB2E8\uAE30/\uC911\uAE30/\uC7A5\uAE30 + \uD22C \uD2B8\uB799 + \uACB0\uC815\uC0AC\uD56D' },
    { n: 2, name: '\uC804\uCCB4 \uC6CC\uD06C\uD50C\uB85C\uC6B0', note: '4\uACC4\uCE35 \uAD6C\uC870 + \uD654\uC0B4\uD45C + \uD074\uB9AD \uC0C1\uC138' },
    { n: 3, name: '\uCF58\uD150\uCE20 \uD30C\uC774\uD504\uB77C\uC778', note: '4\uB2E8\uACC4 \uC218\uD3C9 \uD30C\uC774\uD504\uB77C\uC778' },
    { n: 4, name: '\uBA64\uBC84 \uC5ED\uD560', note: '\uB3D9\uC801 \uB80C\uB354\uB9C1 from members.json' },
    { n: 5, name: 'Mother AI', note: '4\uB9C1 \uAD6C\uC870' },
    { n: 6, name: '\uBC30\uD3EC \uCC44\uB110', note: '7\uCC44\uB110 \uCE74\uB4DC + KPI' },
    { n: 7, name: '\uD53C\uB4DC\uBC31 \uB8E8\uD504', note: '6\uB2E8\uACC4 \uC218\uC9C1 \uD50C\uB85C\uC6B0 + Mirror Loop' },
    { n: 8, name: '\uAD50\uC721 Academy', note: '\uC0AC\uC804\uC900\uBE44+D-Day+\uC218\uAC15\uC0DD\uC5EC\uC815' },
    { n: 9, name: '\uC218\uC775 \uBAA8\uB378', note: '\uC218\uC775\uD654 \uC21C\uC11C + MOU 3\uC2DC\uB098\uB9AC\uC624' },
    { n: 10, name: '\uB9AC\uC2A4\uD06C \uB9F5', note: '4\uB300 \uB9AC\uC2A4\uD06C + \uB300\uC751 \uC804\uB7B5' },
    { n: 11, name: '\uCEE4\uBBA4\uB2C8\uD2F0', note: 'Closed-First 4\uB2E8\uACC4 + \uC628\uBCF4\uB529' },
    { n: 12, name: 'QA \uB9AC\uD3EC\uD2B8', note: '\uC804\uCCB4 \uD0ED \uC0C1\uD0DC \uD14C\uC774\uBE14' },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">QA \uB9AC\uD3EC\uD2B8 &mdash; Dashboard v4 (Next.js Dynamic)</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[0.78rem]">
          <thead><tr>{['#', '\uD0ED \uC774\uB984', '\uAD6C\uD604 \uC0C1\uD0DC', '\uBE44\uACE0'].map(h => (
            <th key={h} className="bg-[#161b22] border border-[#30363d] px-2 py-1.5 text-left font-semibold text-[#58a6ff]">{h}</th>
          ))}</tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.n} className="hover:bg-[rgba(88,166,255,0.04)]">
                <td className="border border-[#30363d] px-2 py-1.5">{r.n}</td>
                <td className="border border-[#30363d] px-2 py-1.5">{r.name}</td>
                <td className="border border-[#30363d] px-2 py-1.5 text-[#27ae60] font-semibold">\uC644\uB8CC</td>
                <td className="border border-[#30363d] px-2 py-1.5">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Dashboard Component ──
interface DashboardClientProps {
  members: DashboardMember[];
  updatedAt: string;
}

export default function DashboardClient({ members, updatedAt }: DashboardClientProps) {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('roadmap');
  const [detail, setDetail] = useState({ title: '', desc: '', owner: '' });

  const onDetail = (title: string, desc: string, owner: string) => {
    setDetail({ title, desc, owner });
  };

  const switchTab = (id: string) => {
    setActiveTab(id);
    setDetail({ title: '', desc: '', owner: '' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">HypeProof <span className="text-[#58a6ff]">Lab</span> Dashboard</h1>
        <p className="text-[#8b949e]">\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.</p>
        <AuthButton />
      </div>
    );
  }

  const activeMembers = members.filter(m => m.status === 'active');

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]" style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-[#30363d]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-bold">
            <Link href="/" className="hover:opacity-80">HypeProof <span className="text-[#58a6ff]">Lab</span> Dashboard</Link>
          </h1>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-[#161b22] border border-[#30363d] rounded-md px-2 py-0.5 text-[0.72rem]">\uBA64\uBC84 <strong className="text-[#58a6ff]">{activeMembers.length}</strong>\uBA85</div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-md px-2 py-0.5 text-[0.72rem]">\uC5D0\uC774\uC804\uD2B8 <strong className="text-[#58a6ff]">8</strong>\uAC1C</div>
            {updatedAt && <div className="bg-[#161b22] border border-[#30363d] rounded-md px-2 py-0.5 text-[0.72rem]">\uAC31\uC2E0 <strong className="text-[#58a6ff]">{updatedAt}</strong></div>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap mt-2 pb-1">
          {activeMembers.map(m => (
            <div key={m.displayName} className="flex items-center gap-1 text-[0.68rem] text-[#8b949e]">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getMemberColor(m.displayName) }} />
              {m.displayName}
            </div>
          ))}
          <div className="flex items-center gap-1 text-[0.68rem] text-[#8b949e]">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#58a6ff' }} />Mother
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-50 bg-[#0d1117] border-b border-[#30363d] px-3 py-1.5 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id}
            className={`shrink-0 rounded-md px-2.5 py-1.5 text-[0.72rem] cursor-pointer whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? 'bg-[#1f6feb] border-[#1f6feb] text-white font-semibold'
                : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#58a6ff] hover:text-[#e6edf3]'
            }`}
            onClick={() => switchTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex gap-4 max-w-[1500px] mx-auto px-4 py-3 items-start">
        <div className="flex-1 min-w-0">
          {activeTab === 'roadmap' && <TabRoadmap onDetail={onDetail} />}
          {activeTab === 'd1' && <TabWorkflow onDetail={onDetail} />}
          {activeTab === 'd2' && <TabContentPipeline onDetail={onDetail} />}
          {activeTab === 'd3' && <TabMemberRoles members={members} onDetail={onDetail} />}
          {activeTab === 'd4' && <TabMotherAI onDetail={onDetail} />}
          {activeTab === 'd5' && <TabChannels />}
          {activeTab === 'd6' && <TabFeedback />}
          {activeTab === 'd7' && <TabAcademy onDetail={onDetail} />}
          {activeTab === 'd8' && <TabRevenue />}
          {activeTab === 'd9' && <TabRisk />}
          {activeTab === 'd10' && <TabCommunity />}
          {activeTab === 'qa' && <TabQA />}
        </div>
        <div className="w-[340px] shrink-0 sticky top-14 hidden lg:block">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <DetailPanel title={detail.title} desc={detail.desc} owner={detail.owner} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Tab 3: Content Pipeline (inline to avoid file size issue) ──
function TabContentPipeline({ onDetail }: { onDetail: (t: string, d: string, o: string) => void }) {
  const stages = [
    { title: 'Stage 1: \uC18C\uC2A4', bg: 'bg-[rgba(88,166,255,0.06)] border-[rgba(88,166,255,0.2)]',
      items: [
        { title: '\uC77C\uC77C \uB9AC\uC11C\uCE58', sub: 'Mother', color: '#58a6ff' },
        { title: '\uBA64\uBC84 \uCE7C\uB7FC', sub: '\uBA64\uBC84 + Mother', color: '#8b949e' },
        { title: 'YouTube', sub: 'JY + TJ', color: '#e74c3c' },
        { title: '\uD31F\uCE90\uC2A4\uD2B8', sub: 'TJ', color: '#8b4513' },
        { title: '\uC774\uBCA4\uD2B8 \uC694\uC57D', sub: 'Kiwon', color: '#e8734a' },
      ] },
    { title: 'Stage 2: \uC81C\uC791', bg: 'bg-[rgba(139,92,246,0.06)] border-[rgba(139,92,246,0.2)]',
      items: [
        { title: 'Mother \uCD08\uC548 \uC791\uC131', sub: 'Mother', color: '#58a6ff' },
        { title: '\uBA64\uBC84 \uAC80\uD1A0/\uC218\uC815', sub: '\uD574\uB2F9 \uBA64\uBC84', color: '#8b949e' },
        { title: 'QA \uAC80\uC99D', sub: 'Mother', color: '#58a6ff' },
        { title: '\uBE4C\uB4DC + \uBC30\uD3EC', sub: 'Mother', color: '#58a6ff' },
      ] },
    { title: 'Stage 3: \uBC30\uD3EC', bg: 'bg-[rgba(251,191,36,0.06)] border-[rgba(251,191,36,0.2)]',
      items: [
        { title: '\uC6F9\uC0AC\uC774\uD2B8', sub: 'JeHyeong', color: '#9b59b6' },
        { title: 'Discord', sub: 'BH', color: '#27ae60' },
        { title: 'YouTube', sub: 'JY', color: '#e74c3c' },
        { title: 'LinkedIn', sub: 'Ryan', color: '#f1c40f' },
      ] },
    { title: 'Stage 4: \uD53C\uB4DC\uBC31', bg: 'bg-[rgba(39,174,96,0.06)] border-[rgba(39,174,96,0.2)]',
      items: [
        { title: '\uC870\uD68C\uC218 \uC218\uC9D1', sub: 'Mother', color: '#58a6ff' },
        { title: 'KPI \uBD84\uC11D', sub: 'Ryan', color: '#f1c40f' },
        { title: 'Mirror Loop', sub: 'Mother', color: '#58a6ff' },
        { title: '\uC8FC\uAC04 \uB9AC\uBDF0', sub: 'Jay', color: '#1f6feb' },
      ] },
  ];

  return (
    <div>
      <div className="flex gap-0 items-stretch overflow-x-auto pb-2">
        {stages.map((stage, i) => (
          <div key={stage.title} className="contents">
            <div className={`flex-1 min-w-[180px] rounded-xl p-3 border ${stage.bg}`}>
              <h3 className="text-[0.82rem] font-semibold mb-2">{stage.title}</h3>
              <div className="flex flex-col gap-1.5">
                {stage.items.map(item => (
                  <Card key={item.title} title={item.title} sub={item.sub} barColor={item.color} onClick={onDetail} />
                ))}
              </div>
            </div>
            {i < stages.length - 1 && <div className="flex items-center justify-center text-[#30363d] text-2xl min-w-7 shrink-0">&#9654;</div>}
          </div>
        ))}
      </div>
      <div className="mt-3 bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-[0.75rem] leading-relaxed">
        <strong className="text-[#58a6ff]">\uD0C0\uC774\uBC0D:</strong> \uB9AC\uC11C\uCE58 \uB9E4\uC77C 06:00 &rarr; \uC6F9 \uBC1C\uD589 \uC989\uC2DC &rarr; Discord 1\uC2DC\uAC04 \uB0B4 &rarr; \uC8FC\uAC04 \uB9AC\uBDF0 \uC77C 21:00
      </div>
    </div>
  );
}
