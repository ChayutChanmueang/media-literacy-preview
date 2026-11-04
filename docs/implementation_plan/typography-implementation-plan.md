# แผนนำระบบตัวอักษรหลักไปใช้ในโค้ด (Typography Implementation Plan)

**สถานะ:** ✅ เสร็จ (ยกเว้น G14) — S0 `476af66`, S1 `ff65e22`, S2 `46b189a`, S3 `9ebb55e`, S4 `92d6504`…`170dd66`, S5 `c1cd87e` (G14 เลื่อนไป — ยังเป็น legacy), S6 `5280b68` | **ค้างอยู่:** G14 (เมื่อจะเปิดใช้), ทดสอบบนมือถือจริงใน LINE, ลบปุ่มสลับโหมด DEV (`e95887a`) เมื่อทดสอบเสร็จ | **วันที่:** 2026-11-04 | **Branch:** `development` (`ed4bbfc`, v0.26.2)
**สเปกต้นทาง:** [docs/wiki/design/07-typography.md](../wiki/design/07-typography.md) (Figma `1055:615`) — Noto Looped Thai, 10 text styles, Mali เหลือเฉพาะข้อความ stage popup, มาก่อนกติกาขนาดตัวอักษรเดิมใน `AGENT.md`
**ขอบเขต:** ทุกหน้าใน `src/app/**`, ส่วนประกอบใช้ร่วม, เกม G1–G20K และ G14 (iframe `public/games/goosl-marbles/`)

---

## 0. ความคืบหน้า

- **S0 (`476af66`)** — ตามแผน; ตรวจในเบราว์เซอร์แล้ว G2, G4, G5, G7, G9–G11 (เดิมเป็นฟอนต์ระบบ) แสดง Noto ครบ; `src/tests/unit/typography.test.ts` 28 tests ตรวจค่า token/utility กับ Figma
- **S1 (`ff65e22`)** — ส่วนประกอบใช้ร่วม**ตรงกับ Figma อยู่แล้วเกือบทั้งหมด** หน้าแนะนำเกม (G1, G13, G16, G18, G19) วัดขนาด/น้ำหนักที่ render ได้**เท่าเดิมทุกจุด**; ที่เปลี่ยนจริงมีจุดเดียว: ตัวหนังสือ `Button3D` แบบ secondary 22px Bold → Button 20px SemiBold
- **เพิ่มกฎ:** ถ้าค่าเดิมตรงกับ style ใด style หนึ่งพอดี (ขนาด + line height + น้ำหนัก) ให้ใช้ style นั้นแม้บทบาทจะต่างจากชื่อ style (เช่น ปุ่มหลัก `Button3D` 28/36 Bold = H2, ป้ายหัวด่าน 20/30 SemiBold = Button) — ค่าเหล่านี้มาจาก Figma อยู่แล้ว; ใช้ตารางหัวข้อ 3 เฉพาะค่าที่ไม่ตรง
- **จุดให้ดีไซเนอร์ดู (D6) เลื่อนไป** — S1 ไม่ได้เปลี่ยนหน้าตา จึงยังไม่เห็นผล "เนื้อหา bold → Regular" ให้ดีไซเนอร์ดูหลังทำเกมแรกของ S3 แทน
- **ปุ่มสลับโหมด DEV (`e95887a`)** — นำกลับมาชั่วคราวตามที่ขอ เพื่อทดสอบทั้งโหมดปกติ/วิจัย: cookie `naplab_ml_dev_app_mode` override `APP_MODE` ทั้งใน layout และ `proxy.ts` (เฉพาะ dev build) — ลบออกเมื่อทดสอบเสร็จ
- **S2 (`46b189a`)** — หน้าที่สร้างจาก Figma วัดขนาดที่ render ได้**เท่าเดิม** (หน้าแรก, ลงทะเบียน, เลือกบทเรียน, กระดานคะแนน, แบบประเมินตนเอง) ที่เปลี่ยนจริง: เมนูข้าง 17px Bold → Button, ชื่อแอปบนแถบหัว/เมนู → H3, เลขเวอร์ชัน 15px → Small Text, ข้อความโหลดไม่สำเร็จของกระดานคะแนน → H3/Body, และหน้าเก่า (แบบทดสอบก่อน/หลังเรียน `QuizScreen`, หน้าใบประกาศ) ย้ายจากขนาด Tailwind มาเป็น style
  - กฎใน `globals.css` (`h1`, `h2`, `.btn`, `.option-item`, `.select-input`, `.text-lead`, `.text-small-legacy`) อ่านค่าจาก token แล้ว — อยู่ใน `@layer components` จึงแพ้ utility `text-*` ที่ใส่บน element เสมอ; ขนาดฐานของ `:root`/`body` (`--font-size-base`) **ยังไม่แตะ** เพราะเป็นฐานของหน่วย `rem` — ทำพร้อมการลบ `data-size` ใน S5
  - **ข้อยกเว้นใช้ attribute `data-type-exempt="<เหตุผล>"`** บน element (ไม่ใช่คอมเมนต์ — JSX ใส่คอมเมนต์บรรทัดเดียวกับ class ไม่ได้ และ Playwright ใน S6 ตรวจ attribute ได้ตรงๆ); ที่ใส่แล้ว: เหรียญอันดับ (emoji), ปุ่มสเกล 1–5 ของแบบประเมินตนเอง (ขนาดตามความกว้างแถว `cqw` จาก Figma), ไอคอน/ตัวเลขคะแนนใหญ่ใน `QuizScreen`, **กรอบใบประกาศทั้งกรอบ** (วาดเหมือนใบประกาศจริง — ข้อยกเว้นประเภทใหม่ ไม่อยู่ใน D3 ให้ทีมยืนยัน)
  - **นอกขอบเขต (S2):** `src/app/facilitator/**` (โหมดฉายจอโปรเจกเตอร์ ไม่ใช่หน้าจอมือถือของผู้สูงอายุ) และคอมโพเนนต์เก่าที่ไม่มีหน้าใดใช้แล้ว (`LandingScreen`, `LessonSelector`, `CertificateScreen`, `VideoScreen`, `RewardScreen`, `ConsentScreen`) — ไม่แก้ และ test S6 ต้องข้ามไฟล์เหล่านี้ (หรือลบไฟล์ทิ้งแยกต่างหาก)
