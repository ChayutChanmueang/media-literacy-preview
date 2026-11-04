"use client";

import React, { useRef } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import { audio } from "@/lib/audio/audioEngine";
import { useAudioSettings } from "@/lib/audio/useAudio";
import { AUDIO_CONTROLS_ENABLED } from "@/lib/audio/audioSettings";
import { loggingService } from "@/services/loggingService";

const LOG_DEBOUNCE_MS = 500;

/**
 * One button for all game sound (BGM + SFX) — the in-game control, since the play screen hides the
 * header. Icon + "เปิด"/"ปิด" text, never colour alone; 48×48 minimum.
 * Hidden while AUDIO_CONTROLS_ENABLED is off (as is AudioSettingsPanel).
 */
export function GameAudioToggle({ className = "" }: { className?: string }) {
  if (!AUDIO_CONTROLS_ENABLED) return null;
  return <GameAudioToggleButton className={className} />;
}

function GameAudioToggleButton({ className }: { className: string }) {
  const settings = useAudioSettings();
  const on = !(settings.bgmMuted && settings.sfxMuted);

  const toggle = () => {
    const muted = on;
    audio.updateSettings({ bgmMuted: muted, sfxMuted: muted, bgmTouched: true });
    loggingService.logEvent("audio_setting_change", { channel: "all", muted, source: "game" });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="ปิดเสียงเกม"
      aria-pressed={!on}
      className={`flex min-h-12 min-w-12 shrink-0 flex-col items-center justify-center rounded-xl px-1 text-button text-[#4B4B4B] active:bg-black/5 ${className}`}
    >
      {on ? <Volume2 size={28} aria-hidden /> : <VolumeX size={28} aria-hidden />}
      <span>{on ? "เปิด" : "ปิด"}</span>
    </button>
  );
}

/** "เสียง" section of the ☰ drawer: music and sound effects, each with on/off + volume. */
export function AudioSettingsPanel() {
  if (!AUDIO_CONTROLS_ENABLED) return null;
  return <AudioSettingsSection />;
}

function AudioSettingsSection() {
  const settings = useAudioSettings();
  const logTimers = useRef<Record<string, number>>({});

  const logVolume = (channel: "bgm" | "sfx", volume: number) => {
    window.clearTimeout(logTimers.current[channel]);
    logTimers.current[channel] = window.setTimeout(() => {
      loggingService.logEvent("audio_setting_change", { channel, volume, source: "drawer" });
    }, LOG_DEBOUNCE_MS);
  };

  return (
    <section aria-label="เสียง" className="flex flex-col gap-2 border-t border-[var(--border)] px-4 py-3">
      <h2 className="text-h3 text-[var(--text-primary)]">เสียง</h2>
      <ChannelRow
        icon={<Music size={24} className="shrink-0 text-[var(--primary)]" aria-hidden />}
        label="เพลงประกอบ"
        muted={settings.bgmMuted}
        volume={settings.bgmVolume}
        onToggle={() => {
          const muted = !settings.bgmMuted;
          audio.updateSettings({ bgmMuted: muted, bgmTouched: true });
          loggingService.logEvent("audio_setting_change", { channel: "bgm", muted, source: "drawer" });
        }}
        onVolume={(volume) => {
          audio.updateSettings({ bgmVolume: volume, bgmMuted: false, bgmTouched: true });
          logVolume("bgm", volume);
        }}
      />
      <ChannelRow
        icon={<Volume2 size={24} className="shrink-0 text-[var(--primary)]" aria-hidden />}
        label="เสียงเอฟเฟกต์"
        muted={settings.sfxMuted}
        volume={settings.sfxVolume}
        onToggle={() => {
          const muted = !settings.sfxMuted;
          audio.updateSettings({ sfxMuted: muted });
          loggingService.logEvent("audio_setting_change", { channel: "sfx", muted, source: "drawer" });
        }}
        onVolume={(volume) => {
          audio.updateSettings({ sfxVolume: volume, sfxMuted: false });
          logVolume("sfx", volume);
        }}
      />
    </section>
  );
}

function ChannelRow({
  icon,
  label,
  muted,
  volume,
  onToggle,
  onVolume,
}: {
  icon: React.ReactNode;
  label: string;
  muted: boolean;
  volume: number;
  onToggle: () => void;
  onVolume: (volume: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {icon}
        <span className="flex-1 text-button text-[var(--text-primary)]">{label}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-label={`ปิด${label}`}
          aria-pressed={muted}
          className={`flex min-h-12 min-w-[88px] items-center justify-center gap-1 rounded-xl border-2 px-2 text-button cursor-pointer ${
            muted
              ? "border-[var(--border)] text-[var(--text-secondary)]"
              : "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
          }`}
        >
          {muted ? <VolumeX size={20} aria-hidden /> : <Volume2 size={20} aria-hidden />}
          {muted ? "ปิด" : "เปิด"}
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={Math.round(volume * 100)}
        onChange={(e) => onVolume(Number(e.currentTarget.value) / 100)}
        aria-label={`ความดัง${label}`}
        className="h-12 w-full cursor-pointer accent-[var(--primary)]"
      />
    </div>
  );
}
