import type { Metadata } from "next";
import { LayoutFooter } from "./_components/LayoutFooter";
import { LangSwitch } from "./_components/LangSwitch";
import "./kids-edu.css";

export const metadata: Metadata = {
  title: "Future AI Leader's Academy — 청소년 AI 교육",
  description:
    '코딩은 AI가 합니다. 아이는 "무엇을 할지" 결정만 하면 됩니다. 부모-자녀 Co-Founding으로 배우는 AI 설계자 교육.',
  openGraph: {
    title: "Future AI Leader's Academy — 청소년 AI 교육",
    description:
      "코딩 기술자가 아닌, AI 시대를 지휘할 설계자(Architect)를 키우는 부모-자녀 Co-Founding 프로그램.",
    type: "website",
  },
};

export default function KidsEduLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="kids-edu-root">
      <LangSwitch />
      {children}
      <LayoutFooter />
    </div>
  );
}