- **S3 (`9ebb55e`)** — G13, G15–G20K ใช้ `gp-type-*`; หน้าสรุปผลตรงกับ H1/H3 เท่าเดิม; **ที่เปลี่ยนให้เห็นครั้งแรก (D6):** กล่องคำแนะนำระหว่างเล่น (22px Bold) และบรรทัด "สถิติดีที่สุด" (22px SemiBold) → Body Large (Regular) ใน G13, G18, G19, G20, G20K — วัดใน browser แล้วเปลี่ยนเฉพาะจุดเหล่านี้; ป๊อปอัปคะแนนบน canvas ของ G13 → H3 (SemiBold แทน Bold), ป้ายบน canvas ของ G17 → Button (20px แทน 22px); `fun-game-viewport.spec.ts` ผ่าน 25/25
  - G20/G20K: ข้อความจบเกมที่เขียนซ้ำ → ใช้ `StagePopup` แล้ว (หน้าตา/จังหวะเดิม) — Mali เหลือ import ที่ `StagePopup.tsx` ไฟล์เดียว
  - **G19 ข้อความบนกระดาน** ("ไม่มีคู่ให้สลับ", "เก่งมาก! 🎉") หน้าตาแบบ stage popup (ขาวขอบน้ำตาล) แต่เป็น **Noto ไม่ใช่ Mali** มาตั้งแต่ก่อนแผนนี้ — คงไว้ตามเดิม ใส่ `data-type-exempt` เฉพาะขนาด; ถ้าทีมอยากให้เหมือน G13/G18/G20 ให้เปลี่ยนไปใช้ `StagePopup` (จะกลายเป็น Mali)
  - **ดีไซเนอร์ดูแล้ว (D6) — ผ่าน** ทั้ง Regular ในกล่องคำแนะนำ และ G19 คงไว้แบบเดิม
