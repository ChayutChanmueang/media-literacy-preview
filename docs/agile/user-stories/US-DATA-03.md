# User Story: US-DATA-03 - เก็บผลแบบทดสอบก่อน/หลังเรียน (โหมดวิจัย) ขึ้นฐานข้อมูล

**Version:** 1.0 | **Last Updated:** 2026-10-28
**Status:** 🔍 In QA — schema + backend + frontend เสร็จ (2026-10-28, ดู [10 — Backend + คู่มือ Frontend](../../software/10-research-pre-post-backend.md)); E2E ผ่านบน build โหมดวิจัย (mock API) — ⏳ ตรวจ Acceptance Criteria บน deployment โหมดวิจัยที่ต่อ DB `100.75.146.233` + Task-20
**Sprint:** [Sprint 06](../sprint-backlog/sprint-06.md)
**Priority:** Should (ภายใน ต.ค. 2569) — ข้อมูลหลักของงานวิจัย (`APP_MODE=research`)
**Estimate:** L
**Spec:** [09 — สเปกการเก็บข้อมูลแบบทดสอบก่อน/หลังเรียน (โหมดวิจัย)](../../software/09-research-pre-post-data-collection.md)

---

## 📖 Description
**ในฐานะ** ทีมวิจัย
**ฉันต้องการ** ให้คำตอบแบบทดสอบก่อน/หลังเรียน (self-assessment 12 ข้อ Likert 1–5) ทุกชุดถูกบันทึกลงตารางเฉพาะในฐานข้อมูล โดยไม่หาย ไม่ซ้ำ และจับคู่ pre ↔ post ของคนเดียวกันได้
**เพื่อให้** วิเคราะห์ผลก่อน/หลังเรียนได้จากข้อมูลที่เชื่อถือได้ แทนการแกะจาก `action_logs` ซึ่งทิ้งข้อมูลได้เมื่อคิวออฟไลน์เต็ม ส่งซ้ำได้ และเวลาเพี้ยน (สเปกข้อ 1.3)

---

