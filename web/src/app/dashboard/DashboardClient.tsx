'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';
import { Footer } from '@/components/layout/Footer';
import type { DashboardMember } from './types';
import type { TimelineData, Holiday } from '@/lib/timeline/types';
import type { Note } from '@/lib/sheets/notes';
import CalendarTab from './components/CalendarTab';

// ── Color map for members ──
const MEMBER_COLORS: Record<string, string> = {
  Jay: '#1f6feb',
  Kiwon: '#e8734a',
  Ryan: '#f1c40f',
  JY: '#e74c3c',
  TJ: '#8b4513',
  '재형': '#9b59b6',
  BH: '#27ae60',
  '정우': '#3498db',
  Sebastian: '#6c757d',
  Simon: '#20c997',
  Mother: '#58a6ff',
};

function getMemberColor(name: string): string {
  return MEMBER_COLORS[name] || '#8b949e';
}

// ── Tab definitions ──
const TABS = [
  { id: 'cal', label: '\uD83D\uDCC5 캘린더' },
  { id: 'roadmap', label: '1. 로드맵' },
  { id: 'd1', label: '2. 전체 워크플로우' },
  { id: 'd2', label: '3. 콘텐츠 파이프라인' },
  { id: 'd3', label: '4. 멤버 역할' },
  { id: 'd4', label: '5. Mother AI' },
  { id: 'd5', label: '6. 배포 채널' },
  { id: 'd6', label: '7. 피드백 루프' },
  { id: 'd7', label: '8. 교육 Academy' },
  { id: 'd8', label: '9. 수익 모델' },
  { id: 'd9', label: '10. 리스크 맵' },
  { id: 'd10', label: '11. 커뮤니티' },
  { id: 'qa', label: '12. QA 리포트' },
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
  const labels = { done: 'Done', progress: '진행중', wait: '대기' };
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
    { title: '입력 계층', color: '#58a6ff', bg: 'bg-[rgba(88,166,255,0.06)] border-[rgba(88,166,255,0.2)]',
      items: [
        { title: '일일 리서치', desc: '매일 06:00 AI/테크 뉴스 수집, 분석, 리포트 자동 생성', owner: 'Mother', color: '#58a6ff' },
        { title: '멤버 아이디어', desc: '8명 멤버가 자기 전공/관점에서 제안하는 토픽과 인사이트', owner: '전원', color: '#8b949e' },
        { title: '외부 시그널', desc: 'SANS 네트워크, LinkedIn, 업계 트렌드 등 외부 정보 유입', owner: 'Ryan', color: '#f1c40f' },
      ] },
    { title: '제작 계층', color: '#8b5cf6', bg: 'bg-[rgba(139,92,246,0.06)] border-[rgba(139,92,246,0.2)]',
      items: [
        { title: '콘텐츠 파이프라인', desc: '리서치 -> 칼럼 -> KO/EN 자동 생성/발행 (8 에이전트)', owner: 'Mother', color: '#58a6ff' },
        { title: '이벤트 기획', desc: '오프라인 이벤트, 세미나, 해커톤 기획 및 실행', owner: 'Kiwon + TJ', color: '#e8734a' },
        { title: '웹 개발', desc: 'hypeproof-ai.xyz SEO, 디자인, 프론트엔드 개발', owner: 'JeHyeong', color: '#9b59b6' },
        { title: 'YouTube/영상', desc: '바이브코딩 시리즈, 교육 영상 제작', owner: 'JY + TJ', color: '#e74c3c' },
        { title: 'Discord 운영', desc: '커뮤니티 관리, 공지, 토론 촉진', owner: 'BH', color: '#27ae60' },
        { title: '도메인 비평', desc: '비판적 관점에서 팀 방향 검증, 도메인 리서치', owner: 'JUNGWOO', color: '#3498db' },
      ] },
    { title: '배포 계층', color: '#fbbf24', bg: 'bg-[rgba(251,191,36,0.06)] border-[rgba(251,191,36,0.2)]',
      items: [
        { title: '웹사이트', owner: '', color: '#9b59b6', desc: 'hypeproof-ai.xyz - SEO 기반 유기적 트래픽' },
        { title: 'Discord', owner: '', color: '#27ae60', desc: '커뮤니티 허브, 실시간 소통' },
        { title: 'YouTube', owner: '', color: '#e74c3c', desc: '영상 콘텐츠, 바이브코딩 시리즈' },
        { title: 'LinkedIn', owner: '', color: '#f1c40f', desc: '전문가 네트워크, B2B 접점' },
        { title: '오프라인', owner: '', color: '#e8734a', desc: '세미나, 해커톤, 대면 이벤트' },
      ] },
    { title: '피드백 계층', color: '#27ae60', bg: 'bg-[rgba(39,174,96,0.06)] border-[rgba(39,174,96,0.2)]',
      items: [
        { title: '성과 수집', desc: 'KPI 대시보드, 트래픽/NPS/전환률 정량 분석', owner: 'Ryan', color: '#f1c40f' },
        { title: 'Mother Mirror', desc: '멤버 산출물 패턴 분석, 성장 궤적 추적, 인사이트 연결', owner: 'Mother', color: '#58a6ff' },
        { title: '주간 리뷰', desc: '매주 일요일 21:00, 방향 설정/의사결정/리스크 점검', owner: 'Jay', color: '#1f6feb' },
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
    Jay: { roleDesc: 'Initiative Provider, Mother ops', peakDays: 'Mon, Sun', kpi: '파이프라인 헬스, 멤버 활성율, Mother 가동률 95%+', value: '리더십, 철학적 사고', tags: ['All (oversight)'] },
    Kiwon: { roleDesc: 'GTM 전략 + 오프라인 이벤트', peakDays: 'Mon, Sat', kpi: '이벤트 월 3-4회, NPS>40', value: '마케팅 심리학, 커뮤니티 설계', tags: ['Offline', 'Marketing'] },
    Ryan: { roleDesc: '전략 + LinkedIn + SANS + 데이터', peakDays: 'Mon, Thu, Sat', kpi: 'LinkedIn 인게이지먼트>3%, SANS 10명', value: '전략적 사고, 시장 분석', tags: ['LinkedIn', 'SANS', 'Analytics'] },
    JY: { roleDesc: 'YouTube + 바이브코딩 + 기술 칼럼', peakDays: 'Mon-Wed', kpi: '구독자 100, 평균조회 50, CTR>5%', value: '교육학, 지식 공유', tags: ['YouTube', 'Tech columns'] },
    TJ: { roleDesc: '영상 제작 + 팟캐스트', peakDays: 'Tue-Thu', kpi: '영상 12편, 팟캐스트 6편, Shorts 30편', value: '스토리텔링, 내러티브 구조', tags: ['YouTube (production)', 'Podcast'] },
    '재형': { roleDesc: '웹 리드 (SEO, 디자인, 프론트)', peakDays: 'Tue-Wed, Sat', kpi: '일 50 PV, 이탈률<60%, SEO 인덱싱 100%', value: '제품 사고, UX', tags: ['Website', 'Reddit'] },
    BH: { roleDesc: 'Discord 커뮤니티 운영', peakDays: 'Mon, Thu', kpi: '주간 메시지 50+, 활성멤버 15+', value: '현장 감각, 니즈 발견', tags: ['Discord'] },
    '정우': { roleDesc: '도메인 비평가 + 리서치', peakDays: 'Tue-Wed, Thu', kpi: '도메인 브리프 6편, 칼럼 3편', value: '비판적 사고', tags: ['Research', 'Strategic feedback'] },
  };

  const activeMembers = members.filter(m => m.status === 'active');

  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">멤버 역할 매트릭스 ({activeMembers.length}명)</h2>
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
                extras ? `<strong>주간 스케줄:</strong><br>피크 요일: ${extras.peakDays}<br>KPI: ${extras.kpi}` : member.title,
                `${hours} / 피크: ${extras?.peakDays || 'N/A'}`
              )}>
              <div className="text-[0.9rem] font-bold mb-0.5" style={{ color }}>{member.displayName}</div>
              <div className="text-[#8b949e] text-[0.72rem] mb-1.5">{roleDesc}</div>
              <div className="flex justify-between text-[0.7rem] mb-0.5"><span className="text-[#8b949e]">주간 투입</span><span>{hours}</span></div>
              {extras && (
                <>
                  <div className="flex justify-between text-[0.7rem] mb-0.5"><span className="text-[#8b949e]">피크 요일</span><span>{extras.peakDays}</span></div>
                  <div className="text-[0.68rem] text-[#c9d1d9] mb-0.5">{extras.kpi}</div>
                  <div className="flex justify-between text-[0.7rem] mb-1"><span className="text-[#8b949e]">체득 가치</span><span className="text-[#8b5cf6]">{extras.value}</span></div>
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
    { title: '자동 -- Mother가 알아서', desc: '파이프라인이 검증됨. 24시간 자동 운영.', bg: 'bg-[rgba(88,166,255,0.08)] border-[rgba(88,166,255,0.3)]', dot: '#58a6ff', bar: '#58a6ff',
      items: [
        { title: '일일 리서치 생성', sub: 'Mother - 매일 06:00', desc: '매일 06:00에 AI/테크 뉴스를 수집, 분석, HypeProof Lens 적용 후 리서치 리포트를 자동 생성.' },
        { title: '리서치 -> 웹 발행', sub: 'Mother - 자동', desc: '생성된 리서치를 웹사이트에 자동 발행. 빌드, 배포, URL 생성까지 전부 자동.' },
        { title: 'SEO 메타데이터', sub: 'Mother - 발행 시', desc: '발행되는 모든 콘텐츠에 SEO 메타태그 자동 생성.' },
        { title: '조회수 트래킹', sub: 'Mother - 실시간', desc: 'Upstash Redis로 모든 페이지의 조회수를 실시간 추적.' },
        { title: '빌드 & 배포', sub: 'Mother - 자동', desc: 'npm run build + vercel --prod. 코드 변경 시 자동 빌드, 테스트, 배포.' },
      ] },
    { title: '거울 -- Mother가 관찰하고 비춰줌', desc: '판단하지 않는다. 멤버의 산출물에서 패턴을 발견해서 보여줄 뿐.', bg: 'bg-[rgba(139,92,246,0.08)] border-[rgba(139,92,246,0.3)]', dot: '#8b5cf6', bar: '#8b5cf6',
      items: [
        { title: '멤버 산출물 패턴 감지', sub: 'Mother Mirror - 주간', desc: '멤버가 쓴 칼럼에서 반복 키워드, 관심 주제, 논조 변화를 자동 감지.' },
        { title: '멤버 간 인사이트 연결', sub: 'Mother Mirror - 감지 시', desc: 'Ryan의 분석과 BH의 관점이 정반대일 때, 그 차이를 발견해서 양쪽에게 알려줌.' },
        { title: '성장 궤적 추적', sub: 'Mother Mirror - 월간', desc: '지난 달 키워드 vs 이번 달 키워드. 변화를 추적해서 보여줌.' },
        { title: '철학적 연결 제안', sub: 'Mother Mirror - 선택적', desc: '멤버 글의 패턴을 인문학/철학 개념과 연결 제안.' },
      ] },
    { title: '보조 -- 사람이 결정하면 AI가 실행', desc: '멤버가 "뭘 할지"를 정하면, Mother가 초안/변환/적용을 해줌.', bg: 'bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.3)]', dot: '#fbbf24', bar: '#fbbf24',
      items: [
        { title: '리서치 기반 칼럼 초안', sub: '멤버 결정 -> Mother 작성', desc: '멤버가 주제를 선택하면, Mother가 리서치 데이터를 기반으로 칼럼 초안을 작성.' },
        { title: '칼럼 -> LinkedIn 글', sub: 'Ryan 선택 -> Mother 변환', desc: '작성된 칼럼을 LinkedIn 전문가 톤으로 변환.' },
        { title: 'Discord 공지', sub: 'BH 결정 -> Mother 생성', desc: '새 콘텐츠 발행 시 Discord 공지 콘텐츠를 Mother가 생성.' },
        { title: 'YouTube 스크립트 개요', sub: 'JY 주제 -> Mother 개요', desc: 'YouTube 에피소드의 스크립트 개요를 Mother가 작성.' },
        { title: 'KPI 대시보드 업데이트', sub: 'Ryan 해석 -> Mother 정리', desc: '주간 KPI 데이터를 수집해서 대시보드 형태로 정리.' },
      ] },
    { title: '사람만 -- Mother 대체 불가', desc: '인간 관계, 현장 존재, 직관적 판단이 필요한 영역.', bg: 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)]', dot: '#ef4444', bar: '#ef4444',
      items: [
        { title: '주간 미팅 진행', sub: 'Jay - 일 21:00', desc: '매주 일요일 21:00 주간 미팅. 방향 설정, 의사결정.' },
        { title: '시드 멤버 1:1 접촉', sub: 'Kiwon', desc: '1:1 DM으로 "당신만 초대합니다" 메시지 발송.' },
        { title: '오프라인 이벤트', sub: 'Kiwon - 이벤트별', desc: '물리적 현장 존재. 참가자와 대면 소통.' },
        { title: '전략적 의사결정', sub: 'Jay', desc: '교육이냐 도메인이냐 같은 근본 결정.' },
        { title: 'SANS 네트워크 관계', sub: 'Ryan', desc: 'SANS 클럽 멤버들과의 관계 형성. 신뢰 구축.' },
        { title: '팟캐스트 호스팅', sub: 'TJ - 격주', desc: '팟캐스트 녹음, 대화, 게스트 초대.' },
      ] },
  ];

  return (
    <div>
      <div className="mb-3">
        <div className="flex rounded-lg overflow-hidden h-1.5 mb-1">
          <div className="flex-1 bg-[#58a6ff]" /><div className="flex-1 bg-[#8b5cf6]" /><div className="flex-1 bg-[#fbbf24]" /><div className="flex-1 bg-[#ef4444]" />
        </div>
        <div className="flex justify-between text-[0.65rem] text-[#8b949e]"><span>AI 자동</span><span>거울 (관찰)</span><span>보조 (사람 결정)</span><span>사람만</span></div>
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
    { name: '웹사이트', color: '#9b59b6', owner: 'JeHyeong', kpi: '일 50 PV, 월 UV 1,000', content: 'Daily Research, 칼럼 KO/EN', freq: '매일' },
    { name: 'Discord', color: '#27ae60', owner: 'BH', kpi: '주간 메시지 50+, 활성멤버 15+', content: '리서치 요약, 칼럼 공지, 토론', freq: '매일' },
    { name: 'YouTube', color: '#e74c3c', owner: 'JY + TJ', kpi: '구독자 100, 영상 12편', content: '바이브코딩 + Shorts', freq: '주 1+3회' },
    { name: 'LinkedIn', color: '#f1c40f', owner: 'Ryan', kpi: '인게이지먼트>3%, 팔로워 200', content: '칼럼 전문가 톤', freq: '주 2회' },
    { name: 'Reddit', color: '#9b59b6', owner: 'JeHyeong', kpi: '주 1-2 포스트', content: '칼럼 커뮤니티 앵글', freq: '주 1-2회' },
    { name: '오프라인', color: '#e8734a', owner: 'Kiwon', kpi: '이벤트 월 3-4회, NPS>40', content: '워크숍, 밋업', freq: '월 1-2회' },
    { name: 'SANS 네트워크', color: '#f1c40f', owner: 'Ryan', kpi: '활성 컨택 10', content: '관련 콘텐츠 공유', freq: '상시' },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">배포 채널 맵</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
        {channels.map(ch => (
          <div key={ch.name} className="bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2.5" style={{ borderTopColor: ch.color, borderTopWidth: '3px' }}>
            <h4 className="text-[0.82rem] font-semibold mb-1">{ch.name}</h4>
            <div className="text-[0.7rem] leading-relaxed text-[#c9d1d9]">
              <strong className="text-[#58a6ff]">담당:</strong> <span style={{ color: ch.color }}>{ch.owner}</span><br />
              <strong className="text-[#58a6ff]">KPI:</strong> {ch.kpi}<br />
              <strong className="text-[#58a6ff]">콘텐츠:</strong> {ch.content}<br />
              <strong className="text-[#58a6ff]">빈도:</strong> {ch.freq}
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
    { title: '1. 멤버 실행', desc: '칼럼 작성, 영상 제작, 이벤트 운영, LinkedIn, Discord', color: '#58a6ff', bg: 'rgba(88,166,255,0.08)', border: 'rgba(88,166,255,0.25)' },
    { title: '2. 성과 수집 (Ryan)', desc: 'Page views, YouTube analytics, Discord activity, LinkedIn impressions, Event NPS', color: '#f1c40f', bg: 'rgba(241,196,15,0.08)', border: 'rgba(241,196,15,0.25)' },
    { title: '3. Mother 분석', desc: '콘텐츠 성과 랭킹, 토픽 히트맵, 멤버 활동 패턴, 채널 ROI 비교', color: '#58a6ff', bg: 'rgba(88,166,255,0.08)', border: 'rgba(88,166,255,0.25)' },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">피드백 루프</h2>
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
            {['패턴 감지: 멤버 산출물에서 반복 키워드/논조 변화 발견', '교차 참조: 멤버 간 상반된 관점 연결', '성장 궤적: 지난달 vs 이번달 키워드 변화 추적', '철학 연결: 인문학/심리학 개념과 패턴 연결 제안'].map(f => (
              <div key={f} className="text-[0.68rem] px-1.5 py-1 bg-[rgba(139,92,246,0.15)] rounded-md text-[#c4b5fd]">{f}</div>
            ))}
          </div>
        </div>
        <div className="text-[#30363d] text-xl text-center py-0.5">&#9660;</div>
        <div className="w-full rounded-xl p-3" style={{ background: 'rgba(31,111,235,0.08)', border: '1px solid rgba(31,111,235,0.25)' }}>
          <h4 className="text-[0.82rem] font-semibold mb-0.5 text-[#1f6feb]">5. 주간 리뷰 (Jay)</h4>
          <p className="text-[0.72rem] text-[#c9d1d9] leading-snug">매주 일 21:00. 콘텐츠 뿹스 조정, 채널 노력 재배분</p>
        </div>
        <div className="text-[#30363d] text-xl text-center py-0.5">&#9660;</div>
        <div className="w-full rounded-xl p-3" style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)' }}>
          <h4 className="text-[0.82rem] font-semibold mb-0.5 text-[#27ae60]">6. 다음 사이클</h4>
          <p className="text-[0.72rem] text-[#c9d1d9] leading-snug">조정된 계획으로 멤버가 다시 실행. 피드백 루프 반복.</p>
        </div>
      </div>
    </div>
  );
}

// ── Tab 8: Academy ──
function TabAcademy({ onDetail }: { onDetail: (t: string, d: string, o: string) => void }) {
  const preItems = [
    { title: 'T-14 커리큐럼 리뷰', sub: 'Jay + Ryan', color: '#1f6feb' },
    { title: 'T-10 마케팅 론칭', sub: 'Kiwon + Ryan', color: '#e8734a' },
    { title: 'T-5 교재 준비', sub: 'Jay + Mother', color: '#1f6feb' },
    { title: 'T-2 기술 리허설', sub: 'Jay + JY', color: '#e74c3c' },
  ];
  const ddayItems = [
    { title: '13:00 Part1 관점전환', sub: 'Jay', color: '#1f6feb' },
    { title: '13:40 Part2 협업 PRD', sub: 'Jay + 조교', color: '#1f6feb' },
    { title: '14:30 Part3 AI 지휘', sub: 'Jay + JY + BH', color: '#e74c3c' },
    { title: '16:00 Part4 발표+시상', sub: 'Jay MC + TJ 촬영', color: '#8b4513' },
  ];
  const journey = ['발견', '등록', '사전 안내', '수업', 'NPS', '커뮤니티 초대', '온보딩', '활동', '기여자'];
  const journeyColors = ['#8b949e', '#e8734a', '#e8734a', '#1f6feb', '#f1c40f', '#e8734a', '#27ae60', '#27ae60', '#8b5cf6'];

  return (
    <div>
      <SectionBox className="bg-[rgba(88,166,255,0.06)] border border-[rgba(88,166,255,0.2)]">
        <h3 className="text-[0.85rem] font-semibold mb-2">사전 준비 (T-14 ~ T-1)</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
          {preItems.map(item => <Card key={item.title} title={item.title} sub={item.sub} barColor={item.color} onClick={onDetail} />)}
        </div>
      </SectionBox>
      <div className="text-center text-[#30363d] text-xl tracking-wider my-0.5">&#9660; D-Day &#9660;</div>
      <SectionBox className="bg-[rgba(232,115,74,0.08)] border border-[rgba(232,115,74,0.3)]">
        <h3 className="text-[0.85rem] font-semibold mb-2">D-Day 실행</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
          {ddayItems.map(item => <Card key={item.title} title={item.title} sub={item.sub} barColor={item.color} onClick={onDetail} />)}
        </div>
      </SectionBox>
      <SectionBox className="bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.2)] mt-3">
        <h3 className="text-[0.85rem] font-semibold mb-2">수강생 여정</h3>
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
      <h2 className="text-[0.95rem] font-semibold mb-3">수익 모델</h2>
      <h3 className="text-[0.82rem] font-semibold mb-2 text-[#58a6ff]">수익화 순서</h3>
      <div className="flex gap-0 items-stretch overflow-x-auto pb-2 mb-3">
        {[
          { t: '\u2460 유료 강의/워크숍', s: '15-30만원', c: '#58a6ff', bg: 'rgba(88,166,255,0.1)', b: 'rgba(88,166,255,0.3)' },
          { t: '\u2461 세미나/오프라인', s: '브랜드 확장', c: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', b: 'rgba(139,92,246,0.3)' },
          { t: '\u2462 기업 교육/컨설팅', s: 'B2B 매출', c: '#f1c40f', bg: 'rgba(241,196,15,0.1)', b: 'rgba(241,196,15,0.3)' },
          { t: '\u2463 월 구독 멤버십', s: '5-10만원', c: '#27ae60', bg: 'rgba(39,174,96,0.1)', b: 'rgba(39,174,96,0.3)' },
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
      <h3 className="text-[0.82rem] font-semibold mb-2 text-[#58a6ff]">MOU 수익 시나리오 (Year 1)</h3>
      <div className="overflow-x-auto mb-3">
        <table className="w-full border-collapse text-[0.78rem]">
          <thead><tr>{['시나리오', 'Year 1 매출', '동아일보 (10%)', '운영 법인 (90%)'].map(h => (
            <th key={h} className="bg-[#161b22] border border-[#30363d] px-2 py-1.5 text-left font-semibold text-[#58a6ff]">{h}</th>
          ))}</tr></thead>
          <tbody>
            <tr><td className="border border-[#30363d] px-2 py-1.5 text-[#27ae60] font-semibold">보수적</td><td className="border border-[#30363d] px-2 py-1.5">8,000만 원</td><td className="border border-[#30363d] px-2 py-1.5">800만 원</td><td className="border border-[#30363d] px-2 py-1.5">7,200만 원</td></tr>
            <tr><td className="border border-[#30363d] px-2 py-1.5 text-[#f1c40f] font-semibold">목표</td><td className="border border-[#30363d] px-2 py-1.5">1억 3,400만 원</td><td className="border border-[#30363d] px-2 py-1.5">1,340만 원</td><td className="border border-[#30363d] px-2 py-1.5">1억 2,060만 원</td></tr>
            <tr><td className="border border-[#30363d] px-2 py-1.5 text-[#e74c3c] font-semibold">낙관적</td><td className="border border-[#30363d] px-2 py-1.5">1억 7,000만 원</td><td className="border border-[#30363d] px-2 py-1.5">1,700만 원</td><td className="border border-[#30363d] px-2 py-1.5">1억 5,300만 원</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 10: Risk ──
function TabRisk() {
  const risks = [
    { level: 'HIGH', lc: '#ef4444', title: '멤버 전환 실패', desc: '모든 멤버는 본업이 있다. 금전적 인센티브도 약하다.', resp: '전원 참여를 기대하지 않는다. 2-3명 코어 + AI 자동화가 현실적 구조.', bg: 'rgba(239,68,68,0.08)', b: 'rgba(239,68,68,0.3)' },
    { level: 'HIGH', lc: '#e8734a', title: 'Jay 의존도', desc: '파이프라인, 콘텐츠, 교육, 인프라 전부 Jay 1인에 의존.', resp: '중기에 반드시 "Jay 없이 돌아가는" 영역을 1개 이상 만든다.', bg: 'rgba(232,115,74,0.08)', b: 'rgba(232,115,74,0.3)' },
    { level: 'MED', lc: '#f1c40f', title: '파일럿 미실행', desc: '29개 액션아이템이 미착수 상태였다.', resp: '사업계획서 제출 완료. 4월 중순 임직원 교육이 첫 실행.', bg: 'rgba(241,196,15,0.08)', b: 'rgba(241,196,15,0.25)' },
    { level: 'LOW', lc: '#58a6ff', title: '관점 분산', desc: '8명의 멤버가 각자 다른 방향을 제시.', resp: 'Jay가 Initiative Provider로서 방향 확정. 교육이 본질.', bg: 'rgba(88,166,255,0.08)', b: 'rgba(88,166,255,0.25)' },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">리스크 맵</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {risks.map(r => (
          <div key={r.title} className="rounded-xl p-3" style={{ background: r.bg, border: `1px solid ${r.b}` }}>
            <h4 className="text-[0.82rem] font-semibold mb-1 flex items-center gap-1.5">
              <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(0,0,0,0.3)', color: r.lc }}>{r.level}</span>{r.title}
            </h4>
            <div className="text-[0.72rem] text-[#c9d1d9] mb-1.5 leading-snug">{r.desc}</div>
            <div className="text-[0.72rem] p-1.5 bg-[rgba(0,0,0,0.3)] rounded-md" style={{ borderLeft: `3px solid ${r.lc}` }}>
              <strong className="text-[#e6edf3]">대응 전략:</strong><br />{r.resp}
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
    { tag: 'CURRENT', tc: '#ef4444', title: 'Phase 1: 폐쇄', sub: '코어 멤버 8명', desc: '현재 단계. 밀도와 브랜드 구축.', bg: 'rgba(239,68,68,0.08)', b: 'rgba(239,68,68,0.3)', hl: true },
    { tag: 'PLANNED', tc: '#e8734a', title: 'Phase 2: 시드 30명', sub: '1:1 DM 초대', desc: '시드 멤버 30명의 퀸리티가 이후 300명을 결정.', bg: 'rgba(232,115,74,0.08)', b: 'rgba(232,115,74,0.3)', hl: false },
    { tag: 'PLANNED', tc: '#f1c40f', title: 'Phase 3: 점진적 개방', sub: '칼럼 제출 진입장벡', desc: '강의 수강 후 실무적용 후 고민공유 순환 루프.', bg: 'rgba(241,196,15,0.08)', b: 'rgba(241,196,15,0.25)', hl: false },
    { tag: 'PLANNED', tc: '#27ae60', title: 'Phase 4: 길드', sub: '탈중앙 플랫폼', desc: '멤버들이 각자 프로젝트 운영. HypeProof Lab은 플랫폼이 된다.', bg: 'rgba(39,174,96,0.08)', b: 'rgba(39,174,96,0.25)', hl: false },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">커뮤니티: Closed-First 모델</h2>
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
      <h3 className="text-[0.85rem] font-semibold mb-2">온보딩 여정</h3>
      <div className="flex gap-0 items-stretch overflow-x-auto pb-1">
        {['발견', '관심', '참여', '기여', '코어'].map((step, i) => (
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
    { n: 1, name: '로드맵', note: '단기/중기/장기 + 투 트랙 + 결정사항' },
    { n: 2, name: '전체 워크플로우', note: '4계층 구조 + 화살표 + 클릭 상세' },
    { n: 3, name: '콘텐츠 파이프라인', note: '4단계 수평 파이프라인' },
    { n: 4, name: '멤버 역할', note: '동적 렌더링 from members.json' },
    { n: 5, name: 'Mother AI', note: '4링 구조' },
    { n: 6, name: '배포 채널', note: '7채널 카드 + KPI' },
    { n: 7, name: '피드백 루프', note: '6단계 수직 플로우 + Mirror Loop' },
    { n: 8, name: '교육 Academy', note: '사전준비+D-Day+수강생여정' },
    { n: 9, name: '수익 모델', note: '수익화 순서 + MOU 3시나리오' },
    { n: 10, name: '리스크 맵', note: '4대 리스크 + 대응 전략' },
    { n: 11, name: '커뮤니티', note: 'Closed-First 4단계 + 온보딩' },
    { n: 12, name: 'QA 리포트', note: '전체 탭 상태 테이블' },
  ];
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold mb-3">QA 리포트 &mdash; Dashboard v4 (Next.js Dynamic)</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[0.78rem]">
          <thead><tr>{['#', '탭 이름', '구현 상태', '비고'].map(h => (
            <th key={h} className="bg-[#161b22] border border-[#30363d] px-2 py-1.5 text-left font-semibold text-[#58a6ff]">{h}</th>
          ))}</tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.n} className="hover:bg-[rgba(88,166,255,0.04)]">
                <td className="border border-[#30363d] px-2 py-1.5">{r.n}</td>
                <td className="border border-[#30363d] px-2 py-1.5">{r.name}</td>
                <td className="border border-[#30363d] px-2 py-1.5 text-[#27ae60] font-semibold">완료</td>
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
  timeline: TimelineData;
  holidays: Holiday[];
  notes: Note[];
  sheetsReady: boolean;
}

export default function DashboardClient({ members, updatedAt, timeline, holidays, notes, sheetsReady }: DashboardClientProps) {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('cal');
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
        <p className="text-[#8b949e]">로그인이 필요합니다.</p>
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
            <div className="bg-[#161b22] border border-[#30363d] rounded-md px-2 py-0.5 text-[0.72rem]">멤버 <strong className="text-[#58a6ff]">{activeMembers.length}</strong>명</div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-md px-2 py-0.5 text-[0.72rem]">에이전트 <strong className="text-[#58a6ff]">8</strong>개</div>
            {updatedAt && <div className="bg-[#161b22] border border-[#30363d] rounded-md px-2 py-0.5 text-[0.72rem]">갱신 <strong className="text-[#58a6ff]">{updatedAt}</strong></div>}
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
          {activeTab === 'cal' && <CalendarTab data={timeline} holidays={holidays} notes={notes} members={activeMembers} sheetsReady={sheetsReady} />}
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
        {activeTab !== 'cal' && (
          <div className="w-[340px] shrink-0 sticky top-14 hidden lg:block">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
              <DetailPanel title={detail.title} desc={detail.desc} owner={detail.owner} />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ── Tab 3: Content Pipeline (inline to avoid file size issue) ──
function TabContentPipeline({ onDetail }: { onDetail: (t: string, d: string, o: string) => void }) {
  const stages = [
    { title: 'Stage 1: 소스', bg: 'bg-[rgba(88,166,255,0.06)] border-[rgba(88,166,255,0.2)]',
      items: [
        { title: '일일 리서치', sub: 'Mother', color: '#58a6ff' },
        { title: '멤버 칼럼', sub: '멤버 + Mother', color: '#8b949e' },
        { title: 'YouTube', sub: 'JY + TJ', color: '#e74c3c' },
        { title: '팟캐스트', sub: 'TJ', color: '#8b4513' },
        { title: '이벤트 요약', sub: 'Kiwon', color: '#e8734a' },
      ] },
    { title: 'Stage 2: 제작', bg: 'bg-[rgba(139,92,246,0.06)] border-[rgba(139,92,246,0.2)]',
      items: [
        { title: 'Mother 초안 작성', sub: 'Mother', color: '#58a6ff' },
        { title: '멤버 검토/수정', sub: '해당 멤버', color: '#8b949e' },
        { title: 'QA 검증', sub: 'Mother', color: '#58a6ff' },
        { title: '빌드 + 배포', sub: 'Mother', color: '#58a6ff' },
      ] },
    { title: 'Stage 3: 배포', bg: 'bg-[rgba(251,191,36,0.06)] border-[rgba(251,191,36,0.2)]',
      items: [
        { title: '웹사이트', sub: 'JeHyeong', color: '#9b59b6' },
        { title: 'Discord', sub: 'BH', color: '#27ae60' },
        { title: 'YouTube', sub: 'JY', color: '#e74c3c' },
        { title: 'LinkedIn', sub: 'Ryan', color: '#f1c40f' },
      ] },
    { title: 'Stage 4: 피드백', bg: 'bg-[rgba(39,174,96,0.06)] border-[rgba(39,174,96,0.2)]',
      items: [
        { title: '조회수 수집', sub: 'Mother', color: '#58a6ff' },
        { title: 'KPI 분석', sub: 'Ryan', color: '#f1c40f' },
        { title: 'Mirror Loop', sub: 'Mother', color: '#58a6ff' },
        { title: '주간 리뷰', sub: 'Jay', color: '#1f6feb' },
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
        <strong className="text-[#58a6ff]">타이밍:</strong> 리서치 매일 06:00 &rarr; 웹 발행 즉시 &rarr; Discord 1시간 내 &rarr; 주간 리뷰 일 21:00
      </div>
    </div>
  );
}
