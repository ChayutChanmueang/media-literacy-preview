# User Story: US-DEBT-01 - เก็บกวาด Dead Code และ Repo Hygiene

**Status:** 🟢 Done ส่วนใหญ่ (2026-07-27) — เหลือ 1 finding ใหม่ (lint 79 errors เดิม) แยกไปทำต่างหาก
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.1 | **Last Updated:** 2026-07-27

> พบระหว่างรีวิว 2026-07-27

---

## 📖 Description
**ในฐานะ** ทีมพัฒนา
**ฉันต้องการ** ลบไฟล์ซ้ำ/ขยะ และเก็บกวาด config ที่ตกค้างจากยุค Vite
**เพื่อให้** repo อ่านง่าย ไม่หลงแก้ผิดไฟล์ และลด drift

---

## ✅ Acceptance Criteria
1. [x] ลบ service ซ้ำเวอร์ชัน `.js` (dead code — TS resolution เลือก `.ts`): `apiClient.js`, `loggingService.js`, `progressService.js`
2. [x] ลบไฟล์ขยะที่ commit ค้าง: `extracted_g9.{json,md,tsx}`, `docs/index_fixed.md`, `docs/index_fixed2.md`, `src/assets/{react,vite}.svg` (ยืนยันไม่ถูก import) — `hero.png` เก็บไว้ (ไม่ใช่ template leftover)
3. [~] **แก้ AC:** `vite` + `@vitejs/plugin-react` **ใช้จริง** โดย `vitest.config.ts` (`plugins: [react()]`) → **ไม่ลบ** (AC เดิมเข้าใจผิด)
4. [x] ลบ `.oxlintrc.json` (ค้างจากเดิม) — เก็บ `eslint.config.mjs` ที่ `npm run lint` ใช้จริง
5. [x] แก้ `.gitignore` แล้ว (ทำใน [US-SEC-01](./US-SEC-01.md) 2026-07-27)
6. [x] เอา hardcoded IP ออกจาก `next.config.ts` → อ่านจาก env `NEXT_ALLOWED_DEV_ORIGINS`
7. [x] `src/lib/db.ts` fail fast (`throw`) เมื่อไม่มี `DATABASE_URL`
8. [x] เลิก track `tsconfig.tsbuildinfo` (`git rm --cached`; อยู่ใน `.gitignore` แล้ว)
9. [ ] 🆕 **Finding ใหม่ (out of scope, แยกทำ):** `npm run lint` มี **79 errors + 125 warnings ที่ค้างอยู่เดิม** (ส่วนใหญ่ใน test/เกม: `@ts-ignore`, unused vars) — ไม่ได้เกิดจากการเก็บกวาดครั้งนี้ (tsc + vitest unit ผ่าน) ควรตั้ง task แยก

---

## 🛠 Technical Tasks
- [ ] ยืนยันว่าไม่มี import ระบุ `.js` ตรง ๆ ก่อนลบ (ตรวจแล้ว 2026-07-27: ไม่มี) แล้วลบไฟล์ `.js`
- [ ] `git rm` ไฟล์ขยะ + ตรวจว่าไม่มีลิงก์ใน docs ชี้ `index_fixed*.md`
- [ ] `npm run lint` + `npx tsc --noEmit` + `npm test` ต้องผ่านหลังเก็บกวาด

---

## 🔗 Related Files
- `src/services/*.js`, `extracted_g9.*`, `docs/index_fixed*.md`, `src/assets/`, `package.json`, `.oxlintrc.json`, `eslint.config.mjs`, `.gitignore`, `next.config.ts`, `src/lib/db.ts`