- **S4** — commit ละเกม: G9 `92d6504`, G5 `ae3deb6`, G10 `97ec94c`, G7 `80b8235`, G4 `aedaf60`, G2 `3606a1f`, G8 `1d8f5a2`, G11 `66954d0`, G6 `c31f14c`, ปุ่ม/ตัวดูรูปที่ใช้ร่วม `170dd66`
  - ใช้กฎเดียวกันทุกเกม (สคริปต์เสนอ + ตรวจทีละบรรทัด): emoji/ไอคอน → exempt, ปุ่ม → Button, หัวข้อตัวหนา → H1/H2/H3 ตามขนาด max ของ `clamp()`, ป้าย/ชื่อตัวหนา → Button, ข้อความปกติ → Body (max ≥ 17px) หรือ Caption; root ของทุกเกมใส่ `gp-compact`
  - ตรวจใน browser ทุกเกมที่ 360×640 และ 388×844: ไม่ล้นแนวนอน ไม่มีข้อความถูกตัดในกล่อง — ข้อความที่เคยเล็ก 8–13px ตอนนี้ ≥ 18px (บนจอเตี้ยย่อตาม `--gp-t` ไม่ต่ำกว่า 18px)
  - **ผลที่เห็นได้:** เนื้อหาบางจอยาวขึ้นจนต้องเลื่อน (G9 โพสต์, G11 การ์ดแนะนำ — การ์ดเลื่อนได้อยู่แล้ว); แถวหัวเกม 2 ป้ายตัดเป็น 2 บรรทัด (G8, G10); การ์ดแพของ G8 เห็นข้อความตัวอย่าง 1 บรรทัดแทน 2 (เปิดอ่านเต็มได้เหมือนเดิม)
  - **ป้ายที่เป็นคำใบ้ต้องอ่านได้ ไม่ exempt:** "ได้รับการสนับสนุน" ในโพสต์ G9 และชื่อแอปบนหน้าจอโทรศัพท์จำลอง G10 → Caption; ที่ exempt เป็นของตกแต่งจริง: เวลา/ยอดถูกใจ/ปุ่มถูกใจ-แชร์ในโพสต์จำลอง G9, ป้ายบนเส้นขอบเขตของ G5, ป้าย "แตะ" ในวงกลม 32px ของ G5, ตัวเลขในวงกลม 26px ของ G6
  - **นอกขอบเขต (S4):** G12 (`G12ChuzzleStop` ไม่มีที่ใดใช้), GP1/GP2/GP5 (ต้นแบบใน dev hub เท่านั้น); G1/G3 ไม่มีขนาดตั้งเอง ใช้ส่วนประกอบจาก S1 ทั้งหมด
  - `journey.spec.ts` ไม่ผ่านบน dev server ปกติ เพราะคาดหวังโหมดวิจัย (ไม่เกี่ยวกับแผนนี้) — รันซ้ำโดยตั้งโหมดวิจัยด้วย cookie DEV ผ่าน 3/3

## 1. สภาพปัจจุบัน (ตรวจ 2026-11-04)

| ปัญหา | ขนาดงาน |
|---|---|
| ฟอนต์ฐาน `--font-sans`/`--font-content` ชี้ `Outfit`/`Sarabun`/`Inter` ที่ไม่ได้โหลด → ตกไปฟอนต์ระบบ | `globals.css` 2 บรรทัด |
| Noto ใส่ทีละหน้า/ทีละคอมโพเนนต์ (`notoLoopedThai.className`) หน้าเกมไม่ได้ใส่ → G2, G4, G5, G7–G12, G14 ใช้ฟอนต์ระบบ | 28 ไฟล์ใช้ `notoLoopedThai` |
| Mali ใช้ใน `StagePopup` (G13, G18) และข้อความจบเกมของ `G20VeggieToss`, `G20KVeggieTossKitchen` ที่เขียนซ้ำแบบเดียวกับ `StagePopup` ไว้ในไฟล์เกมเอง | 3 ไฟล์ + `src/lib/fonts.ts` |
| ขนาดตัวอักษรตั้งเองกระจัดกระจาย ไม่ผูกกับ style | `text-[Npx]` 215 จุด/33 ไฟล์, `clamp(…px…)` 268 จุด/18 ไฟล์, `gp-text-N` 85 จุด/16 ไฟล์, `text-sm…text-6xl` 80 จุด/18 ไฟล์ |
| น้ำหนักส่วนใหญ่ semibold/bold แม้เป็นเนื้อหา (สเปก: Body/Caption = Regular) | `font-*` 387 จุด/60 ไฟล์ |
| เกมเก่าใช้ `clamp(…vw…)` ได้ขนาด ~9–12px บนจอ 375px | G2, G4, G5, G7–G11 |
| โทเค็นเก่า `--font-size-*` + `data-size` 3 ระดับ (UI ปุ่มปรับขนาดถูกซ่อนแล้วตาม US-CF-01), กฎ `h1`/`h2`/`.text-lead`/`.text-small` ใน `globals.css` | `h1`/`h2` 40 จุด, `.text-lead`/`.text-small` 14 จุด |
| ข้อความบน canvas ตั้งฟอนต์เอง (`sans-serif`, `monospace`) | G13 (3 จุด), G17 (2 จุด) — ไม่นับ emoji |

