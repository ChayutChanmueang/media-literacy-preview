# 🎮 รู้ทันสื่อ Interactive — Project Index

**Project:** Web Application สร้างเสริมสมรรถนะรู้เท่าทันสื่อ/สแกม/AI สำหรับผู้สูงอายุ (NAPLAB Media Literacy)
**Status:** Active | **Current Sprint:** [Sprint 04](./agile/sprint-backlog/sprint-04.md) — 🟡 Pre-Phrae/Nan Readiness (ปรับจาก feedback เชียงใหม่เตรียมงานแพร่ 17–18 ส.ค.) | **Fast-Tracked:** [Sprint 03B](./agile/sprint-backlog/sprint-03b-refinement.md) (Completed 80%+)
**Last Updated:** 2026-08-18

**ที่มา:** เอกสาร Requirement [Interactive เกม-ระบบ.docx](./wiki/base-requirement/Interactive%20เกม-ระบบ.docx)
**Deadline สำคัญ:** ใช้งานจริงครั้งแรก — เชียงใหม่ 6–7 ส.ค. 2569, แพร่ 17–18 ส.ค., น่าน 24–25 ส.ค.

---

## 📘 Game Design (GDD)

- [00 — Concept &amp; Architecture](./gdd/00-concept.md) — วิสัยทัศน์, กลุ่มผู้ใช้ 2 กลุ่ม, ฟีเจอร์, สถาปัตยกรรม, **นโยบาย AI Content**
- [01 — Core Mechanics](./gdd/01-mechanics.md) — Core loop (คลิป→เกม→ถัดไป), สเปกเกม G1–G5, ระบบรางวัล
- [02 — Content &amp; Curriculum](./gdd/02-narrative.md) — โครงเนื้อหาวิดีโอ 2 ชุด 3 Topics + "หยุด คิด ถาม ทำ"
- [03 — Art Direction &amp; UI/UX](./gdd/03-art-direction.md) — Accessibility สำหรับผู้สูงวัย (ข้อบังคับ)
- [04 — Video Clip Registry](./gdd/04-video-clips.md) — 🟡 รายการคลิปทั้งหมด + ลิงก์ YouTube ของชุดที่ 1 (3 Topics) — ชุดที่ 2 (เชิงทัศนคติ) ยังไม่มีคลิปแมป [NEW]
- [03.1 — Design Reference Index](./wiki/design/index.md) — สรุปแนวทางการดีไซน์ระบบสลับธีม 3 จังหวัด (เชียงใหม่, แพร่, น่าน)
  - [01 — Brand Identity](./wiki/design/01-brand-identity.md) — แนวคิดและตราสัญลักษณ์โครงการ
  - [02 — Website Design Tokens](./wiki/design/02-website-design-tokens.md) — ดีไซน์โทเค็นสี ขนาดตัวอักษรเพื่อผู้สูงอายุ และสัดส่วนปุ่ม/การ์ด
  - [03 — Application Guideline](./wiki/design/03-application-guideline.md) — แนวทางการนำไปประยุกต์ใช้ในการเขียนโค้ดและสลับธีมตามจังหวัด
  - [Playground — UI Visualization](./wiki/design/ui-visualization.html) — หน้าทดสอบสลับธีมและปรับแต่ง UI สำหรับผู้สูงอายุแบบมีปฏิสัมพันธ์ (Interactive Playground) [NEW]
