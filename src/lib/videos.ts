import catalog from "@/data/videos.json";

export type VideoPlaySource = "youtube" | "s3";

export type VideoRecord = {
  lessonId: string;
  lessonNum: string;
  title: string;
  clipIntro?: string;
  showClipIntro?: boolean;
  skip?: boolean;
  play?: VideoPlaySource | "";
  youtube?: string;
  s3?: string;
  script?: string;
};

export type ResolvedVideo = {
  lessonId: string;
  lessonNum: string;
  title: string;
  clipIntro: string;
  showClipIntro: boolean;
  skip: boolean;
  script: string;
  play: VideoPlaySource;
  youtubeUrl?: string;
  youtubeId?: string;
  s3Url?: string;
  /** ค่าที่ใช้ log / analytics — YouTube ID หรือ URL ของไฟล์ S3 */
  logId: string;
};

type VideoCatalogJson = {
  fallbackLessonId?: string;
  videos: VideoRecord[];
};

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const data = catalog as VideoCatalogJson;
const FALLBACK_LESSON_ID = data.fallbackLessonId || data.videos[0]?.lessonId || "topic-1";

/** ดึง YouTube Video ID จากลิงก์เต็ม หรือจาก ID 11 ตัวตรง ๆ */
export function extractYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (YOUTUBE_ID_RE.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0]?.split("?")[0];
      return id && YOUTUBE_ID_RE.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && YOUTUBE_ID_RE.test(fromQuery)) return fromQuery;

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && ["shorts", "embed", "live", "v"].includes(parts[0])) {
        const id = parts[1];
        return YOUTUBE_ID_RE.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function hasS3(entry: VideoRecord): boolean {
  return Boolean(entry.s3?.trim());
}

function youtubeIdOf(entry: VideoRecord): string | null {
  return entry.youtube?.trim() ? extractYoutubeId(entry.youtube) : null;
}

function pickPlay(entry: VideoRecord): VideoPlaySource {
  const s3Ok = hasS3(entry);
  const ytOk = Boolean(youtubeIdOf(entry));

  if (entry.play === "s3" && s3Ok) return "s3";
  if (entry.play === "youtube" && ytOk) return "youtube";
  if (s3Ok) return "s3";
  return "youtube";
}

export function resolveVideo(entry: VideoRecord): ResolvedVideo {
  const play = pickPlay(entry);
  const youtubeId = youtubeIdOf(entry) ?? undefined;
  const youtubeUrl = entry.youtube?.trim() || undefined;
  const s3Url = entry.s3?.trim() || undefined;

  return {
    lessonId: entry.lessonId,
    lessonNum: entry.lessonNum,
    title: entry.title,
    clipIntro: entry.clipIntro?.trim() || entry.title,
    showClipIntro: Boolean(entry.showClipIntro && (entry.clipIntro?.trim() || entry.title)),
    skip: Boolean(entry.skip),
    script: entry.script?.trim() || "",
    play,
    youtubeUrl,
    youtubeId,
    s3Url,
    logId: play === "s3" ? (s3Url || entry.lessonId) : (youtubeId || youtubeUrl || entry.lessonId),
  };
}

function findRecord(lessonId: string): VideoRecord | undefined {
  return data.videos.find((v) => v.lessonId === lessonId);
}

/** ลำดับบทตามที่เรียงใน videos.json (ใช้โหมด facilitator) */
export function getOrderedLessonIds(): string[] {
  return data.videos.map((v) => v.lessonId);
}

export function getVideoByLessonId(lessonId: string): ResolvedVideo {
  const record =
    findRecord(lessonId) ||
    findRecord(FALLBACK_LESSON_ID) ||
    data.videos[0];

  if (!record) {
    return {
      lessonId,
      lessonNum: "",
      title: "",
      clipIntro: "",
      showClipIntro: false,
      skip: true,
      script: "",
      play: "youtube",
      logId: lessonId,
    };
  }

  return resolveVideo(record);
}

export function isVideoSkipped(lessonId: string): boolean {
  return getVideoByLessonId(lessonId).skip;
}

export function getStartMenuClipName(): string {
  return getVideoByLessonId(FALLBACK_LESSON_ID).clipIntro;
}
