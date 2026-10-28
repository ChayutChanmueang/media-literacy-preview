import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { selfAssessmentService } from "@/services/selfAssessmentService";
import type { SelfAssessmentPhase } from "@/lib/selfAssessmentPhase";
import { useIsClient } from "@/lib/useIsClient";

/** Where a research participant goes instead of redoing a phase they already submitted. */
export const selfAssessmentDoneTarget = (phase: SelfAssessmentPhase) => (phase === "pre" ? "/lessons" : "/lessons/complete");

/**
 * Research mode: pre and post can each be done once per session (docs/software/10-research-pre-post-backend.md 9.3).
 * Redirects away when `phase` is already done and returns true while the page must not render its content
 * (also during SSR/hydration, so the questions never flash). `paused` stops the check, e.g. right after
 * this page submitted, when hasCompleted() turns true but the page is already navigating on.
 */
export function useSelfAssessmentDoneGuard(phase: SelfAssessmentPhase, paused = false): boolean {
  const router = useRouter();
  const isClient = useIsClient();
  const done =
    isClient && !paused && progressService.getAppMode() === "research" && selfAssessmentService.hasCompleted(phase);

  useEffect(() => {
    if (!done) return;
    loggingService.logEvent("self_assessment_already_done", { phase });
    router.replace(selfAssessmentDoneTarget(phase));
  }, [done, phase, router]);

  return !isClient || done;
}
