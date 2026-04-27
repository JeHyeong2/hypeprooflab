import type { Metadata } from "next";
import { EventContent } from "./EventContent";

export const metadata: Metadata = {
  title: "2026 어린이날 · 나만의 마법 게임 만들기",
  description:
    "2026년 5월 5일, 국립암센터 소아암 병동 친구들과 함께 AI를 지휘해 '내 게임'을 완성하는 Future AI Leader's Academy 특별 세션 랜딩.",
  openGraph: {
    title: "나만의 마법 게임 만들기 — 지휘관의 탄생",
    description:
      "2026 어린이날 특별 세션. AI를 지휘해 두 시간 만에 내 게임을 완성합니다.",
    type: "website",
  },
};

export default function ChildrensDay2026Page() {
  return <EventContent />;
}
