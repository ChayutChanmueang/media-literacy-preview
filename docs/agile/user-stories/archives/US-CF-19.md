# User Story: US-CF-19 - G13: เพิ่มไอศกรีมพิเศษ "ไอติมคู่" ให้คะแนนสองเท่า

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
**ฉันต้องการ** ให้มีไอศกรีมพิเศษ "ไอติมคู่" (double ice cream) ตกลงมาเป็นครั้งคราว ซึ่งเมื่อรับได้จะให้คะแนนสองเท่า
**เพื่อให้** เกมมีองค์ประกอบเซอร์ไพรส์ สนุกตื่นเต้นมากขึ้น และกระตุ้นให้พยายามรับให้ได้

---

## ✅ Acceptance Criteria

1. [x] มีไอศกรีมพิเศษประเภทใหม่ "ไอติมคู่" (double scoop) แสดงผลเป็น visual ที่แตกต่างจากไอศกรีมปกติอย่างชัดเจน (เอฟเฟกต์เรืองแสงสีทอง, ซ้อน 2 ลูก, พร้อมป้าย ×2)
2. [x] ไอติมคู่มี spawn rate ต่ำ (rare) — 7% ของการ spawn ไอศกรีมทั้งหมด
3. [x] เมื่อผู้เล่นรับไอติมคู่ได้ จะได้คะแนน 2 เท่าของคะแนนปกติ (+2 ชั้นในหอไอติม)
4. [x] มี visual feedback ชัดเจนเมื่อรับไอติมคู่ได้ ( golden flash บริเวณจอ และข้อความ "ไอติมคู่! +2 ชั้น ✨")
5. [x] ไอติมคู่ตกลงมาด้วยความเร็วเท่ากับไอศกรีมปกติในขณะนั้น
6. [x] Collision detection ทำงานถูกต้องกับ sprite ไอติมคู่

---

## 🛠 Technical Tasks

- [x] ออกแบบ visual ของไอติมคู่ (`drawDoubleScoop`) — canvas drawing มีรัศมีเรืองแสง, ซ้อนสองลูก, และป้าย ×2
- [x] เพิ่ม scoop type ใหม่ `double` ใน spawner logic พร้อม rare spawn rate (`DOUBLE_SCOOP_CHANCE = 0.07`)
- [x] ปรับ catch/collision handler ให้ตรวจประเภท scoop และเพิ่ม 2 flavor ลงใน `world.stack`
- [x] เพิ่ม visual feedback เมื่อรับไอติมคู่ (flash สีทอง พร้อม announce text)
- [x] ตรวจสอบระบบด้วย type check และ unit test ยืนยันความเสถียร

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G13 remake: [US-GAME-13-R2](./US-GAME-13-R2.md)
- Progressive difficulty: [US-CF-15](./US-CF-15.md)
- Second spawner: [US-CF-18](./US-CF-18.md)
