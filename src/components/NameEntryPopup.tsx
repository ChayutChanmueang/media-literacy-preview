"use client";

import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { leaderboardNameSchema, type LeaderboardNameInput } from "@/lib/validations";
import { leaderboardPlayerService } from "@/services/leaderboardPlayerService";
import Button3D from "./Button3D";
import GamePopupShell from "./GamePopupShell";

/**
 * Name entry ("กรอกชื่อเพื่อเก็บคะแนน") as a popup over the game instead of the leaderboard page's
 * ?step=save screen — same content as that screen (avatar, title, name field, "ยืนยัน"; Figma 3347:15533)
 * in the result popup's card (GamePopupShell). Used by every fun game (G13, G18–G20K).
 *
 * "ยืนยัน" keeps the stored profile when the name is unchanged (a new name = a new player), as the page
 * does, then calls onSaved — the leaderboard page saves the pending score for that profile when it loads.
 */
interface NameEntryPopupProps {
  /** the profile is stored (new or reused) — go on to the leaderboard */
  onSaved: (reusedProfile: boolean) => void;
  /** false while the leaderboard popup is open on top — only the topmost popup dims */
  dim?: boolean;
}

export default function NameEntryPopup({ onSaved, dim = true }: NameEntryPopupProps) {
  const titleId = useId();
  const inputId = useId();
  const errorId = `${inputId}-error`;
  // read once on mount: a returning player starts with their name filled in (they can still change it)
  const [storedPlayer] = useState(() => leaderboardPlayerService.getProfile());
  // empty name on "ยืนยัน": the field shakes (gp1-shake) as on the page
  const [shaking, setShaking] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    setFocus,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LeaderboardNameInput>({
    resolver: zodResolver(leaderboardNameSchema),
    defaultValues: { name: storedPlayer?.name ?? "" },
    mode: "onChange",
  });

  const save = (data: LeaderboardNameInput) => {
    const reused = Boolean(storedPlayer && storedPlayer.name === data.name);
    if (!reused) leaderboardPlayerService.createProfile(data.name);
    onSaved(reused);
  };

  const handleConfirm = () => {
    if (isSubmitting) return;
    if (!(getValues("name")?.trim() ?? "")) {
      setError("name", { type: "manual", message: "กรุณากรอกชื่อของคุณ" });
      setShaking(true);
      setFocus("name");
      return;
    }
    void handleSubmit(save)();
  };

  return (
    // page level (fixed), so gp-compact gives it the stepped small-screen scale
    <GamePopupShell labelledBy={titleId} position="fixed" className="gp-compact" dim={dim}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleConfirm();
        }}
        noValidate
        className="flex w-full flex-col items-center gp-gap-8"
      >
        <div className="result-badge shrink-0 gp-size-100" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG from the Figma design */}
          <img src="/assets/icons/leaderboard-avatar.svg" alt="" width={100} height={100} className="block h-full w-full" />
        </div>
        <h2 id={titleId} className="result-pop gp-type-h2 text-[#4B4B4B]">
          กรอกชื่อเพื่อเก็บคะแนน
        </h2>
        <div className="result-rise w-full gp-pt-8">
          <label htmlFor={inputId} className="sr-only">
            ชื่อที่ต้องการแสดง
          </label>
          <input
            id={inputId}
            type="text"
            autoComplete="nickname"
            maxLength={30}
            placeholder="กรอกชื่อของคุณ"
            aria-describedby={errors.name ? errorId : undefined}
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
            onAnimationEnd={() => setShaking(false)}
            className={`${shaking ? "gp1-shake" : ""} h-[max(48px,calc(64px*var(--gp-s,1)))] w-full rounded-[20px] border-2 border-solid bg-white px-4 text-center gp-type-button text-[#4B4B4B] shadow-[0px_2px_0px_0px_#D9D9D9] outline-none placeholder:text-[#7F7F7F] ${
              errors.name
                ? "border-[var(--accent-error)] focus:ring-4 focus:ring-[rgba(220,38,38,0.18)]"
                : "border-[#A5A5A5] focus:border-[#00A3E0] focus:ring-4 focus:ring-[rgba(0,163,224,0.18)]"
            }`}
          />
          {errors.name && (
            <p id={errorId} role="alert" className="gp-mt-8 gp-type-caption text-[var(--accent-error)]">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="result-actions w-full gp-pt-12">
          {/* grey (inactive) until a valid name is typed — still pressable, so an empty name shakes the field */}
          <Button3D type="submit" size="md" inactive={!isValid || isSubmitting}>
            ยืนยัน
          </Button3D>
        </div>
      </form>
    </GamePopupShell>
  );
}
