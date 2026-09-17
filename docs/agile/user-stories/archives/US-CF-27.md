# User Story: US-CF-27 - G13 "เกมฝึกสมอง" วางไอติม: ป้ายเกม + ปุ่มเล่นอีกรอบ + กราฟิกลูกไอติม

**Status:** 🟢 Done (code) — ป้ายเกมฝึกสมอง + sprite ไอติม (ปุ่มเล่นอีกรอบตรวจแล้วว่าเสร็จอยู่ก่อนแล้ว); รอ browser QA
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-04 ([ML](../meeting-log/ML-2026-08-04-client-feedback.md) #11–13)
**Owner:** TBD | **Priority:** สูง (ข้อ 3 กราฟิก) | **Estimate:** M
**Version:** 1.0 | **Last Updated:** 2026-08-04

---

## 📖 Description

ปรับ G13 (`src/components/G13ScoopStacker.tsx`) — สื่อว่าเป็นเกมฝึกสมอง, แก้ปุ่มตอนวนกลับ, และเปลี่ยนกราฟิกลูกไอติมให้ดูน่ากิน

---

## 🎯 สิ่งที่ต้องแก้

**1) ระบุว่าเป็น "เกมฝึกสมอง"**
- เพิ่มคำ/ป้ายว่าเป็น "เกมฝึกสมอง" ในหน้าแนะนำ/ชื่อเกม (GameIntro tutorial ของ G13)

**2) ปุ่มตอนวนกลับหน้าไอติม**
- ปัจจุบันเล่นจบกด **"ไปต่อ"** แล้ว **วนกลับมาหน้าไอติม (เล่นใหม่)** → label ควรเป็น **"เล่นอีกรอบ"** ให้ตรงพฤติกรรม
- *(ตรวจว่าเป็น flow ไหน: ถ้า flow-g13 จบแล้วควรไป Start Menu (ดู [US-CF-06](./US-CF-06.md)) — กรณีที่วนกลับหน้าไอติมคือ replay ให้ใช้ "เล่นอีกรอบ")*

**3) เปลี่ยนกราฟิกลูกไอติมให้น่ากิน**
- ปัจจุบันวาดลูกไอติมเป็นวงกลมสี (canvas, `SCOOP_RADIUS`) → เปลี่ยนไปใช้ **sprite ภาพจริง**
- Asset พร้อมแล้วที่ **`public/assets/ice-cream/0-9.png`** (10 แบบสีสัน — ลูกค้าอ้างอิงแนว vecteezy/magnific)
- โหลดรูปมา draw บน canvas แทนวงกลม (สุ่ม/วนสีจาก 10 ไฟล์), คุมขนาดให้พอดี `SCOOP_RADIUS`, คง collision/stack logic เดิม

---

## ✅ Acceptance Criteria

1. [x] หน้าแนะนำ/ชื่อ G13 ระบุว่าเป็น "เกมฝึกสมอง"
2. [x] ปุ่มที่วนกลับมาเล่นหน้าไอติมใหม่ = "เล่นอีกรอบ" (ไม่ใช่ "ไปต่อ")
3. [x] ลูกไอติมใช้ sprite จาก `public/assets/ice-cream/*.png` แสดงน่ากิน หลากสี
4. [ ] collision/การซ้อนกอง/เวลาเล่นทำงานเหมือนเดิม, เฟรมเรตลื่น (canvas)

---

## 🛠 Technical Tasks

- [x] เพิ่มป้าย "เกมฝึกสมอง" ใน GameIntro ของ G13
- [x] แก้ label ปุ่ม replay → "เล่นอีกรอบ" (แยกจากกรณีจบ flow ที่ไป Start Menu)
- [x] preload 10 sprites + draw รูปแทน `arc()` วงกลมใน render loop; map ขนาดกับ `SCOOP_RADIUS`
- [ ] `tsc` + runtime playtest (ลื่น, ไม่มี console error)

---

## 🔗 Related

- Feedback: [ML-2026-08-04](../meeting-log/ML-2026-08-04-client-feedback.md) #11–13
- Component: `src/components/G13ScoopStacker.tsx` | เกม: [US-GAME-13-R2](./US-GAME-13-R2.md)
- Sprite: `public/assets/ice-cream/0-9.png`
- ปุ่มจบ flow G13 → Start Menu: [US-CF-06](./US-CF-06.md)
- ขนาดไอติม/โคน: [US-CF-14](./US-CF-14.md), [US-CF-17](./US-CF-17.md)
