# User Story: US-CF-28 - ใช้คำกลางทั้งแอป: ลบ "วัยเก๋า" ทุกที่ + ตัด ครับ/ค่ะ/คะ ท้ายประโยค

**Status:** ✅ Done (implement 2026-08-05) — sweep ทั้งแอปในไฟล์ live เสร็จแล้ว
**Epic:** [Product Backlog](../01-product-backlog.md) — Client/Internal Feedback (โทนภาษา)
**Owner:** TBD | **Priority:** Medium | **Estimate:** M–L (ข้อความเยอะ)
**Version:** 1.1 | **Last Updated:** 2026-08-05
**Source:** คำสั่งทีม 2026-08-04

---

## ✅ สรุปการ implement (2026-08-05)

- **ส่วน A (วัยเก๋า):** ลบออกจากไฟล์ live ครบ — `layout.tsx`, `AppLayout.tsx` (header+drawer), `consent/page.tsx` (label อายุ), `certificate/page.tsx` (shareText/หัวเกียรติบัตร/ชื่อผู้อำนวยการ) → `grep "วัยเก๋า" src/` (ไม่รวม dead) = **0**
- **ส่วน B (ครับ/ค่ะ/คะ):** ตัดคำลงท้ายในไฟล์ live ครบ — app pages (certificate, facilitator script, summary, lessons, posttest), เกม G1–G11 + QuizScreen, และ data JSON (g4/g7/g8/g9/g10/g11/g13); `นะคะ`→`นะ` (คงคำกลาง)
- **ป้องกัน false positive:** `คะแนน` และ `ฟ้าคะนอง` ไม่ถูกแตะ (ยืนยันด้วย grep); strip เฉพาะ particle ที่ตามด้วย space/เครื่องหมาย/ท้ายบรรทัด จึงไม่โดนคำที่ขึ้นต้นด้วย "คะ" กลางคำ (เช่น คะน้า)
- **ไฟล์ DEAD (ไม่ render) เว้นไว้ตามข้อตกลง AC#1:** `LandingScreen.jsx`, `CertificateScreen.jsx`, `LessonSelector.jsx`, `ConsentScreen.jsx`, `VideoScreen.jsx`, `RewardScreen.jsx`, `G12ChuzzleStop.tsx` + `g12-chuzzle-items.json` (พิจารณาลบทีหลัง)
- **ข้อสังเกต:** บทแชทจำลองของมิจฉาชีพ (chat bubble) ก็ถูกตัด particle ด้วยเพื่อความสม่ำเสมอ (เช่น "สวัสดีครับพี่"→"สวัสดีพี่") — ถ้าต้องการคงความสมจริงของบทสนทนา แจ้งกลับเพื่อ restore เฉพาะจุด
- **Verify:** `tsc --noEmit` ผ่าน, JSON ทุกไฟล์ parse ได้, ไม่มี double-space ในข้อความ

---

## 📖 Description

**ในฐานะ** ทีมโครงการ (และเพื่อความเป็นกลางทางเพศ/วัย)
**ฉันต้องการ** ให้ข้อความทั้งแอปใช้คำกลาง ไม่มีคำว่า "วัยเก๋า" และไม่ลงท้ายด้วย ครับ/ค่ะ/คะ
**เพื่อให้** โทนเป็นทางการ/เป็นกลาง เหมาะกับผู้ใช้ทุกคน

---

## 🎯 สิ่งที่ต้องแก้

### ส่วน A — ลบ "วัยเก๋า" ทุกที่ (19 จุด)
เอาคำว่า "วัยเก๋า" ออกให้หมด ไม่ว่าอยู่ที่ไหน (แอปหลัก/เกม) โดยแก้ตามบริบท:

**ไฟล์ LIVE (ต้องแก้จริง):**
- `src/app/layout.tsx` — `title: "รู้ทันสื่อวัยเก๋า - ..."` → `รู้ทันสื่อ - ...`
- `src/components/AppLayout.tsx` (บรรทัด 167, 202) — header/drawer `รู้ทันสื่อวัยเก๋า` → `รู้ทันสื่อ`
- `src/app/page.tsx` (บรรทัด 46) — badge `สำหรับวัยเก๋า & ผู้สูงอายุ` → `สำหรับผู้สูงอายุ` (หรือคำกลางอื่น)
- `src/app/consent/page.tsx` (บรรทัด 79–81) — label อายุ `(วัยเก๋าตอนต้น/กลาง/ปลาย)` → เอาวงเล็บ "วัยเก๋า…" ออก (เหลือช่วงอายุ) หรือใช้คำกลาง
- `src/app/certificate/page.tsx` (บรรทัด 53, 150, 180) — shareText/หัวเกียรติบัตร `รู้ทันสื่อวัยเก๋า`, `รู้เท่าทันภัยสื่อออนไลน์วัยเก๋า` → ตัด "วัยเก๋า"

