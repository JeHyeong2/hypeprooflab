import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { LangSwitch } from "../kids-edu/_components/LangSwitch";
import { IdentityFooter } from "./_components/IdentityFooter";
// kids-edu.css 재활용: Apple 라이트 테마 + reveal 애니메이션 전부 포함.
// accent 퍼플은 루트 div inline style로 재정의.
import "../kids-edu/kids-edu.css";

export const metadata: Metadata = {
  title: "HypeProof Lab — AI 크리에이터가 모이는 곳",
  description:
    "AI 빌더·리서처·크리에이터가 모이는 곳. 기술이 아니라 창작에 집중합니다.",
  openGraph: {
    title: "HypeProof Lab — Where AI creators gather",
    description:
      "Where AI builders, researchers, and creators gather — focused on creation, not the tech itself.",
    type: "website",
  },
};

// HypeProof Lab 브랜드 퍼플로 accent 재정의 (kids-edu의 Apple blue 대신).
const identityThemeVars: CSSProperties = {
  ["--kf-accent" as string]: "#a855f7",
  ["--kf-accent-hover" as string]: "#9333ea",
};

export default function IdentityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="kids-edu-root" style={identityThemeVars}>
      <LangSwitch />
      {children}
      <IdentityFooter />
    </div>
  );
}
