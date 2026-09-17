# User Story: US-GAME-13-R1 - รื้อ UI/Layout เกม G13 ต่อไอติมรู้ทันสื่อ (Rework)

**Status:** ⛔ Superseded by [US-GAME-13-R2 — Canvas Remake](./US-GAME-13-R2.md) (2026-07-30)
**Sprint:** [Sprint 08](../sprint-backlog/sprint-08.md) — breakdown ของ [US-UX-05](./US-UX-05.md) (responsive + นำ design UX/UI มาใช้จริง)
**Priority:** Nice — ชุดที่ 2: ทัศนคติ | **เกมปิดท้าย Flow ใหม่** ([US-FLOW-01](./US-FLOW-01.md) terminal `flow-g13`)
**Estimate:** M
**GDD Source:** [design-g13.md](../../gdd/design-g13.md)
**Component:** `src/components/G13ScoopStacker.tsx` (มี prototype แล้ว — [US-GAME-13](./US-GAME-13.md))

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** ให้เกม G13 ที่ปิดท้าย Flow มีหน้าตา/เลย์เอาต์ใหม่ที่พอดีจอและเล่นลื่น
**เพื่อที่จะ** จบบทเรียนด้วยเกมสนุกที่เล่นได้เต็มจอบนมือถือเครื่องเล็กโดยไม่มีส่วนล้นจอ

## 🎯 ขอบเขตงานรื้อ (Rework Scope)

> หมายเหตุ: G13 เป็น prototype ใหม่ล่าสุด (`.tsx` แล้ว) — งานนี้ต่อยอดจาก prototype ให้ตรง design + responsive
> ⚠️ **สเปกปุ่มตอบ 1 แถว (2026-07-30) ไม่บังคับใช้กับ G13** — G13 ไม่มีปุ่มตัวเลือก (input เดียวคือลากโคน) จึงไม่เกี่ยวกับการรื้อปุ่มตอบของ G1/G3/G6
> ⛔ **ไม่ทำ task นี้แยกแล้ว:** ขอบเขต DOM/responsive rework ถูกแทนด้วยการ remake บน Canvas ใน [US-GAME-13-R2](./US-GAME-13-R2.md)

1. **UI ใหม่** — ปรับหน้าตาให้ตรง design UX/UI (สไตล์ไอติมสดใส ไม่ดูเป็น "แอปเด็ก") + ใช้ design token กลาง
2. **Layout ใหม่** — single-screen: พื้นที่เล่น (โคน + หอไอติม + สกู๊ปตก) + ป้ายข้อความสกู๊ป + แผงเฉลย/จุดสังเกต อยู่ในเฟรมเดียว **สเกลตามความสูงจอจริง** (หอไอติมสูงขึ้นต้องไม่ล้นจอเล็ก)
3. **Logic บางจุด (ทบทวนกับ GDD)** — ยืนยันให้ตรง [design-g13.md](../../gdd/design-g13.md):
   - Input เดียว: ลากโคนซ้าย-ขวา; รับสกู๊ป "ดี" = หอสูง, เผลอรับ "ร้าย" = wobble (ไม่ล้ม), **ไม่มี Game Over**
   - ในบริบท Flow: เกมปิดท้าย **ไม่ให้ดาว/ไม่มีจอแพ้** ([US-FLOW-01](./US-FLOW-01.md))
   - จูนฟิสิกส์ wobble / ความเร็วสกู๊ปตก ให้เหมาะผู้สูงอายุ (ยังเป็น Open Question ใน GDD)
   - *(รายการ logic fix ที่เจาะจงให้ groom กับทีม/GDD ตอนเริ่มงาน)*

## ✅ Acceptance Criteria

- [ ] ผ่าน audit `zero-scroll-ui` บนจอเล็ก/A10s/LINE browser; หอไอติมสูงสุดไม่ล้นจอ
- [ ] ใช้ design token กลาง + ตรง design UX/UI
- [ ] คงเกณฑ์ Accessibility + ✓/✗ คู่สี + ไม่มี Game Over/จับเวลากดดัน
- [ ] ลากลื่นไม่กระตุก บนเครื่องสเปคต่ำ (A10s); รองรับ `prefers-reduced-motion`
- [ ] ในบริบท Flow ไม่ให้ดาว/ไม่มีจอแพ้; คงการยิง event + `onFinish` ไม่พัง
- [ ] รองรับ dark/theme/size

## 🛠 Technical Tasks

- [ ] จัด playfield ให้สเกลตามความสูงจอ (viewport-based) + design token
- [ ] จูน wobble/ความเร็วสกู๊ป (อ้าง Open Questions ใน design doc)
- [ ] ต่อ behavior โหมด Flow (ไม่ให้ดาว) ให้ตรง [US-FLOW-01](./US-FLOW-01.md)
- [ ] ตรวจ `tsc`/`eslint` ผ่าน + playtest คลิกจริง + วัด FPS บน A10s

## 🔗 Related
- Parent: [US-UX-05](./US-UX-05.md) | Flow: [US-FLOW-01](./US-FLOW-01.md)
- GDD: [design-g13.md](../../gdd/design-g13.md) | Prototype: [US-GAME-13](./US-GAME-13.md)
