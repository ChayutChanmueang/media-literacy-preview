# User Story: US-UX-07 - หน้าเฉลย: ยืดเวลา auto-advance เป็น 30 วิ และหยุดนับเมื่อผู้ใช้แตะ/เลื่อนเนื้อหา

**Status:** 🟢 Done (code) 2026-08-04 — `AutoAdvanceButton` รับ prop `paused`, `CustomScrollArea` รับ `onActiveChange`, wire ใน G1/G3 (`delayMs={30000}` + `paused`); `tsc` ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — UX polish (กลุ่มเดียวกับ [US-UX-06](./US-UX-06.md))
**Owner:** TBD
**Priority:** Medium
**Estimate:** S
**Version:** 1.0 | **Last Updated:** 2026-08-04
**Source:** คำสั่งทีม 2026-08-04 (พบตอนทดสอบหน้าเฉลย G1)

---

## 📖 Description

**ในฐานะ** ผู้เล่นสูงอายุที่กำลังอ่านคำเฉลยในเกม (G1 "จริงหรือมั่ว?" และ G3 "AI หรือ คน?")
**ฉันต้องการ** ให้ปุ่ม "ต่อไป" ที่กดให้เองอัตโนมัติ ไม่รีบพาไปข้อถัดไปเร็วเกินไป และหยุดนับเวลาเมื่อฉันกำลังอ่าน/เลื่อนเนื้อหาอยู่
**เพื่อให้** มีเวลาอ่านคำอธิบายจนจบโดยไม่ถูกตัดจบกลางคัน

---

## 🎯 สิ่งที่ต้องแก้

หน้าเฉลย (reveal) ของเกมที่มีปุ่ม "ต่อไป" แบบ auto-advance (`AutoAdvanceButton`):

1. **ยืดเวลา auto-advance เป็น 30 วินาที** (เดิม 5 วิ — เร็วเกินสำหรับกลุ่มผู้สูงอายุ)
2. **หยุดตัวนับเวลาชั่วคราวเมื่อผู้ใช้กำลังโต้ตอบกับเนื้อหา** — ถ้าผู้ใช้แตะค้าง หรือกำลังเลื่อน (scroll) เนื้อหาคำเฉลย เวลาจะหยุดค้าง (ทั้งตัวนับและแถบ progress) แล้วนับต่อจากจุดเดิมเมื่อผู้ใช้หยุดโต้ตอบ (ปล่อยนิ้ว + หยุดนิ่ง ~0.7 วิ)

ครอบคลุมเกม **G1** และ **G3** (เกมที่ใช้ pattern หน้าเฉลย + `CustomScrollArea` + `AutoAdvanceButton`)

---

## ✅ Acceptance Criteria

1. [x] ปุ่ม "ต่อไป" ในหน้าเฉลย G1/G3 auto-advance ที่ 30 วินาที (`delayMs={30000}`)
2. [x] แถบ progress บนปุ่มวิ่งสอดคล้องกับเวลา 30 วิ และ **หยุดค้าง** เมื่อ `paused`
3. [x] ระหว่างที่ผู้ใช้แตะค้าง/เลื่อนเนื้อหาคำเฉลย ตัวนับหยุด — ไม่เด้งไปข้อถัดไป
4. [x] เมื่อผู้ใช้หยุดโต้ตอบ ตัวนับ **นับต่อจากเวลาที่เหลือ** (ไม่รีเซ็ตกลับ 30 วิ)
5. [x] ผู้ใช้ยังกดปุ่ม "ต่อไป" เองได้ทุกเมื่อ (ข้ามการรอ)
6. [x] เริ่มโจทย์ใหม่ ตัวนับเริ่มนับใหม่ที่ 30 วิเสมอ
7. [~] Layout/พฤติกรรมไม่พังทั้ง G1 และ G3 — **รอ browser QA**

---

## 🛠 Technical Tasks

- [x] `src/components/AutoAdvanceButton.jsx` — เพิ่ม prop `paused`; เปลี่ยนจาก `setTimeout` ก้อนเดียวเป็นการเก็บ "เวลาที่เหลือ" (`remainingRef`) ข้ามช่วง pause/resume; แถบ progress ใช้ `animationPlayState: paused ? 'paused' : 'running'`
- [x] `src/components/CustomScrollArea.jsx` — เพิ่ม prop `onActiveChange(active)`; ตรวจจับ pointer/touch/scroll/wheel → active ทันทีที่โต้ตอบ, กลับ false เมื่อปล่อยนิ้ว + นิ่งเกิน `IDLE_MS` (700ms)
- [x] `src/components/G1FactCheck.jsx` — state `autoPaused` (reset ทุกโจทย์), ส่ง `onActiveChange={setAutoPaused}` ให้ `CustomScrollArea` หน้าเฉลย และ `delayMs={30000} paused={autoPaused}` ให้ `AutoAdvanceButton`
- [x] `src/components/G3AIOrNot.jsx` — เหมือน G1
- [x] `tsc --noEmit` ผ่าน
- [ ] browser QA: ยืนยันเวลา 30 วิ, การ pause ตอนเลื่อน/แตะ, resume ต่อ, และกดเองได้

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- Component ที่ใช้ร่วม: `AutoAdvanceButton`, `CustomScrollArea`
- เกมที่เกี่ยวข้อง: [US-GAME-01](./US-GAME-01.md), [US-GAME-03](./US-GAME-03.md)
- UX polish อื่น: [US-UX-06](./US-UX-06.md)
