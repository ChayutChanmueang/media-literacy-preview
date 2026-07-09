import React, { useEffect, useState, useRef } from 'react';
import { Play, ArrowRight, ExternalLink, Volume2 } from 'lucide-react';
import { loggingService } from '../services/loggingService';

// Video mappings for the three lessons (US-CORE-03 & US-DATA-02)
const VIDEO_MAP = {
  'topic-1': {
    videoId: 'GYZJsM7sOKU', // Requested YouTube Shorts video
    title: 'วิธีสังเกตข่าวปลอมและโพสต์ลวงโลก',
    lessonNum: 'บทที่ 1'
  },
  'topic-2': {
    videoId: '9l5Ro9NEoeg', // Requested YouTube Shorts video
    title: 'จับพิรุธสัญญาณมิจฉาชีพทาง SMS และ LINE',
    lessonNum: 'บทที่ 2'
  },
  'topic-3': {
    videoId: 'XhdNGJPXqas', // Requested YouTube Shorts video
    title: 'เท่าทันภัยภาพและเสียงสังเคราะห์จาก AI',
    lessonNum: 'บทที่ 3'
  }
};

export default function VideoScreen({ lessonId = 'topic-1', onNext }) {
  const [videoFinished, setVideoFinished] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef(null);

  const videoDetails = VIDEO_MAP[lessonId] || VIDEO_MAP['topic-1'];
  const videoId = videoDetails.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    // Log entry event
    loggingService.logEvent('enter_video', { lesson_id: lessonId, video_id: videoId });

    // Check if script already loaded
    let sdkLoaded = window.YT !== undefined;
    
    if (!sdkLoaded) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
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
            setPlayerReady(true);
            try {
              event.target.playVideo();
            } catch (e) {}
          },
          onStateChange: (event) => {
            // YT.PlayerState.PLAYING is 1
            if (event.data === 1) {
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
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [lessonId, videoId]);

  const handleSkip = () => {
    setVideoFinished(true);
    loggingService.logEvent('skip_video', { lesson_id: lessonId, video_id: videoId });
  };

  return (
    <div className="screen-container">
      <div className="content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{videoDetails.lessonNum}</span>
        </div>

        <h2 style={{ marginTop: '8px', marginBottom: '8px' }}>{videoDetails.title}</h2>
        <p className="text-small" style={{ marginBottom: '16px' }}>
          *กรุณารับชมคลิปวิดีโอให้จบ เพื่อเปิดทำแบบฝึกหัดทบทวนครับ*
        </p>

        {/* Video Player Container with 9:16 aspect ratio */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '320px',
          aspectRatio: '9 / 16',
          backgroundColor: '#000000',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          margin: '0 auto 16px auto',
          border: '4px solid var(--border)'
        }}>
          {/* IFrame placeholder */}
          <div id="yt-player-iframe" style={{ width: '100%', height: '100%' }}></div>
          
          {!playerReady && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #334155',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>กำลังโหลดวิดีโอ...</span>
            </div>
          )}
        </div>

        {/* External Link Fallback */}
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-outline"
          onClick={() => loggingService.logEvent('open_external_youtube', { lesson_id: lessonId, video_id: videoId })}
          style={{ 
            maxWidth: '320px', 
            margin: '0 auto 16px auto', 
            minHeight: '48px', 
            padding: '8px 16px',
            fontSize: '16px',
            gap: '8px'
          }}
        >
          <span>เปิดดูด้วยแอป YouTube</span>
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Developer Skip Feature & Next Button */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {!videoFinished && (
          <button 
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '16px',
              margin: '0 auto',
              display: 'block'
            }}
          >
            ข้ามวิดีโอ (สำหรับทดสอบ)
          </button>
        )}

        <button 
          onClick={onNext} 
          className="btn btn-primary"
          disabled={!videoFinished}
          style={{ 
            fontSize: '22px', 
            minHeight: '64px',
            boxShadow: videoFinished ? '0 0 15px rgba(13, 148, 136, 0.4)' : 'none',
            transform: videoFinished ? 'scale(1.02)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <span>ไปทำแบบฝึกหัด (เกม)</span>
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}
