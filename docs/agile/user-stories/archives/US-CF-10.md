# User Story: US-CF-10 - G6: ลดเวลารอก่อนข้อความ Pop-Up ปรากฏ

**Status:** 🟢 Done
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** Medium
**Estimate:** S
**Version:** 1.0 | **Last Updated:** 2026-07-31
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #10

---

## 📖 Description

**ในฐานะ** ผู้ใช้ที่เล่นเกม G6 "จำลองแชท LINE"
**ฉันต้องการ** ให้ข้อความ pop-up และหน้า Intro ของแต่ละด่านปรากฏเร็วขึ้น
**เพื่อให้** เกมมี pacing ที่ดี ไม่ต้องรอนาน โดยเฉพาะสำหรับผู้สูงอายุที่อาจหมดความสนใจ

---

## ✅ Acceptance Criteria

1. [x] เวลารอ auto-advance บนหน้า Intro G6 ลดลงจาก 30 วินาที เหลือ ≤ 15 วินาที
2. [x] เวลารอ message pop-up ลดลงจากค่าเดิมให้อยู่ในระดับที่ผู้ทดสอบไม่รู้สึกว่ารอนาน
3. [x] ปุ่มข้ามยังคงมองเห็นได้ชัดเจนและสามารถกดได้ตลอดเวลา
4. [x] การเปลี่ยนแปลงไม่ทำให้ผู้ใช้พลาดเนื้อหาสำคัญในหน้า Intro

---

## 🛠 Technical Tasks

- [x] ระบุ timer/delay ของ Intro auto-advance ใน G6 component
- [x] ระบุ timer ของ message pop-up delay ใน G6 chat flow
- [x] ลด Intro auto-advance จาก 30 วินาที → 10–15 วินาที
- [x] ปรับ message pop-up delay ให้เหมาะสม
- [x] อัปเดต [US-GAME-06-R1](./US-GAME-06-R1.md) ให้ตรงกับค่าใหม่
- [x] ทดสอบกับผู้ใช้สูงอายุหรือ user tester

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G6 rework: [US-GAME-06-R1](./US-GAME-06-R1.md)
- Internal feedback: [FB-2026-07-31-playtest.md](../feedback/FB-2026-07-31-playtest.md) ข้อ #4
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