---

## 2. การตัดสินใจ

ทีมตัดสินแล้ว 2026-11-04:

| # | คำถาม | ผลการตัดสินใจ |
|---|---|---|
| D1 | `data-size` 3 ระดับ (normal/large/xlarge) — Figma มีขนาดเดียว | **เลิกใช้** — UI ปรับขนาดถูกซ่อนแล้ว (US-CF-01) ทุกคนได้ normal อยู่แล้ว; ลบ cookie `naplab_ml_size` + โทเค็น `--font-size-*` ใน S5 |
| D2 | สีข้อความหลัก Figma = `#4B4B4B` แต่ `--text-primary` ปัจจุบัน = `#0f172a` และ `h1` ใช้สี `--primary` | **คงสีเดิม** — ไม่แก้สีข้อความใดๆ ในแผนนี้ (`--text-primary`, สี `h1`, สีที่ตั้งในแต่ละคอมโพเนนต์คงไว้ทั้งหมด); text style utilities ไม่ตั้งสี |
| D3 | ข้อความที่ไม่ใช่ "ตัวหนังสือ" เช่น emoji/ไอคอน (`text-6xl`), ตัวเลขคะแนนใหญ่ (G19 56px, G11 80px), ข้อความในภาพจำลองแอป (G9, G10) | **ยกเว้น** — ไม่ต้อง map เข้า style แต่ต้องใส่ attribute `data-type-exempt="<เหตุผล>"` บน element ให้ตรวจเจอได้ (ใน CSS ล้วน เช่น G14 ใช้คอมเมนต์ `type-exempt`) |
| D4 | Small Text 12px ใช้กับอะไร | จนกว่าดีไซเนอร์ระบุ: ใช้ได้เฉพาะข้อความที่ไม่ต้องอ่าน (เครดิต, เลขเวอร์ชัน) |
| D5 | G14 อยู่ใน iframe ใช้ `next/font` ไม่ได้ | โฮสต์ไฟล์ woff2 เองใน `public/fonts/` + `@font-face` (ไม่ดึงจาก Google ตอนรัน — PWA ออฟไลน์/LINE webview) |
| D6 | เนื้อหาในเกมเปลี่ยนจาก bold → Regular ตามสเปก หน้าตาจะเบาลงชัดเจน | ทำตามสเปก แต่ให้ดีไซเนอร์ดู screenshot ก่อน/หลังของ S1 ก่อนขยายไปทุกเกม |
| D7 | Mali | **คงไว้เฉพาะข้อความ stage popup** (ตัวหนังสือขาวขอบน้ำตาลกลางจอเล่น — `StagePopup` และข้อความจบเกม G20/G20K) ทั้งฟอนต์ ขนาด (`clamp(…cqw…)` ตามกรอบ) และน้ำหนัก ถือเป็น `type-exempt`; ที่อื่นห้ามใช้ Mali |

---

## 3. หลักการแปลงขนาด (ใช้ทุกขั้น)

ทุกข้อความต้องใช้ style ใด style หนึ่ง — map จากขนาดเดิมที่ **จออ้างอิง 388×844** (iPhone 12 Pro) ตามตาราง แล้วตัดสินด้วยบทบาทของข้อความเป็นหลัก ไม่ใช่ตัวเลข:

| ขนาดเดิม | Style | Utility |
|---|---|---|
| ≥ 38px | Display 40/48 Bold | `text-display` |
| 30–37px | H1 32/40 Bold | `text-h1` |
| 26–29px | H2 28/36 Bold | `text-h2` |
| 23–25px | H3 24/32 SemiBold | `text-h3` |
| 22px (เนื้อหาเด่น) | Body Large 22/32 Regular | `text-body-lg` |
| 20–21px, ~ทุกเนื้อหา | Body 20/30 Regular | `text-body` |
| ข้อความบนปุ่ม/ตัวเลือก | Button 20/30 SemiBold | `text-button` |
| ≤ 19px (ข้อมูลรอง) | Caption 18/26 Regular | `text-caption` / `text-caption underline` |
| ข้อความไม่ต้องอ่าน (D4) | Small 12/16 Regular | `text-small` |

