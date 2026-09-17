# User Story: US-CF-17 - G13: จำกัดการแสดงไอศกรีมซ้อนบนโคนไม่เกิน 2.5 ลูก (162px ไม่รวมโคน)

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
**ฉันต้องการ** ให้ไอศกรีมที่ซ้อนบนโคนแสดงผลสูงสุดไม่เกิน 2.5 ลูก (ความสูง 162px ไม่รวมโคน) เมื่อถูกดันลงจากการรับเพิ่ม
**เพื่อให้** หน้าจอไม่ดูรกเกินไปและยังคงเล่นได้สะดวก

---

## ✅ Acceptance Criteria

1. [x] เมื่อไอศกรีมถูกซ้อนบนโคนจนถูก push down ลง จำนวนความสูงไอศกรีมที่แสดงผล (visible) สูงสุดไม่เกิน 162px (ประมาณ 2.5 ลูก)
2. [x] ไอศกรีมลูกเก่าที่เกินกว่ากำหนดถูกซ่อนหรือ fade out ออก ไม่แสดงผลล้นออกมาจากโคน
3. [x] คะแนนยังนับตามจริง (logic ไม่เปลี่ยน) — เฉพาะ visual ที่จำกัด
4. [x] Collision detection ยังทำงานถูกต้องกับ scoop ที่อยู่บนยอดหอ
5. [x] ทดสอบแล้วว่าหน้าจอไม่เต็มด้วยไอศกรีมจำนวนมากบนจอ mobile portrait

---

## 🛠 Technical Tasks

- [x] ระบุจุดที่จัดการ scoop stack display ใน G13 Canvas renderer (`G13ScoopStacker.tsx`)
- [x] เพิ่ม helper function `getVisibleScoopRange` ใน `src/lib/g13Game.ts` เพื่อจำกัดความสูง `MAX_VISIBLE_STACK_PX = 162`
- [x] ตรวจสอบว่า collision ยังตรวจจับที่ยอดหอ (top of visible stack) ถูกต้อง
- [x] Playtest และ unit tests สำหรับ helper logic ยืนยันทำงานถูกต้องเมื่อคะแนน 10+ ลูก

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G13 remake: [US-GAME-13-R2](./US-GAME-13-R2.md)
- ขยายขนาด sprite: [US-CF-14](./US-CF-14.md)
- Progressive difficulty: [US-CF-15](./US-CF-15.md)