- [05 — User Journey](./gdd/05-user-journey.md) — 🟡 ข้อเสนอออกแบบ Journey ผู้นำชุมชน + ผู้สูงอายุ (ส่วนที่ Requirement ยังไม่ได้ลงรายละเอียด)
- [06 — Pre-test & Post-test Specification](./gdd/06-quiz-spec.md) — รายละเอียดคำถาม ตัวเลือก คำอธิบายเฉลย และโครงสร้างฐานข้อมูล [NEW]
- **Detailed Game Design (ราย G-number):**
  - [G4 — แชร์ดีไหม?](./gdd/design-g4.md) — 🔨 Prototype เกมคัดแยกการแชร์ข้อมูลส่วนตัว (จริง/มั่ว/ไม่แน่ใจ) ใน `/dev/games`
  - [G5 — กางโล่กู้ชีพ](./gdd/design-g5.md) — เกมแตะสลายภัยแบบ Single-action
  - [G6 — จำลองแชท LINE](./gdd/design-g6.md) — UI จำลอง LINE + Red Flag Hotspots
  - [G8 — กระโดดแพรู้ทันมิจ](./gdd/design-g8.md) — 🟢 Prototype เกมคัดแยก SMS/สายโทรเข้าแบบกระโดดข้ามแพ (playtest ครบ 5 ด่าน — [US-GAME-08](./agile/user-stories/US-GAME-08.md))
  - [G9 — ลิงก์จี้หรือลิงก์จริง](./gdd/design-g9.md) — จำลองฟีด/คอมเมนต์ แยกลิงก์ `.go.th` จริง vs ปลอม
  - [G10 — นี้แอปฉัน นั้นแอปใคร?](./gdd/design-g10.md) — หา/ลบแอปปลอมในตารางไอคอนมือถือ
  - [G11 — หยุดนิ้ว! คิดก่อนกด](./gdd/design-g11.md) — 🔨 Prototype แตะมือหยุดนิ้วก่อนกดข้อมูลหลอกลวง ([US-GAME-11](./agile/user-stories/US-GAME-11.md))
  - [G12 — อย่ากดลิงก์จี้ ถ้าไม่รีบหยุดกด](./gdd/design-g12.md) — 🟡 ผสาน Chuzzle + คอมเมนต์ลิงก์อันตราย + นิ้วที่กำลังกด [NEW]
  - [G13 — ต่อไอติมรู้ทันสื่อ](./gdd/design-g13.md) — 🔨 DOM Prototype ใช้เป็นเกมปิดท้าย Flow; มี task [US-GAME-13-R2 — Canvas Remake](./agile/user-stories/US-GAME-13-R2.md) รอเริ่ม (ไอติมจริง + ระเบิด + stack collision ใหม่)


## 💻 Software Design

- [01 — System Design](./software/01-system-design.md) — 🟢 Stack ยืนยันแล้ว (Next.js + TypeScript / Supabase / Docker VM): subsystem breakdown, NFR, open decisions
- [02 — System Architecture](./software/02-architecture.md) — 🟢 สถาปัตยกรรมระบบ โครงสร้างแต่ละเลเยอร์และการไหลข้อมูล
- [03 — Data Schema](./software/03-data-schema.md) — 🟢 ข้อมูลอายุ/ตำแหน่ง + PDPA + Geolocation และสเปก `game_id`/`player_info` สำหรับ Leaderboard history
- [04 — Application Flow &amp; Routing](./software/04-application-flow.md) — 🟢 ผังเส้นทาง Next.js รวม `/lessons/[id]/leaderboard` แบบกรอกชื่อครั้งแรกและแสดงอันดับเฉพาะเกมใน route
- [05 — Screen Design](./software/05-screen-design.md) — 🟢 การจัดวางหน้าจอผู้สูงอายุและสเปก Leaderboard แบบแยก `gid`/รองรับรายการเลื่อนได้
- [06 — Session & Identifier Specification](./software/06-session-specification.md) — ข้อกำหนดการจัดการ Session ID สภาพแวดล้อมจัดเก็บข้อมูลคู่ออฟไลน์ และทางเลือกกรณีเปิดข้ามเบราว์เซอร์ [NEW]
- 07 — Class Diagram — ⏳ ยังไม่สร้าง

## 🚀 Agile Management

