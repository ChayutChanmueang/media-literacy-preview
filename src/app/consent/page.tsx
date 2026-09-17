"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { notoLoopedThai } from "@/lib/fonts";
import { useDevSkip } from "@/lib/devSkip";
import { AGE_OPTIONS, type AgeGroup } from "@/lib/ageOptions";
import Button3D from "@/components/Button3D";

const subscribeNoop = () => () => {};

// Figma node 2065:7239 "ข้อมูลผู้ใช้ - age" — step 1 of registration; step 2 is /consent/location
export default function ConsentAgePage() {
  const router = useRouter();
  // Prefilled from the session so coming back from step 2 keeps the choice; rendered client-side only
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(
    () => (progressService.getOrCreateSession()?.ageGroup as AgeGroup) ?? null
  );
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    loggingService.logEvent("consent_page_view", { step: "age" });
  }, []);

  const goToLocation = (value: AgeGroup) => {
    const session = progressService.getOrCreateSession();
    // consentGiven stays false until step 2, so nothing syncs to the backend yet
    progressService.saveSession({ ...session, ageGroup: value });
    loggingService.logEvent("consent_age_selected", { age_range: value });
    router.push("/consent/location");
  };

  useDevSkip(() => goToLocation(ageGroup ?? "60-69"));

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center gap-[32px] px-[24px] py-[28px]">
          <div className="flex flex-col items-center gap-[8px] text-center">
            <p className="text-[24px] font-semibold leading-[32px]">ข้อมูลผู้ใช้</p>
            <p className="text-[28px] font-bold leading-[36px]">โปรดเลือกช่วงอายุท่าน</p>
          </div>

          <div role="radiogroup" aria-label="ช่วงอายุของท่าน" className="flex w-full flex-col items-center gap-[16px]">
            {isClient &&
              AGE_OPTIONS.map((opt) => {
                const selected = ageGroup === opt.value;
                return (
                  <div key={opt.value} className="h-[64px] w-full overflow-clip rounded-[20px] bg-[#D9D9D9]">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setAgeGroup(opt.value)}
                      className={`flex h-[62px] w-full cursor-pointer items-center justify-center rounded-[20px] border-2 border-solid bg-white text-[20px] font-semibold leading-[30px] active:translate-y-[2px] ${
                        selected ? "border-[#00A3E0] text-[#0078A8]" : "border-[#D9D9D9] text-[#A5A5A5]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
        <Button3D onClick={() => ageGroup && goToLocation(ageGroup)} disabled={!ageGroup}>
          กดเพื่อไปต่อ
        </Button3D>
      </div>
    </div>
  );
}
