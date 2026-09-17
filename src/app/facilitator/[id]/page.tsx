"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, ArrowRight, ExternalLink, Presentation, ChevronLeft, ChevronRight, MessageSquareQuote } from "lucide-react";
import { loggingService } from "@/services/loggingService";
import { getOrderedLessonIds, getVideoByLessonId } from "@/lib/videos";

const ORDERED_LESSONS = getOrderedLessonIds();

export default function FacilitatorView() {
  const params = useParams();
  const router = useRouter();
  const lessonId = (params.id as string) || "topic-1";

  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);

  const videoDetails = getVideoByLessonId(lessonId);
  const videoId = videoDetails.youtubeId || "";
  const videoSrc = videoDetails.play === "s3" ? videoDetails.s3Url : undefined;

  useEffect(() => {
    loggingService.logEvent("facilitator_lesson_view", { lesson_id: lessonId });

    if (videoSrc) {
      // For MP4, skip YT init
      return;
    }

    // Check if script already loaded
    let sdkLoaded = typeof window !== "undefined" && window.YT !== undefined;

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

      playerRef.current = new window.YT.Player("yt-presenter-iframe", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          fs: 1,
          playsinline: 1,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              loggingService.logEvent("facilitator_play_video", { lesson_id: lessonId });
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
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (e) { }
      }
    };
  }, [lessonId, videoId, videoSrc]);

  const currentIdx = ORDERED_LESSONS.indexOf(lessonId);

  const handlePrev = () => {
    if (currentIdx > 0) {
      router.push(`/facilitator/${ORDERED_LESSONS[currentIdx - 1]}`);
    }
  };

  const handleNext = () => {
    if (currentIdx < ORDERED_LESSONS.length - 1) {
      router.push(`/facilitator/${ORDERED_LESSONS[currentIdx + 1]}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-between select-none">

      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/facilitator")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-xl cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span className="text-sm font-bold">กลับหน้าศูนย์ผู้นำ</span>
          </button>

          <div className="h-6 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <span className="text-[#38bdf8] font-bold text-sm bg-[#38bdf8]/10 px-3 py-1 rounded-full">
              {videoDetails.lessonNum}
            </span>
            <h2 className="text-xl font-bold text-white">{videoDetails.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Presentation size={18} />
          <span>โหมดฉายจอใหญ่สำหรับนำเสนอ</span>
        </div>
      </div>

      {/* Main split-screen panel */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 p-8 min-h-0">

        {/* Left Column: Vertical Video embed (Big size) */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <div
            className="relative w-full max-w-[280px] bg-black overflow-hidden border-4 border-slate-800 rounded-3xl shrink-0"
            style={{
              height: "min(68dvh, 560px)",
              aspectRatio: "9 / 16",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            {videoSrc ? (
              <video
                src={videoSrc}
                className="w-full h-full object-contain"
                controls
                playsInline
                onLoadedData={() => setPlayerReady(true)}
                onPlay={() => {
                  loggingService.logEvent("facilitator_play_video", { lesson_id: lessonId });
                }}
              />
            ) : (
              <div id="yt-presenter-iframe" className="w-full h-full"></div>
            )}

            {!playerReady && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-6 text-center z-20">
                <div className="w-12 h-12 border-4 border-slate-700 border-t-[#38bdf8] rounded-full animate-spin mb-4"></div>
                <span className="text-base font-bold">กำลังดาวน์โหลดตัวเล่นวิดีโอ...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Talking Script & helper notes */}
        <div className="w-full md:w-[48%] flex flex-col gap-4">
          <div className="flex-1 bg-slate-850 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center gap-2.5 text-[#38bdf8] border-b border-slate-800 pb-3">
              <MessageSquareQuote size={28} />
              <strong className="text-lg">บทอ่านประกอบการสอน (Talking Script)</strong>
            </div>

            <p className="text-xl leading-relaxed text-slate-200 text-left whitespace-pre-line font-medium">
              "{videoDetails.script}"
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-left text-xs text-slate-400">
            <strong>💡 คำแนะนำเพิ่มเติม:</strong> ผู้นำกิจกรรมสามารถกดปุ่มเริ่มเล่นวิดีโอที่จอซ้ายมือ เพื่อให้ผู้เรียนทุกคนได้เห็นเนื้อหาพร้อมกัน
            จากนั้นใช้อ่านบทสคริปต์นี้เพื่อร่วมพูดคุยซักถามผู้เรียนเกี่ยวกับเหตุการณ์ในวิดีโอ และแนะนำให้ทุกคนเปิดแอปของตัวเองขึ้นมาลองเล่นเกมด่านนั้นต่อไป
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="px-8 py-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center shrink-0 select-none">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold"
        >
          <ChevronLeft size={16} />
          <span>บทเรียนก่อนหน้า</span>
        </button>

        <span className="text-xs text-slate-400">
          บทที่ {currentIdx + 1} จาก {ORDERED_LESSONS.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIdx === ORDERED_LESSONS.length - 1}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-[#38bdf8] hover:bg-[#0ea5e9] text-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold"
        >
          <span>บทเรียนถัดไป</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