- [01 — Product Backlog](./agile/01-product-backlog.md) — User stories: Must (11) / Should (7) / Nice (4) + Sprint 03B (8) + Client Feedback (15 + CF-01B/03B/09B) + Epic E-WORLD (9)
- [02 — Sprint Planning](./agile/02-sprint-planning.md) — Roadmap ก.ค.–ต.ค. 2569 + Gantt + Risks
- [Client Feedback Records](./agile/feedback/FB-2026-08-18-gps-consent.md) — 🆕 บันทึกผลตอบรับและข้อเสนอแนะจากผู้ทดสอบ/ลูกค้า (ล่าสุดรอบ [2026-08-18 (ถอด GPS หน้า Consent)](./agile/feedback/FB-2026-08-18-gps-consent.md), [2026-08-07 (ปัญหาการขยายฟอนต์)](./agile/feedback/FB-2026-08-07-font-scaling.md), [2026-08-06](./agile/feedback/FB-2026-08-06-client-feedback.md) และ [2026-07-31](./agile/feedback/FB-2026-07-31-playtest.md)) [NEW]
- [Sprint Backlogs](./agile/sprint-backlog/) — รายการงานย่อยและเป้าหมายราย Sprint (Sprint 01 - 07, 03B)
- [Sprint 03B — Flow Restructure & Security Hotfix](./agile/sprint-backlog/sprint-03b-refinement.md) — ⚡ รื้อ Flow เรียนต่อเนื่อง (คลิป→เกม) + Autoplay fallback & 5s countdown + Supabase IPv4 Pooler Connection Hotfix v0.8.1 (Completed 80%+) [NEW]
- [Sprint 04 — Pre-Phrae/Nan Readiness & Facilitator](./agile/sprint-backlog/sprint-04.md) — 🟡 เตรียมความพร้อมสำหรับงานลงพื้นที่แพร่ (17–18 ส.ค.) และ น่าน (24–25 ส.ค.) — Active
- [US-CF-50 — Leaderboard แยกตามเกม](./agile/user-stories/US-CF-50.md) — 🟡 In Progress: G13 score submission, Supabase DB QA และ browse-only regression ผ่านแล้ว; full mobile/LINE QA ยังรอ
- [Sprint 07 — Top-Down Mini Prototype](./agile/sprint-backlog/sprint-07.md) — 🆕 R&D: Canvas 2D world ห่อมินิเกม G1–G10 "รู้ทันกลางสายหมอก" (Epic E-WORLD, US-WORLD-01…09) — Planned
- [Weekly Progress Reports](./reports/weekly/) — 🆕 รายงานสรุปความคืบหน้าประจำสัปดาห์ (ล่าสุด [Weekly 2026-W32 (27 ก.ย. – 8 ส.ค. 2026)](./reports/weekly/weekly-2026-W32.md) และ [Weekly 2026-W30](./reports/weekly/weekly-2026-W30.md)) [NEW]

---

## ❓ คำถามเปิดถึงทีม (ต้องการคำตอบเพื่อเดินต่อ)

1. ~~รายการคลิปทั้งหมด + ลิงก์ YouTube ของแต่ละคลิป~~ ✅ ชุดที่ 1 (3 Topics) มีแล้ว ดู [04 — Video Clip Registry](./gdd/04-video-clips.md) — ⏳ ยังรอคลิปชุดที่ 2 (เชิงทัศนคติ)
2. ทบทวน/อนุมัติ [User Journey](./gdd/05-user-journey.md) ที่เสนอ
3. เสียงอ่านโจทย์: อัดเสียงจริง vs TTS — ดู [Open Decisions](./software/01-system-design.md#open-decisions)
4. ทีมพัฒนามีกี่คน (กระทบความจุ Sprint)

**แก้ไขแล้ว:** ✅ Technical Stack ยืนยันเป็น Next.js + TypeScript (Single Project / Monorepo), Supabase (Database, Auth, Storage, Real-time), React Hook Form + Zod — ดู [Technical Stack](./gdd/00-concept.md#2-technical-stack-ยืนยันแล้ว) | ✅ การทดสอบ: Vitest (ทดสอบ Logic) และ Playwright (ทดสอบ E2E Flow) | ✅ ระดับความละเอียดตำแหน่ง: จังหวัด/อำเภอ/ตำบล ที่ผู้เรียนเลือกเองจากรายการ (ไม่ใช้ GPS / ไม่ใช้ GeoIP)

## 📚 Resources & Guidelines

- [Documentation Changelog](./changelog.md)
- [เอกสารประสานงานระบบ DNS สำหรับโดเมนสถาบันการศึกษา](./wiki/dns-setup.md)
- [🔍 เอกสารยื่นขอใช้เครื่องแม่ข่ายและโดเมนเนม CAMT (ร่างเตรียมยื่น)](./wiki/deploy-camt/README.md)
- เอกสารต้นทาง: [Interactive เกม-ระบบ.docx](./wiki/base-requirement/Interactive%20เกม-ระบบ.docx) (ใน `docs/wiki/base-requirement/`)
- ตัวอย่างเกมอ้างอิง: [AI or Not (sightengine)](https://sightengine.com/ai-or-not)
