# User Story: US-CF-01 - ลบ / ซ่อนแท็บปรับขนาด UI

**Status:** 🟢 Done (code) 2026-08-03 — ลบ UI ปุ่ม ก/ก+/ก++ ใน `AppLayout.tsx`; `tsc` ผ่าน ไม่มี lint issue ใหม่ (แนะนำ browser QA ยืนยัน layout ตาม AC #2)
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** Medium
**Estimate:** S
**Version:** 1.1 | **Last Updated:** 2026-08-03
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #1

---

## 📖 Description

**ในฐานะ** ผู้ใช้แอป
**ฉันต้องการ** ให้แท็บสำหรับปรับขนาด UI ถูกลบออกหรือซ่อนจากหน้าจอ
**เพื่อให้** อินเทอร์เฟซดูสะอาดขึ้นและลดความสับสนในการใช้งาน

---

## ✅ Acceptance Criteria

1. [x] แท็บปรับขนาด UI ไม่ปรากฏในหน้าจอใดๆ ที่ผู้ใช้มองเห็น — ลบ JSX ปุ่ม ก/ก+/ก++ ออกจาก header (`AppLayout.tsx`) ที่เดียวที่ render (ยืนยันด้วย grep)
2. [~] UI ยังคงทำงานได้ปกติหลังซ่อน/ลบแท็บ ไม่มี layout พัง — ปุ่มรีเซ็ต + header คงอยู่ครบ, `tsc` ผ่าน; **รอ browser QA ยืนยันสายตา**
3. [x] ฟังก์ชัน font-size ภายในยังทำงานเบื้องหลัง — คงกลไก `data-size` (server อ่าน cookie `naplab_ml_size` ใน `layout.tsx`) + สเกลใน `globals.css` ไว้ครบ ไม่แตะ

---

## 🛠 Technical Tasks

- [x] ระบุ component ที่ render แท็บปรับขนาด UI — `src/components/AppLayout.tsx` (กลุ่มปุ่ม ก/ก+/ก++ ใน header)
- [x] ลบ UI ปุ่มออก + ลบ state/handler ที่ค้าง (`size`, `changeSize`, `initialSize` destructure) เพื่อไม่ให้เกิด unused-var
- [x] คงกลไก font-size ฝั่ง server (cookie + `data-size` + globals.css) — ไม่แตะ
- [ ] browser QA: เปิดแอปยืนยัน header ไม่มีปุ่มปรับขนาด และ layout ไม่เพี้ยน

---

## 🚫 Out of Scope

- ไม่ต้องลบระบบ font-size ภายใน ถ้ายังมีการใช้งาน
- ไม่เปลี่ยน logic การแสดงผลอื่นๆ

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
