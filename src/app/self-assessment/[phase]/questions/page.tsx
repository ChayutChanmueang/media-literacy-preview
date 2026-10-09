"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { notoLoopedThai } from "@/lib/fonts";
import { useDevSkip } from "@/lib/devSkip";
import type { SelfAssessmentPhase } from "@/lib/selfAssessmentPhase";
import Button3D from "@/components/Button3D";
import ITEMS from "@/data/self-assessment-items.json";

// Figma: Component 72 / Component 66 (2454:8936). Unselected = pastel face on a color edge;
// selected = solid color face on a darker edge; pressed = face drops 4px over the edge.
const SCALE = [
  { value: 1, label: ["ไม่เห็นด้วย", "อย่างยิ่ง"], color: "#C81F2A", pale: "#FBE3DE", dark: "#7D141B" },
  { value: 2, label: ["ไม่เห็นด้วย"], color: "#F4912E", pale: "#FBEBD9", dark: "#86521D" },
  { value: 3, label: ["ไม่แน่ใจ"], color: "#F4C741", pale: "#FBF3D9", dark: "#866D22" },
  { value: 4, label: ["เห็นด้วย"], color: "#B5D930", pale: "#E9F2E5", dark: "#71871F" },
  { value: 5, label: ["เห็นด้วย", "อย่างยิ่ง"], color: "#84CE2F", pale: "#DCEEE3", dark: "#54841D" },
];

const shuffle = <T,>(list: T[]): T[] => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const subscribeNoop = () => () => {};

// Spacing is in px, not Tailwind rem steps: the app's root font-size is 20px, which would inflate rem spacing vs Figma.
export default function SelfAssessmentQuestionsPage() {
  const router = useRouter();
  const { phase } = useParams<{ phase: SelfAssessmentPhase }>();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  // Order is random per visit; render it only on the client so SSR and hydration never disagree.
  const [statements] = useState(() => shuffle(ITEMS));
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    loggingService.logEvent("self_assessment_page_view", { phase });
  }, [phase]);

  // All statements are shown on one scrolling page; submit unlocks once every one is answered.
  const allAnswered = isClient && statements.every((s) => answers[s.id]);

  const handleSelect = (statementId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [statementId]: value }));
    loggingService.logEvent("self_assessment_answer", { phase, statement_id: statementId, value });
  };

  const finish = (finalAnswers: Record<string, number>) => {
    const progress = progressService.getProgress();
    progressService.saveProgress({
      ...progress,
      selfAssessment: { ...progress.selfAssessment, [phase]: finalAnswers },
    });
    loggingService.logEvent("self_assessment_submitted", {
      phase,
      answers: finalAnswers,
      order: statements.map((s) => s.id),
    });
    router.push(`/self-assessment/${phase}/complete`);
  };

  useDevSkip(() => {
    const filled = { ...answers };
    for (const s of statements) filled[s.id] ??= Math.ceil(Math.random() * 5);
    loggingService.logEvent("self_assessment_dev_skip", { phase });
    finish(filled);
  });

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-[#E8EAF3] text-black`}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[20px] px-[24px] pb-[4px] pt-[28px]">
          {isClient &&
            statements.map((statement) => {
              const selected = answers[statement.id];
              return (
                <div
                  key={statement.id}
                  role="radiogroup"
                  aria-labelledby={`${statement.id}-text`}
                  className="flex w-full flex-col items-center gap-[12px] overflow-clip rounded-[12px] border-2 border-solid border-[#D9D9D9] bg-white p-[20px] shadow-[0px_2px_0px_0px_#D9D9D9]"
                >
                  <p
                    id={`${statement.id}-text`}
                    className="w-full text-center text-[20px] font-normal leading-[30px] [word-break:break-word]"
                  >
                    {statement.text}
                  </p>

                  {/* Figma packs the five buttons edge to edge (5 × 60 = 300px); columns share the width so no gaps appear.
                      Text scales with the row (cqw) in Figma's ratio — 20px number / 12px label at 300px — never below those sizes. */}
                  <div className="@container flex min-h-[80px] w-full items-start">
                    {SCALE.map((opt) => {
                      const isSelected = selected === opt.value;
                      return (
                        <div key={opt.value} className="flex min-w-0 flex-1 basis-0 flex-col items-center gap-[8px]">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`${opt.value} ${opt.label.join("")}`}
                            onClick={() => handleSelect(statement.id, opt.value)}
                            className="group relative w-full cursor-pointer pb-[4px]"
                          >
                            <span
                              className="absolute inset-x-0 bottom-0 top-[4px] rounded-[8px]"
                              style={{ backgroundColor: isSelected ? opt.dark : opt.color }}
                              aria-hidden="true"
                            />
                            <span
                              className="relative flex aspect-square w-full items-center justify-center rounded-[8px] border-2 border-solid border-white text-[max(20px,6.667cqw)] font-semibold leading-[1.5] text-black group-active:translate-y-[4px] group-active:border-transparent"
                              style={{ backgroundColor: isSelected ? opt.color : opt.pale }}
                            >
                              {opt.value}
                            </span>
                          </button>
                          <p className="w-full text-center text-[max(12px,4cqw)] font-semibold leading-[1.333]" aria-hidden="true">
                            {opt.label.map((line) => (
                              <span key={line} className="block">
                                {line}
                              </span>
                            ))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="shrink-0 px-[24px] pb-action-bar pt-[24px]">
        <Button3D onClick={() => finish(answers)} disabled={!allAnswered}>
          ต่อไป
        </Button3D>
      </div>
    </div>
  );
}
