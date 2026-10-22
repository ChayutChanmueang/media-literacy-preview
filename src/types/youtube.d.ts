// Minimal typings for the YouTube IFrame Player API (https://www.youtube.com/iframe_api) —
// only the parts used by the lesson video and facilitator pages.

export interface YTPlayer {
  playVideo(): void;
  getCurrentTime(): number;
  destroy(): void;
}

/** event.data: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued */
export interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

export interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
  };
}

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
    };
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}
