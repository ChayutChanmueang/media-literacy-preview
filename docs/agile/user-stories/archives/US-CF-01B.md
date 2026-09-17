# User Story: US-CF-01B - ย้าย action ใน header ไปไว้ใน Menu Drawer + ปุ่มไปหน้าแรก

**Status:** 🟢 Done (code) 2026-08-03 — navigation drawer (☰ → สไลด์ซ้าย + overlay) ใน `AppLayout.tsx`: ไปหน้าแรก + รีเซ็ต, ไม่มีปุ่ม font; `tsc` ผ่าน ไม่มี lint issue ใหม่ (แนะนำ browser QA)
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** Medium
**Estimate:** M
**Version:** 1.1 | **Last Updated:** 2026-08-03
**Design ref:** navigation drawer สไตล์ Google Drive (☰ มุมซ้าย → เมนูสไลด์จากซ้าย + overlay dim) ตามภาพที่ทีมให้ 2026-08-03
**Deadline:** 2026-08-04
**Source:** ต่อยอดจาก [US-CF-01](./US-CF-01.md) (client feedback #1) — คำสั่งทีมเพิ่มเติม 2026-08-03

---

## 📖 Description

**ในฐานะ** ผู้ใช้แอป
**ฉันต้องการ** ให้ action ต่าง ๆ ที่เคยอยู่มุมขวาบน (บริเวณ "แท็บปรับขนาด UI" เดิม) ถูกย้ายไปรวมไว้ใน **menu drawer** และมีปุ่มให้กลับไปหน้าแรกได้จากใน drawer
**เพื่อให้** header สะอาดขึ้น และรวมเมนู/การนำทางไว้ที่เดียว ใช้งานง่ายสำหรับผู้สูงอายุ

---

## ⚠️ ข้อกำหนดสำคัญ (อย่าเข้าใจผิด)

- **ไม่นำปุ่มปรับขนาด font (ก / ก+ / ก++) กลับมา** — ตอนนี้**ไม่ต้องการให้ปรับขนาด font ได้อีกต่อไป** (ยืนยันจากทีม 2026-08-03)
- "action ที่เคยอยู่บนแท็บปรับขนาด UI" ที่จะย้ายเข้า drawer หมายถึง **ปุ่มรีเซ็ต** (และ action อื่นในอนาคต) — **ไม่รวม** ปุ่มปรับ font
- กลไก font-size ฝั่ง server (cookie `naplab_ml_size` + `data-size` + สเกลใน `globals.css`) จะเก็บไว้หรือลบทิ้งก็ได้ในภายหลัง แต่ **UI ปรับ font ต้องไม่กลับมา** ไม่ว่ากรณีใด

---

## ✅ Acceptance Criteria

1. [x] มีปุ่ม ☰ (Menu icon) มุมซ้ายของ header เปิด **menu drawer** ได้
2. [x] ใน drawer มี **ปุ่มรีเซ็ตข้อมูล** (ย้ายจาก header) เรียก `handleResetAll` เดิม (`resetAll()` + เคลียร์ cookie + log `reset_application_state`)
3. [x] ใน drawer มี **ปุ่ม "ไปหน้าแรก"** → `router.push("/")` (Landing) + log `nav_home_from_drawer`
4. [x] **ไม่มีปุ่มปรับขนาด font** ใน drawer หรือ header
5. [x] เปิด/ปิดได้: overlay `bg-black/40` แตะปิด + ปุ่ม X; drawer สไลด์ (`transition-transform`); ปุ่มเมนู `min-h-14` ตัวใหญ่
6. [~] header ไม่พัง (☰ + โลโก้); โหมด Flow/Manual ไม่ถูกแตะ — **รอ browser QA ยืนยันสายตา**
7. [x] drawer อยู่ใน main return เท่านั้น → ไม่แสดงใน `/dev`, `/facilitator` (return ก่อนถึง drawer)

---

## 🛠 Technical Tasks

- [x] drawer (slide-in + overlay) inline ใน `AppLayout.tsx` (state `menuOpen`); z-50 อยู่เหนือ header
- [x] เพิ่มปุ่ม ☰ (Menu) มุมซ้ายของ header; ย้ายปุ่มรีเซ็ตเข้า drawer
- [x] ปุ่ม "ไปหน้าแรก" → `router.push("/")` (`handleGoHome`)
- [x] overlay แตะปิด + ปุ่ม X ปิด; ปุ่มเมนู `min-h-14` ตัวใหญ่
- [x] drawer อยู่ใน main return → ไม่โผล่ใน `/dev`, `/facilitator`
- [ ] browser QA: เปิด/ปิด drawer, กดไปหน้าแรก, กดรีเซ็ต, ยืนยันไม่มีปุ่ม font

---

## ❓ Open Questions

1. ~~ไอคอน hamburger ซ้าย/ขวา?~~ ✅ ซ้ายบน (ตาม design ref Google Drive 2026-08-03)
2. นอกจากรีเซ็ต + ไปหน้าแรก มี action อื่นที่จะใส่ drawer ในอนาคตไหม (เช่น เกี่ยวกับ/ช่วยเหลือ)? — ปัจจุบัน 2 รายการ
3. โลโก้ใน header ยังคงพฤติกรรมเดิม (`handleHeaderClick` → `/lessons` หรือ `/` ตาม consent); ปุ่ม "ไปหน้าแรก" ใน drawer ไป `/` เสมอ

---

## 🔗 Related Documents

- ต้นทาง: [US-CF-01](./US-CF-01.md) (ลบแท็บปรับขนาด UI)
- Start Menu ที่เกี่ยวข้อง: [US-CF-02](./US-CF-02.md), [US-CF-06](./US-CF-06.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
</content>
