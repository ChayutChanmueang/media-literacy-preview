"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";
import { apiClient } from "@/services/apiClient";
import ClipTitleCard from "@/components/ClipTitleCard";
import Button3D from "@/components/Button3D";
import { getVideoByLessonId, isVideoSkipped } from "@/lib/videos";
import { useDevSkip } from "@/lib/devSkip";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export default function VideoLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = (params.id as string) || "topic-1";
  const video = getVideoByLessonId(lessonId);
  const videoId = video.youtubeId || "";
  const videoSrc = video.play === "s3" ? video.s3Url : undefined;
  const logId = video.logId;
  const skipped = isVideoSkipped(lessonId);

  // Bypass selected lesson videos and jump straight to their games
  useEffect(() => {
    if (skipped) {
      const progress = progressService.getProgress();
      progressService.saveProgress({ ...progress, currentStep: "game", currentLessonId: lessonId });
      
      apiClient.saveLessonProgress(
        progressService.getOrCreateSession()?.sessionId || "",
        lessonId,
        new Date().toISOString()
      );
      loggingService.logEvent("video_complete_skipped", { lesson_id: lessonId });

      router.replace(`/lessons/${lessonId}/game`);
    }
  }, [lessonId, router, skipped]);

  // เริ่มนับถอยหลังในปุ่ม "ถัดไป" หลังคลิปจบเท่านั้น
  // countdownActive=false จะ unmount ปุ่ม progress → timer ถูก clear และรีเซ็ต
  // ยกเลิกเมื่อผู้ใช้เล่นซ้ำจาก UI ของตัวเล่นเอง (YouTube onStateChange / <video> onPlay)
  const [countdownActive, setCountdownActive] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  // US-CF-24: phase — "loading" ระหว่างอ่านโหมด, "intro" = หน้าชื่อคลิป, "video" = เล่นวิดีโอ
  const [phase, setPhase] = useState<"loading" | "intro" | "video">("loading");
  const playerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPlayingRef = useRef(false);
  const skipBtnShownAtRef = useRef<number | null>(null);
  const playerReadyRef = useRef(false);
  const hasBufferedRef = useRef(false);

  // US-CF-49.1: Stutter & Stall Detection Refs
  const stutterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeRef = useRef<number>(0);
  const stutterCountRef = useRef<number>(0);

  // อ่านโหมดการเรียนตอน mount → กำหนดปลายทางปุ่ม + ตัดสินใจว่าจะแสดงหน้าชื่อคลิปก่อนไหม
  useEffect(() => {
    const mode = progressService.getProgress()?.learningMode || "manual";
    setPhase(mode === "flow" && video.showClipIntro ? "intro" : "video");
  }, [lessonId, video.showClipIntro]);

  useEffect(() => {
    // US-CF-24: ยังไม่สร้าง player ระหว่างอยู่หน้าชื่อคลิป (intro) หรือกำลังอ่านโหมด
    if (skipped || phase !== "video") return;

    // Log entry event
    loggingService.logEvent("enter_video", { lesson_id: lessonId, video_id: logId });

    // US-CF-49: Start 7-second loading timer
    loadingTimerRef.current = setTimeout(() => {
      // ถ้า player พร้อมแล้ว (onReady/onLoadedData ทำงาน + เรียก play() ไปแล้ว) แต่ยังไม่เคย
      // buffer เลย แปลว่าเบราว์เซอร์บล็อก autoplay อยู่ (เช่น LINE in-app browser) — ผู้ใช้แค่
      // ต้องกดปุ่มเล่นของตัวเล่นเอง ไม่ใช่กรณีโหลดช้าจริง จึงไม่ควรเสนอปุ่มข้าม
      const waitingForManualPlay = playerReadyRef.current && !hasBufferedRef.current;
      if (!videoPlayingRef.current && !waitingForManualPlay) {
        setShowSkipButton(true);
        skipBtnShownAtRef.current = Date.now();
        loggingService.logEvent("video_slow_load_shown", { lesson_id: lessonId, video_id: logId });
      }
    }, 7000);

    if (videoSrc) {
      // For MP4, skip YT init
      return;
    }

    // Check if script already loaded
    const sdkLoaded = typeof window !== "undefined" && window.YT !== undefined;

    if (!sdkLoaded && typeof document !== "undefined") {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const initPlayer = () => {
      if (typeof window === "undefined" || !window.YT) return;

      playerRef.current = new window.YT.Player("yt-player-iframe", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 0, // เล่นมีเสียงเลย (ผู้ใช้กด "ดูคลิป"/นำทางมาเอง = user gesture; ถ้าเบราว์เซอร์บล็อก ผู้ใช้กดปุ่มเล่นบน control ของ YouTube เองได้)
          controls: 1,
          rel: 0,
          fs: 1,
          playsinline: 1,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayerReady(true);
            playerReadyRef.current = true;
            try {
              event.target.playVideo();
            } catch (e) { }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING is 1, BUFFERING is 3
            // คลิปกลับมาเล่นอีกครั้ง = ผู้ใช้ดูซ้ำ ต้องยกเลิก countdown ด้วย ไม่ใช่แค่ซ่อนแถบปุ่ม
            // เพราะการเล่นซ้ำจาก UI ของ YouTube เอง (ปุ่ม replay/play/ลากแถบเวลาในตัวเล่น)
            // ถ้าไม่ยกเลิกที่นี่ ปุ่ม "ถัดไป" จะยัง mount ค้างและนับต่อ
            // จนพาไปเกมทั้งที่ผู้ใช้กำลังดูซ้ำอยู่
            if (event.data === 1 || event.data === 3) {
              setCountdownActive(false);
              setShowControls(false);
            }

            if (event.data === 1) {
              videoPlayingRef.current = true;
              if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
              }
              if (stutterTimerRef.current) {
                clearTimeout(stutterTimerRef.current);
                stutterTimerRef.current = null;
              }
              
              setShowSkipButton((prev) => {
                if (prev) {
                  loggingService.logEvent("video_slow_load_resolved", { lesson_id: lessonId, video_id: logId });
                }
                return false;
              });

              loggingService.logEvent("play_video", { lesson_id: lessonId, video_id: logId });
              
              // US-CF-49.1: Detect frozen video (time not advancing)
              if (playbackCheckIntervalRef.current) clearInterval(playbackCheckIntervalRef.current);
              playbackCheckIntervalRef.current = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
                  const currentTime = playerRef.current.getCurrentTime();
                  if (currentTime > 0 && Math.abs(currentTime - lastTimeRef.current) < 0.2) {
                    stutterCountRef.current += 1;
                    if (stutterCountRef.current >= 3) {
                      setShowSkipButton(true);
                      if (!skipBtnShownAtRef.current) skipBtnShownAtRef.current = Date.now();
                    }
                  } else {
                    stutterCountRef.current = 0;
                  }
                  lastTimeRef.current = currentTime;
                }
              }, 1000);
            }
            
            // YT.PlayerState.BUFFERING is 3
            if (event.data === 3) {
              hasBufferedRef.current = true;
              if (playbackCheckIntervalRef.current) {
                clearInterval(playbackCheckIntervalRef.current);
                playbackCheckIntervalRef.current = null;
              }
              if (stutterTimerRef.current) clearTimeout(stutterTimerRef.current);
              stutterTimerRef.current = setTimeout(() => {
                setShowSkipButton(true);
                if (!skipBtnShownAtRef.current) skipBtnShownAtRef.current = Date.now();
              }, 3000);
            }
            
            // YT.PlayerState.PAUSED is 2, ENDED is 0
            if (event.data === 2 || event.data === 0) {
              if (playbackCheckIntervalRef.current) {
                clearInterval(playbackCheckIntervalRef.current);
                playbackCheckIntervalRef.current = null;
              }
              if (stutterTimerRef.current) {
                clearTimeout(stutterTimerRef.current);
                stutterTimerRef.current = null;
              }
            }

            // YT.PlayerState.ENDED is 0
            if (event.data === 0) {
              // คลิปจบแล้ว → เริ่ม progress 15 วิในปุ่มถัดไป ก่อน auto-advance
              setCountdownActive(true);
              setShowControls(true);
              // Save video watch progress inside DB & session
              apiClient.saveLessonProgress(
                progressService.getOrCreateSession()?.sessionId || "",
                lessonId,
                new Date().toISOString()
              );
              loggingService.logEvent("video_complete", { lesson_id: lessonId, video_id: logId });
            }
          },
        },
      });
    };

    if (typeof window !== "undefined") {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initPlayer;
      }
    }

    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      if (stutterTimerRef.current) clearTimeout(stutterTimerRef.current);
      if (playbackCheckIntervalRef.current) clearInterval(playbackCheckIntervalRef.current);
      
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (e) { }
      }
    };
  }, [lessonId, videoId, phase, videoSrc, logId, skipped]);

  // MP4: เล่นแบบมีเสียงเลย (ผู้ใช้นำทางมาเอง = user gesture) ถ้าเบราว์เซอร์บล็อก
  // ผู้ใช้กดปุ่มเล่นบน native controls ของ <video> เองได้ (มี controls อยู่แล้ว)
  const attemptMp4Autoplay = () => {
    setPlayerReady(true);
    playerReadyRef.current = true;
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => { });
  };

  // ครบ 5 วิหลังคลิปจบ → ไปเกมถัดไปให้เอง
  const handleAutoAdvance = () => {
    loggingService.logEvent("video_auto_advance", { lesson_id: lessonId, video_id: logId });
    handleNext();
  };

  const handleNext = () => {
    const progress = progressService.getProgress();
    // US-CF-07: video-first — ดูคลิปจบแล้วไปเล่นเกมของบทเดียวกัน (ทั้ง Flow และ Manual)
    // (ใน Flow การไปคลิปบทถัดไป/แบบทดสอบหลังเรียน จะเกิดหลัง "เกม" จบ ที่ game/page.tsx)
    progressService.saveProgress({ ...progress, currentStep: "game", currentLessonId: lessonId });
    router.push(`/lessons/${lessonId}/game`);
  };

  useDevSkip(handleNext);

  // US-CF-49 / US-CF-49.1: ข้ามวิดีโอเมื่อโหลดช้า หรือ stutter
  const handleSkipSlowLoad = () => {
    const waitDurationMs = skipBtnShownAtRef.current ? Date.now() - skipBtnShownAtRef.current : 0;
    const eventName = videoPlayingRef.current ? "video_skip_stutter" : "video_skip_slow_load";
    
    loggingService.logEvent(eventName, {
      lesson_id: lessonId,
      video_id: logId,
      wait_duration_ms: waitDurationMs,
    });
    
    // Stop video from loading/playing in the background while transitioning
    if (playerRef.current && typeof playerRef.current.destroy === "function") {
      try {
        playerRef.current.destroy();
      } catch (e) {}
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src'); // Stop loading MP4
        videoRef.current.load();
      } catch (e) {}
    }

    handleNext();
  };

  // US-CF-24: กด "ดูคลิป" เอง หรือครบ 15 วิ → เริ่มเล่นวิดีโอ
  const handleStartClip = () => {
    loggingService.logEvent("clip_intro_start", { lesson_id: lessonId });
    setPhase("video");
  };

  if (skipped) {
    return (
      <div className="screen-container items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-[var(--primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  // ระหว่างอ่านโหมด (ยังไม่รู้ว่าจะขึ้น intro หรือวิดีโอ) — spinner กลาง กัน flash จอดำ
  if (phase === "loading") {
    return (
      <div className="screen-container items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  // US-CF-24 / US-CF-30: หน้าชื่อคลิป (intro) ก่อนเล่นวิดีโอ — flow + topic-3/topic-6 (Figma node 2065:7208)
  if (phase === "intro") {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center justify-center px-[24px] py-[28px]">
            <ClipTitleCard topLine="รับชมคลิป" clipName={video.clipIntro} />
          </div>
        </div>

        <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
          <Button3D onClick={handleStartClip} onAutoAdvance={handleStartClip} autoAdvanceMs={15000}>
            เริ่มชมคลิป
          </Button3D>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container p-0 gap-0 flex flex-col flex-1 min-h-0 relative overflow-hidden bg-black">
      {/* พื้นที่คลิป — แสดงเต็มหน้าจอ / viewport สูงสุด ไม่แสดงชื่อ Topic (US-CF-05) */}
      <div className="w-full h-full flex-1 min-h-0 relative">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-contain bg-black"
            controls
            playsInline
            onLoadedData={attemptMp4Autoplay}
            onPlay={() => {
              // Native controls ต้อง unmount countdown ที่นี่เมื่อคลิปกลับมาเล่น
              setCountdownActive(false);
              videoPlayingRef.current = true;
              if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
              }
              if (stutterTimerRef.current) {
                clearTimeout(stutterTimerRef.current);
                stutterTimerRef.current = null;
              }
              
              setShowSkipButton((prev) => {
                if (prev) {
                  loggingService.logEvent("video_slow_load_resolved", { lesson_id: lessonId, video_id: logId });
                }
                return false;
              });

              setShowControls(false);
              loggingService.logEvent("play_video", { lesson_id: lessonId, video_id: logId });
              
              if (playbackCheckIntervalRef.current) clearInterval(playbackCheckIntervalRef.current);
              playbackCheckIntervalRef.current = setInterval(() => {
                if (videoRef.current && !videoRef.current.paused) {
                  const currentTime = videoRef.current.currentTime;
                  if (currentTime > 0 && Math.abs(currentTime - lastTimeRef.current) < 0.2) {
                    stutterCountRef.current += 1;
                    if (stutterCountRef.current >= 3) {
                      setShowSkipButton(true);
                      if (!skipBtnShownAtRef.current) skipBtnShownAtRef.current = Date.now();
                    }
                  } else {
                    stutterCountRef.current = 0;
                  }
                  lastTimeRef.current = currentTime;
                }
              }, 1000);
            }}
            onWaiting={() => {
              hasBufferedRef.current = true;
              if (playbackCheckIntervalRef.current) {
                clearInterval(playbackCheckIntervalRef.current);
                playbackCheckIntervalRef.current = null;
              }
              if (stutterTimerRef.current) clearTimeout(stutterTimerRef.current);
              stutterTimerRef.current = setTimeout(() => {
                setShowSkipButton(true);
                if (!skipBtnShownAtRef.current) skipBtnShownAtRef.current = Date.now();
              }, 3000);
            }}
            onPause={() => {
              if (playbackCheckIntervalRef.current) {
                clearInterval(playbackCheckIntervalRef.current);
                playbackCheckIntervalRef.current = null;
              }
              if (stutterTimerRef.current) {
                clearTimeout(stutterTimerRef.current);
                stutterTimerRef.current = null;
              }
            }}
            onEnded={() => {
              if (playbackCheckIntervalRef.current) {
                clearInterval(playbackCheckIntervalRef.current);
                playbackCheckIntervalRef.current = null;
              }
              if (stutterTimerRef.current) {
                clearTimeout(stutterTimerRef.current);
                stutterTimerRef.current = null;
              }
              
              setCountdownActive(true);
              setShowControls(true);
              apiClient.saveLessonProgress(
                progressService.getOrCreateSession()?.sessionId || "",
                lessonId,
                new Date().toISOString()
              );
              loggingService.logEvent("video_complete", { lesson_id: lessonId, video_id: logId });
            }}
          />
        ) : (
          <div id="yt-player-iframe" className="w-full h-full"></div>
        )}

        {!playerReady && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white p-6 text-center z-20">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-[var(--primary)] rounded-full animate-spin mb-4"></div>
            <span className="text-lg font-bold">กำลังโหลดวิดีโอ...</span>
          </div>
        )}
      </div>

      {/* Bottom overlays: `invisible` while hidden stops a slide-down flash on mount and keeps them untappable; the padded frame passes taps through to the player */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 px-[24px] pb-[64px] pt-[24px] transition-transform duration-500 ease-in-out ${
          showSkipButton ? "visible translate-y-0" : "invisible translate-y-full"
        }`}
      >
        <Button3D onClick={handleSkipSlowLoad} className="pointer-events-auto">
          ข้าม
        </Button3D>
      </div>

      {/* ปุ่มไปเกม slide up เมื่อคลิปจบ — นับถอยหลัง 5 วิแล้วไปเกมเอง */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 px-[24px] pb-[64px] pt-[24px] transition-transform duration-500 ease-in-out ${
          showControls ? "visible translate-y-0" : "invisible translate-y-full"
        }`}
      >
        <Button3D
          onClick={handleNext}
          onAutoAdvance={handleAutoAdvance}
          autoAdvanceMs={countdownActive ? 5000 : undefined}
          className="pointer-events-auto"
        >
          เริ่มเล่นเกม
        </Button3D>
      </div>
    </div>
  );
}