**ไฟล์ DEAD (ไม่ render — แก้เพื่อความสะอาด/กัน grep เจอ หรือพิจารณาลบไฟล์ทิ้ง):**
- `LessonSelector.jsx`, `CertificateScreen.jsx`, `ConsentScreen.jsx`, `LandingScreen.jsx`

### ส่วน B — ตัด ครับ/ค่ะ/คะ ท้ายประโยค + ใช้คำกลาง
- ตัดคำลงท้าย **ครับ / ค่ะ / คะ** ท้ายประโยคทุกจุดในข้อความที่ผู้ใช้อ่าน/ได้ยิน
- ปรับประโยคให้ยังลื่น (บางที่ต้องเกลาคำ ไม่ใช่ลบดื้อ ๆ)
- ขอบเขต (จากการสำรวจ): `ครับ` ~66 บรรทัด, `ค่ะ` ~166 บรรทัด, `คะ` (คำลงท้าย/คำถาม) — **ระวัง false positive `คะแนน` 7 จุด ห้ามแตะ**
- ครอบคลุมไฟล์: component เกม (`G1`–`G13`), แอปหลัก, และ **ไฟล์ข้อมูล** `src/data/g*-*.json` (advice/explanation เยอะสุด: g8/g9/g13/g10)

---

## ✅ ขอบเขตที่ยืนยันแล้ว (2026-08-04)

- **ตัด ครับ/ค่ะ/คะ ทุกที่** — ครอบคลุม **UI บนจอ + เสียงอ่าน TTS** (`speakerText`, `speakerSummary`, `advice`) **+ ไฟล์ข้อมูลเกม `src/data/*.json`** (รับว่าเสียง TTS อาจห้วนขึ้นได้)
- เลี่ยง false positive: `คะแนน` และคำที่มี "คะ/ค่ะ" ที่ไม่ใช่คำลงท้าย ต้องไม่ถูกแตะ (แก้ทีละจุด ไม่ใช้ regex ลบดื้อ)

---

## ✅ Acceptance Criteria

1. [x] `grep -rn "วัยเก๋า" src/` = 0 จุด (เหลือเฉพาะไฟล์ dead ที่ตกลงว่าจะลบทีหลัง)
2. [x] ไม่มีคำลงท้าย ครับ/ค่ะ/คะ ในข้อความที่ผู้ใช้อ่าน (ตามขอบเขตที่ยืนยัน) — `คะแนน`/`ฟ้าคะนอง` ไม่ถูกแตะ
3. [x] ประโยคยังอ่านลื่น เป็นกลาง (`นะคะ`→`นะ` คงความนุ่มนวลแบบคำกลาง)
4. [x] `tsc` ผ่าน, JSON ทุกไฟล์ valid, ไม่มี string เพี้ยน/double-space
5. [ ] browser QA จุดสำคัญ (header, consent, certificate, เฉลยเกม) — รอทดสอบบนเบราว์เซอร์

---

## 🛠 Technical Tasks

- [ ] ส่วน A: แก้ "วัยเก๋า" ในไฟล์ live 5 ไฟล์ (+ พิจารณา dead files)
- [ ] ส่วน B: sweep ครับ/ค่ะ/คะ ทีละไฟล์ (ไม่ใช้ regex ลบดื้อ ๆ เพราะ false positive) — ตามขอบเขตที่ยืนยัน
- [ ] verify `grep` วัยเก๋า = 0 + ตรวจ คะแนน ไม่โดนแตะ
- [ ] `tsc`/lint/JSON valid + browser QA

---

## 🔗 Related

- แอปหลัก: `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/AppLayout.tsx`
- consent/certificate: `src/app/consent/page.tsx`, `src/app/certificate/page.tsx`
- เกม + `src/data/g*-*.json`
- โทนภาษา (GDD): [gdd/02-narrative.md](../../gdd/02-narrative.md) — "อบอุ่น ให้เกียรติ"
