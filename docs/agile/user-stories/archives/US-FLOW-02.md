# User Story: US-FLOW-02 - รื้อระบบนับ Progress ให้เดินหน้าตามลำดับจริง (ไม่ค้าง/ไม่ถอยหลัง)

**Status:** 🟢 Done (code) 2026-08-03 — progress bar flow-aware (monotonic ไม่ถอยหลัง) + ขยับต่อโจทย์ผ่าน event จากเกม; `tsc`/unit ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — ต่อยอดจาก [US-FLOW-01](./US-FLOW-01.md) (video-first)
**Owner:** TBD
**Priority:** High
**Estimate:** M
**Version:** 1.1 | **Last Updated:** 2026-08-03
**Source:** คำสั่งทีม 2026-08-03 (พบตอนทดสอบ progress bar)

---

## 📖 Description

**ในฐานะ** ผู้เรียน (ผู้สูงอายุ)
**ฉันต้องการ** ให้แถบความคืบหน้า (progress bar) ขยับเพิ่มขึ้นเรื่อย ๆ เมื่อเดินหน้าไปโจทย์/สเตปถัดไป
**เพื่อให้** เห็นว่ากำลังคืบหน้าอยู่จริง ไม่ใช่ค้างที่เดิม และไม่สับสนเมื่อแถบถอยหลัง

---

## 🐞 ปัญหาปัจจุบัน

ระบบใน `AppLayout.getProgressPercentage()` คิด % จาก **route (pathname) อย่างเดียว**:
`["/", "/consent", "/pretest", "/lessons", "video", "game", "summary", "/posttest", "/certificate"]` → `((idx+1)/9)*100`

1. **ค้างระหว่างเล่นเกม** — พออยู่ที่ `/game` จะ fix ที่ idx 5 (~66.6%) ตลอด ไม่ขยับตามโจทย์ที่เล่นไปเรื่อย ๆ ในเกม (เช่น G1 มี 5 ข้อ แต่แถบไม่ขยับเลย); เพิ่มทีเดียวตอนจบเกม
2. **ถอยหลัง (bug)** — หลัง [US-FLOW-01](./US-FLOW-01.md) เป็น video-first สาย Flow คือ `คลิป→เกม→คลิปบทถัดไป→เกม→…`
   แต่ path-based ให้ `video`=idx4 (~55.6%), `game`=idx5 (~66.6%) → พอจบเกมบทหนึ่งแล้วไป "คลิปบทถัดไป" แถบจะ **ลดจาก 66.6% กลับไป 55.6%** (ถอยหลัง) แทนที่จะเดินหน้า

---

## 🎯 พฤติกรรมที่ต้องการ

- Progress **เดินหน้าอย่างเดียว (monotonic)** ตลอดสาย Flow — ไม่ถอยหลังเมื่อสลับ เกม→คลิปบทถัดไป
- ขยับ **เมื่อไปสเตป/โจทย์ถัดไป** ไม่ใช่กระโดดทีเดียวตอนจบเกม (อย่างน้อยระดับสเตป; ระดับ per-question เป็น bonus)
- ไปถึง ~100% เมื่อจบสาย (G13 → Start Menu) และคงพฤติกรรมที่เหมาะสมกับ Manual ด้วย

---

## ✅ Acceptance Criteria

1. [x] แถบ progress เดินหน้าตาม **flow position** ผ่าน `FLOW_STEP_ORDER` (video/game × topic-1/3/6 + g13) ไม่ใช่ route ล้วน
2. [x] **ไม่ถอยหลัง** — ค่ายืนยัน monotonic: video-t1 22→33, game-t1 33→44, …, game-t6 78→89, g13 89→100 (game→คลิปบทถัดไปเพิ่มขึ้นเสมอ)
3. [x] ขยับต่อสเตป + **ต่อโจทย์** — G1/G3/G6 ยิง event `flowStepProgress` (currentIdx/total), G13 ตามเวลา (timer) → interpolate ในสไลซ์ของสเตป
4. [x] ถึง ~100% ตอนจบ G13 (สไลซ์ 89→100 ไต่ตาม timer); Manual: คลิป < เกม(+ต่อโจทย์) < สรุป ไม่พัง
5. [x] onboarding: `/`=5, consent=10, pretest=15, lessons=20 ต่อเนื่องเข้าช่วง flow (22%+)

---

## 🛠 สิ่งที่ทำ (implementation)

- **`AppLayout.tsx`**: เพิ่ม `FLOW_STEP_ORDER` (7 สเตป) + `flowStepIndex()`; `getProgressPercentage` คิดจาก flow position + `stepFraction` — สาย flow ใช้ base ตาม index (จึง monotonic ไม่ต้องใช้ max-guard); onboarding/certificate เป็นค่าคงที่
- **event bridge** (ไม่ต้อง prop threading): เกมยิง `window` CustomEvent `flowStepProgress` (0..1) เมื่อไปโจทย์ถัดไป; AppLayout ฟังแล้ว `setStepFraction`, และรีเซ็ตเป็น 0 เมื่อเปลี่ยน pathname
- **`G1FactCheck.jsx` / `G3AIOrNot.jsx` / `G6LineSimulation.jsx`**: `useEffect([currentIdx])` ยิง `currentIdx / total`
- **`G13ScoopStacker.tsx`**: `useEffect([timeLeft])` ยิง `(120 - timeLeft) / 120` → สเตปปิดท้ายไต่ถึง ~100%
- อ่าน `currentLessonId`/`learningMode` เข้า state `flowMeta` ใน effect (SSR-safe — ไม่อ่าน storage ตอน render)

## 📝 ตามต่อ / หมายเหตุ

- ปุ่มกลับ Start Menu หลังจบ G13 (US-CF-06) ทำให้แถบรีเซ็ตจาก ~100% → 20% ที่ `/lessons` — เป็นพฤติกรรมที่ตั้งใจ (กลับเมนูเพื่อเริ่มใหม่)

---

## 🔗 Related Files / Docs

- โค้ด: `src/components/AppLayout.tsx` (`getProgressPercentage`), `src/lib/flow.ts`, `progressService`
- ต้นเหตุ video-first: [US-FLOW-01](./US-FLOW-01.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
</content>
