import type { ReactNode } from "react";
import { SELF_ASSESSMENT_PHASES } from "@/lib/selfAssessmentPhase";

// Only /self-assessment/pre and /self-assessment/post exist; any other phase 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SELF_ASSESSMENT_PHASES).map((phase) => ({ phase }));
}

export default function SelfAssessmentPhaseLayout({ children }: { children: ReactNode }) {
  return children;
}