- **ห้ามตามด้วย `font-*`/`leading-*`** — utility ตั้งน้ำหนักและ line-height ให้แล้ว (เน้นคำในเนื้อหาใช้ `<strong>` = Bold ได้)
- ในเกมที่ย่อตามจอ (`.gp-compact`, `useStageScale`) ใช้รุ่น `gp-type-*` แทน (ดู S0)
- ขนาด `clamp(…vw…)` ทิ้งทั้งหมด — style มีขนาดตายตัว จอเล็กย่อด้วย `--gp-t` เท่านั้น

---

## 4. ขั้นตอน

แต่ละขั้น commit แยก, ผ่าน `tsc` + `eslint` + Vitest + Playwright เดิม และเก็บ screenshot ก่อน/หลังที่ 360×640, 375×667, 388×844 ก่อนไปขั้นถัดไป

### S0 — รากฐาน (ไม่เปลี่ยนหน้าตาที่จับต้องได้มาก ยกเว้นฟอนต์)

1. `src/lib/fonts.ts`: `notoLoopedThai` เพิ่ม `variable: "--font-noto-looped"`
2. `src/app/layout.tsx`: ใส่ `notoLoopedThai.variable` ที่ `<html>`
3. `src/app/globals.css`:
   - `--font-sans` และ `--font-content` → `var(--font-noto-looped), system-ui, sans-serif` → **ทุกหน้า/ทุกเกมได้ Noto ทันที** (ปิดปัญหาเกมที่ใช้ฟอนต์ระบบ)
   - เพิ่ม `@theme` text styles ทั้ง 9 (`--text-display: 40px; --text-display--line-height: 48px; --text-display--font-weight: 700;` …) → Tailwind สร้าง `text-display` … `text-small` ให้
   - เพิ่ม `@utility gp-type-*` คู่กัน: ขนาด/line-height คูณ `var(--gp-t, 1)` ขั้นต่ำ 18px (Small คงที่ 12px) — นอก `.gp-compact` ได้ค่าเท่า `text-*`
   - `.text-small` เดิมชนชื่อกับ utility ใหม่ → เปลี่ยนชื่อเป็น `.text-small-legacy` ก่อน (ลบใน S5)
   - ไม่แตะตัวแปรสี (D2)
4. Unit test: utility ทั้ง 9 + `gp-type-*` ให้ค่าตามสเปก (อ่าน CSS ที่ build แล้ว)

### S1 — ส่วนประกอบใช้ร่วม (กระทบทุกเกม — ให้ดีไซเนอร์ดูตรงนี้ D6)

`Button3D`, `GameAnswerButton`, `GameIntro`, `GameStageHeader`, `GameScoreCard`, `GameSolutionCard`, `SaveScorePopup`, `NewsMessageView`, `ClipTitleCard`, `RichText`
- ปุ่ม = Button, ชื่อเกม/หัวการ์ด = H1/H2, คำอธิบาย = Body, หมายเหตุ = Caption
- `StagePopup` **ไม่แก้** (D7) — ใส่แค่คอมเมนต์ `type-exempt` และระบุใน doc comment ว่าเป็นที่เดียวที่ใช้ Mali
- ลบ `notoLoopedThai.className` ที่ซ้ำซ้อน (ได้จาก root แล้ว)

### S2 — หน้าแอป

`src/app/page.tsx` (ชื่อ 40px → Display), `consent/**`, `lessons/**` (รวม leaderboard, score, video), `self-assessment/**`
- กฎ `h1`/`h2` ใน `globals.css` → ใช้ค่า H1/H2 (40 จุดได้ผลอัตโนมัติ — ตรวจทีละหน้า)
- `.text-lead` → Body Large, `.text-small-legacy` → Caption

### S3 — เกม GP และเกมสนุก (`gp-text-*` 85 จุด)

