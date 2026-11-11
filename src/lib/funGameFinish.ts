import { leaderboardScoreService } from "@/services/leaderboardScoreService";
import { progressService } from "@/services/progressService";

/**
 * "กดเพื่อเสร็จสิ้น" on a fun game's leaderboard (page or G13's LeaderboardPopup): drop anything still
 * pending, then free mode → back to the game list, Flow → the course-complete page. Returns the path to go to.
 */
export function finishFunGame(gid: string | undefined): string {
  // nothing should be left pending once the player leaves (the popup's "ไม่" already dropped it)
  if (gid) leaderboardScoreService.clearPendingScore(gid);
  const progress = progressService.getProgress();
  // โหมดอิสระ: เกมสนุกเป็นหมวดเดี่ยว ไม่ใช่ปลายทาง Flow จึงกลับหน้าหมวดหมู่แทนหน้าจบคอร์ส
  if (progress?.learningMode === "manual") {
    progressService.saveProgress({ ...progress, currentStep: "lessons", currentLessonId: undefined });
    return "/lessons";
  }
  progressService.saveProgress({ ...progress, currentStep: "complete", currentLessonId: undefined });
  return "/lessons/complete";
}
