import React, { useEffect, useState, useRef } from 'react';
import { Play, ArrowRight, ExternalLink, Volume2 } from 'lucide-react';
import { loggingService } from '../services/loggingService';

// Video mappings for the three lessons (US-CORE-03 & US-DATA-02)
const VIDEO_MAP = {
  'topic-1': {
    videoId: 'FtM6e2QcqgE', // Requested YouTube Shorts video
    title: 'วิธีสังเกตข่าวปลอมและโพสต์ลวงโลก',
    lessonNum: 'บทที่ 1'
  },
  'topic-2': {
    videoId: 'olFI-ddmedk', // Requested YouTube Shorts video
    title: 'จับพิรุธสัญญาณมิจฉาชีพทาง SMS และ LINE',
    lessonNum: 'บทที่ 2'
  },
  'topic-3': {
    videoId: 'ZXQeMwJcWFg', // Requested YouTube Shorts video
    title: 'เท่าทันภัยภาพและเสียงสังเคราะห์จาก AI',
    lessonNum: 'บทที่ 3'
  }
};

export default function VideoScreen({ lessonId = 'topic-1', onNext }) {
  const [videoFinished, setVideoFinished] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const playerRef = useRef(null);
  const loadingTimerRef = useRef(null);
  const videoPlayingRef = useRef(false);
  const skipBtnShownAtRef = useRef(null);

  const videoDetails = VIDEO_MAP[lessonId] || VIDEO_MAP['topic-1'];
  const videoId = videoDetails.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    // Log entry event
    loggingService.logEvent('enter_video', { lesson_id: lessonId, video_id: videoId });

    // US-CF-49: Start 1-second loading timer (for testing)
    loadingTimerRef.current = setTimeout(() => {
      console.log("[VideoScreen] Timer triggered. videoPlayingRef.current =", videoPlayingRef.current);
      if (!videoPlayingRef.current) {
        setShowSkipButton(true);
        skipBtnShownAtRef.current = Date.now();
        loggingService.logEvent('video_slow_load_shown', { lesson_id: lessonId, video_id: videoId });
      }
    }, 1000);

    // Check if script already loaded
    let sdkLoaded = window.YT !== undefined;
    
    if (!sdkLoaded) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      console.log("[VideoScreen] Initializing YouTube Player...");
      playerRef.current = new window.YT.Player('yt-player-iframe', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          fs: 1,
          playsinline: 1,
          modestbranding: 1
        },
        events: {
          onReady: (event) => {
            console.log("[VideoScreen] Player ready. Attempting playVideo()...");
            setPlayerReady(true);
            try {
              event.target.playVideo();
            } catch (e) {
              console.error("[VideoScreen] Error in playVideo:", e);
            }
          },
          onStateChange: (event) => {
            console.log("[VideoScreen] Player state changed to:", event.data);
            // YT.PlayerState.PLAYING is 1
            if (event.data === 1) {
              videoPlayingRef.current = true;
              if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
              }
              // If button was already shown, it means it took > 7s but eventually loaded
              setShowSkipButton((prev) => {
                if (prev) {
                  loggingService.logEvent('video_slow_load_resolved', { lesson_id: lessonId, video_id: videoId });
                }
                return false;
              });
              
              loggingService.logEvent('play_video', { lesson_id: lessonId, video_id: videoId });
            }
            // YT.PlayerState.ENDED is 0
            if (event.data === 0) {
              setVideoFinished(true);
              loggingService.logEvent('video_complete', { lesson_id: lessonId, video_id: videoId });
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [lessonId, videoId]);

  const handleSkipSlowLoad = () => {
    const waitDurationMs = skipBtnShownAtRef.current ? Date.now() - skipBtnShownAtRef.current : 0;
    loggingService.logEvent('video_skip_slow_load', { 
      lesson_id: lessonId, 
      video_id: videoId,
      wait_duration_ms: waitDurationMs
    });
    onNext();
  };

  return (
    <div className="screen-container">
      <div className="content-area flex-1 flex flex-col">
        <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
          <span className="font-bold text-[var(--primary)]">{videoDetails.lessonNum}</span>
        </div>

        <h2 className="mt-2 mb-2">{videoDetails.title}</h2>
        <p className="text-small mb-4">
          *กรุณารับชมคลิปวิดีโอให้จบ เพื่อเปิดทำแบบฝึกหัดทบทวนครับ*
        </p>

        {/* Video Player Container with 9:16 aspect ratio — height-driven so it always
            fits the space left after the title/instructions/buttons on a short phone,
            instead of a fixed width that forces the height to whatever the ratio gives */}
        <div className="relative h-[min(46dvh,400px)] max-w-full aspect-[9/16] bg-black rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] overflow-hidden mx-auto mb-4 border-4 border-[var(--border)] shrink-0">
          {/* IFrame placeholder */}
          <div id="yt-player-iframe" className="w-full h-full"></div>

          {!playerReady && (
            <div className="absolute inset-0 bg-[rgba(15,23,42,0.95)] flex flex-col items-center justify-center text-white p-6 text-center">
              <div className="w-[50px] h-[50px] border-[5px] border-[#334155] rounded-full [border-top-color:var(--primary)] [animation:spin_1s_linear_infinite] mb-4"></div>
              <span className="text-[18px] font-bold">กำลังโหลดวิดีโอ...</span>
            </div>
          )}
        </div>

        {/* External Link Fallback */}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline max-w-[320px] mx-auto mb-4 min-h-[48px] px-4 py-2 text-[16px] gap-2"
          onClick={() => loggingService.logEvent('open_external_youtube', { lesson_id: lessonId, video_id: videoId })}
        >
          <span>เปิดดูด้วยแอป YouTube</span>
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Skip Slow Load & Next Button Area */}
      <div className="w-full flex flex-col gap-3">

        {!videoFinished && showSkipButton && (
          <button
            onClick={handleSkipSlowLoad}
            className="btn btn-primary text-[22px] min-h-[64px] transition-all duration-300 skip-btn-enter"
          >
            <span>ข้ามวิดีโอ</span>
            <ArrowRight size={24} />
          </button>
        )}

        <button
          onClick={onNext}
          className={`btn btn-primary text-[22px] min-h-[64px] transition-all duration-300 ${videoFinished ? 'shadow-[0_0_15px_rgba(13,148,136,0.4)] scale-[1.02]' : 'shadow-none scale-100'}`}
          disabled={!videoFinished}
        >
          <span>ไปทำแบบฝึกหัด (เกม)</span>
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}
