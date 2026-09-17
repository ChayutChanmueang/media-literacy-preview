# User Story: US-GAME-13-R2 - Remake เกมวางไอติม G13 ด้วย Canvas

**Version:** 1.1 | **Last Updated:** 2026-07-31
**Status:** 🔍 In QA — Canvas remake implemented, รอ runtime/playtest viewport จริง
**Sprint:** [Sprint 08](../sprint-backlog/sprint-08.md) — แทนขอบเขตเดิมของ [US-GAME-13-R1](./US-GAME-13-R1.md)
**Priority:** Nice — เกมสนุกปิดท้าย Flow ([US-FLOW-01](./US-FLOW-01.md), terminal `flow-g13`)
**Estimate:** L
**GDD Source:** [design-g13.md](../../gdd/design-g13.md) — ต้อง sync กลไกใหม่เมื่อเริ่ม implementation
**Current Prototype:** [US-GAME-13](./US-GAME-13.md) / `src/components/G13ScoopStacker.tsx`

---

## 📖 Description

**ในฐานะ** ผู้เล่นที่มาถึงเกมปิดท้าย Flow
**ฉันต้องการ** เล่นเกมลากกรวยรับไอติมจริงที่ลื่นไหลและอ่านสถานะจากภาพได้ทันที
**เพื่อให้** จบบทเรียนด้วยเกมแอ็กชันที่เน้นความสนุก ไม่ถูกข้อความจำนวนมากรบกวน และไม่เกิดบั๊กจาก DOM element ที่ถูกบีบหรือเลื่อนหลุดพื้นที่เล่น

## 🎯 Product Decision

G13 รอบนี้เป็น **remake ใหม่บน HTML Canvas** ไม่ใช่การ polish DOM prototype เดิม:

- ใช้ `<canvas>` เป็น playfield และวาด/อัปเดตวัตถุเกมใน animation loop เดียว
- React/DOM ใช้เฉพาะ shell และหน้าจอ tutorial/summary ที่จำเป็น ไม่ใช้ `<div>` เป็นวัตถุไอติมตกหรือหอไอติม
- เปลี่ยนจากเกมคัดแยก “สกู๊ปดี/ร้ายที่มีข้อความเตือนภัย” เป็นเกมรับไอติมจริงเพื่อความสนุก
- อุปสรรคมีชนิดเดียวคือ **ระเบิด**; ผู้เล่นต้องลากหลบ
- เพิ่มระยะเวลาเล่นจาก prototype เป็น **120 วินาที (2 นาที)** เพื่อให้ต่อหอและเห็น camera/sky progression ได้เต็มที่
- คงแนวคิดหอไอติมสูงแล้วโยกมากขึ้น แต่แก้ collision/stacking ใหม่ทั้งหมด

## 🎮 Core Loop ใหม่

1. เริ่มเซสชัน 120 วินาทีพร้อมกรวยไอติมที่ด้านล่าง
2. สุ่มไอติมรส/สีต่าง ๆ ตกจากขอบบน ผู้เล่นลากกรวยและหอซ้าย-ขวาเพื่อรับ
3. เมื่อไอติมแตะ **ไอติมชั้นบนสุด** (หรือกรวยเมื่อหอยังว่าง) ให้ต่อเป็นชั้นใหม่ทันที
4. ยิ่งต่อสูง หอไอติมยิ่งโยกซ้าย-ขวาชัดขึ้น โดยยังควบคุมได้และไม่มี Game Over
5. สุ่มระเบิดตกเป็นอุปสรรค:
   - หลบสำเร็จ → เล่นต่อ
   - ระเบิดชนกรวยหรือหอ → ไอติมบนสุดสูงสุด 2 ลูกหลุดและร่วงออกจากกอง
6. เมื่อหมดเวลา แสดงความสูง/จำนวนไอติมที่ต่อได้และคำชม แล้วคง contract `onFinish(...)`/Flow เดิม

## 🧱 Canvas & World-Bounds Requirements

- Canvas ต้องมี logical coordinate system และปรับ backing store ตาม `devicePixelRatio` เพื่อภาพคมโดยไม่ทำให้ physics เร็ว/ช้าตาม display scale
- วัตถุเกมทุกชนิดต้องถูก clip ภายในขอบ canvas; ไอติม/ชิ้นส่วนที่ร่วงออกนอก playfield ต้องหายไปเมื่อพ้น world bounds
- เมื่อกรวยเลื่อนไปซ้าย/ขวาสุด วัตถุต้องถูกจำกัดตำแหน่งด้วย world bounds และ **ห้ามถูก CSS/flex บีบรูปทรง**
- resize/orientation change ต้องคำนวณ canvas scale และตำแหน่งวัตถุใหม่โดยไม่เพิ่ม/ลบชั้นหรือทำ collision ซ้ำ
- animation ใช้ `requestAnimationFrame` + delta time และแยก simulation coordinate ออกจาก CSS pixel

## 🎨 Art & Assets

- สร้างกรวยไอติมเป็น SVG/vector ที่ดูเป็นกรวยจริง: ทรงกรวย, ขอบปากกรวย และลายตารางวาฟเฟิล
- วาดไอติมเป็นทรง scoop จริงบน Canvas (หลายรส/สี) ไม่มี emoji และไม่มีข้อความความรู้บน scoop
- ระเบิดต้องแยกจากไอติมได้ทันทีด้วย silhouette/สี/ประกายชนวน และมี visual feedback ตอนชน
- SVG เป็น source asset ได้ แต่ runtime object ของ playfield ต้อง render ลง Canvas
- visual style สดใส อ่านง่าย และไม่พึ่งข้อความระหว่างเล่น

