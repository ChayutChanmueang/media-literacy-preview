# รู้ทันสื่อ Interactive — Product Backlog

**Last Updated:** 2026-08-14 | **Version:** 1.8

> **Deadline แข็ง:** ใช้งานจริงครั้งแรกในงานอบรมเชียงใหม่ (6–7 ส.ค. 2569)

## Must Have (ใช้งานจริงในงานอบรมเชียงใหม่)

| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| [US-CORE-01](./user-stories/archives/US-CORE-01.md) | ในฐานะผู้สูงอายุ ฉันต้องการเปิดแอปจากลิงก์ใน LINE แล้วเริ่มเรียนได้ทันที เพื่อไม่ต้องติดตั้งหรือสมัครอะไร | เปิดใน LINE in-app browser ได้; ไม่มี login; โหลด < 3s บน 3G | M | [x] |
| [US-CORE-02](./user-stories/archives/US-CORE-02.md) | ในฐานะผู้เรียนและกระบวนกร ฉันต้องการยินยอมข้อมูล PDPA และระบุกลุ่มอายุในหน้าเดียวโดยระบุพื้นที่ตามพิกัด IP | หน้า Onboarding จบในหน้าเดียว; เลือกอายุและแจ้งเตือน PDPA; ตรวจหาพื้นที่จาก IP อัตโนมัติและไม่เก็บบล็อก Dropdown | S | [x] |
| [US-CORE-03](./user-stories/archives/US-CORE-03.md) | ในฐานะผู้สูงอายุ ฉันต้องการดูคลิป "รู้ทันสื่อ" แนวตั้งในแอป เพื่อเรียนรู้เนื้อหาแต่ละบท | YouTube embed แนวตั้งเล่นได้; จับ event ดูจบ; มี fallback เปิดใน YouTube | M | [x] |
| [US-CORE-04](./user-stories/archives/US-CORE-04.md) | ในฐานะผู้สูงอายุ ฉันต้องการให้ระบบพาไปทีละขั้น (คลิป → เกม → บทถัดไป) เพื่อไม่หลงทาง | Sequence engine ทำงานตามลำดับ; ปุ่ม "ถัดไป" เดียวชัดเจน; จำความคืบหน้าได้ | M | [x] |
| [US-GAME-01](./user-stories/archives/US-GAME-01.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกม "จริงหรือมั่ว?" (G1) เพื่อฝึกแยกแยะข่าวจริง-ปลอม | โจทย์ ≥ 5 ข้อ; เฉลยพร้อมเหตุผลทุกข้อ; ไม่มีจับเวลา | M | [x] |
| [US-GAME-02](./user-stories/archives/US-GAME-02.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกม "จับสัญญาณมิจ" (G2) เพื่อแยกแยะและประเมินข้อความหลอกลวง | โจทย์รูปภาพ/ข้อความ SMS คัดสรร ≥ 4 ข้อ; เลือกตอบ จริง/มั่ว/ไม่แน่ใจ; แสดงเฉลยระบุจุดน่าสงสัย | M | [x] |
| [US-GAME-03](./user-stories/US-GAME-03.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกม "AI หรือ คน?" (G3) เพื่อฝึกสังเกตสื่อที่ AI สร้าง | โจทย์ภาพ ≥ 6 ข้อ; เฉลยชี้จุดสังเกต; **ทุกสื่อ AI มีป้าย ai_disclosure** | L | 🔍 QA — ดู [Sprint 03 polishing](./sprint-backlog/sprint-03-polishing.md) |
| [US-GAME-06](./user-stories/US-GAME-06.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกมจำลองแชท LINE (G6) เพื่อจดจำสัญญาณเตือนภัยมิจฉาชีพในแชท | จำลองห้องแชท LINE Platform; แตะจับ Red Flags Hotspots ≥ 3 จุดต่อแชท; สรุปแจ้งเตือนภัย | L | 🔍 QA — ดู [Sprint 03 polishing](./sprint-backlog/sprint-03-polishing.md) |
| [US-UX-01](./user-stories/archives/US-UX-01.md) | ในฐานะผู้สูงอายุ ฉันต้องการตัวหนังสือใหญ่ ปุ่มใหญ่ และขั้นตอนน้อย เพื่อใช้งานเองได้โดยไม่ต้องมีคนช่วย | ผ่านเกณฑ์ Accessibility ใน [Art Direction](../gdd/03-art-direction.md) ทุกข้อ; ทดสอบกับผู้สูงอายุจริง ≥ 3 คน | M | [x] |
| [US-LEAD-01](./user-stories/archives/US-LEAD-01.md) | ในฐานะผู้นำชุมชน ฉันต้องการแชร์ลิงก์บทเรียนเข้ากลุ่ม LINE ได้ในแตะเดียว เพื่อส่งต่อให้คนในชุมชน | ปุ่มแชร์สร้างข้อความ + deep link ต่อบท; เปิดจากลิงก์แล้วไปบทนั้นตรง ๆ | S | [x] |
| [US-REWARD-01](./user-stories/archives/US-REWARD-01.md) | ในฐานะผู้สูงอายุ ฉันต้องการได้ดาวเมื่อจบแต่ละบท เพื่อเห็นความก้าวหน้าและอยากเรียนต่อ | ดาวแสดงบนหน้าเลือกบท; ค้างอยู่แม้ปิดแอป (ใช้ Cookie + LocalStorage Hybrid) | S | [x] |
| [US-DATA-02](./user-stories/archives/US-DATA-02.md) | ในฐานะทีมโครงการ ฉันต้องการเก็บประวัติและเวลาการกดใช้งานฟังก์ชันต่างๆ เพื่อใช้วิเคราะห์การไหลของหน้าจอและจุดขัดข้อง | มีกลไกส่ง Event (เช่น ข้ามคลิป, เปิดคำถาม, ปิดเสียงอ่าน) พร้อมประทับเวลาฝั่ง Client ลงตาราง `action_logs` แบบ Asynchronous | M | [x] |
| [US-UX-04](./user-stories/archives/US-UX-04.md) | ในฐานะผู้เรียนและกระบวนกร ฉันต้องการเลือกรูปแบบการเรียน 2 หมวด (Flow เรียนต่อเนื่อง และ Manual เลือกบทเรียนเอง) | แสดงตัวเลือกโหมดการเรียนในแดชบอร์ด; เปลี่ยนสเตปนำทางของปุ่มในหน้าเฉลยตามโหมด | S | [x] |
| [US-MIGRATE-01](./user-stories/US-MIGRATE-01.md) | ในฐานะทีมพัฒนา ฉันต้องการย้ายโครงสร้างระบบหลักไปเป็น Next.js + TypeScript | สร้าง Next.js App Router, ย้าย Component หลักฝั่ง Client, และติดตั้ง Server-Side Middleware Redirect | L | ⏳ active — ดู [Sprint 03](./sprint-backlog/sprint-03-polishing.md) |
| [US-MIGRATE-02](./user-stories/US-MIGRATE-02.md) | ในฐานะผู้สูงอายุ ฉันต้องการใช้ปุ่มขนาดใหญ่และสลับธีมสีตามพื้นที่ผ่าน Tailwind CSS + shadcn/ui | ติดตั้ง Tailwind, ตั้งค่า CSS variables ตามแต่ละจังหวัดและระดับขยายฟอนต์, และตกแต่ง shadcn components | M | ⏳ active — ดู [Sprint 03](./sprint-backlog/sprint-03-polishing.md) |
| [US-MIGRATE-03](./user-stories/US-MIGRATE-03.md) | ในฐานะทีมพัฒนา ฉันต้องการฟอร์มที่มี Validation ปลอดภัยและบันทึกข้อมูลแบบออฟไลน์ด้วย React Hook Form + Zod และ Supabase | ต่อ Supabase Client, ทำ Zod schema validation, เชื่อม API บันทึก logs/ผลสอบ, และระบบคิวซิงก์ออฟไลน์ | L | ⏳ active — ดู [Sprint 03](./sprint-backlog/sprint-03-polishing.md) |
| [US-MIGRATE-04](./user-stories/US-MIGRATE-04.md) | ในฐานะทีม QA ฉันต้องการทดสอบ Logic และ E2E Flow แบบออฟไลน์ด้วย Vitest + Playwright | รัน Unit tests ด้วย Vitest และจำลองการรันเบราว์เซอร์ E2E/Offline flows ด้วย Playwright | M | ⏳ active — ดู [Sprint 03](./sprint-backlog/sprint-03-polishing.md) |

## Should Have (ภายใน ต.ค. 2569)

| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| US-LEAD-02 | ในฐานะผู้นำชุมชน ฉันต้องการ Facilitator Mode เพื่อใช้จัดกิจกรรมกลุ่มในชุมชน | Layout จอใหญ่; คู่มือพูดประกอบต่อบท; โหมดตอบแบบกลุ่ม | L | [ ] |
| [US-GAME-05](./user-stories/US-GAME-05.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกมกางโล่สะกดภัย "หยุด คิด ถาม ทำ" (G5) | แตะสิ่งเร้าเพื่อกางโล่; คอนโทรลปุ่มเดี่ยว; อนิเมชั่นสโลแกน "หยุด คิด ถาม ทำ"; Confidence Bar | M | 🔍 QA — ดู [Sprint 03 polishing](./sprint-backlog/sprint-03-polishing.md) |
| [US-GAME-07](./user-stories/US-GAME-07.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกมวิ่งหลบภัยไซเบอร์ (G7) เพื่อฝึกสังเกตและกระโดดหลบอุปสรรค | ตัวละครวิ่งอัตโนมัติ; แตะเพื่อกระโดดหลบอุปสรรคสแกม; ระบบบันทึกคะแนนและเสียงชื่นชมบวก | M | 🔨 Prototype — โค้ดเสร็จ รอ QA playtest ([US-GAME-07](./user-stories/US-GAME-07.md)) |
| [US-GAME-09](./user-stories/US-GAME-09.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกม "ลิงก์จี้หรือลิงก์จริง" (G9) เพื่อแยกลิงก์ทางการจริงจากลิงก์ปลอมบนโซเชียล | จำลองฟีดโพสต์/คอมเมนต์; ส่องลิงก์ไฮไลต์โดเมน; กฎ .go.th; ไม่มีจับเวลา/จอแพ้ | M | 🔨 Prototype — โค้ดเสร็จ รอ QA playtest ([US-GAME-09](./user-stories/US-GAME-09.md)) |
| [US-GAME-10](./user-stories/US-GAME-10.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกม "นี้แอปฉัน นั้นแอปใคร?" (G10) เพื่อหาและลบแอปปลอมในมือถือ | จำลองตารางแอป (2×2/3×2/3×3); ตรวจที่มา/สิทธิ์; ลบแอปปลอม; ไม่มีจับเวลา/จอแพ้ | M | 🔨 Prototype — โค้ดเสร็จ รอ QA playtest ([US-GAME-10](./user-stories/US-GAME-10.md)) |
| [US-GAME-08](./user-stories/US-GAME-08.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกม "กระโดดแพรู้ทันมิจ" (G8) เพื่อคัดแยก SMS/สายโทรเข้าจากมิจฉาชีพ | เล่นครบ 5 ด่าน; ห่วงยาง 5 หน่วย; เรือกู้ภัย (ไม่มีจอแพ้); ไม่มีจับเวลา | M | 🔨 Prototype — playtest ครบ 5 ด่าน 2026-07-19 ([US-GAME-08](./user-stories/US-GAME-08.md)) |
| [US-GAME-11](./user-stories/US-GAME-11.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกม "หยุดนิ้ว! คิดก่อนกด" (G11) เพื่อฝึกหยุดก่อนกดข้อมูลหลอกลวง | โทรศัพท์จำลอง + นิ้วเลื่อนเข้าหาปุ่ม; แตะมือหยุดเมื่อเป็นข้อมูลหลอก; ปล่อยกดเมื่อเชื่อถือได้; ไม่มีจอแพ้ | M | 🔨 Prototype — โค้ดเสร็จ รอ QA playtest ([US-GAME-11](./user-stories/US-GAME-11.md)) |
| US-REWARD-02 | ในฐานะผู้สูงอายุ ฉันต้องการใบประกาศเมื่อเรียนครบ เพื่อความภูมิใจและแชร์ให้ลูกหลานดู | ใส่ชื่อเล่นได้; บันทึกเป็นภาพ; แชร์ LINE ได้ | M | [ ] |
| US-UX-02 | ในฐานะผู้สูงอายุที่อ่านหนังสือไม่ถนัด ฉันต้องการเสียงอ่านโจทย์และเฉลย เพื่อเรียนได้ด้วยตัวเอง | เสียงอ่านครบทุกโจทย์เกม Must-have; ปุ่มเล่นเสียงชัดเจน | M | [ ] |
| US-DATA-01 | ในฐานะทีมโครงการ ฉันต้องการ dashboard จำนวนผู้เล่นแยกพื้นที่/ช่วงอายุ เพื่อรายงานผลโครงการ | ดูจำนวน session แยกราย จังหวัด/อำเภอ/ตำบล และช่วงอายุ; วิเคราะห์ funnel ต่อบทเรียน | M | [ ] |

## Nice to Have

| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| [US-GAME-04](./user-stories/US-GAME-04.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกม "แชร์ดีไหม?" (G4) เพื่อระวังการแชร์ข้อมูลส่วนตัว | โจทย์ ≥ 5 ข้อ; เลือกตอบจริง/มั่ว/ไม่แน่ใจ; เฉลยอธิบายเหตุผลอย่างละเอียด | M | 🔨 Prototype — โค้ดเสร็จ รอ QA playtest ([US-GAME-04](./user-stories/US-GAME-04.md)) |
| [US-GAME-13](./user-stories/US-GAME-13.md) | ในฐานะผู้สูงอายุ ฉันต้องการเล่นเกม "ต่อไอติมรู้ทันสื่อ" (G13) เป็นเกมสนุกปิดท้าย Flow | ลากโคนรับสกู๊ปดี/หลบสกู๊ปร้าย; หอ wobble ไม่ล้ม; ไม่มีดาว/จอแพ้; ใช้เป็น terminal ของ [US-FLOW-01](./user-stories/US-FLOW-01.md) | M | 🔨 Prototype — โค้ดเสร็จ รอ QA playtest ([US-GAME-13](./user-stories/US-GAME-13.md)) |
| US-LEAD-03 | ในฐานะผู้นำชุมชน ฉันต้องการเห็นจำนวนคนในพื้นที่ของฉันที่เข้ามาเรียน เพื่อติดตามผลการถ่ายทอด | ตัวเลขผู้เล่นในอำเภอตัวเอง | M | [ ] |
| US-CORE-05 | ในฐานะผู้สูงอายุในพื้นที่เน็ตช้า ฉันต้องการให้เกมเล่นต่อได้แม้เน็ตหลุด เพื่อไม่เสียอารมณ์เรียน | ผลการเล่น queue ไว้ sync ทีหลัง | M | [ ] |

## Sprint 08 — Flow Restructure, Responsive & Hardening

> จากคำสั่งทีม + รีวิวโค้ด/เอกสาร 2026-07-27 — วางไว้ **[Sprint 08](./sprint-backlog/sprint-08.md)** (Planned); งาน security ส่วนวิกฤตเป็น 🔥 Hotfix ทำก่อนงานเชียงใหม่ 6 ส.ค.

| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| [US-FLOW-01](./user-stories/US-FLOW-01.md) | ในฐานะผู้สูงอายุ ฉันต้องการโหมด Flow ที่ดูคลิปสั้นนำแล้วเล่นเกม (คลิป→G1→คลิป→G3→คลิป→G6) ปิดท้ายด้วยเกมสนุก G13 → กลับ Start Menu | เริ่มที่คลิป; สลับคลิป↔เกมอัตโนมัติถึง G6; G6 จบเปิด G13; G13 ไม่มีดาว/จอแพ้; จบ G13 กลับ Start Menu; จำความคืบหน้า; Manual ไม่พัง | L | 🔨 โค้ด video-first เสร็จ (2026-08-03) via [US-CF-06](./user-stories/US-CF-06.md)/[US-CF-07](./user-stories/US-CF-07.md); tsc/unit ผ่าน — รอ QA playtest |
| [US-FLOW-02](./user-stories/US-FLOW-02.md) | ในฐานะผู้เรียน ฉันต้องการ progress bar ที่เดินหน้าตามลำดับจริง ไม่ค้างตอนเล่นเกม และไม่ถอยหลัง | progress เดินตาม flow position (คลิป→เกม→…→G13) monotonic ไม่ถอยหลัง; ขยับเมื่อไปสเตปถัดไป; ถึง ~100% ตอนจบ; Manual ไม่พัง | M | 🟢 Done (code) — flow-aware + event ต่อโจทย์ ใน `AppLayout`+G1/G3/G6/G13; รอ browser QA |
| [US-UX-05](./user-stories/US-UX-05.md) | ในฐานะผู้สูงอายุ ฉันต้องการให้เกมทุกตัวแสดงพอดีจอทุกขนาดและตรง design UX/UI | G1–G13 single-screen ไม่ scroll ตั้งแต่จอเล็ก/A10s; ใช้ design token กลาง; คงเกณฑ์ Accessibility + dark/theme/size | L | 🏗 Planned |
| [US-UX-06](./user-stories/US-UX-06.md) | ในฐานะผู้เล่น G3 ฉันต้องการให้หัวข้อ+คำอธิบายโจทย์มีระยะห่างจากขอบ | เพิ่ม padding บน/ซ้าย/ขวา 15px ให้ `<div text-left shrink-0>` ใน G3; layout ไม่พัง | S | 🟢 Done (code) — `pt-[15px] px-[15px]`; รอ browser QA |
| [US-UX-07](./user-stories/US-UX-07.md) | ในฐานะผู้เล่นสูงอายุ ฉันต้องการให้หน้าเฉลยไม่รีบไปข้อถัดไป และหยุดนับเมื่อกำลังอ่าน/เลื่อนเนื้อหา | auto-advance G1/G3 เป็น 30 วิ; หยุดตัวนับ+แถบ progress เมื่อผู้ใช้แตะ/เลื่อนเฉลย แล้วนับต่อจากจุดเดิม | S | 🟢 Done (code) — `AutoAdvanceButton paused` + `CustomScrollArea onActiveChange`; รอ browser QA |
| [US-UX-08](./user-stories/US-UX-08.md) | ในฐานะผู้สูงอายุ ฉันต้องการเห็นคำขวัญ "หยุด คิด ถาม ทำ" ตั้งแต่หน้าแรก | เพิ่ม tagline `หยุด · คิด · ถาม · ทำ` + ไอคอนโล่ ใต้หัวข้อรองใน Landing (≥20px, ไม่แตะ badge) | XS | 🟢 Done (code) — tagline คำขวัญจาก GDD; รอ browser QA |
| [US-GAME-13-R2](./user-stories/US-GAME-13-R2.md) | ในฐานะผู้เล่น ฉันต้องการเกมวางไอติม G13 ที่ remake บน Canvas เพื่อเล่นเกมรับไอติมจริงได้ลื่นและไม่ถูก DOM บีบ | Canvas playfield; ไอติมจริงไม่มีข้อความ; ระเบิดทำไอติมบนสุดร่วง ≤2 ลูก; collision ต่อที่ยอดหอ; wobble/camera/sky ตามความสูง; เวลา 120 วินาที | L | 🔍 In QA — implementation เสร็จ รอ runtime playtest |
| [US-SEC-01](./user-stories/US-SEC-01.md) | ในฐานะทีมโครงการ ฉันต้องการอุดช่อง secret หลุด / API ไม่มี auth / quiz เชื่อ client | rotate secret + auth analytics (🔥 hotfix); server คำนวณคะแนน quiz; ไม่ส่งเฉลยให้ client; Zod ทุก POST; ไม่ leak error | L | 🔥 In Progress — `.env.example`/gitignore แก้แล้ว (`d5c2e9b`); ⏳ รอ rotate รหัสจริง + auth/quiz-integrity |
| [US-DOC-01](./user-stories/US-DOC-01.md) | ในฐานะ dev/agent ฉันต้องการให้ AGENT.md/CLAUDE.md/architecture ตรงกับโค้ดจริง | ระบุ Next.js+pg (ไม่ใช่ Vite/Express/Supabase-Auth); ลบอ้างอิงไฟล์ที่ไม่มีแล้ว; แก้ architecture doc | S | 🟢 Done (`9900ddd`) |
| [US-DEBT-01](./user-stories/US-DEBT-01.md) | ในฐานะ dev ฉันต้องการ repo ที่ไม่มีไฟล์ซ้ำ/ขยะ | ลบ service .js ซ้ำ + ไฟล์ขยะ + vite deps; แก้ gitignore/hardcoded IP; lint+tsc+test ผ่าน | M | 🟢 Done ส่วนใหญ่ (`f401d0b`) — เหลือ lint 79 errors เดิม (แยก task) |

## Epic: Top-Down Mini Prototype (E-WORLD) — "รู้ทันกลางสายหมอก"

> งาน R&D / Production-Transition — โลก 2D top-down (**Canvas 2D ไม่ใช่ Phaser** ดูเหตุผลใน [Sprint 07](./sprint-backlog/sprint-07.md#-key-decision--ใช้-canvas-2d-ไม่ใช่-phaser)) มาห่อมินิเกม G1–G10 ให้เป็นเรื่องราวในชุมชน ลดความรู้สึกเหมือนทำแบบทดสอบ — อ้างอิง [05 Prototype GDD](../wiki/design/05-mini-prototype-gdd.docx.md) + [04 SRS](../wiki/design/04-requirements-specification.md). วางไว้ **[Sprint 07](./sprint-backlog/sprint-07.md)** (Planned)

| ID | User Story | Phase | Estimate | Status |
|----|-----------|-------|----------|--------|
| [US-WORLD-01](./user-stories/US-WORLD-01.md) | Canvas 2D world engine + เดิน 4 ทิศ + แผนที่เล็ก 1 แผนที่ | P1 | L | 📋 Backlog |
| [US-WORLD-02](./user-stories/US-WORLD-02.md) | NPC 5–7 ตัว + interaction zone + ปุ่มโต้ตอบ | P1 | M | 📋 Backlog |
| [US-WORLD-03](./user-stories/US-WORLD-03.md) | Typed Event Bus + `MinigameResult` contract + migrate `onFinish` | P1 | M | 📋 Backlog |
| [US-WORLD-04](./user-stories/US-WORLD-04.md) | ระบบบทสนทนา (Dialogue overlay) | P2 | M | 📋 Backlog |
| [US-WORLD-05](./user-stories/US-WORLD-05.md) | Quest + Incident + Day controller + หน้าสรุปประจำวัน | P2 | L | 📋 Backlog |
| [US-WORLD-06](./user-stories/US-WORLD-06.md) | เชื่อมมินิเกม G1–G10 เข้าเหตุการณ์ + Phone overlay | P3 | L | 📋 Backlog |
| [US-WORLD-07](./user-stories/US-WORLD-07.md) | 3 ค่าสถานะ + 3 ตอนจบ + ฉากเปิด/จบ | P2/P4 | M | 📋 Backlog |
| [US-WORLD-08](./user-stories/US-WORLD-08.md) | Save/Resume + จุดพัก "เล่นต่อ / พักก่อน" | P2/P4 | M | 📋 Backlog |
| [US-WORLD-09](./user-stories/US-WORLD-09.md) | Optimize เครื่องสเปคต่ำ (A10s) + Accessibility + emoji/SVG art | P4 | M | 📋 Backlog |

## Client Feedback — Deadline 4 ส.ค. 2569

> จากการประชุมรับฟังผลตอบรับลูกค้า 2026-07-31 — ดูรายละเอียดใน [ML-2026-07-31-client-feedback.md](./meeting-log/ML-2026-07-31-client-feedback.md) | **กำหนดส่ง: 4 ส.ค. 2569**

| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| [US-CF-01](./user-stories/US-CF-01.md) | ในฐานะผู้ใช้ ฉันต้องการให้แท็บปรับขนาด UI ถูกลบออกหรือซ่อนไว้ เพื่อให้หน้าจอดูสะอาดขึ้น | แท็บปรับขนาดไม่ปรากฏในหน้าจอใดๆ ของผู้ใช้; UI ยังคงทำงานได้ปกติ | S | 🟢 Done (code) — ลบปุ่ม ก/ก+/ก++ ใน `AppLayout.tsx`; รอ browser QA |
| [US-CF-01B](./user-stories/US-CF-01B.md) | ในฐานะผู้ใช้ ฉันต้องการ menu drawer ที่รวม action เดิม (รีเซ็ต) + ปุ่มไปหน้าแรก โดย**ไม่นำปุ่มปรับ font กลับมา** | มี hamburger เปิด drawer; ใน drawer มีรีเซ็ต + ไปหน้าแรก (`/`); ไม่มีปุ่มปรับ font; layout ไม่พัง | M | 🟢 Done (code) — ☰ drawer สไลด์ซ้าย (Google Drive style) ใน `AppLayout`; รอ browser QA |
| [US-CF-02](./user-stories/US-CF-02.md) | ในฐานะผู้ใช้ ฉันต้องการให้ Start Menu แสดงเพียงปุ่ม Play เดียว เพื่อลดความสับสนในการเริ่มต้น | ปุ่ม Manual Learning ถูกซ่อน/ปิดใช้งาน; ปุ่ม Auto Flow ถูกเปลี่ยนเป็นปุ่ม Play; logic Auto Flow ยังทำงานเหมือนเดิม | S | 🟢 Done (code) — soft-hide Manual + ปุ่ม Play "เริ่มเล่น" ใน `lessons/page.tsx`; รอ browser QA |
| [US-CF-03](./user-stories/US-CF-03.md) | ในฐานะผู้ใช้ใหม่ ฉันต้องการเห็นหน้าแนะนำก่อนเริ่มเกม เพื่อเข้าใจวิธีเล่นและเนื้อหาของเกม | หน้า Intro Panel/Scene แสดงผลก่อนเริ่ม gameplay; มีข้อมูลวิธีเล่นและเนื้อหาของเกม | M | 🟢 Done (code) — shared `GameIntro` ใน G1/G3/G6 + refactor G13; รอ browser QA |
| [US-CF-03B](./user-stories/US-CF-03B.md) | ในฐานะผู้สูงอายุ ฉันต้องการฟอนต์ "วิธีเล่น" ใหญ่ขึ้น และหน้า intro scroll ได้ ไม่ถูกบีบบนจอเตี้ย | "วิธีเล่น" ≥20px; `GameIntro` scroll ได้ (overflow-y-auto+min-h-full); เพิ่มกฏ font/scroll ใน AGENT.md | S | 🟢 Done (code) — GameIntro + AGENT.md; รอ browser QA |
| [US-CF-04](./user-stories/US-CF-04.md) | ในฐานะผู้ใช้ ฉันต้องการให้ปุ่มตัวเลือก (ปฎิเสธ/ยอมรับ/นิ่งเฉย) มีดีไซน์สม่ำเสมอและรู้สึกว่ากดได้ เพื่อประสบการณ์การใช้งานที่ดีขึ้น | ปุ่มทุกตัวใช้โทนสีเดียวกันในทุกเกม; ปุ่มมีลักษณะนูน (raised/shadow); มี animation กดที่เห็นได้ชัด (scale หรือ depress) | M | 🟢 Done |
| [US-CF-05](./user-stories/US-CF-05.md) | ในฐานะผู้ใช้ ฉันต้องการให้วิดีโอแสดงแบบเต็มหน้าจอหรือใช้พื้นที่หน้าจอมากที่สุด เพื่อประสบการณ์การรับชมที่ดีที่สุด | Video player ขยายเป็น fullscreen หรือครอบคลุม viewport สูงสุด; ไม่มีขอบสีขาวหรือพื้นที่ว่างที่ไม่จำเป็น; ไม่แสดงชื่อ Topic; ปุ่ม slide up/down | S | 🟢 Done (code) — วิดีโอเต็มหน้าจอ ลบชื่อ Topic และปุ่ม slide up/down ตามสถานะเล่น/จบ; รอ browser QA |
| [US-CF-06](./user-stories/US-CF-06.md) | ในฐานะผู้ใช้ หลังจากดูคะแนน G13 เสร็จแล้ว ฉันต้องการกดปุ่ม Finish แล้วกลับไปที่ Start Menu เพื่อ flow ที่ชัดเจน | กดปุ่ม Finish/Return หลังหน้าคะแนน G13 แล้วนำทางไปที่ Start Scene/Menu; ไม่ติดค้างหรือไปหน้าอื่น | S | 🟢 Done (code) — จบ G13 → `/lessons` (Play menu) ใน `game/page.tsx`; รอ browser QA |
| [US-CF-07](./user-stories/US-CF-07.md) | ในฐานะผู้ใช้ ฉันต้องการดูวิดีโอแนะนำก่อนเล่นเกม เพื่อเข้าใจเนื้อหาก่อนเริ่มฝึก | วิดีโอแสดงก่อน gameplay ในทุกเกมที่เกี่ยวข้อง; ผู้ใช้ต้องดูวิดีโอก่อนจึงจะเข้าสู่เกมได้ | M | 🟢 Done (code) — รื้อ Flow เป็น video-first (คลิป→เกม); tsc/unit ผ่าน; รอ browser QA |
| [US-CF-08](./user-stories/archives/US-CF-08.md) | ในฐานะผู้ใช้ G1 ฉันต้องการให้ข้อความข่าวดูเหมือนแอปส่งข้อความจริง (LINE/SMS) เพื่อความสมจริงและน่าเชื่อถือ | UI ข้อความมีองค์ประกอบครบ: ฟองข้อความ (chat bubble), ชื่อผู้ส่ง, timestamp; สไตล์ตรงกับ LINE หรือ SMS; หัวแชทเหลือเฉพาะโปรไฟล์กับชื่อ/เบอร์ ไม่มีปุ่มโทรหรือปุ่มกลับ | M | 🟢 Done (code) — `NewsMessageView` สุ่ม LINE/SMS ต่อข้อใน G1; หัวแชทตัดปุ่มจำลองแล้ว |
| [US-CF-09](./user-stories/US-CF-09.md) | ในฐานะผู้สูงอายุที่ใช้ G6 ฉันต้องการให้ข้อความในหน้า Level Intro มีขนาดใหญ่พอ เพื่ออ่านได้สะดวก | ขนาดตัวอักษรในหน้า Level Intro G6 ≥ ค่าที่กำหนดในแนวทาง accessibility สำหรับผู้สูงอายุ | S | 🟡 Pending Testing |
| [US-CF-09B](./user-stories/US-CF-09B.md) | ในฐานะผู้สูงอายุที่ใช้ G6 ฉันต้องการให้หัวข้อสถานการณ์แสดงเป็น 2 บรรทัด (ลำดับ / ชื่อเรื่อง) เพื่ออ่านง่ายขึ้น | หน้าแสดงโจทย์ G6 แยกหัวข้อเป็น 2 บรรทัด: "สถานการณ์ที่ N" + ชื่อเรื่อง; ครบ 3 สถานการณ์; layout ไม่พัง | S | 🟢 Done (code) — split ที่ ": " ใน `G6LineSimulation.jsx`; รอ browser QA |
| [US-CF-10](./user-stories/US-CF-10.md) | ในฐานะผู้ใช้ G6 ฉันต้องการให้ข้อความ pop-up ปรากฏเร็วขึ้น เพื่อให้เกมมี pacing ที่ดีและไม่น่าเบื่อ | เวลารอก่อน message pop-up ปรากฏใน G6 ลดลงจากค่าเดิม; ผู้ทดสอบไม่รู้สึกว่ารอนาน | S | 🟢 Done |
| [US-CF-11](./user-stories/US-CF-11.md) | ในฐานะผู้เรียน G6 เมื่อฉันกดองค์ประกอบหลอกลวงโดยไม่ตั้งใจ ฉันต้องการได้รับคำเตือนทันที เพื่อเรียนรู้ว่าไม่ควรกดสิ่งเหล่านั้น | เกมแสดง warning/toast ทุกครั้งที่ผู้ใช้โต้ตอบกับ scam element; ข้อความเตือนชัดเจนและเข้าใจง่าย | M | 🟢 Done |
| [US-CF-12](./user-stories/US-CF-12.md) | ในฐานะผู้เรียน G6 ฉันต้องการตัวเลือก "ตอบกลับ" และ "ไม่ตอบกลับ" แทนระบบสามตัวเลือกเดิม เพื่อตัดสินใจที่ชัดเจนและตรงประเด็นกว่า | ปุ่มตัวเลือกใน G6 เปลี่ยนจาก 3 ตัวเลือก (ปฎิเสธ/ยอมรับ/นิ่งเฉย) เป็น 2 ตัวเลือก (ตอบกลับ/ไม่ตอบกลับ); game logic ทำงานสอดคล้องกับตัวเลือกใหม่ | M | 🟢 Done |
| [US-CF-13](./user-stories/US-CF-13.md) | ในฐานะผู้ใช้ G13 ฉันต้องการเห็นหน้าแนะนำที่น่าสนใจและสร้างแรงจูงใจ เพื่อรู้สึกอยากเล่นเกม | copy ของหน้า Intro G13 กระตุ้นให้อยากเล่น (เช่น นำเสนอเป็น "เกมฝึกสมองสนุกๆ"); มี visual หรือข้อความสร้างแรงบันดาลใจ | S | 🔴 To Do |
| [US-CF-14](./user-stories/US-CF-14.md) | ในฐานะผู้เล่น G13 ฉันต้องการให้ไอศกรีมและโคนมีขนาดใหญ่ขึ้น เพื่อมองเห็นได้ชัดและเล่นสนุกกว่าเดิม | sprites ไอศกรีมและโคนแสดงผลใน G13 ขนาด ~3 เท่าของขนาดก่อนแก้ไข; proportions ยังสมดุล | S | 🟡 Pending Testing |
| [US-CF-15](./user-stories/US-CF-15.md) | ในฐานะผู้เล่น G13 ฉันต้องการให้เกมยากขึ้นเรื่อยๆ ตามเวลาที่เล่น เพื่อความท้าทายและน่าสนใจมากขึ้น | ความเร็วการตกของ item เพิ่มขึ้นเรื่อยๆ ตามเวลาหรือคะแนนที่สะสม; ผู้ทดสอบรู้สึกว่าเกมมี skill curve ที่ชัดเจน | M | ✅ Done |
| [US-CF-16](./user-stories/US-CF-16.md) | ในฐานะผู้เล่น G6 ฉันต้องการให้คำว่า "สถานการณ์" แยกออกจากชื่อเหตุการณ์อย่างชัดเจน เพื่ออ่านง่ายขึ้น | "สถานการณ์ที่ N" แสดงแยกจากชื่อเรื่องในทุกจุดที่แสดง event title; ครบ 3 สถานการณ์; layout ไม่พัง | S | 🟢 Done |
| [US-CF-17](./user-stories/US-CF-17.md) | ในฐานะผู้เล่น G13 ฉันต้องการให้ไอศกรีมซ้อนบนโคนแสดงสูงสุด 2.5 ลูก (162px ไม่รวมโคน) เพื่อหน้าจอไม่รก | visible stack ≤ 162px; scoop เก่าที่เกินถูกซ่อน; คะแนนนับตามจริง; collision ถูกต้อง | M | ✅ Done |
| [US-CF-18](./user-stories/US-CF-18.md) | ในฐานะผู้เล่น G13 ฉันต้องการให้มีไอศกรีมลูกที่ 2 spawn เมื่อคะแนนถึง ~10 เพื่อความท้าทายเพิ่ม | ที่ ~10 คะแนนเพิ่ม spawner ลูกที่ 2 มีความเร็วและเวลา spawn อิสระ (ไม่พร้อมกันตลอด); catch logic รองรับ 2 ลูก | M | ✅ Done |
| [US-CF-19](./user-stories/US-CF-19.md) | ในฐานะผู้เล่น G13 ฉันต้องการไอศกรีมพิเศษ "ไอติมคู่" ให้คะแนน ×2 เพื่อเซอร์ไพรส์และสนุกมากขึ้น | ไอติมคู่ visual แตกต่างชัดเจน (เอฟเฟกต์เรืองแสง + ป้าย ×2); spawn rate rare (7%); รับแล้วได้ ×2 คะแนน; มี visual feedback | M | ✅ Done |
| [US-CF-20](./user-stories/US-CF-20.md) | ในฐานะผู้เล่น G13 ฉันต้องการลากโคนจริง (drag) ไม่ใช่แตะตำแหน่ง เพื่อควบคุมแม่นยำกว่า | โคนเคลื่อนที่ด้วย drag เท่านั้น; แตะโดยไม่ลากไม่ขยับ; smooth ไม่กระโดด; hit area ใหญ่พอสำหรับผู้สูงอายุ | M | ✅ Done |

## Client Feedback — รอบ 2026-08-04

> จากการทบทวนผลตอบรับ/ทีม **2026-08-04** (คนละรอบกับ 2026-07-31) — ดู [ML-2026-08-04-client-feedback.md](./meeting-log/ML-2026-08-04-client-feedback.md) | หน้าแรก/Start Menu (US-CF-21, 22) เสร็จแล้ว; ที่เหลือ (US-CF-23..28) เป็นงานเร่งควรจัดก่อนงานแพร่ 17–18 ส.ค.

| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| [US-CF-21](./user-stories/US-CF-21.md) | ในฐานะผู้สูงอายุ ฉันต้องการหน้าแรกที่ข้อความกระชับและปุ่มเริ่มชัดเจน | แก้ H1 `รู้ทันสื่อ`, H2 `เรียนรู้ความปลอดภัยออนไลน์ด้วยตัวคุณเอง`, ย่อหน้าแนะนำ, ปุ่ม `กดที่นี่เพื่อเริ่ม`; badge→โลโก้ รอ asset | S | 🟢 Done (code) — ข้อความ/ปุ่มแก้แล้ว; badge→โลโก้ รอ asset; รอ browser QA |
| [US-CF-22](./user-stories/US-CF-22.md) | ในฐานะผู้สูงอายุ ฉันต้องการให้หน้าเริ่มเล่น (Start Menu) มีข้อความสั้นชวนดูคลิปแรกเท่านั้น | ลบ badge/หัวข้อ/คำอธิบายเดิม เหลือบรรทัดเดียว `พร้อมแล้วไปดูคลิป "ใครๆก็ทำสื่อได้" กันเลย` + ปุ่มเริ่มเล่น | XS | 🟢 Done (code) — `src/app/lessons/page.tsx`; รอ browser QA |
| [US-CF-23](./user-stories/US-CF-23.md) | ในฐานะผู้เล่นจังหวัด/อายุอื่น ฉันต้องการเลือก "อื่นๆ" ในหน้ากรอกข้อมูล | เพิ่ม option "อื่นๆ" ใน dropdown จังหวัด (+ซ่อนอำเภอ/ตำบล) และในช่วงอายุ (`other` + `z.enum`) | XS | 🟢 Done (code) — auto-set "อื่นๆ"; รอ browser QA |
| [US-CF-24](./user-stories/US-CF-24.md) | ในฐานะผู้เล่น G1 ฉันต้องการวิธีเล่นชัด หมวดข่าวถูก และจบเกมแล้วเห็นคะแนน+หน้าชื่อคลิป | how-to; prefix น้ำมะนาวโซดา→"ข่าวสารสุขภาพ"; จบเกม→หน้าคะแนน(ดาว)→หน้าชื่อคลิป (auto 15 วิ)→วิดีโอ | S | 🟢 Done (code) — `ClipTitleCard` + video intro phase + summary flow-next; รอ browser QA |
| [US-CF-25](./user-stories/US-CF-25.md) | ในฐานะผู้เล่น G3 ฉันต้องการ header โจทย์สั้น + มีภาพถ่ายจริงปน | ตัด header เหลือ "ภาพนี้เป็นภาพจริงหรือ เอไอ" (กรอบสีหลัก) ✅; เพิ่มภาพถ่ายจริง 1–2 รูป ⏳ รอ asset | M | 🟡 Partial — item 1 เสร็จ; item 2 รอไฟล์ภาพถ่ายจริง |
| [US-CF-26](./user-stories/US-CF-26.md) | ในฐานะผู้เล่น G6 ฉันต้องการชื่อ/ภาษาไทย ลดขั้นตอน และปุ่มจบตรงพฤติกรรม | ชื่อ "จำลองแชทไลน์"; "LINE"→"ไลน์"; ตัดหน้าสถานการณ์เข้าแชทเลย; ปุ่ม "จบเกมและรับดาว" | M | 🔴 To Do — [ML](./meeting-log/ML-2026-08-04-client-feedback.md) #7–10 |
| [US-CF-27](./user-stories/US-CF-27.md) | ในฐานะผู้เล่น G13 ฉันต้องการรู้ว่าเกมฝึกสมอง ปุ่มเล่นอีกรอบ และไอติมน่ากิน | ป้าย "เกมฝึกสมอง"; ปุ่มวนกลับ→"เล่นอีกรอบ"; ลูกไอติมใช้ sprite `public/assets/ice-cream/*.png` | M | 🔴 To Do — [ML](./meeting-log/ML-2026-08-04-client-feedback.md) #11–13 |
| [US-CF-28](./user-stories/US-CF-28.md) | ในฐานะทีม ฉันต้องการให้ทั้งแอปใช้คำกลาง ไม่มี "วัยเก๋า" และไม่ลงท้าย ครับ/ค่ะ/คะ | ลบ "วัยเก๋า" ทุกที่ (19 จุด, live 5 ไฟล์); ตัดคำลงท้าย ครับ/ค่ะ/คะ (ระวัง `คะแนน`); ขอบเขต UI+TTS+JSON | M-L | 🔴 To Do — copy sweep |
| [US-CF-29](./user-stories/US-CF-29.md) | ในฐานะผู้เล่น G1 ฉันต้องการเห็นตัวหนาจริง (ไม่ใช่ `**`) และหมวดข่าวไม่มี ":" | render `**bold**`→`<strong>` ในเฉลย/แชท; ลบ ":" จาก prefix ข่าว (q3/q4) | S | 🟢 Done (code) — `RichText` component; รอ browser QA |
| [US-CF-30](./user-stories/US-CF-30.md) | ในฐานะผู้ใช้ ฉันต้องการหน้าชื่อคลิปจัดกึ่งกลางแบบ Start Menu | ปรับ layout phase intro ใน `video/page.tsx` ให้ปุ่มอยู่ใต้ข้อความกึ่งกลาง (ไม่ชิดล่าง) | XS | 🟢 Done (code) — `justify-center` + ปุ่มใต้ข้อความ; รอ browser QA |
| [US-CF-31](./user-stories/US-CF-31.md) | ในฐานะผู้เล่น ฉันต้องการไอคอนจริงในกล่อง intro เกม (ไม่ใช่ "?") | prop `imageSrc` ใน GameIntro; G1/G3 ไอคอน AI-gen, G6 โลโก้ไลน์ (`public/assets/icon-game/`); G13 มี cone อยู่แล้ว | M | 🟢 Done (code) — รอ browser QA |
| [US-CF-32](./user-stories/US-CF-32.md) | ในฐานะผู้เล่น flow ฉันต้องการจบเกมแล้วไปหน้าชื่อคลิปเลย ไม่มีหน้าสรุปคะแนนคั่น | flow จบเกม→หน้าชื่อคลิป/G13 (ข้าม summary); ปุ่มจบ G1/G3/G6 = "บทเรียนถัดไป", G13 = "เสร็จสิ้นบทเรียน" | XS | 🟢 Done (code) — ปรับจาก US-CF-24; รอ browser QA |
| [US-CF-33](./user-stories/US-CF-33.md) | ในฐานะผู้เล่นที่เล่นค้างไว้ ฉันต้องการกด "เริ่ม" แล้วเข้าบทที่ค้างเลย ไม่เห็นหน้าชื่อคลิปซ้ำ | Landing resume เข้าบทที่ค้าง (ข้าม Start Menu) เมื่อเล่น flow บางบทแต่ไม่ครบ; fresh/ครบ → Start Menu | XS | 🟢 Done (code) — `page.tsx handleNext`; รอ browser QA |
| [US-GAME-03-R2](./user-stories/US-GAME-03-R2.md) | ในฐานะผู้เล่น G3 ฉันต้องการให้สุ่มโจทย์ และภาพ "จริง" เป็นภาพถ่ายจริง (ไม่ใช่ mockup AI) | สุ่มโจทย์จากคลัง (คุมสัดส่วน AI/จริง); รื้อโจทย์ `isAi:false` ให้เป็นภาพถ่ายจริงทั้งหมด; เพิ่มโจทย์ใหม่ขยายคลัง; เกณฑ์ดาวอิงจำนวนข้อ (ไม่ hardcode 6); เฉลยบอกประเภทปลอม (AI/ตัดต่อ) | L | 🏗 In Progress — code + คลัง 17 ข้อ เสร็จ (2026-08-05); รอ browser QA |

## Client Feedback — รอบ 2026-08-06

> จากการรวบรวมข้อเสนอแนะและผลตอบรับจากลูกค้า/ทีมงานประจำวันที่ **2026-08-06** — ดู [FB-2026-08-06-client-feedback.md](./feedback/FB-2026-08-06-client-feedback.md) | เป็นชุดงานที่ต่อยอดเพื่อพัฒนาให้เหมาะสำหรับผู้ใช้และผู้สูงวัยในทุกจุดก่อนลงพื้นที่จริง

| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| [US-CF-34](./user-stories/US-CF-34.md) | ในฐานะผู้ใช้งาน ฉันต้องการให้คำว่า "สนุก ๆ" บนหน้า Landing มีเว้นวรรคไม้ยมกถูกต้อง | แก้ข้อความ "สนุกๆ" เป็น "สนุก ๆ" ใน `page.tsx` | XS | 🟢 Done (Needs QA) — [FB](./feedback/FB-2026-08-06-client-feedback.md) #1 |
| [US-CF-35](./user-stories/US-CF-35.md) | ในฐานะผู้เรียน ฉันต้องการข้อความชวนดูคลิปที่สะกดถูก และระบุ “ยุคโซเชียลมีเดีย ใคร ๆ ก็ทำสื่อได้" | แก้คำผิด "พรอ้ม" เป็น "พร้อม"; เปลี่ยนข้อความชวนชมเป็น "พร้อมแล้วไปดูคลิป “ยุคโซเชียลมีเดีย ใคร ๆ ก็ทำสื่อได้" กันเลย!" | XS | 🟢 Done (Needs QA) — [FB](./feedback/FB-2026-08-06-client-feedback.md) #2 |
| [US-CF-36](./user-stories/US-CF-36.md) | ในฐานะผู้สูงอายุ ฉันต้องการเว้นวรรค "อื่น ๆ" ของตัวเลือกอายุ และตัวหนังสือเลือกพื้นที่ใหญ่ขึ้น | เว้นวรรคไม้ยมก "อื่น ๆ"; ขยายขนาดตัวหนังสือเลือกพื้นที่ (จังหวัด/อำเภอ/ตำบล) ในหน้า Consent $\ge 18\text{px}$ | S | 🟢 Done (Needs QA) — [FB](./feedback/FB-2026-08-06-client-feedback.md) #3 |
| [US-CF-37](./user-stories/US-CF-37.md) | ในฐานะผู้ใช้งาน ฉันต้องการให้ชื่อคลิป "ใคร ๆ ก็ทำสื่อได้" ในหน้าวิดีโอเว้นวรรคไม้ยมกถูกต้อง | แก้ข้อความ "ใครๆก็ทำสื่อได้" เป็น "ใคร ๆ ก็ทำสื่อได้" ในหน้า Video Player และทั่วระบบ | XS | 🟢 Done (Needs QA) — [FB](./feedback/FB-2026-08-06-client-feedback.md) #4 |
| [US-CF-38](./user-stories/US-CF-38.md) | ในฐานะผู้เล่น G1 ฉันต้องการวิธีเล่นเป็นลำดับชัดเจน และโจทย์/เฉลยพร้อมจุดสังเกต 4 ข้อ | ปรับวิธีเล่นเป็น 2 ข้อ (เลือกตอบ -> อ่านเฉลย); อัปเดตโจทย์/เฉลย 4 ข้อ (หอมหัวใหญ่, ใบขับขี่, กรมอุตุฯ พายุฝน, เงินช่วย 3,000 บาท) ตามสเปก | M | 🟢 Done (Needs QA) — [FB](./feedback/FB-2026-08-06-client-feedback.md) #5 |
| [US-CF-39](./user-stories/US-CF-39.md) | ในฐานะผู้เล่น G3 ฉันต้องการชื่อ "AI หรือ ของจริง" ตัดคำเตือนบนรูป และตรวจสอบภาพกับเฉลยให้ถูก | เปลี่ยนชื่อเป็น "AI หรือ ของจริง"; ลบข้อความ "ภาพนี้จำลองโดย AI เพื่อการศึกษา" ออกจากภาพ/เฉลย; ตรวจสอบและแก้ไขภาพจริง (แม่ค้า/ทำนา/อาหาร) กับคำตอบใน JSON | M | 🟢 Done (Needs QA) — [FB](./feedback/FB-2026-08-06-client-feedback.md) #6 |
| [US-CF-40](./user-stories/US-CF-40.md) | ในฐานะผู้เล่น G6 ฉันต้องการคำชี้แจงชัดเจน และตัวเลือก "กดตอบทันที" / "หยุดคิด" | ปรับสตริงคำชี้แจงจุดสังเกตและคำถามก่อนตอบ; เปลี่ยนปุ่มตัวเลือกจาก ตอบกลับ/ไม่ตอบกลับ เป็น "กดตอบทันที" และ "หยุดคิด" | M | 🟢 Done (Needs QA) — [FB](./feedback/FB-2026-08-06-client-feedback.md) #7 |
| [US-CF-41](./user-stories/US-CF-41.md) | ในฐานะผู้เล่น G13 ฉันต้องการชื่อ "ต่อไอติมฝึกสมอง" และถอดคำว่า "ไม่มี game over" ออก | เปลี่ยนชื่อเกมเป็น "ต่อไอติมฝึกสมอง"; ค้นหาและนำข้อความ "ไม่มี game over" ออกจากทุกจุดใน UI และคำอธิบายเกม | XS | 🟢 Done (Needs QA) — [FB](./feedback/FB-2026-08-06-client-feedback.md) #8 |
| [US-CF-42](./user-stories/US-CF-42.md) | ในฐานะผู้เรียน ฉันต้องการเห็นหน้าจอยินดี "เก่งมากท่านได้เรียนรู้ครบถ้วน" เมื่อจบ G13 | หลังกดเสร็จสิ้นบทเรียนจาก G13 ในระบบ Flow ให้นำทางไปหน้าชื่นชมใหม่ แสดงข้อความ "เก่งมากท่านได้เรียนรู้ครบถ้วน" และมีปุ่ม "กลับไปหน้าหลัก" เพียง 1 ปุ่ม | S | 🟢 Done — [FB](./feedback/FB-2026-08-06-client-feedback.md) #9 |
| [US-CF-43](./user-stories/US-CF-43.md) | ในฐานะทีมและผู้นำชุมชน ฉันต้องการภาพ Preview ขึ้นเวลาแชร์ลิงก์ทางโซเชียลมีเดีย | จัดทำไฟล์รูปภาพ `public/og-image.jpg`; ตั้งค่า `openGraph` และ `twitter` meta tag ใน `src/app/layout.tsx` | S | 🔴 To Do — [FB](./feedback/FB-2026-08-06-client-feedback.md) #10 |
| [US-CF-44](./user-stories/US-CF-44.md) | ในฐานะผู้เรียนและทีมผู้สอน ฉันต้องการให้ระบบเล่นวิดีโอรองรับไฟล์ MP4 สำรองเมื่อ YouTube ไม่พร้อมใช้งาน | ปรับ Video Player รองรับทั้ง YouTube Iframe API และ HTML5 `<video>` (.mp4); รักษาพฤติกรรมบันทึก progress, auto-advance 15 วิ และการเล่นซ้ำให้เหมือนกัน 100% | M | 🟢 Done |

## Client Feedback — รอบ 2026-08-07

> ผลตอบรับด้านเทคนิคจากการทดสอบบนอุปกรณ์จริงประจำวันที่ **2026-08-07** — ดู [FB-2026-08-07-font-scaling.md](./feedback/FB-2026-08-07-font-scaling.md)

| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| [US-CF-45](./user-stories/US-CF-45.md) | ในฐานะผู้สูงอายุที่ตั้งฟอนต์เครื่องใหญ่ ฉันต้องการให้แอปแสดงตามขนาดที่ออกแบบ ไม่ถูกคูณซ้ำจน layout เพี้ยน | ตั้ง `text-size-adjust: 100%` บน `html, body` (`src/app/globals.css`) กันการขยายระดับ OS ได้ (ทดสอบเครื่องจริง ✅); Chrome in-browser Text scaling เป็นข้อจำกัดที่ CSS กันไม่ได้ (รับทราบ) | S | 🟢 Done (Needs QA) — [FB](./feedback/FB-2026-08-07-font-scaling.md) #1 |
| [US-CF-46](./user-stories/US-CF-46.md) | ในฐานะผู้เรียน ฉันต้องการให้คลิป (YouTube + MP4) เล่นมีเสียงเลย ไม่มีปุ่ม "แตะเพื่อเปิดเสียง" เกะกะ | ถอดปุ่ม overlay + state `isMuted`/`handleUnmute`/import `VolumeX`; YouTube `mute:0`; MP4 เล่นมีเสียง ไม่มี fallback ปิดเสียง (`src/app/lessons/[id]/video/page.tsx`) — แก้ความเข้าใจคลาดเคลื่อนจาก `0.7.2` | XS | 🟢 Done (Needs QA) |

## Client Feedback — รอบ 2026-08-14

> ผลตอบรับด้าน UX และ feature ใหม่ประจำวันที่ **2026-08-14** — ปรับปรุง Video Player (US-CF-47..49), เพิ่มระบบ Leaderboard (US-CF-50), Polish UX/UI ตาม Designer (US-CF-51)

| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| [US-CF-47](./user-stories/US-CF-47.md) | ในฐานะผู้เรียน ฉันต้องการให้ popup หลังวิดีโอจบไม่มีปุ่ม "เล่นซ้ำ" ซ้ำซ้อน และเมื่อกดเล่นซ้ำที่ player ให้หยุด auto-advance | ลบปุ่มเล่นซ้ำจาก popup เหลือปุ่มไปเล่นเกมเต็มความกว้าง; reset countdown เมื่อ YouTube/MP4 กลับมาเล่น | S | 🔍 In QA — implementation เสร็จ รอ browser QA |
| [US-CF-48](./user-stories/US-CF-48.md) | ในฐานะผู้เรียน ฉันต้องการให้วิดีโอ YouTube เล่นเสียงอัตโนมัติเมื่อเริ่มดูคลิป | YouTube ใช้ `autoplay: 1`, `mute: 0`, `controls: 1` และ `onReady` → `playVideo()`; MP4 เล่นโดยตั้ง `muted = false`; ไม่มีปุ่มเปิดเสียงพิเศษ | S | 🟢 Done — ผู้ใช้ยืนยัน Runtime QA |
| [US-CF-49](./user-stories/US-CF-49.md) | ในฐานะผู้เรียนเน็ตช้า ฉันต้องการปุ่ม "ข้ามวิดีโอ" เมื่อรอโหลดเกิน 7 วินาที | timeout 7 วิ → ปุ่มข้าม slide-up (style เดียวกับ continue); วิดีโอโหลดสำเร็จ → ซ่อนปุ่ม; log events 3 ตัว | M | 🟢 Done |
| [US-CF-50](./user-stories/US-CF-50.md) | ในฐานะผู้เรียน ฉันต้องการกรอกชื่อครั้งเดียวและดู Leaderboard ของเกมที่เพิ่งเล่น เพื่อเทียบคะแนนแต่ละรอบกับตนเองและผู้เล่นอื่น | `/lessons/[id]/leaderboard` ตรวจ local player UUID+ชื่อเพื่อข้ามฟอร์ม; ยืนยันด้วย popup ก่อนเก็บ/ไม่เก็บคะแนน; derive `gid` จากเกมใน route; เก็บทุกผลเล่นเป็น history; แสดง Top 10 ของเกมนั้นเท่านั้น; อ่าน/เขียน Supabase ผ่าน server API | L | 🟡 In Progress — G13 score submission, Supabase DB QA และ browse-only regression ผ่านแล้ว; เพิ่ม popup ยืนยัน; full mobile/LINE QA ยังรอ |
| [US-CF-51](./user-stories/US-CF-51.md) | ในฐานะผู้เรียน ฉันต้องการให้ UI ทุกหน้าถูก polish ตาม design จาก UX/UI designer | ปรับ UI ตรงตาม design; ใช้ design token กลาง; คง accessibility ผู้สูงอายุ; zero-scroll; รอ design assets | L | 🔴 To Do |

## Linked GDD Features
- Derived from: [Concept](../gdd/00-concept.md), [Core Mechanics](../gdd/01-mechanics.md), [User Journey](../gdd/05-user-journey.md)
- Mini Prototype (E-WORLD): [04 Requirements Spec](../wiki/design/04-requirements-specification.md), [05 Mini Prototype GDD](../wiki/design/05-mini-prototype-gdd.docx.md)
