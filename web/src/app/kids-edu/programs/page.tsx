import type { Metadata } from "next";
import { ProgramsHubContent } from "./ProgramsHubContent";

export const metadata: Metadata = {
  title: "교육 프로그램 — Future AI Leader's Academy",
  description:
    "Future AI Leader's Academy가 지금 진행 중인 교육 프로그램을 소개합니다.",
};

export default function ProgramsHubPage() {
  return <ProgramsHubContent />;
}
