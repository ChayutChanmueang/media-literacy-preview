# User Story: US-DOC-01 - แก้เอกสารที่ไม่ตรงโค้ดจริง (AGENT.md / CLAUDE.md / Architecture)

**Status:** 🟢 Done (2026-07-27 — แก้ `AGENT.md` + `02-architecture.md` แล้ว; `CLAUDE.md` ไม่ต้องแก้เพราะ defer ไป AGENT.md อย่างเดียว)
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.1 | **Last Updated:** 2026-07-27

> พบระหว่างรีวิว 2026-07-27 — commit `24a5862` migrate เป็น Next.js แต่ไฟล์ instruction ระดับบนสุดยังไม่อัปเดต

---

## 📖 Description
**ในฐานะ** ทีมพัฒนา/AI agent ที่ถูกสั่งให้อ่าน `AGENT.md` ก่อนเริ่มงานทุกครั้ง
**ฉันต้องการ** ให้เอกสาร instruction ตรงกับสแตกจริง (Next.js + TypeScript + pg)
**เพื่อให้** ไม่ทำงานผิดทิศจากข้อมูลสแตกที่ล้าสมัย

---

## ✅ Acceptance Criteria
1. [x] `AGENT.md` แก้ให้ตรงจริง: **Next.js 16 App Router** (ไม่ใช่ Vite), **Route Handlers + `pg` Pool** (ไม่ใช่ Express), **มี TypeScript**, **มี Vitest + Playwright** (`npm test`, `npm run test:e2e`), lint = **eslint** (ไม่ใช่ oxlint)
2. [x] ลบการอ้างอิงไฟล์ที่ไม่มีแล้ว: `src/App.jsx`, `src/App.css`, `src/index.css` → ชี้ไป `src/app/`, `src/app/globals.css`, `src/services/apiClient.ts`
3. [x] `CLAUDE.md` สอดคล้อง — ตรวจแล้วไม่มี stale claim ของตัวเอง (defer ไป AGENT.md) จึงไม่ต้องแก้
4. [x] `docs/software/02-architecture.md` เพิ่ม callout สถานะจริง + แก้ §2.3 ให้ระบุ `pg` ตรง, ไม่มี Auth/RLS/Realtime, Storage ยังไม่ต่อ
5. [x] ระบุสถานะ `src/lib/supabase.ts` (dead code ไม่มีใคร import) ไว้ใน AGENT.md แล้ว — การ**ลบ**ยกไปทำใน [US-DEBT-01](./US-DEBT-01.md)

---

## 🛠 Technical Tasks
- [ ] แก้ Tech Stack + สถาปัตยกรรมโค้ดใน `AGENT.md` (ข้อ 11–28 เดิม)
- [ ] อัปเดต `CLAUDE.md` หมายเหตุเฉพาะให้ตรง
- [ ] แก้ `docs/software/02-architecture.md` (ส่วน Supabase Auth/RLS/Realtime) + ตรวจ `01-system-design.md` ประกอบ
- [ ] `grep` หาอ้างอิง Vite/Express/App.jsx ที่ตกค้างทั่ว repo แล้วแก้ให้ครบ

---

## 🔗 Related Files
- `AGENT.md`, `CLAUDE.md`, `docs/software/02-architecture.md`, `docs/software/01-system-design.md`, `src/lib/supabase.ts`
