# User Story: US-CF-02 - Start Menu แสดงเพียงปุ่ม Play เดียว

**Status:** 🟢 Done (code) 2026-08-03 — ซ่อน Manual (soft-hide) + เปลี่ยนปุ่ม Flow เป็นปุ่ม Play "เริ่มเล่น" ใน `src/app/lessons/page.tsx`; `tsc` ผ่าน ไม่มี lint issue ใหม่ (แนะนำ browser QA)
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** High
**Estimate:** S
**Version:** 1.1 | **Last Updated:** 2026-08-03
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #2

---

## 📖 Description

**ในฐานะ** ผู้ใช้ที่เปิดแอปจากลิงก์ LINE
**ฉันต้องการ** ให้ Start Menu มีเพียงปุ่ม Play เดียวที่ชัดเจน
**เพื่อให้** ไม่สับสนระหว่างโหมดการเรียน และเริ่มต้นใช้งานได้ทันที

---

## ✅ Acceptance Criteria

1. [x] ปุ่ม Manual Learning ถูกซ่อน (soft-hide ด้วย flag `SHOW_MANUAL_MODE = false`) — ไม่ลบโค้ด, mount logic ก็ gate ด้วย flag เดียวกันจึงไม่หลุดไปหน้า lessons จาก cookie เดิม
2. [x] ปุ่ม Auto Flow เปลี่ยนเป็นปุ่ม **Play** ("เริ่มเล่น" + ไอคอน Play) ปุ่มเดียวกลางจอ
3. [x] กดปุ่ม Play ยังเรียก `handleStartFlowMode` เดิมทุกประการ — **ไม่แตะ logic/behavior** ของ Auto Flow
4. [~] UI Start Menu เรียบง่ายขึ้น (เหลือปุ่มเดียว + heading "พร้อมเริ่มเรียนรู้หรือยัง?") — **รอ browser QA ยืนยันสายตา**

---

## 🛠 Technical Tasks

- [x] ระบุ component Start Menu — `src/app/lessons/page.tsx` (view `activeSubPage === "modes"`)
- [x] เพิ่ม flag `SHOW_MANUAL_MODE` (module-level) + conditional render ซ่อนปุ่ม Manual (soft-hide)
- [x] เปลี่ยนปุ่ม Auto Flow เป็นปุ่ม Play "เริ่มเล่น" (import icon `Play`) + ปรับ heading/subtext ให้เข้ากับปุ่มเดียว
- [x] คง `handleStartFlowMode` เดิม (ยังอ้างอิงใน JSX จึงไม่เกิด unused-var); `tsc` ผ่าน
- [ ] browser QA: Start Menu แสดงปุ่ม Play เดียว, กดแล้วเข้าสาย Flow ได้

> ⚠️ **หมายเหตุ cross-dependency:** `handleStartFlowMode` ปัจจุบันยัง route แบบ game-first (`currentStep:"game"` → `/game`) ตามโค้ด `863895c` ซึ่ง [US-FLOW-01](./US-FLOW-01.md) จะรื้อกลับเป็น video-first ภายหลัง — US-CF-02 คงพฤติกรรมไว้ตามข้อกำหนด "ห้ามเปลี่ยน behavior ของ Auto Flow"

---

## ⚠️ Important Note

- ห้ามเปลี่ยน logic หรือ behavior ของ Auto Flow
- Manual Learning อาจเปิดใช้งานได้อีกครั้งในอนาคต — ให้ซ่อนแบบ soft (ไม่ต้องลบโค้ดออก)

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- Flow: [US-FLOW-01](./US-FLOW-01.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
