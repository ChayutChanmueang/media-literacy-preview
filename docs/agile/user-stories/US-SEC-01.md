# User Story: US-SEC-01 - อุดช่องความปลอดภัย (Secret หลุด / API ไม่มี Auth / Quiz เชื่อ Client)

**Status:** 🔥 Hotfix In Progress — `.env.example`/`gitignore` แก้แล้ว (2026-07-27), ⏳ รอ rotate รหัสจริง + ทำ auth/quiz-integrity ต่อ
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.0 | **Last Updated:** 2026-07-27

> พบระหว่างรีวิวโค้ด 2026-07-27 — จัดลำดับ: **Hotfix ด่วนก่อน 6 ส.ค.** สำหรับ secret + analytics endpoint, ส่วนที่เหลือทำใน Sprint 08

---

## 📖 Description
**ในฐานะ** ทีมโครงการที่เก็บข้อมูลผู้สูงอายุจริงและข้อมูลวิจัย pre/post-test
**ฉันต้องการ** ปิดช่องที่ทำให้ credential รั่ว, API ถูกยิงได้อิสระ, และผลแบบทดสอบถูกปลอมจากฝั่ง client
**เพื่อให้** ข้อมูลผู้เข้าร่วมปลอดภัยและผลวิจัยเชื่อถือได้

---

## ✅ Acceptance Criteria

### 🔥 Hotfix (ทำทันที ก่อน 6 ส.ค. — นอกกรอบ timeline Sprint 08)
1. [~] **Rotate credential ที่หลุด** — `.env.example` แทนที่ด้วย placeholder แล้ว (2026-07-27) + แก้ `.gitignore` ให้ `!.env.example` มีผลจริง ✅ | ⏳ **ยังค้าง: ต้อง rotate รหัสจริงใน Supabase dashboard** (dev action) เพราะรหัสเดิมถูกเปิดใน git history ไปแล้ว
2. [ ] `GET /api/action-logs` (analytics รวมทั้งหมด) ต้อง **ไม่เปิดสาธารณะ** — ใส่ auth/secret header หรือปิด public access
3. [ ] `/facilitator` ไม่ควรเปิดสาธารณะเต็มที่ (ประเมิน gate เหมือน `/dev/games`)

### 🏗 Sprint 08
4. [ ] **Quiz integrity** — server คำนวณ `is_correct`/`score` เองจาก `quiz_options.is_correct` ใน DB; ไม่เชื่อค่าที่ client ส่งมาใน `/api/quiz-answers` และ `/api/quiz-attempts`
5. [ ] `GET /api/quiz-questions` ต้อง **ไม่ส่งเฉลย** (`is_correct`) ไปฝั่ง client — เลือกเฉพาะ `id, option_text` (ปัจจุบัน `SELECT *`)
6. [ ] ใช้ Zod schema ที่มีอยู่ (`src/lib/validations.ts`) validate body ทุก POST route ก่อน insert (ปัจจุบัน route รับ field ดิบ)
7. [ ] Error response ไม่ leak `error.message` ภายในให้ client (ปัจจุบันทุก route ส่ง `details: error.message`)

---

## 🛠 Technical Tasks
- [ ] Rotate Supabase DB password + publishable/anon key; อัปเดตค่าใน Vercel/Portainer env จริง
- [ ] แก้ `.env.example` เป็น placeholder; แก้ `.gitignore` (บรรทัด `.env*` ท้ายไฟล์ override `!.env.example` — ย้าย negation ไว้ล่างสุด) — ดู [US-DEBT-01](./US-DEBT-01.md)
- [ ] เพิ่ม auth guard ให้ `src/app/api/action-logs/route.ts` (GET) — เช่น ตรวจ secret header/basic auth สำหรับ dashboard ทีม
- [ ] เขียน server-side scoring: join `quiz_answers.selected_option_id` → `quiz_options.is_correct` ใน `src/app/api/quiz-answers/route.ts` + `quiz-attempts`
- [ ] จำกัดคอลัมน์ใน `quiz-questions` (ตัด `is_correct` ออกจาก payload ฝั่ง client)
- [ ] wire Zod (`onboardingSchema`, `quizSubmissionSchema`, ฯลฯ) ในทุก route handler
- [ ] เปลี่ยน error response เป็นข้อความ generic + log ฝั่ง server เท่านั้น

---

## 🔗 Related Files
- `src/app/api/**/route.ts` (ทุก route), `src/lib/database.ts`, `src/lib/supabase.ts`, `src/lib/analytics.ts`, `src/lib/validations.ts`
- `.env.example`, `.gitignore`, `docs/supabase-schema.sql`
- หมายเหตุ: SQL ทุก query parameterized แล้ว (ไม่มีช่อง injection) — จุดเสี่ยงคือ auth + trust boundary
