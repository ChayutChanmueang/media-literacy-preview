# รู้ทันสื่อ Interactive — Video Clip Registry

**Version:** 1.0 | **Last Updated:** 2026-07-19

> เอกสารนี้บันทึกรายการคลิปวิดีโอทั้งหมดที่ใช้ในแอป พร้อมลิงก์ YouTube และ mapping คลิป↔บทเรียน↔เกม เพื่อตอบคำถามเปิดข้อ 1 ใน [Project Index](../index.md#-คำถามเปิดถึงทีม-ต้องการคำตอบเพื่อเดินต่อ) และอ้างอิงจาก [02 — Content & Curriculum](./02-narrative.md#สถานะสื่อวิดีโอ)
>
> **แหล่งข้อมูล (source of truth):** `VIDEO_MAP` ใน [VideoScreen.jsx](../../src/components/VideoScreen.jsx#L6-L22) — คลิปทั้งหมดเป็น YouTube Shorts, embed ผ่าน YouTube IFrame API (ไม่มีไฟล์วิดีโอเก็บในโปรเจกต์หรือ Supabase Storage)

## ชุดที่ 1 — เน้นการสอนให้ความรู้

| lessonId | บทที่ | หัวข้อ (Topic) | ชื่อคลิป | YouTube Video ID | ลิงก์ YouTube | เกมที่รองรับ |
|----------|-------|----------------|----------|-------------------|----------------|--------------|
| `topic-1` | บทที่ 1 | Topic 1: General Media and Information Literacy (MIL) | วิธีสังเกตข่าวปลอมและโพสต์ลวงโลก | `GYZJsM7sOKU` | https://www.youtube.com/watch?v=GYZJsM7sOKU | [G1 จริงหรือมั่ว?](./01-mechanics.md#g1--จริงหรือมั่ว-fact-check-quiz-must--topic-1-mil), [G5 แชร์ดีไหม?](./01-mechanics.md#g5--แชร์ดีไหม-privacy-game-nice--topic-1-online-safety) |
| `topic-2` | บทที่ 2 | Topic 2: Recognizing and Handling Scams | จับพิรุธสัญญาณมิจฉาชีพทาง SMS และ LINE | `olFI-ddmedk` | https://www.youtube.com/shorts/olFI-ddmedk | [G2 จับสัญญาณมิจ](./01-mechanics.md#g2--จับสัญญาณมิจ-spot-the-scam-must--topic-2-scams), [G4](./01-mechanics.md#g4--หยุด-คิด-ถาม-ทำ-scenario-game-should--ชุดที่-2-ทัศนคติ) |
| `topic-3` | บทที่ 3 | Topic 3: Artificial Intelligence and New Technologies | เท่าทันภัยภาพและเสียงสังเคราะห์จาก AI | `ZXQeMwJcWFg` | https://www.youtube.com/shorts/ZXQeMwJcWFg | [G3 AI หรือ คน?](./01-mechanics.md#g3--ai-หรือ-คน-ai-or-not-must--topic-3-ai) |

## ชุดที่ 2 — เชิงทัศนคติ ("หยุด คิด ถาม ทำ")

⏳ **ยังไม่มีคลิปแมปใน `VIDEO_MAP`** — ตาม [02-narrative.md](./02-narrative.md#ชุดที่-2--เชิงทัศนคติ) เนื้อหาชุดนี้ปัจจุบันถูกสอดแทรกในหน้าสรุปของ G4 และทุกเกม ยังไม่มี lessonId/videoId เฉพาะของตัวเอง — รอทีมยืนยันว่าจะมีคลิปแยกหรือไม่

## หมายเหตุ

- คลิปทั้งหมดเป็น **YouTube Shorts** (แนวตั้ง อัตราส่วน 9:16) ตามที่ระบุใน comment ต้นทาง `VIDEO_MAP`
- ผู้เล่นต้องดูคลิปจบ (`onStateChange` → `ENDED`) จึงจะปลดล็อกปุ่ม "ไปทำแบบฝึกหัด" — มีปุ่ม "ข้ามวิดีโอ (สำหรับทดสอบ)" ไว้ใช้ตอน dev/QA เท่านั้น
- Event logging ที่เกี่ยวข้อง (ดู [Data Schema](../software/03-data-schema.md)): `enter_video`, `play_video`, `video_complete`, `skip_video`, `open_external_youtube`

## Related Documents

- Content & Curriculum: [02 — Content & Curriculum](./02-narrative.md)
- Core Mechanics: [01 — Core Mechanics](./01-mechanics.md)
- Data Schema: [Data Schema §Events](../software/03-data-schema.md)
