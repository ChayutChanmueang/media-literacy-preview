# User Story: US-CF-09 - G6: เพิ่มขนาดตัวอักษรในหน้า Level Intro

**Status:** 🟡 Pending Testing
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** Medium
**Estimate:** S
**Version:** 1.0 | **Last Updated:** 2026-07-31
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #9

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุที่ใช้งาน G6 "จำลองแชท LINE"
**ฉันต้องการ** ให้ข้อความในหน้าแนะนำด่าน (Level Intro) มีขนาดใหญ่พอที่จะอ่านได้สะดวก
**เพื่อให้** เข้าใจสถานการณ์ของแต่ละด่านก่อนเริ่มเล่น โดยไม่ต้องเพ่งหรือซูม

---

## ✅ Acceptance Criteria

1. [ ] ขนาดตัวอักษรหลักในหน้า Level Intro G6 ≥ 18px (หรือตามเกณฑ์ที่กำหนดใน [US-UX-05](./US-UX-05.md))
2. [ ] ข้อความทุกส่วนในหน้า Level Intro อ่านได้ชัดเจนโดยไม่ต้องซูม
3. [ ] Contrast ของข้อความยังผ่านเกณฑ์ Accessibility (≥ 4.5:1)
4. [ ] Layout ไม่ล้นหน้าจอหลังเพิ่มขนาดตัวอักษร

---

## 🛠 Technical Tasks

- [x] ระบุ component หน้า Level Intro ของ G6
- [x] ตรวจสอบ font-size ปัจจุบันและเปรียบเทียบกับเกณฑ์ accessibility
- [x] เพิ่มขนาด font ในหน้า Level Intro ให้เป็นไปตามเกณฑ์
- [ ] ทดสอบบนหน้าจอ 360px portrait และ LINE in-app browser

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G6 rework: [US-GAME-06-R1](./US-GAME-06-R1.md)
- Responsive parent: [US-UX-05](./US-UX-05.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
