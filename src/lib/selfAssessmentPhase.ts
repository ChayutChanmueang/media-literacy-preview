export const SELF_ASSESSMENT_PHASES = {
  pre: { title: "แบบทดสอบก่อนเรียน" },
  post: { title: "แบบทดสอบหลังเรียน" },
} as const;

export type SelfAssessmentPhase = keyof typeof SELF_ASSESSMENT_PHASES;
