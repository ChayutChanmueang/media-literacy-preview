# User Story: US-CF-15 - G13: เพิ่มความยากขึ้นเรื่อยๆ แบบ Progressive

**Status:** ✅ Done
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** Medium
**Estimate:** M
**Version:** 1.0 | **Last Updated:** 2026-07-31
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #15

---

## 📖 Description

**ในฐานะ** ผู้เล่นเกม G13 "ต่อไอติมรู้ทันสื่อ"
**ฉันต้องการ** ให้เกมยากขึ้นเรื่อยๆ ยิ่งเล่นนานยิ่งท้าทาย
**เพื่อให้** เกมมี skill curve ที่ชัดเจน น่าสนใจตลอด 120 วินาที และไม่รู้สึกซ้ำซาก

---

## ✅ Acceptance Criteria

1. [ ] ความเร็วการตกของ scoop และ/หรือ bomb เพิ่มขึ้นเรื่อยๆ ตามเวลาหรือคะแนนที่สะสม
2. [ ] อัตราการเพิ่มความยากเป็น gradual (ไม่กระชาก) — ผู้เล่นรู้สึกได้ว่ายากขึ้น แต่ยังเล่นได้
3. [ ] ผู้เล่นที่ทดสอบรู้สึกว่าเกมมี skill curve ที่ชัดเจน
4. [ ] ไม่มี Game Over ยังคงเล่นได้ตลอด 120 วินาที แม้ความยากจะเพิ่มขึ้น
5. [ ] ความยากสูงสุดยังอยู่ในระดับที่ผู้สูงอายุสามารถเล่นได้ ไม่หนักเกินไป

---

## 🛠 Technical Tasks

- [ ] ออกแบบ difficulty curve: กำหนดค่า speed ณ เวลา t=0, t=30, t=60, t=90, t=120 วินาที
- [ ] implement ตัวแปร difficulty multiplier ใน game loop ของ G13
- [ ] ผูก fall speed ของ scoop/bomb กับ difficulty multiplier
- [ ] พิจารณาเพิ่ม spawn rate ของ bomb เมื่อเวลาผ่านไป (optional)
- [ ] ทดสอบ difficulty curve กับผู้ใช้หลายระดับทักษะ
- [ ] ตรวจสอบว่า physics ยังทำงานถูกต้องเมื่อ speed สูง (ไม่มี tunneling)

---

## ❓ Open Questions

1. ควรเพิ่มเฉพาะ fall speed หรือรวมถึง spawn rate ของ bomb ด้วย?
2. ระดับ max speed ที่ยังเหมาะสมสำหรับผู้สูงอายุคือเท่าไหร่?

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G13 remake: [US-GAME-13-R2](./US-GAME-13-R2.md)
- Asset resize: [US-CF-14](./US-CF-14.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
