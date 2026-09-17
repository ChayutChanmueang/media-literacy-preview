# User Story: US-CF-18 - G13: เพิ่มไอศกรีมตกอีกลูกเมื่อคะแนนถึง ~10

**Status:** ✅ Done
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** Dev Team
**Priority:** Medium
**Estimate:** M
**Version:** 1.1 | **Last Updated:** 2026-08-04
**Deadline:** 2026-08-04
**Source:** Client Feedback เพิ่มเติม 2026-08-03 / 2026-08-04

---

## 📖 Description

**ในฐานะ** ผู้เล่นเกม G13 "ต่อไอติมรู้ทันสื่อ"
**ฉันต้องการ** ให้เมื่อได้คะแนนประมาณ 10 คะแนน มีไอศกรีมอีกลูกเริ่ม spawn ตกลงมาโดยมีเวลา spawn อิสระ (ไม่พร้อมกันตลอด) และมีความเร็วที่ช้ากว่าลูกแรกเสมอ
**เพื่อให้** เกมมีความท้าทายเพิ่มขึ้นและสนุกมากขึ้นตามระดับคะแนนที่ผู้เล่นทำได้

---

## ✅ Acceptance Criteria

1. [x] เมื่อผู้เล่นมีคะแนนสะสมถึง ~10 คะแนน ระบบ spawn ไอศกรีมลูกที่สองเพิ่ม
2. [x] ไอศกรีมลูกที่สองมี difficulty scaling เป็นของตัวเองและมีความเร็วตกช้ากว่าลูกแรกเสมอ (1.0× ถึง 1.4× เทียบกับ 1.0× ถึง 1.8× ของลูกแรก)
3. [x] ไอศกรีมทั้ง 2 ลูกมี timer แยกกันและ spawn คนละตำแหน่ง X ไม่ทับซ้อนกัน
4. [x] Collision/catch logic ทำงานถูกต้องกับทั้ง 2 ลูกพร้อมกัน
5. [x] ไม่กระทบ performance อย่างมีนัยสำคัญบน mobile (fps ≥ 30)

---

## 🛠 Technical Tasks

- [x] เพิ่ม score threshold check (~10 คะแนน) เพื่อ trigger second spawner (`secondSpawnerActive`)
- [x] สร้าง spawner ลูกที่ 2 ที่มี difficulty multiplier แยกกัน (`FALL_SPEED_2ND_MAX_MULTIPLIER = 1.4`)
- [x] ตรวจสอบว่า spawn position ของลูกที่ 2 ไม่ทับกับลูกแรก (เช็ค distance ใน loop ก่อนตั้งค่า x)
- [x] ปรับ collision/catch handler และ `world.falling` ให้รองรับ array ของ scoop หลายลูกตกพร้อมกัน
- [x] Playtest และ unit test ตรวจสอบว่าระบบทำงานถูกต้อง

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G13 remake: [US-GAME-13-R2](./US-GAME-13-R2.md)
- Progressive difficulty: [US-CF-15](./US-CF-15.md)
- จำกัดแสดง scoop: [US-CF-17](./US-CF-17.md)
