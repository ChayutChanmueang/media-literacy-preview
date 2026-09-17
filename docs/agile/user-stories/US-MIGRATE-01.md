# User Story: US-MIGRATE-01 - ย้ายโครงสร้างระบบหลักสู่ Next.js + TypeScript (Next.js & TypeScript Migration)

**Status:** ⏳ Planned
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.0 | **Last Updated:** 2026-07-19

---

## 📖 Description
**ในฐานะ** ทีมพัฒนาซอฟต์แวร์
**ฉันต้องการ** ย้ายโปรเจกต์จากสแตกเดิมที่เป็น Vite React SPA (JavaScript) เข้าสู่ Next.js App Router (TypeScript)
**เพื่อให้** ระบบมีขีดความสามารถการเรนเดอร์เพจฝั่งเซิร์ฟเวอร์ (SSR) ช่วยเร่งความเร็ว FCP ในหน้าจอแรก และมีความเสถียรของโค้ดด้วยระบบประเภทข้อมูล (Types)

---

## ✅ Acceptance Criteria
1. [ ] สร้างโครงการหรือเริ่มโครงสร้างโปรเจกต์ใหม่ในไดเรกทอรีเดียว (Monorepo) โดยใช้ Next.js v15+ (App Router) และ TypeScript
2. [ ] ย้ายหน้าจอหลักทั้งหมด (Consent, LessonSelector, Video, Reward, Certificate) จาก `src/` เดิมไปเป็น Next.js Pages ภายใต้โฟลเดอร์ `/app` (`/app/page.tsx`, `/app/consent/page.tsx`, `/app/lessons/page.tsx` ฯลฯ)
3. [ ] ในส่วนที่เรียกใช้งานเฟรมเวิร์กเกม (Phaser 3/4 หรือ ThreeJS Canvas) ต้องใช้การ Import แบบ Dynamic (`dynamic` imports ของ Next.js) พร้อมปิดตัวเลือก `{ ssr: false }` เพื่อเลี่ยงปัญหา Error `window is not defined`
4. [ ] พัฒนาระบบ Routing Guards ด้วย **Next.js Middleware (`middleware.ts`)** เพื่อทำหน้าที่ตรวจสอบ HTTP Cookies (Consent, Pretest) และนำทางผู้เล่นไปยังหน้าที่ถูกต้องตามลำดับ User Journey โดยไม่ต้องรอโหลดหน้า Client
5. [ ] ระบบสามารถคอมไพล์ผ่าน (Build Success) และไม่มี Error เกี่ยวกับ Types ของ TypeScript หลงเหลือ

---

## 🛠 Technical Tasks
- [ ] ติดตั้ง Next.js App Router + TypeScript โครงสร้างพื้นฐาน
- [ ] ตั้งค่าไฟล์คอนฟิก `tsconfig.json` และการ Map Paths (เช่น `@/*` ชี้ไปยังรากโฟลเดอร์)
- [ ] เขียนและย้าย UI Layout หน้าจอหลักเข้ามาในระบบ App Router
- [ ] ย้ายเอนจิ้น Phaser 3/4 ใน React component ไปรันแบบ Client-only Dynamic Import
- [ ] เขียนระบบ Middleware (`middleware.ts`) คอยสกัดอ่านคุกกี้ Session ID และจัดการ Redirect
- [ ] ดีบั๊กความไม่เข้ากันทาง Types ของตัวแปรเดิมให้สมบูรณ์

---

## 🔗 Related Files
- Architecture: [docs/software/02-architecture.md](../../docs/software/02-architecture.md)
- Routing Specs: [docs/software/04-application-flow.md](../../docs/software/04-application-flow.md)
