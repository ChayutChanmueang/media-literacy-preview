import { describe, it, expect } from "vitest";
import {
  extractYoutubeId,
  resolveVideo,
  getVideoByLessonId,
  isVideoSkipped,
  type VideoRecord,
} from "@/lib/videos";

describe("extractYoutubeId", () => {
  it("accepts a raw 11-character video id", () => {
    expect(extractYoutubeId("GYZJsM7sOKU")).toBe("GYZJsM7sOKU");
  });

  it("parses watch, shorts, youtu.be, and embed URLs", () => {
    expect(extractYoutubeId("https://www.youtube.com/watch?v=sQbYRUQKJKI")).toBe("sQbYRUQKJKI");
    expect(extractYoutubeId("https://www.youtube.com/shorts/9l5Ro9NEoeg")).toBe("9l5Ro9NEoeg");
    expect(extractYoutubeId("https://youtu.be/GYZJsM7sOKU")).toBe("GYZJsM7sOKU");
    expect(extractYoutubeId("https://www.youtube.com/embed/GYZJsM7sOKU")).toBe("GYZJsM7sOKU");
    expect(extractYoutubeId("https://m.youtube.com/watch?v=sQbYRUQKJKI")).toBe("sQbYRUQKJKI");
  });

  it("returns null for empty or non-YouTube values", () => {
    expect(extractYoutubeId("")).toBeNull();
    expect(extractYoutubeId("https://example.com/video.mp4")).toBeNull();
  });
});

describe("resolveVideo source picking", () => {
  const base: VideoRecord = {
    lessonId: "topic-x",
    lessonNum: "บทที่ X",
    title: "ตัวอย่าง",
    youtube: "https://youtu.be/GYZJsM7sOKU",
    s3: "https://minio.example.com/bucket/clip.mp4",
  };

  it("plays S3 when play is s3 even if YouTube exists", () => {
    const resolved = resolveVideo({ ...base, play: "s3" });
    expect(resolved.play).toBe("s3");
    expect(resolved.s3Url).toContain("clip.mp4");
    expect(resolved.youtubeId).toBe("GYZJsM7sOKU");
  });

  it("plays YouTube when play is youtube even if S3 exists", () => {
    const resolved = resolveVideo({ ...base, play: "youtube" });
    expect(resolved.play).toBe("youtube");
    expect(resolved.youtubeId).toBe("GYZJsM7sOKU");
  });

  it("defaults to S3 when both links exist and play is omitted", () => {
    const resolved = resolveVideo(base);
    expect(resolved.play).toBe("s3");
  });

  it("falls back to YouTube when play is s3 but s3 is empty", () => {
    const resolved = resolveVideo({ ...base, play: "s3", s3: "" });
    expect(resolved.play).toBe("youtube");
    expect(resolved.youtubeId).toBe("GYZJsM7sOKU");
  });
});

describe("videos.json catalog", () => {
  it("resolves known lessons from the local db", () => {
    const topic1 = getVideoByLessonId("topic-1");
    expect(topic1.play).toBe("youtube");
    expect(topic1.youtubeId).toBe("y5ii-ANYibk");

    const topic3 = getVideoByLessonId("topic-3");
    expect(topic3.play).toBe("youtube");
    expect(topic3.youtubeId).toBe("sQbYRUQKJKI");
    expect(topic3.showClipIntro).toBe(true);
  });

  it("keeps current skip flags for unfinished clips", () => {
    expect(isVideoSkipped("topic-1")).toBe(false);
    expect(isVideoSkipped("topic-6")).toBe(true);
    expect(isVideoSkipped("topic-3")).toBe(false);
  });

  it("falls back to topic-1 for unknown lesson ids", () => {
    expect(getVideoByLessonId("unknown-lesson").lessonId).toBe("topic-1");
  });
});
