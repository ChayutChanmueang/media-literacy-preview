# 🎮 รู้ทันสื่อ Interactive — Project Index

**Project:** Web Application สร้างเสริมสมรรถนะรู้เท่าทันสื่อ/สแกม/AI สำหรับผู้สูงอายุ (NAPLAB Media Literacy)
**Status:** Active | **Current Sprint:** Sprint 02 (เริ่ม 2026-07-20) | Sprint 01 เสร็จสิ้นแล้ว
**Last Updated:** 2026-07-03

**ที่มา:** เอกสาร Requirement [Interactive เกม-ระบบ.docx](./wiki/base-requirement/Interactive%20เกม-ระบบ.docx)
**Deadline สำคัญ:** ใช้งานจริงครั้งแรก — เชียงใหม่ 6–7 ส.ค. 2569, แพร่ 17–18 ส.ค., น่าน 24–25 ส.ค.

---

## 📘 Game Design (GDD)
- [00 — Concept & Architecture](./gdd/00-concept.md) — วิสัยทัศน์, กลุ่มผู้ใช้ 2 กลุ่ม, ฟีเจอร์, สถาปัตยกรรม, **นโยบาย AI Content**
- [01 — Core Mechanics](./gdd/01-mechanics.md) — Core loop (คลิป→เกม→ถัดไป), สเปกเกม G1–G5, ระบบรางวัล
- [02 — Content & Curriculum](./gdd/02-narrative.md) — โครงเนื้อหาวิดีโอ 2 ชุด 3 Topics + "หยุด คิด ถาม ทำ"
- [03 — Art Direction & UI/UX](./gdd/03-art-direction.md) — Accessibility สำหรับผู้สูงวัย (ข้อบังคับ)
- [05 — User Journey](./gdd/05-user-journey.md) — 🟡 ข้อเสนอออกแบบ Journey ผู้นำชุมชน + ผู้สูงอายุ (ส่วนที่ Requirement ยังไม่ได้ลงรายละเอียด)

## 💻 Software Design
- [01 — System Design](./software/01-system-design.md) — 🟢 Stack ยืนยันแล้ว (Vite+React / Supabase / Cloudflare Pages): subsystem breakdown, NFR, open decisions
- [02 — System Architecture](./software/02-architecture.md) — 🟢 สถาปัตยกรรมระบบ โครงสร้างแต่ละเลเยอร์และการไหลข้อมูล
- [03 — Data Schema](./software/03-data-schema.md) — 🟢 ข้อมูลที่เก็บ (อายุ/ตำแหน่ง) + ประเด็น PDPA + Geolocation ผ่าน Cloudflare
- [04 — Application Flow & Routing](./software/04-application-flow.md) — 🟢 ผังเส้นทางหน้าจอและ Route หน้าเว็บ SPA สอดคล้องกับ User Journey
- 05 — Class Diagram — ⏳ ยังไม่สร้าง

## 🚀 Agile Management
- [01 — Product Backlog](./agile/01-product-backlog.md) — User stories: Must (11) / Should (5) / Nice (3)
- [02 — Sprint Planning](./agile/02-sprint-planning.md) — Roadmap ก.ค.–ต.ค. 2569 + Gantt + Risks
- [Sprint Backlogs](./agile/sprint-backlog/) — รายการงานย่อยและเป้าหมายราย Sprint (Sprint 01 - 06)
- Retrospectives, reports — ⏳ จะสร้างเมื่อเริ่ม Sprint 01

---

## ❓ คำถามเปิดถึงทีม (ต้องการคำตอบเพื่อเดินต่อ)
1. รายการคลิปทั้งหมด + ลิงก์ YouTube ของแต่ละคลิป (block Sprint 01)
2. ทบทวน/อนุมัติ [User Journey](./gdd/05-user-journey.md) ที่เสนอ
3. เสียงอ่านโจทย์: อัดเสียงจริง vs TTS — ดู [Open Decisions](./software/01-system-design.md#open-decisions)
4. ทีมพัฒนามีกี่คน (กระทบความจุ Sprint)

**แก้ไขแล้ว:** ✅ Technical Stack ยืนยันเป็น Vite+React (PWA) / Supabase / Cloudflare Pages — ดู [Technical Stack](./gdd/00-concept.md#2-technical-stack-ยืนยันแล้ว) | ✅ ระดับความละเอียดตำแหน่ง: จังหวัด/อำเภอผ่าน Cloudflare + เลือกอำเภอ/ตำบลเพิ่มแบบ Manual

## 📚 Resources & Guidelines
- [Documentation Changelog](./changelog.md)
- เอกสารต้นทาง: [Interactive เกม-ระบบ.docx](./wiki/base-requirement/Interactive%20เกม-ระบบ.docx) (ใน `docs/wiki/base-requirement/`)
- ตัวอย่างเกมอ้างอิง: [AI or Not (sightengine)](https://sightengine.com/ai-or-not)
