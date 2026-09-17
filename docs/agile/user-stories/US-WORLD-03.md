# User Story: US-WORLD-03 - Typed Event Bus + MinigameResult Contract + Migrate onFinish

**Status:** 📋 Backlog — **[Sprint 07](../sprint-backlog/sprint-07.md)** (Foundation / Phase 1)
**Epic:** E-WORLD — Top-Down Mini Prototype "รู้ทันกลางสายหมอก"
**Priority:** 🔴 P0 (contract กลางที่ story อื่นพึ่ง)
**Estimate:** M
**Scope reference:** [05 GDD](../../wiki/design/05-mini-prototype-gdd.docx.md) §13, §19.3 · [04 SRS](../../wiki/design/04-requirements-specification.md) §6.3, §16.3
**Depends on:** [US-WORLD-01](./US-WORLD-01.md)
**Last Updated:** 2026-07-21

---

## Story

**ในฐานะ** ทีมพัฒนา
**ฉันต้องการ** ช่องทางสื่อสารมาตรฐานระหว่างโลก Canvas กับมินิเกม React
**เพื่อที่จะ** เปิด/ปิดมินิเกมและรับผลลัพธ์กลับได้เหมือนกันทุกเกม โดยโลกไม่ต้องรู้ logic ภายในเกม

## ปัญหาที่ต้องแก้

ตอนนี้มินิเกมทุกเกมส่งกลับแค่ `onFinish(stars)` + `logEvent` แต่เอกสารต้องการผลลัพธ์ละเอียด (§13, §16.3) — ต้องออกแบบ **`MinigameResult` contract** และ migrate `onFinish` แบบ **backward-compatible** ไม่ให้ Dev Game Hub / flow `/lessons/[id]/game` เดิมพัง

## ขอบเขตของรอบนี้ (Prototype Scope)

**ทำในรอบนี้:**
- **Typed Event Bus** (§19.3): `world-ready`, `interaction-started`, `dialogue-opened`, `incident-started`, `minigame-opened`, `minigame-completed`, `minigame-closed`, `quest-updated`, `day-completed`, `save-requested` — พร้อม TypeScript type ต่อ event
- **`MinigameResult` interface** ตาม §13: `minigameId, incidentId, completed, score, stars, correctCount, mistakeCount, duration, hintsUsed, retryCount, outcome`
- **Migrate `onFinish`**: จาก `onFinish(stars)` → `onFinish(result: MinigameResult)` โดยให้ `GameShell` เป็นตัวประกอบ result จาก event ที่เกม log อยู่แล้ว (correct/wrong/hint/retry) — เกมส่วนใหญ่ **แทบไม่ต้องแก้ภายใน**
- Adapter: โลกส่ง incident payload เข้ามินิเกม แล้วรับ `MinigameResult` กลับ, กัน instance ซ้ำ (§16.2)

**ยังไม่ทำในรอบนี้:**
- เขียน incident/quest จริง (→ US-WORLD-05), เชื่อมครบ 10 เกม (→ US-WORLD-06)
- ส่ง result ขึ้น Supabase (prototype เก็บ local ก่อน — US-WORLD-08)

## Acceptance Criteria (Prototype)

- [ ] มี Event Bus แบบ typed ครบ 10 event ตาม §19.3 พร้อม unit test เบื้องต้น
- [ ] มี `MinigameResult` interface ตาม §13 (มี field ครบ, มี type)
- [ ] `onFinish` รับ `MinigameResult` ได้ และ **flow เดิม (Dev Game Hub, lesson game) ยังทำงานปกติ** (backward compatible)
- [ ] `GameShell` ประกอบ result (correctCount/mistakeCount/hintsUsed/retryCount/duration) จาก event ที่เกม log — ตรวจกับ ≥2 เกม (เช่น G1, G6)
- [ ] เปิดมินิเกมจาก event `minigame-opened` แล้วรับ `minigame-completed` (พร้อม result) กลับได้
- [ ] กันเปิดมินิเกมซ้อน/instance ซ้ำ

## Technical Tasks

- [ ] สร้าง `src/lib/world/event-bus.ts` (typed emitter) + type map
- [ ] สร้าง `src/types/minigame-result.ts` (`MinigameResult`)
- [ ] แก้ signature `onFinish` ใน `GameShell.jsx` + จุดเรียกใช้ (Dev Game Hub, lesson flow) แบบ backward compat
- [ ] ให้ GameShell รวบ event ต่อเกมเป็น result — verify กับ G1 + G6
- [ ] unit test event bus + result mapping (Vitest)
- [ ] ตรวจ `tsc`/`eslint` + รัน flow เดิมยืนยันไม่พัง

## Related Documents
- Prototype GDD: [05 §13 Minigame Integration, §19.3 Event Bus](../../wiki/design/05-mini-prototype-gdd.docx.md)
- SRS: [04 §16 Minigame Integration Requirements](../../wiki/design/04-requirements-specification.md)
- ใช้โดย: [US-WORLD-05](./US-WORLD-05.md), [US-WORLD-06](./US-WORLD-06.md)
