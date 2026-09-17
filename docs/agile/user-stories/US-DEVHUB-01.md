# User Story: US-DEVHUB-01 - เพิ่มขนาดฟอนต์หน้าสรุปผล (Result Modal) ใน Dev Game Hub

**Status:** 🏗 In Progress (2026-07-30)
**Sprint:** งานย่อยระหว่าง QA เกม (ต่อเนื่องจากรื้อ UI มินิเกม) — dev tool
**Priority:** เล็ก (dev-only, ช่วยอ่านง่ายตอน playtest/สาธิต)
**Component:** `src/app/dev/games/DevGameHubClient.tsx` (result modal, บรรทัด ~241–274)

> ⚠️ **ขอบเขต:** นี่คือ **result modal ของ Dev Game Hub** (โหมดทดสอบ `/dev/games` — ข้อความ "เกมเรียกใช้ onFinish แล้ว / โหมดทดสอบ...") ไม่ใช่หน้าสรุปจริงที่ผู้เล่นเห็น หน้าจริงคือ [`RewardScreen.jsx`](../../../src/components/RewardScreen.jsx) + route `/lessons/[id]/summary` (คนละตัว — ยังไม่แตะในงานนี้ เว้นแต่ผู้ใช้สั่งเพิ่ม)

---

## 📖 Description

**ในฐานะ** dev/กระบวนกรที่ทดสอบเกมผ่าน Dev Game Hub
**ฉันต้องการ** ให้ตัวหนังสือในหน้าสรุปผล (modal หลังจบเกม) ใหญ่ขึ้น
**เพื่อที่จะ** อ่านผล/ปุ่มได้ชัดตอน playtest หรือสาธิตบนมือถือ (ปัจจุบันเล็กมาก `text-sm`/`text-xs`)

## 🎯 ขอบเขตงาน

เพิ่มขนาดฟอนต์ทุกส่วนใน result modal ให้ **ใหญ่ขึ้นเทียบเท่าข้อความข่าวสารของ G1 (~26px)** — คงโครง/ปุ่ม/logic เดิม แก้เฉพาะขนาดตัวอักษร + ขนาดดาว:

| ส่วน | เดิม | ใหม่ |
|------|------|------|
| caption "เกมเรียกใช้ onFinish แล้ว" | `text-sm` (14px) | **24px** |
| หัวข้อ "ได้ N ดาว" | `text-2xl` (24px) | **34px** (ตัวใหญ่สุด) |
| ดาว (Star) | `size={28}` | **44** |
| หมายเหตุ "โหมดทดสอบ..." | `text-xs` (12px) | **22px** |
| ปุ่ม "เล่นใหม่" / "กลับหน้ารวมเกม" | default (~16px) | **26px** + ปุ่มสูงขึ้น |

## ✅ Acceptance Criteria

- [x] ทุกข้อความใน result modal อ่านง่ายบนมือถือ (≥ ~22px, ตัวหลัก/ปุ่ม ~26px) — implement 2026-07-30
- [x] หัวข้อ "ได้ N ดาว" เด่นสุด (34px), ดาวใหญ่ขึ้น (size 44)
- [x] คง logic เดิม (`replay`, `backToList`, onFinish overlay) และ layout modal ไม่พัง
- [x] tsc + eslint ผ่าน
- [ ] ⏳ playtest ยืนยันบนจอจริง

## 🔗 Related
- Dev Game Hub: [US-03-R4](./US-03-R4.md)
- หน้าสรุปจริงของผู้เล่น (นอกขอบเขต): `RewardScreen.jsx`
