# AGENT.md — รู้ทันสื่อ Interactive (NAPLAB Media Literacy)

คำแนะนำสำหรับ AI agent ที่เข้ามาช่วยงานในโปรเจกต์นี้ อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง

## โปรเจกต์คืออะไร

Web App เชิงโต้ตอบ (SPA, mobile-first, no-login) สอนทักษะรู้เท่าทันสื่อ/สแกม/AI ให้ผู้สูงอายุ เข้าถึงผ่านลิงก์ที่แชร์ใน LINE — ดูคลิป → เล่นเกม → รับดาว วนไปทีละบท จุดหมายแรกคืองานอบรมเชียงใหม่ 6–7 ส.ค. 2569 (deadline แข็ง ห้ามเลื่อน)

**เอกสารหลักที่ควรอ่านก่อนแก้โค้ด/วางแผนงาน:** [docs/index.md](./docs/index.md) เป็นสารบัญรวม ลิงก์ไปทุกที่

## Tech Stack

- **Next.js 16 (App Router)** + React 19 (function components + hooks เท่านั้น, ไม่มี class component) + **TypeScript**
- Backend อยู่ในโปรเจกต์เดียวกัน: **Next.js Route Handlers** ใต้ `src/app/api/**/route.ts` ต่อ Postgres (Supabase) ตรงผ่าน **`pg` Pool** (`src/lib/database.ts`) — ฝั่ง client เรียกผ่าน `src/services/apiClient.ts`
- ⚠️ ต่อ DB ด้วย `pg` ล้วน **ไม่ได้ใช้ Supabase Auth/RLS/Realtime** (schema ถอด RLS ออก ดู `docs/supabase-schema.sql`) — `src/lib/supabase.ts` มีอยู่แต่ยังไม่มีใคร import
- Deploy: Docker Container (บนระบบ Portainer เครื่องแม่ข่าย CAMT) หรือ Vercel
- Lint: `npm run lint` = **eslint** (`eslint.config.mjs` + `eslint-config-next`) — `.oxlintrc.json` เป็นของเก่าที่ยังค้าง ไม่ได้ใช้จริง
- Test: `npm test` = **Vitest** (unit, `src/tests/unit/`) | `npm run test:e2e` = **Playwright** (E2E, `src/tests/e2e/`)
- Dev commands: `npm run dev`, `npm run build`, `npm start`

โปรเจกต์เป็น TypeScript (`npx tsc --noEmit` ผ่านสะอาด) — ไฟล์เก่าบางส่วน (เกม/บางหน้าจอ) ยังเป็น `.jsx` ปนกับ `.tsx`/`.ts` ได้

## สถาปัตยกรรมโค้ด

- ไม่มี `src/App.jsx` แล้ว — flow คุมด้วย **Next.js App Router** (1 step = 1 route) + `src/components/AppLayout.tsx` (header / progress bar / สลับธีม / ปุ่มขนาดฟอนต์ / reset) ลำดับ step: `/` (landing) → `/consent` → `/pretest` → `/lessons` → `/lessons/[id]/{video,game,summary}` → `/posttest` → `/certificate` โดยความคืบหน้าเก็บผ่าน `progressService`
- `src/services/progressService.js` — persistence แบบ Hybrid (localStorage + Cookie, 1 ปี) เพราะ LINE in-app browser ชอบล้าง cache กะทันหัน **ห้ามเปลี่ยนไปใช้ localStorage อย่างเดียว**
- `src/services/loggingService.js` — ส่ง event log แบบ async ไม่บล็อก UI, มี offline queue fallback ผ่าน `localStorage` ถ้าเซิร์ฟเวอร์ล่ม/เน็ตหลุด — ทุก action สำคัญ (ข้ามคลิป, เปิดคำถาม, ตอบ, จบเกม) ต้องยิง `loggingService.logEvent(...)`
- `src/components/GameShell.jsx` — เชลล์กลางของทุกมินิเกม (progress dots, ปุ่มเสียงอ่าน, การ์ดเฉลย) — เกมใหม่ควรคุยกับ `GameShell` ผ่าน props `onFinish(stars)` และ `logEvent`, ไม่ต้อง reinvent การ layout เอง
- แต่ละมินิเกมเป็น component แยก ตามรหัส G-number: `G1FactCheck`, `G2ScamSpotter`, `G3AIOrNot`, `G5DigitalShield`, `G6LineSimulation` — ก่อนเพิ่มเกมใหม่ ให้ดู [docs/gdd/01-mechanics.md](./docs/gdd/01-mechanics.md) และ design doc เฉพาะเกม (`docs/gdd/design-g*.md`) ก่อนเสมอ ห้ามเดาสเปกเอง
- ธีม / Design tokens ทั้งหมดอยู่ที่ `src/app/globals.css` (ไม่ใช่ `src/App.css` หรือ `src/index.css` — สองไฟล์นั้นไม่มีแล้วหลัง migrate) โหลดผ่าน `src/app/layout.tsx`