G13, G15, G16, G17, G18, G19, G20, G20K
- `gp-text-N` → `gp-type-*` ตามตารางหัวข้อ 3
- G20/G20K: ข้อความจบเกม ("เก่งมาก! 🎉") ที่เขียนซ้ำไว้ในไฟล์เกม → เปลี่ยนไปใช้คอมโพเนนต์ `StagePopup` (หน้าตา/จังหวะเดิม — ส่ง `inMs`/`outMs` เป็น `FINISH_IN_MS`/`FINISH_OUT_MS`) เพื่อให้ Mali เหลือ import แค่ใน `StagePopup.tsx`; ข้อความอื่นในสองเกมนี้ใช้ `gp-type-*`
- `mali` ใน `src/lib/fonts.ts` **คงไว้** (ใช้โดย `StagePopup` เท่านั้น) — เพิ่มคอมเมนต์ระบุ
- canvas: G13 popup ใช้ H3 (`600 24px`) × `s`, G17 คำบนบล็อกใช้ Body/Button ตามบทบาท; ป้าย debug `14px monospace` ของ G13 ไม่ต้องแก้ (dev only), emoji ไม่ต้องแก้
- ตรวจ `fun-game-viewport.spec.ts` ยังผ่าน (25 กรณี)

### S4 — เกมเก่า (`clamp()` 268 จุด — งานใหญ่สุด แบ่ง commit รายเกม)

ลำดับตามความเสี่ยง (ตัวเล็กสุดก่อน): **G9 → G5 → G10 → G7 → G4 → G2 → G8 → G11 → G12 → G6 → G1 → G3**
- ทิ้ง `clamp()` → `text-*`/`gp-type-*`; ถ้าเกมยังไม่มี `.gp-compact` ให้เพิ่มที่ root
- ข้อความจะใหญ่ขึ้นมาก (9–12px → ≥ 18px) → layout ที่บีบไว้จะล้น: ห่อด้วย pattern `overflow-y-auto` + `min-h-full` ตาม `AGENT.md` อย่าลดขนาดตัวอักษรกลับ
- ข้อความในภาพจำลองแอป/แชต (G9 ลิงก์, G10 หน้าแอป) — ถ้าเป็นเนื้อหาให้ผู้เล่นอ่านเพื่อตอบ ต้องเป็น style ปกติ; ถ้าเป็นของตกแต่งใส่ `type-exempt` (D3)
- แต่ละเกม: เล่นครบ 1 รอบที่ 360×640 ไม่มีข้อความถูกตัด/ล้นแนวนอน

### S5 — G14 และเก็บกวาด

> **ทำแล้ว (`c1cd87e` + เอกสาร) ยกเว้น G14:** ทีมตัดสิน (2026-11-04) ว่า G14 ยังไม่ได้ใช้งาน จึง**ข้ามไปก่อน — G14 ยังเป็นฟอนต์/ขนาดแบบเดิม (legacy)** บันทึกไว้ใน `07-typography.md` §4; ข้อ G14 ด้านล่างคงไว้เป็นวิธีทำเมื่อจะเปิดใช้ — ส่วนอื่น: ลบ `--font-size-*` / `[data-size]` / cookie `naplab_ml_size` (ที่อ่านใน layout) / prop `initialSize` / `.text-lead` / `.text-small-legacy` แล้ว, ขนาดฐาน `:root`/`body` = Body 20px (`rem` เท่าเดิม — ตรวจใน browser แล้ว และ cookie ขนาดเก่าไม่มีผล), ปุ่มรีเซ็ตยังลบ cookie เก่าให้; `notoLoopedThai.className` ไม่เหลือแล้ว (ลบไปตอน S1–S4); ลบ unit test ใน `logic.test.ts` ที่แค่ยืนยันตารางขนาดเก่า; เอกสาร `design-tokens.json`, `02` (วงแหวนคะแนน), `03` §3 (ทำเครื่องหมายเลิกใช้), `07` §4 อัปเดตแล้ว

- G14: `public/fonts/noto-sans-thai-looped-{400,600,700}.woff2` + `@font-face` ใน `styles.css`, แทน font stack เดิม (เก็บ `ui-monospace` ไว้สำหรับตัวเลข); map ขนาดใน `styles.css` ตามตาราง (ถ้า G14 ไม่ใช่โค้ดของเรา/อัปเดตจาก upstream ให้ใส่เป็นไฟล์ override แยก)
- ลบของเก่า (D1): `--font-size-*`, `[data-size=…]`, `.text-small-legacy`, `.text-lead`, cookie `naplab_ml_size` ใน `layout.tsx`/`AppLayout.tsx`, prop `initialSize`
- ลบ `notoLoopedThai.className` ที่เหลือทั้งหมด (คงไว้แค่ `.style.fontFamily` ที่ canvas ใช้)
- เอกสาร: `design-tokens.json`, `02-website-design-tokens.md` §2, `03-application-guideline.md`, หัวข้อ 4 ใน `07-typography.md`

