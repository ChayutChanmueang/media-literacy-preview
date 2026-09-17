# User Story: US-CF-04 - ปุ่มตัวเลือก — ดีไซน์สม่ำเสมอ นูนขึ้น และมี Animation กด

**Status:** 🟢 Done
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** Medium
**Estimate:** M
**Version:** 1.0 | **Last Updated:** 2026-07-31
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #4

---

## 📖 Description

**ในฐานะ** ผู้ใช้ที่ต้องกดปุ่มตัวเลือกระหว่างเล่นเกม
**ฉันต้องการ** ให้ปุ่ม ปฎิเสธ / ยอมรับ / นิ่งเฉย มีรูปลักษณ์ที่สม่ำเสมอและตอบสนองเมื่อกด
**เพื่อให้** ประสบการณ์การโต้ตอบรู้สึกชัดเจนและน่าเชื่อถือ

---

## ✅ Acceptance Criteria

1. [x] ปุ่มตัวเลือกทุกตัวในทุกเกมใช้โทนสีเดียวกัน (consistent color scheme)
2. [x] ปุ่มมีลักษณะนูนขึ้น (raised style) ด้วย shadow หรือ border ที่ให้ความรู้สึกมีความลึก
3. [x] มี animation เมื่อกด: ปุ่มยุบลง (depress) หรือ scale เล็กลงอย่างน้อย 5% พร้อม transition ≤ 100ms
4. [x] Contrast ของปุ่มยังผ่านเกณฑ์ Accessibility (≥ 4.5:1) และ touch target ≥ 48×48px

---

## 🛠 Technical Tasks

- [x] ระบุ component ปุ่มตัวเลือกในแต่ละเกมที่ได้รับผลกระทบ (G1, G6 ฯลฯ)
- [x] ออกแบบ raised button style ร่วมกับทีม UX/UI
- [x] สร้างหรืออัปเดต shared button component ให้ใช้ style เดียวกัน (`GameChoiceButton.jsx`)
- [x] เพิ่ม CSS transition/animation สำหรับ press state (active pseudo-class หรือ JS event)
- [ ] ทดสอบบน touch device จริง (Android)

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- Responsive parent: [US-UX-05](./US-UX-05.md)
- G6 rework: [US-GAME-06-R1](./US-GAME-06-R1.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