## Design Tokens & Accessibility (ข้อบังคับ ไม่ใช่ทางเลือก)

Token หลักอยู่ที่ `src/app/globals.css` (`--primary: #0d9488`, ฟอนต์ `Outfit`/`Sarabun`) รองรับ dark mode ผ่าน `prefers-color-scheme` และสลับธีมรายจังหวัดผ่าน attribute `data-theme` (teal / purple / orange / green)

กติกาจาก [docs/gdd/03-art-direction.md](./docs/gdd/03-art-direction.md) ที่ห้ามละเมิดเวลาแก้ UI:
- ตัวอักษรเนื้อหา ≥ 20px, ปุ่ม ≥ 22px | Contrast ≥ 4.5:1 | Touch target ≥ 48×48px
- **ห้ามใส่ตัวหนังสือเล็กเด็ดขาด** — แอปนี้ทำเพื่อผู้สูงอายุ กฏ ≥ 20px ใช้กับ **ทุกข้อความที่ผู้ใช้อ่าน** รวมถึง label/eyebrow/caption/หมายเหตุ ไม่ใช่แค่ body หลัก; ถ้าใช้ `clamp()` ค่า **max ต้อง ≥ 20px** (min บนจอจิ๋วยอมให้ต่ำลงได้เล็กน้อย แต่ห้ามตั้งใจทำให้เล็ก)
- **ทุกหน้า/ทุก content ใหม่ต้อง scroll ได้** — ห้ามทำ layout ที่บีบเนื้อหาให้พอดีจอแบบตายตัว เพราะบนจอเตี้ย/สั้น UI จะถูกบีบจนพัง ให้ห่อด้วย pattern `overflow-y-auto` + inner `min-h-full` (จอสูงพอ = จัดกึ่งกลาง, จอเตี้ย = เลื่อนดูได้) ดูตัวอย่างที่ `src/components/GameIntro.tsx`
- ห้ามใช้สีสื่อความหมายเดี่ยว (ถูก/ผิดต้องมีไอคอน ✓ ✗ กำกับเสมอ)
- ห้ามมีการจับเวลากดดันหรือหน้าจอ "แพ้" (Game Over) — ทุกเกมต้อง positive reinforcement เท่านั้น ตอบผิด/ไม่ทัน = คำแนะนำนุ่มนวล ไม่ใช่การลงโทษ
- Portrait-first เสมอ ไม่มี layout สำหรับ landscape/desktop (ยกเว้น Facilitator Mode)
- สื่อ/ภาพ/เสียงใดๆ ที่สร้างจาก AI ต้องมี field `ai_disclosure` แสดงผลหลังหน้าเฉลยเสมอ ([นโยบาย](./docs/gdd/00-concept.md#5-นโยบายการนำเสนอเนื้อหาที่สร้างจาก-ai-⚠️))

## Agile / เอกสารโครงการ — วิธีทำงาน

โครงสร้างอยู่ใต้ `docs/agile/`:
- `01-product-backlog.md` — Backlog รวม แบ่ง Must/Should/Nice
- `02-sprint-planning.md` — Roadmap ทั้งโครงการ + Gantt + Risks
- `sprint-backlog/` — ไฟล์ราย Sprint (`sprint-0N.md`), Sprint ที่จบแล้วย้ายไป `sprint-backlog/archives/`
- `user-stories/` — 1 ไฟล์ต่อ 1 US-ID, ที่จบแล้วย้ายไป `user-stories/archives/`

**กติกาเวลาแก้เอกสารเหล่านี้ (สำคัญ เพราะเคยเจอ docs ไม่ตรงโค้ดจริงมาแล้ว):**
1. ห้าม mark `[x]` หรือ Status "Done" โดยไม่ได้ตรวจสอบจริง (เล่นเกม/รันโค้ด) ตรงกับ Acceptance Criteria ก่อน — ถ้าโค้ดมีอยู่แต่ยังไม่ได้ตรวจ ให้ใช้สถานะกลาง (เช่น "🔍 In QA") พร้อมลิงก์ไปยัง sprint ที่ตามงานอยู่ อย่าเดา
2. ทุกครั้งที่ rename/ย้ายไฟล์ sprint หรือ user-story ให้ `grep` หาลิงก์ที่ชี้ไฟล์เดิมทั่ว `docs/` แล้วแก้ให้ครบ — ลิงก์เสียเคยเกิดขึ้นจริงจากการ rename โดยไม่เช็ค
3. บันทึกการเปลี่ยนแปลงเอกสารทุกครั้งใน `docs/changelog.md` (มีรูปแบบเดิมให้ทำตาม — หัวข้อวันที่ + bullet สรุปสิ่งที่เปลี่ยน) และอัปเดต `docs/index.md` ("Current Sprint") ให้ตรงของจริง
4. Sprint/พื้นที่ทำงานปัจจุบันอาจถูกรวม/แยก/เปลี่ยนชื่อได้ตลอด (เช่นเคยมีการรวม "Sprint 01 Reboot" เข้ากับ "Sprint 03" กลายเป็น `sprint-03-polishing.md`) — ก่อนอ้างอิงไฟล์ sprint ใดๆ ให้เช็คว่ายังมีอยู่จริงด้วย `ls`/`Glob` ก่อนเสมอ อย่าเชื่อชื่อไฟล์จากบทสนทนาเก่า

## Git / การจัดการเวอร์ชัน (ข้อบังคับ)

- **ห้ามเขียนประวัติ commit ทับ/ย้อนคอมมิตเด็ดขาด** — ห้ามใช้ `git reset` (ย้อน commit), `git rebase`, `git commit --amend`, `git push --force*` เพื่อ "แก้" งานที่ commit ไปแล้ว **แม้จะยังไม่ push** เพราะทำให้ timeline แตกสาย (diverged) ทั้งที่ควรต่อกัน — **เคยเกิดจริงและสร้างปัญหามาแล้ว**
- **แก้ผิด = แก้ที่โค้ดแล้ว commit ก้อนใหม่ต่อไปข้างหน้าเสมอ** (forward fix / `git revert` ถ้าต้องยกเลิกผลของ commit เก่า) ให้ประวัติเป็นเส้นเดียวต่อเนื่อง
- **คำว่า "ย้อน" จากผู้ใช้ = ย้อน/แก้ "โค้ด" ไม่ใช่ย้อน "git commit"** เว้นแต่ผู้ใช้สั่งเรื่อง git commit ตรง ๆ และชัดเจน
- **ห้าม push / force-push เอง** เว้นแต่ผู้ใช้สั่งชัดเจน; `development` เป็น branch ที่แชร์กับทีม การเขียนทับประวัติกระทบคนอื่น
- commit เมื่อผู้ใช้สั่ง, แยก commit ตามงาน, ปิดท้ายด้วย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

## Deployment / Domain

- Hosting: Vercel (`media-literacy` project) — ดู `.vercel/project.json`
- โดเมนปัจจุบันอยู่ระหว่างเปลี่ยนผ่าน: เดิมวางแผนใช้ subdomain ของสถาบัน/แหล่งทุน (ดู [docs/wiki/dns-setup.md](./docs/wiki/dns-setup.md)) แต่กำลังเสนอเปลี่ยนไปโดเมนที่จำง่ายกว่า — การเปลี่ยนจริงต้อง**รอเจ้าหน้าที่ IT ฝั่งแหล่งทุนยืนยัน** (external dependency ทีม dev คุมเวลาไม่ได้) ระหว่างนี้ให้ตั้ง HTTP redirect จาก URL เดิมของคณะไปยัง URL โปรเจกต์จริงแทน (คนละกระบวนการกับการแก้ DNS)

## Deadline สำคัญที่ต้องระวังเวลาวางแผน

งานอบรม เชียงใหม่ 6–7 ส.ค. 2569 (แข็ง) → แพร่ 17–18 ส.ค. → น่าน 24–25 ส.ค. 2569 — งานที่กระทบการใช้งานจริงหน้างาน (G1–G3, G6, Accessibility, LINE browser) ห้ามเลื่อนเกินกำหนดนี้