## ✅ Acceptance Criteria

1. [ ] Gameplay ทั้งหมด (ไอติมตก, กรวย/หอ, ระเบิด, ชิ้นส่วนที่หลุด, collision และ wobble) render และ update บน `<canvas>`; ไม่มี DOM `<div>` ทำหน้าที่เป็น game object
2. [ ] เกมใช้เวลา 120 วินาทีและยังเปิด/จบผ่าน Flow เดิมได้
3. [ ] ไอติมไม่มี emoji, label หรือเนื้อหาเตือนภัย; ไอติมแต่ละลูกมีรูปทรง/สีเหมือนไอติมจริง
4. [ ] ไอติมต่อทันทีเมื่อชนไอติมบนสุดของหอ ไม่ต้องตกทะลุลงไปถึงกรวย; ลูกแรกเท่านั้นที่ชนกรวย
5. [ ] ระเบิดที่ชนกรวยหรือหอทำให้ไอติมบนสุดร่วงออกสูงสุด 2 ลูก; ถ้ามีน้อยกว่า 2 ให้ร่วงเท่าที่มี และจำนวนชั้นต้องไม่ติดลบ
6. [ ] ไอติม/ระเบิด/ชิ้นส่วนที่ร่วงออกนอกขอบ playfield ถูก clip และ cleanup โดยไม่บีบย่อ ไม่ค้างใน memory และไม่เกิด collision ซ้ำ
7. [ ] กรวยและหอเลื่อนซ้าย-ขวาได้ลื่น แต่ไม่หลุด world bounds; touch/pointer mapping ถูกต้องเมื่อ canvas ถูก resize หรือมี `devicePixelRatio` สูง
8. [ ] ความแรง/ระยะโยกเพิ่มตามความสูงของหออย่างต่อเนื่อง และ visual wobble ไม่ทำให้ collision geometry แยกจากตำแหน่งที่ผู้เล่นเห็น
   - เมื่อยอดสูงเกินครึ่ง playfield กล้องต้องติดตามขึ้นไปเรื่อย ๆ (ใช้ world/camera offset ได้) และเลื่อนกลับอย่างนุ่มนวลเมื่อระเบิดทำจำนวนชั้นลดลง
9. [ ] ไม่มี Game Over; โดนระเบิดแล้วยังเล่นต่อจนหมดเวลา พร้อม feedback เชิงภาพ/เสียงที่ไม่ลงโทษผู้เล่น
10. [ ] กรวยใช้ SVG/vector ลายวาฟเฟิลที่ดูเป็นกรวยไอติมจริง และ asset ไม่มีการยืดผิดสัดส่วน
11. [ ] เล่นได้แบบ portrait single-screen บน 360×740, 375×667 และ 390×844 โดยทั้งหน้าไม่ scroll และ HUD ไม่บัง playfield
12. [ ] คง `game_start`, collision/catch, obstacle hit และ `game_complete` analytics ในรูปแบบที่ไม่ผูกกับเนื้อหา good/bad เดิม; schema event ใหม่ต้องบันทึกใน task ก่อน implement
13. [ ] `npx tsc --noEmit`, lint เฉพาะไฟล์ G13 และ runtime playtest ผ่าน; ไม่มี React ref-during-render/setState-in-animation-loop error จาก prototype เดิม

## 🛠 Technical Tasks

- [x] ออกแบบ canvas coordinate system, DPR scaling, resize strategy และ world bounds
- [x] แยก simulation state ออกจาก React render; สร้าง update loop ด้วย `requestAnimationFrame`
- [x] สร้าง entity/model สำหรับ scoop, bomb, cone, stacked scoop และ falling debris
- [x] สร้าง collision: falling scoop ↔ top-of-stack/cone และ bomb ↔ tower
- [x] สร้าง stack anchoring + height-based wobble โดย collision geometry ตรงกับภาพ
- [x] สร้าง bomb penalty ให้ pop ไอติมบนสุดไม่เกิน 2 ลูกเข้าสู่ falling-debris simulation
- [x] วาด/เพิ่ม SVG กรวยลายวาฟเฟิลและวาดไอติม/ระเบิดบน Canvas
- [x] ตัด dependency ต่อ `g13-scoop-items.json` และ content feedback good/bad ออกจาก gameplay ใหม่
- [x] ตั้ง session 120 วินาที, คง Flow terminal, `onFinish` และ summary contract
- [x] นิยาม analytics event/payload ใหม่ใน [design-g13.md](../../gdd/design-g13.md)
- [ ] เพิ่ม unit tests สำหรับ collision, stack/pop, bounds และ timer
- [ ] playtest viewport matrix + DPR สูง + pointer/touch และตรวจ cleanup หลัง unmount

## 🚫 Out of Scope

- ไม่เพิ่มบทเรียน/ข้อความแจ้งเตือนภัยลงบนไอติม
- ไม่เพิ่มชีวิต, คะแนนติดลบ หรือหน้าจอแพ้
- ไม่เปลี่ยนลำดับ Flow หลังจบ G13
- ยังไม่เริ่ม implementation จนกว่าผู้ใช้จะสั่ง

## 🔗 Related Documents

- Prototype: [US-GAME-13](./US-GAME-13.md)
- Superseded rework: [US-GAME-13-R1](./US-GAME-13-R1.md)
- Flow: [US-FLOW-01](./US-FLOW-01.md)
- Responsive parent: [US-UX-05](./US-UX-05.md)
- GDD: [design-g13.md](../../gdd/design-g13.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
