# User Story: US-CF-31 - หน้า intro เกม: ใส่ไอคอนจริงในกล่องด้านบน (AI-gen ต่อเกม / โลโก้ไลน์จริงสำหรับ G6)

**Status:** 🟢 Done (code) 2026-08-04 — เพิ่ม prop `imageSrc` ใน `GameIntro` + ใส่ไอคอน G1/G3 (AI-gen) และ G6 (โลโก้ไลน์) จาก `public/assets/icon-game/`; G13 มี cone อยู่แล้ว; `tsc` ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-04 ([ML](../meeting-log/ML-2026-08-04-client-feedback.md) #17)
**Owner:** TBD | **Priority:** Medium | **Estimate:** M (ต้องมี asset)
**Version:** 1.0 | **Last Updated:** 2026-08-04

---

## 📖 Description

**ในฐานะ** ผู้เล่นที่เปิดหน้าแนะนำเกม (GameIntro)
**ฉันต้องการ** ให้กล่องด้านบน (เหนือคำว่า "วิธีเล่น") มีไอคอน/ภาพที่สื่อถึงเกมนั้นจริง ๆ
**เพื่อให้** ดูน่าสนใจและเข้าใจธีมเกม แทนไอคอน placeholder "?" ที่ดูว่าง

---

## 🎯 สิ่งที่ต้องแก้ (`src/components/GameIntro.tsx` + การเรียกใช้ในแต่ละเกม)

- กล่องด้านบน (`w-24 h-24 rounded-3xl bg-white/75` — รับ prop `icon`/`mediaSlot`) ปัจจุบันหลายเกมส่ง lucide icon (เช่น `CircleHelp` = "?") → ดูเป็น placeholder
- **ใส่ไอคอน/ภาพที่ใช่**:
  - เกมทั่วไป (G1/G3/G13 ฯลฯ) → ใช้ **ภาพไอคอนที่ AI generate** ให้สื่อธีมเกม (ผ่าน `mediaSlot` เป็น `<img>`)
  - **เกมจำลองแชทไลน์ (G6)** → ใช้ **โลโก้ไลน์ (LINE) จริง** (asset โลโก้ทางการ)
- ต้องเตรียม asset: ไอคอน AI-gen ต่อเกม (ใส่ `public/assets/game-intro/` หรือที่เหมาะสม) + โลโก้ไลน์

---

## ✅ Acceptance Criteria

1. [ ] กล่อง intro ของแต่ละเกมแสดงไอคอน/ภาพที่สื่อธีมเกม (ไม่ใช่ "?" placeholder)
2. [ ] G6 (จำลองแชทไลน์) ใช้โลโก้ไลน์จริง
3. [ ] ภาพคมชัด ขนาดพอดีกล่อง, รองรับ dark/theme
4. [ ] `tsc`/lint ผ่าน

---

## 🛠 Technical Tasks

- [ ] จัดหา/สร้าง asset ไอคอน AI-gen ต่อเกม + โลโก้ไลน์ (ตรวจเงื่อนไขลิขสิทธิ์โลโก้ไลน์)
- [ ] ใส่ผ่าน `mediaSlot` (`<img>`) ในการเรียก `GameIntro` ของแต่ละเกม
- [ ] `tsc`/lint + browser QA

---

## 🔗 Related

- Feedback: [ML-2026-08-04](../meeting-log/ML-2026-08-04-client-feedback.md) #17
- Component: `src/components/GameIntro.tsx` (prop `mediaSlot`/`icon`)
- เกมที่ใช้ GameIntro: G1/G3/G6/G13 ([US-CF-03](./US-CF-03.md))
- G6 เปลี่ยนชื่อเป็น "จำลองแชทไลน์": [US-CF-26](./US-CF-26.md)
