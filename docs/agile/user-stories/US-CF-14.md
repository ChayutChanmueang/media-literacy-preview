# User Story: US-CF-14 - G13: ขยายขนาดไอศกรีมและโคน ~3 เท่า

**Status:** 🟡 Pending Testing
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** Medium
**Estimate:** S
**Version:** 1.0 | **Last Updated:** 2026-07-31
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #14

---

## 📖 Description

**ในฐานะ** ผู้เล่นเกม G13 "ต่อไอติมรู้ทันสื่อ"
**ฉันต้องการ** ให้ไอศกรีมและโคนมีขนาดใหญ่ขึ้นจากปัจจุบัน
**เพื่อให้** มองเห็นวัตถุได้ชัดเจนขึ้นและเล่นได้สนุกกว่าเดิม

---

## ✅ Acceptance Criteria

1. [ ] sprites ไอศกรีม (scoop) และโคน (cone) แสดงผลในขนาดประมาณ 3 เท่าของขนาดก่อนแก้ไข
2. [ ] อัตราส่วน (proportions) ของ sprite ยังสมดุล ไม่ยืดหรือบีบผิดรูป
3. [ ] Collision detection ยังคงแม่นยำกับขนาด sprite ใหม่
4. [ ] ขนาดใหม่ไม่ทำให้ gameplay area แน่นจนเล่นไม่ได้บนหน้าจอ mobile portrait
5. [ ] Canvas world bounds ยังทำงานถูกต้องกับ sprite ขนาดใหม่

---

## 🛠 Technical Tasks

- [ ] ระบุค่า size/scale ปัจจุบันของ scoop และ cone ใน G13ScoopStacker.tsx
- [ ] คำนวณขนาดใหม่ (~3× ของค่าเดิม) และตรวจสอบว่าพอดีกับ canvas
- [ ] อัปเดตค่า size ของ sprite และ collision geometry ให้ตรงกัน
- [ ] ปรับ spawn position และ world bounds ถ้าจำเป็น
- [ ] Playtest บนหน้าจอ 360×740px เพื่อยืนยัน gameplay ยังใช้งานได้

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G13 remake: [US-GAME-13-R2](./US-GAME-13-R2.md)
- Progressive difficulty: [US-CF-15](./US-CF-15.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
