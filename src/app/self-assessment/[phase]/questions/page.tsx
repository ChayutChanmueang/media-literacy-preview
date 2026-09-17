"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { notoLoopedThai } from "@/lib/fonts";
import { useDevSkip } from "@/lib/devSkip";
import type { SelfAssessmentPhase } from "@/lib/selfAssessmentPhase";
import Button3D from "@/components/Button3D";
import ITEMS from "@/data/self-assessment-items.json";

const PER_PAGE = 2;
const PAGE_COUNT = Math.ceil(ITEMS.length / PER_PAGE);

// Figma: Component 42 colors; selected state intentionally uses a thick ring + check badge instead of Figma's solid fill
const SCALE = [
  { value: 1, label: ["ไม่เห็นด้วย", "อย่างยิ่ง"], stroke: "#FF4B4B", fill: "#FBE3DE" },
  { value: 2, label: ["ไม่เห็นด้วย"], stroke: "#E08A3C", fill: "#FBEBD9" },
  { value: 3, label: ["ไม่แน่ใจ"], stroke: "#D9B23C", fill: "#FBF3D9" },
  { value: 4, label: ["เห็นด้วย"], stroke: "#2FB84E", fill: "#E9F2E5" },
  { value: 5, label: ["เห็นด้วย", "อย่างยิ่ง"], stroke: "#1E7A46", fill: "#E9F2E5" },
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pageIndex, setPageIndex] = useState(0);
  // Order is random per visit; render it only on the client so SSR and hydration never disagree.
  const [statements] = useState(() => shuffle(ITEMS));
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    loggingService.logEvent("self_assessment_page_view", { phase });
  }, [phase]);

  const firstIndex = pageIndex * PER_PAGE;
  const pageStatements = statements.slice(firstIndex, firstIndex + PER_PAGE);
  const pageAnswered = isClient && pageStatements.every((s) => answers[s.id]);

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

  const handleNext = () => {
    loggingService.logEvent("self_assessment_page_completed", {
      phase,
      page: pageIndex + 1,
      statement_ids: pageStatements.map((s) => s.id),
    });

    if (pageIndex < PAGE_COUNT - 1) {
      setPageIndex(pageIndex + 1);
      scrollRef.current?.scrollTo({ top: 0 });
      return;
    }
    finish(answers);
  };

  useDevSkip(() => {
    const filled = { ...answers };
    for (const s of statements) filled[s.id] ??= Math.ceil(Math.random() * 5);
    loggingService.logEvent("self_assessment_dev_skip", { phase });
    finish(filled);
  });

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-[#E8EAF3] text-black`}>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[20px] px-[24px] pb-[4px] pt-[28px]">
          {isClient &&
            pageStatements.map((statement) => {
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

                  <div className="flex min-h-[80px] w-full items-start justify-between">
                    {SCALE.map((opt) => {
                      const isSelected = selected === opt.value;
                      return (
                        <div key={opt.value} className="flex w-[55px] min-w-0 shrink flex-col items-center gap-[8px]">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`${opt.value} ${opt.label.join("")}`}
                            onClick={() => handleSelect(statement.id, opt.value)}
                            className="flex min-h-[48px] w-full cursor-pointer items-center justify-center py-[4px]"
                          >
                            <span
                              className={`relative flex size-[clamp(44px,12vw,52px)] items-center justify-center rounded-full border-solid text-[22px] font-bold transition-transform ${
                                isSelected ? "scale-110 border-4" : "border-2"
                              }`}
                              style={{ backgroundColor: opt.fill, borderColor: opt.stroke, color: "#1f2937" }}
                            >
                              {opt.value}
                              {isSelected && (
                                <span
                                  className="absolute -right-[12px] -top-[12px] flex size-[24px] items-center justify-center rounded-full border-2 bg-white"
                                  style={{ borderColor: opt.stroke }}
                                  aria-hidden="true"
                                >
                                  <Check size={12} strokeWidth={4} className="text-[#0f172a]" />
                                </span>
                              )}
                            </span>
                          </button>
                          <p className="w-full text-center text-[12px] font-semibold leading-[16px]" aria-hidden="true">
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

      <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
        <Button3D onClick={handleNext} disabled={!pageAnswered}>
          ต่อไป
        </Button3D>
      </div>
    </div>
  );
}