### S6 — กันถอยหลัง

> **ทำแล้ว (`5280b68`):** `src/tests/unit/typography-guard.test.ts` อ่าน JSX ด้วย TypeScript compiler (ข้อยกเว้นตาม tree — ลูกของ `data-type-exempt` ได้รับข้อยกเว้นด้วย) ตรวจขนาดตั้งเอง, `style={{ fontSize }}`, `font-*` คู่กับ style class และ import Mali นอก `StagePopup.tsx`; `src/tests/e2e/typography.spec.ts` เปิดหน้าแรก/ลงทะเบียน 2 หน้า + 19 เกมใน dev hub (หน้าแนะนำ + ระหว่างเล่น) ที่ 390×1200 (สูงพอให้ไม่ย่อ) — ใส่ `data-testid="dev-game-root"` ที่ dev hub เพื่อไม่วัด chrome ของ hub; ทั้งสองผ่าน และ**ลองใส่ข้อผิดพลาดจริงแล้วจับได้ทั้งคู่**; `AGENT.md` อัปเดตแล้ว

- Vitest แบบ grep: ห้าม `text-[Npx]`, `clamp(…px` ใน `font-size`, `gp-text-`, `text-(xs|sm|base|lg|xl|Nxl)` ใน `src/components/**` + `src/app/**` ยกเว้น element ที่มี (หรืออยู่ใต้) `data-type-exempt` และไฟล์นอกขอบเขต (facilitator, คอมโพเนนต์เก่าที่ไม่ได้ใช้ — ดูหัวข้อ 0) — ตรวจราย element ไม่ใช่รายบรรทัด เพราะ JSX หลายบรรทัด; ห้าม import `mali` นอก `StagePopup.tsx`
- Playwright: เปิดทุกเกมที่ 388×844 → ทุก text node ที่มองเห็นต้องเป็น `Noto Sans Thai Looped` (ยกเว้น stage popup ที่เป็น Mali) และ `font-size` อยู่ในชุด {40, 32, 28, 24, 22, 20, 18, 12} (ยกเว้น `[data-type-exempt]`)
- `AGENT.md`: ชี้ไปที่ utility `text-*`/`gp-type-*` เป็นวิธีเดียวที่ถูก

---

## 5. ความเสี่ยง

| ความเสี่ยง | ทางรับมือ |
|---|---|
| เกมเก่า layout ล้นเมื่อตัวอักษรใหญ่ขึ้น | ทำทีละเกม, ใช้ scroll pattern, เก็บ screenshot จอเล็ก |
| Regular ทั้งเกมดูจางกว่าเดิม | ให้ดีไซเนอร์อนุมัติหลัง S1 ก่อนไปต่อ (D6) |
| Noto Looped Thai สูงกว่า Sarabun/ฟอนต์ระบบ → ปุ่ม/การ์ดสูงเกินที่คิดไว้ใน S0 | S0 เปลี่ยนฟอนต์อย่างเดียว ตรวจ screenshot ทุกเกมก่อน S1 |
| ไฟล์ฟอนต์เพิ่มขนาดดาวน์โหลด (Thai + Latin × 3 น้ำหนัก) | `next/font` แบ่ง subset และ preload อยู่แล้ว; ไม่เพิ่มน้ำหนักอื่นนอก 400/600/700 |
| คนแก้ไฟล์เกมเดียวกันพร้อมกัน (หลาย session) | `git diff` ก่อน commit ทุกครั้ง, commit เล็กรายเกม |

---

## 6. เกณฑ์เสร็จ

- ทุกหน้าและทุกเกม (รวม G14) แสดง Noto Looped Thai, ไม่มี Outfit/Sarabun เหลือในโค้ด, Mali เหลือเฉพาะ `StagePopup`
- สีข้อความเหมือนก่อนเริ่มแผน (D2)
- ทุกข้อความใช้ 1 ใน 10 style (หรือมี `type-exempt`) — test S6 ผ่าน
- ที่ 388×844 ขนาด/น้ำหนัก/line-height ตรง Figma; จอเล็กย่อด้วย `--gp-t` ไม่ต่ำกว่า 18px (ยกเว้น Small)
- ทดสอบบนมือถือจริงใน LINE (Android + iPhone) อย่างน้อยหน้าแรก, 1 เกมเก่า, 1 เกมสนุก