## ✅ Acceptance Criteria
อ้างอิง [สเปกข้อ 11](../../software/09-research-pre-post-data-collection.md#11-เกณฑ์ตรวจรับ-acceptance-criteria)

1. [ ] ทำ pre-test ใน deployment `APP_MODE=research` → ภายใน 5 วินาที (มีเน็ต) มี 1 แถว `phase='pre'` ใน `self_assessment_submissions` และ 12 แถวใน `self_assessment_answers` ที่ `value` ตรงกับที่ตอบ และ `shown_position` ตรงกับลำดับบนจอ
2. [ ] ปิดเน็ตก่อนกดส่ง → ไปหน้าถัดไปได้ปกติไม่มีหน้าจอรอ; เปิดเน็ต (หรือเปิดแอปใหม่) → แถวขึ้น DB โดย `submitted_at` เป็นเวลาที่กดส่งจริง
3. [ ] ส่ง request เดิมซ้ำ (`submission_uuid` เดียวกัน) → ยังมีแถวเดียว และ client เอาออกจากคิว
4. [ ] ทำครบ pre → เรียน → post → export `--shape=wide` ได้ 1 แถวที่ `has_pair = true`
5. [ ] ใช้ปุ่ม dev skip → แถวมี `is_dev_skip = true` และไม่อยู่ในผล export ค่าเริ่มต้น
6. [ ] รัน backfill 2 ครั้ง → จำนวนแถว `source='backfill'` เท่าเดิม
7. [ ] ทุกแถวใน `self_assessment_answers` ระบุ `item_id` เป็นรหัสข้อ และ `shown_position` ตรงกับลำดับที่แสดงจริง
8. [ ] โหมดวิจัย: ส่ง pre แล้วเปิด `/self-assessment/pre` อีกครั้ง → ไป `/lessons` และ DB ยังมี pre แถวเดียว; ยิง API ด้วย `submission_uuid` ใหม่ของ session เดิม → `200 { duplicate: true }`
9. [ ] โหมดวิจัย: ส่ง post แล้วเปิด `/self-assessment/post` อีกครั้ง หรือเล่น Flow จบอีกรอบ → ไป `/lessons/complete` โดยไม่เห็นหน้าแบบทดสอบ และ DB ยังมี post แถวเดียว
10. [ ] โหมดวิจัย: เมนูไม่มีปุ่ม reset และไม่มีเส้นทางใดพาไป `/pretest` / `/posttest`
11. [ ] ตารางและ view วิเคราะห์อ่านผ่าน REST API ด้วย anon key ไม่ได้ (ดู Task-DATA03-01)

---

## 🛠 Technical Tasks

### 0. ตัดสินใจก่อนเริ่ม
- [x] **Task-DATA03-00a** ✅ 2026-10-28 — ออกแบบ schema ใหม่: ใช้ `sessions` + `action_logs` เดิม และเพิ่ม `self_assessment_item_sets` / `self_assessment_items` / `self_assessment_submissions` / `self_assessment_answers` + view 3 ตัว (สเปกข้อ 5)
- [x] **Task-DATA03-00b** ✅ 2026-10-28 — แก้ `docs/supabase-schema.sql` ให้ตรง DB จริง (ลำดับคอลัมน์, ไม่มี `ON DELETE CASCADE`, ไม่มี `UNIQUE (session_id, test_type)` / `game_id.name UNIQUE`, ไม่มี index `idx_*`, RLS ทุกตาราง) — เทียบโครงสร้างแล้วตรงกับทั้ง `100.75.146.233` และ `100.75.225.202` ทุกคอลัมน์/constraint/index/RLS
- [x] **Task-DATA03-00c** ✅ 2026-10-28 — ทีมเลือก `100.75.146.233` เป็น DB ที่สร้างตาราง (เครื่องเดียวที่มีคำตอบ self-assessment); Supabase หลัก (cloud) และ `100.75.225.202` ยังไม่แตะ
- [x] **Task-DATA03-00d** ✅ 2026-10-28 — ใช้ข้อความ consent และแนวทางเข้าถึงข้อมูลเดิม; เพิ่มรายการข้อมูลส่วนบุคคลที่ระบบเก็บใน [03 — Data Schema](../../software/03-data-schema.md#ข้อมูลส่วนบุคคลเก็บที่ไหนบ้าง-personal-data-inventory)
- [x] **Task-DATA03-00e** ✅ 2026-10-28 — รอบนี้ทำเฉพาะระบบ pre-test / post-test; ข้อมูลเกมคงอยู่ใน `action_logs` / `lesson_progress` ตามเดิม

### 1. ฐานข้อมูล (สเปกข้อ 5)
- [x] **Task-DATA03-01** ✅ 2026-10-28 — DDL + seed `sa-v1` ต่อท้าย `docs/supabase-schema.sql` และแก้สเปกข้อ 5–6 ตามการออกแบบใหม่: คำตอบ 1 แถวต่อข้อ (CHECK 1–5, FK รหัสข้อ + item set), `shown_position` แทน `item_order`, FK `sessions` เป็น `RESTRICT`, `source_log_id` สำหรับ backfill, view ทุกตัว `security_invoker` + REVOKE — ทดสอบกับ PGlite 22 กรณีผ่าน
- [x] **Task-DATA03-02** สร้างตารางบน DB โหมดวิจัย — ✅ `100.75.146.233` สร้างแล้ว 2026-10-28 (ผ่าน MCP); ✅ `scripts/migrate-self-assessment.cjs` (2026-10-28) สำหรับ DB อื่น — ต้องได้รับอนุญาตก่อนแก้ DB ทุกครั้ง
- [x] **Task-DATA03-03** ✅ 2026-10-28 — เพิ่มตาราง `self_assessment_*` ใน [03 — Data Schema](../../software/03-data-schema.md)

### 2. Server (สเปกข้อ 6)
- [x] **Task-DATA03-04** `selfAssessmentSubmissionSchema` ใน `src/lib/validations.ts` — ✅ 2026-10-28
- [x] **Task-DATA03-05** `SELF_ASSESSMENT_ITEM_SET` + map item set → รายการ id ใน `src/lib/selfAssessmentPhase.ts` — ✅ 2026-10-28
- [x] **Task-DATA03-06** แยก `ensureSessionRow()` ไป `src/lib/sessionRows.ts` ให้ `action-logs`, `page-views` และ route ใหม่ใช้ตัวเดียวกัน — ✅ 2026-10-28
- [x] **Task-DATA03-07** `src/app/api/self-assessment/route.ts` — validate, ตรวจชุดข้อครบ, transaction เดียว: `INSERT` submission `ON CONFLICT DO NOTHING` แล้ว `INSERT` คำตอบ 12 แถว, 201 / 200 duplicate / 400 / 500 — ✅ 2026-10-28

### 3. Client (สเปกข้อ 7)
- [x] **Task-DATA03-08** `apiClient.saveSelfAssessment()` — ✅ 2026-10-28
- [x] **Task-DATA03-09** `src/services/selfAssessmentService.ts` + field `selfAssessmentPending` / `selfAssessmentRejected` ใน `UserProgress` (คิวไม่ทิ้งข้อมูล, เพดาน cookie 3 ตัว) — ✅ 2026-10-28 (คิวใน key แยก `naplab_ml_sa_pending` แทน field ใน `UserProgress` — เหตุผลใน [10 ข้อ 3](../../software/10-research-pre-post-backend.md#3-client-data-layer--selfassessmentservice))
- [x] **Task-DATA03-10** ✅ 2026-10-28 _(frontend — [10 ข้อ 9.1](../../software/10-research-pre-post-backend.md#91-srccomponentsapplayouttsx-task-10-task-13))_ เรียก `syncPending()` ตอน mount ใน `AppLayout.tsx` + listener `online` + กัน `resetAll()` ทิ้งคิว
- [x] **Task-DATA03-11** ✅ 2026-10-28 _(frontend)_ แก้หน้า `questions`: `startedAt`, เรียก `submit()` แบบไม่ await, dev skip ส่ง `isDevSkip`, เพิ่ม `submission_uuid`/`is_dev_skip` ใน event `self_assessment_submitted`
- [x] **Task-DATA03-12** ✅ 2026-10-28 _(frontend)_ ทำได้อย่างละครั้ง: `hasCompletedAssessment()` + guard ที่หน้า consent, จบ Flow ในหน้าเกม, หน้า intro/questions (สเปกข้อ 7.5) — ใช้ `selfAssessmentService.hasCompleted()` + hook `src/lib/useSelfAssessmentDoneGuard.ts` (หน้า intro/questions)
- [x] **Task-DATA03-13** ✅ 2026-10-28 _(frontend)_ ซ่อนปุ่ม reset ในโหมดวิจัย (สเปกข้อ 7.6)
- [x] **Task-DATA03-14** ✅ 2026-10-28 _(frontend)_ ตัดเส้นทางปรนัยเก่า: branch `isTestingGroup` ใน `self-assessment/[phase]/complete/page.tsx` + ข้าม guard ใน `src/proxy.ts` เมื่อโหมดวิจัย (สเปกข้อ 7.7)

### 4. สคริปต์ (สเปกข้อ 8)
- [x] **Task-DATA03-15** ✅ 2026-10-28 — สคริปต์ `scripts/backfill-self-assessment.cjs` (dry run เป็นค่าเริ่มต้น, `--apply` เพื่อเขียน) และ backfill บน `100.75.146.233` แล้ว: 5 ชุด / 60 คำตอบ, ตัดซ้ำ 0, dev skip 0, ข้าม 0; มี 1 session ทำ post ซ้ำ (view `self_assessment_primary` ใช้ครั้งแรก) — รันผ่าน MCP ด้วย SQL ที่สร้างจาก `buildBackfillRows()` ตัวเดียวกับสคริปต์
- [x] **Task-DATA03-16** `scripts/export-self-assessment.cjs` (`--shape=long|wide`, `--include-dev-skip`, `--all-attempts`) — ติดธงแถวที่ `sessions.age_range = 'unknown'` — ✅ 2026-10-28 (+ `--shape=items`, คอลัมน์ `demographics_unknown`)

### 5. Test
- [x] **Task-DATA03-17** Unit — schema (ค่า 1–5, ขาด/เกินข้อ, key ไม่ใช่รหัสข้อ, uuid ผิด) และลำดับสลับแล้วคำตอบยังผูกรหัสข้อถูก — ✅ 2026-10-28 (`src/tests/unit/self-assessment-*.test.ts`)
- [x] **Task-DATA03-18** Unit — service: ล้มเหลวอยู่ในคิว, 201/duplicate ออกจากคิว, 400 ย้ายไป rejected, sync ซ้อนไม่ส่งซ้ำ — ✅ 2026-10-28 (`src/tests/unit/self-assessment-*.test.ts`)
- [x] **Task-DATA03-19** ✅ 2026-10-28 _(frontend)_ E2E — ส่งแล้วดัก `POST /api/self-assessment`, offline → online, guard ทำครั้งเดียว, ไม่มีปุ่ม reset, `isTestingGroup` ค้างไม่ถูกพาไป `/pretest` — `src/tests/e2e/self-assessment.spec.ts` (7 เคส ต้องรันกับ server `APP_MODE=research`, ข้ามเองบนโหมดปกติ; ผ่าน 105/105 รอบ บน `next start` + mock API)

### 6. เอกสาร
- [ ] **Task-DATA03-20** อัปเดต [04 — Application Flow](../../software/04-application-flow.md), ระบุ [06-quiz-spec.md](../../gdd/06-quiz-spec.md) เป็น legacy, เปลี่ยนสถานะสเปก 09 เป็น 🟢 + บันทึก `docs/changelog.md`

---

## 🔗 Related Files
- Spec: [docs/software/09-research-pre-post-data-collection.md](../../software/09-research-pre-post-data-collection.md)
- Schema: [docs/supabase-schema.sql](../../supabase-schema.sql)
- หน้าแบบทดสอบ: `src/app/self-assessment/[phase]/`, ข้อคำถาม `src/data/self-assessment-items.json`
- Pattern ต้นแบบ: `src/app/api/game-results/route.ts` (กันส่งซ้ำด้วย uuid), `scripts/export-action-logs.cjs`
