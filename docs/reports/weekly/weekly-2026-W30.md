# Weekly Progress Report: สัปดาห์ที่ 30 (20-26 กรกฎาคม 2026)

## 📌 Executive Summary (ภาพรวมประจำสัปดาห์)

ในสัปดาห์ที่ 30 (20-26 ก.ค. 2026) ทีมงานได้ดำเนินการสปรินท์ (Sprint 03) ในการย้ายสแตกระบบสู่ **Next.js 16 (App Router) + React 19 + TypeScript + Supabase** อย่างต่อเนื่อง พร้อมทั้งยกระดับความเสถียรของระบบ Deployment ด้วย Docker Compose และ Portainer Environment Variables สำหรับ Dev Game Hub นอกจากนี้ยังได้พัฒนาและขัดเกลามินิเกม Prototype ใหม่อย่าง **G12 (Chuzzle Stop / Match-Ring)** ให้มีระบบ Auto-advance และนิ้วมือขยับสมบูรณ์แบบ ทนต่อ React StrictMode, พัฒนา **G13 (Scoop Stacker)** สำหรับการเรียนรู้เชิงแอคชั่น และจัดทำแผนสปรินท์ Sprint 07 (Epic E-WORLD) สำหรับโลก 2D Top-down

---

## 🚀 Key Highlights & Accomplishments (ผลงานหลักที่ทำเสร็จในสัปดาห์นี้)

### 1. 🏗️ Tech Stack Migration & Infrastructure (การย้ายสแตกระบบและโครงสร้างพื้นฐาน)
- 🟢 **Next.js & TypeScript Monorepo Migration**: แปลงและปรับโครงสร้างโปรเจกต์จาก Vite React SPA เดิม มาเป็น Next.js App Router พร้อม TypeScript สำหรับรองรับ SSR และ Performance ที่ดีขึ้น
- 🟢 **Docker & Portainer Environment Config**: เพิ่มการตั้งค่า `docker-compose` สำหรับ Portainer Deployment และย้าย Dev Game Hub Guard ไปประมวลผลที่ Server Component (`force-dynamic`) เพื่อเปิด/ปิด `ENABLE_DEV_HUB` ได้ผ่าน Container Env โดยไม่ต้อง Rebuild Docker Image
- 🟢 **System & Deployment Documentation**: เพิ่มเอกสาร [04 Application Flow](../../software/04-application-flow.md) และ [Camt Deployment Guide](../../wiki/deploy-camt/) ใน Wiki

### 2. 🎮 Game Prototypes & Refinements (การพัฒนามินิเกมและปรับปรุง Engine)
- 🟢 **G12 Chuzzle Stop / Match-Ring (อย่ากดลิงก์จี้)**:
  - พัฒนา Clean-room Engine `src/lib/match-ring/` พร้อม Unit Tests ผ่าน 5/5
  - แก้ไขบั๊ก React StrictMode ที่ทำให้นิ้วมือค้าง ด้วย rAF `useEffect` ตัวเดียวที่ทนทาน
  - ปรับกติกา `min_group_size = 3` สม่ำเสมอทุกรอบ (แก้ไขปัญหากด 3 แล้วไม่เคลียร์ในรอบที่ตั้งค่า 4 ไว้เดิม)
  - ปรับ UI Flow เป็น Auto-advance (ไม่มีปุ่ม "ถัดไป" ลื่นไหล ปรับความเร็ว destroy ~0.95s / miss ~1.6s) และขยายเซสชันเป็น 10 รอบ
- 🟢 **G13 Scoop Stacker (ต่อไอติมรู้ทันสื่อ)**:
  - พัฒนา Prototype เกมแอคชั่น Catch & Stack ไอติม (`G13ScoopStacker.tsx`, `g13-scoop-items.json`) 16 สกู๊ป + 2 ไอเทมพิเศษ
  - เพิ่มระบบเอียงแกว่ง (Wobble Physics) ตามความสูงของหอไอติม และนโยบาย Zero Game Over
- 🟢 **G8 Raft Crossing (ข้ามแพรู้ทันมิจ)**:
  - ปรับปรุงและลงทะเบียนทดสอบผ่าน Dev Game Hub
