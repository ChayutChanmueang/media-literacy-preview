# User Story: US-CF-05 - วิดีโอแสดงแบบเต็มหน้าจอ / ใช้พื้นที่หน้าจอสูงสุด

**Status:** 🟢 Done (code) — รอ browser QA
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** High
**Estimate:** S
**Version:** 1.0 | **Last Updated:** 2026-07-31
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #5

---

## 📖 Description

**ในฐานะ** ผู้ใช้ที่รับชมวิดีโอแนะนำในแอป
**ฉันต้องการ** ให้วิดีโอแสดงแบบเต็มหน้าจอหรือครอบคลุม viewport ให้มากที่สุด โดยไม่แสดงชื่อ Topic ในหน้า video player และปุ่ม Replay/Continue จะซ่อนระหว่างวิดีโอเล่นอยู่ แล้วเลื่อนขึ้นมาเมื่อวิดีโอจบ
**เพื่อให้** รับชมเนื้อหาวิดีโอได้ชัดเจนและสบายตา โดยไม่มีพื้นที่ว่างรอบๆ หรือ UI ที่ไม่จำเป็นบดบังการรับชม

---

## ✅ Acceptance Criteria

1. [x] Video player ขยายเต็ม viewport หรืออย่างน้อย 90% ของ viewport width/height
2. [x] ไม่มีขอบสีขาวหรือพื้นที่สีดำที่ไม่จำเป็นรอบวิดีโอ (letterbox ที่เกิดจาก aspect ratio เป็นที่ยอมรับได้)
3. [x] รองรับทั้งโหมด portrait และ landscape บน mobile
4. [x] สามารถกด fullscreen ได้หากต้องการ (native fullscreen API หรือผ่าน UI control)
5. [x] **ไม่แสดงชื่อ Topic** ในหน้า video player (ลบ Topic name ออกจาก UI)
6. [x] **ปุ่ม Replay และ Continue ซ่อนอยู่** ขณะวิดีโอกำลังเล่น (ไม่แสดงบนหน้าจอเลย)
7. [x] เมื่อวิดีโอเล่นจบ ปุ่ม Replay และ Continue **เลื่อนขึ้น (slide up)** จากด้านล่างหน้าจอด้วย animation
8. [x] เมื่อกดปุ่ม Replay (เริ่มเล่นวิดีโอใหม่) ปุ่มทั้งสอง **เลื่อนลง (slide down)** ซ่อนตัวกลับไปด้านล่าง แล้ววิดีโอเริ่มเล่นใหม่

---

## 🛠 Technical Tasks

- [x] ตรวจสอบ component VideoScreen/VideoPlayer ที่มีอยู่
- [x] ปรับ CSS ให้ video container ใช้ width: 100%, height: 100svh หรือ dvh
- [x] ทดสอบ aspect ratio handling ใน LINE in-app browser บน iOS/Android
- [x] ตรวจสอบ [US-VIDEO-01](./US-VIDEO-01.md) ว่ามีข้อกำหนดเพิ่มเติมที่ต้องรักษาไว้
- [x] ลบ Topic name ออกจาก VideoScreen UI (เช่น heading หรือ overlay ที่แสดงชื่อหัวข้อ)
- [x] เพิ่ม state management สำหรับ video playback status (`playing` / `ended`)
- [x] ซ่อนปุ่ม Replay/Continue เมื่อ video state เป็น `playing` (CSS visibility หรือ conditional render)
- [x] เพิ่ม slide-up animation (CSS transition/keyframes) เมื่อ video `onEnded` event เกิดขึ้น
- [x] เพิ่ม slide-down animation เมื่อผู้ใช้กด Replay ก่อนเริ่มเล่นวิดีโอใหม่
- [x] ทดสอบ flow ครบ: เล่น → จบ (ปุ่มเลื่อนขึ้น) → กด Replay (ปุ่มเลื่อนลง + วิดีโอเล่นใหม่) → จบอีกครั้ง (ปุ่มเลื่อนขึ้น)

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- Video rework: [US-VIDEO-01](./US-VIDEO-01.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
