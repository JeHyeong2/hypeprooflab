import type { Metadata } from "next";
import { ProjectsContent } from "./ProjectsContent";

export const metadata: Metadata = {
  title: "Projects — Future AI Leader's Academy",
  description:
    "Future AI Leader's Academy 참가 팀들이 만든 프로젝트 아카이브.",
};

export default function KidsEduProjectsPage() {
  return <ProjectsContent />;
}