- 🟢 **G7 Cyber Runner & G10 Spot Fake App & G4/G9**:
  - จัดทำ Prototype และเอกสาร GDD รายละเอียดครบถ้วนพร้อมใช้งาน

### 3. 📋 Agile Planning & Documentation (การบริหารจัดการโปรเจกต์)
- 🟢 **Epic E-WORLD (Sprint 07)**: ออกแบบสเปกและ User Stories (`US-WORLD-01` ถึง `09`) สำหรับโลก Top-down 2D "รู้ทันกลางสายหมอก" ด้วย Canvas 2D เพื่อลดข้อจำกัดของเครื่องสเปคต่ำ (เช่น Galaxy A10s)
- 🟢 **User Stories & Agile Updates**: สร้าง [US-GAME-13](../agile/user-stories/US-GAME-13.md) และปรับปรุงสถานะ backlog ทั้งหมดให้ตรงกับซอร์สโค้ดจริง

---

## ⚙️ Code Progress & Technical Updates (รายละเอียดการพัฒนาทางเทคนิค)

- **Files Modified / Created**:
  - Core Games: `src/components/G12ChuzzleStop.tsx`, `src/components/G13ScoopStacker.tsx`, `src/components/G8RaftCrossing.tsx`, `src/components/DevGameHubClient.tsx`
  - Engine & Test: `src/lib/match-ring/` (`types.ts`, `board-state.ts`, `cluster-find.ts`, `seed-board.ts`), `src/tests/unit/match-ring.test.ts`
  - Data: `src/data/g12-chuzzle-items.json`, `src/data/g13-scoop-items.json`
  - Docs: `docs/agile/user-stories/US-GAME-13.md`, `docs/gdd/design-g13.md`, `docs/gdd/design-g12.md`, `docs/changelog.md`
- **Quality Assurance**:
  - Type Check: `npx tsc --noEmit` ผ่านสะอาด
  - Unit Tests: `match-ring.test.ts` ผ่าน 5/5
  - Playwright Verification: ทดสอบนิ้ว G12 เคลื่อนที่อัตโนมัติ 46px ใน 3s โดยไม่ต้องแตะจอ

---

## ⚠️ Missing Systems & Blockers (ระบบที่ยังขาดและอุปสรรค)

- 🔴 **ระบบที่ยังขาดอยู่**:
  1. **Supabase Production Schema & Auth Sync**: ยังต้องทดสอบ integration ของ Supabase Auth และ RLS policies ร่วมกับแบบฟอร์มประเมินและแบบทดสอบ Pretest/Posttest
  2. **Lesson Flow Integration**: มินิเกม G7, G8, G10, G12, G13 ปัจจุบันเล่นได้ผ่าน Dev Game Hub เท่านั้น ยังไม่ได้ผูกเข้ากับ Route หลัก `/lessons/[id]/game`
  3. **Elderly Playtest (QA)**: ยังรอการทดสอบ playtest บนอุปกรณ์จริงกับผู้สูงอายุ เพื่อจูนความเร็วและขนาด UI ตาม feedback หน้างาน
- ⚡ **Blockers / Technical Debt**:
  - บางเกมมีไฟล์ legacy `.jsx` คงค้างจากสแตกเดิม ต้องทยอย migrate เป็น `.tsx` เต็มรูปแบบในสปรินท์ถัดไป

---

## 🎯 Next Week Priorities (แผนงานสำคัญสัปดาห์ถัดไป)

1. **ผูกมินิเกม Prototype เข้ากับ Lesson Flow (`/lessons/[id]/game`)** และต่อยอดระบบบันทึก progress/ดาว
2. **ขัดเกลาและทดสอบ Supabase Form Sync (US-MIGRATE-03)** สำหรับบันทึกผลการเรียนและการทำแบบทดสอบ
3. **ดำเนินงาน Testing & QA (US-MIGRATE-04)** ด้วย Vitest และ Playwright สำหรับ Offline Flow
4. **เตรียมความพร้อมสำหรับการทดสอบกับผู้สูงอายุจริง (User Testing Prep)**
