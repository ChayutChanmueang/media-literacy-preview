# Detailed Design Document: G14 — ยิงลูกแก้วรู้ทันสื่อ (Goosl Glass Marbles)

**สถานะ:** 🧪 Prototype / Integrated (WebGL Canvas Engine)  
**หมวดหมู่:** 3. Motivation & Empowerment Action Game  
**ความสำคัญ:** Nice to Have / Action Minigame  
**กลุ่มเป้าหมาย:** ผู้สูงอายุ (อายุ 60 ปีขึ้นไป)  
**ผู้ออกแบบ:** ทีมวิชาการ NAPLAB & Engine จาก Goosl Marbles (Plan9)  
**เวอร์ชัน:** 1.0 | **อัปเดตล่าสุด:** 2026-08-04

---

## 1. Overview (ภาพรวมของเกม)

เกม **G14 — ยิงลูกแก้วรู้ทันสื่อ** เป็นเกมแอ็กชันฟิสิกส์ 2D/3D (WebGL Canvas) ที่ดัดแปลงมาจากเกม **Goosl Glass Marbles (구슬치기)** โดยจำลองอุปมาของการ **"เคาะข่าวปลอมและข้อมูลหลอกลวงออกจากวงความเชื่อ"**

### แนวคิดหลัก (Concept & Learning Metaphor)

- **ลูกแก้วผู้เล่น (Shooter Marble):** ตัวแทนของ *"สติ วิจารณญาณ และความรู้เท่าทันสื่อ"*
- **ลูกแก้วเป้าหมาย 7 ลูก (Target Marbles):** ตัวแทนของ *"ข่าวปลอม / ข้อความหลอกลวง / ลิงก์มิจฉาชีพ"*
- **วงกลมเป้าหมาย (Ring Boundary):** ตัวแทนของ *"ขอบเขตความเชื่อ / กรอบการรับข่าวสาร"*
- **เป้าหมายของเกม:** ผู้เล่นเล็งและลากปรับแรงยิงลูกแก้วผู้เล่นไปกระทบลูกแก้วเป้าหมาย เพื่อเคาะลูกแก้วเป้าหมายทั้ง 7 ลูกให้ออกจากวงกลมภายใน 6 โอกาส (Shots) โดย **ห้าม** ให้ลูกแก้วผู้เล่นหยุดนิ่งอยู่ภายในวงกลม (เปรียบเสมือนการไม่หลงเข้าไปติดอยู่ในวงข่าวปลอม)

---

## 2. Core Mechanics & Physics Architecture

### 2.1 Engine Specs & Rendering
- **WebGL 2.0 Shader Pipeline:** วาดลูกแก้วแก้วใสมิติสูง มีเอฟเฟกต์เงา เงาสะท้อน แสงหักเห (Glass Refraction) และเส้นเป้าหมาย (Aiming Guideline)
- **Physics Simulation:**
  - 2D Rigid Body Physics พร้อมแรงเสียดทาน (Friction), สัมประสิทธิ์การสะท้อน (Restitution / Elastic Collision), Mass Ratio
  - ระบบคำนวณตำแหน่งสะท้อนขอบและขอบวงกลมเป้าหมาย
  - รองรับ Sensor เอียงเครื่อง (Gyroscope / Device Orientation) ในโหมดเล่นอิสระ (สำหรับอุปกรณ์เคลื่อนที่)

### 2.2 Control Scheme (การควบคุม)
- **Touch / Drag to Aim:** ลากนิ้วจากลูกแก้วยิงถอยหลังเพื่อเล็งทิศทางและปรับระดับแรงยิง (Power Meter)
- **Release to Shoot:** ปล่อยนิ้วเพื่อยิงลูกแก้วพุ่งออกไปตามทิศทางและแรงที่กำหนด
- **Single-Screen Zero-Scroll UI:** แสดงผลครอบคลุมเต็มหน้าจออุปกรณ์โดยไม่มีส่วนเกินล้นสกอร์บอร์ด

---

## 3. Game Rules & Scoring

### 3.1 เงื่อนไขชนะ / แพ้
- **ชนะ (Victory):** สามารถเคาะลูกแก้วเป้าหมายออกจากวงได้สำเร็จตามเป้าหมาย
- **แพ้ (Failure):**
  1. โอกาสยิงหมดลง (0 Shots Left) แต่ยังมีลูกแก้วเป้าหมายตกค้างอยู่ในวง
  2. ลูกแก้วผู้เล่น (Shooter Marble) หยุดนิ่งอยู่ภายในวงกลม ก่อนที่ลูกแก้วเป้าหมายจะถูกเคาะออกหมด

### 3.2 การประเมินผลดาว (Star Rating)
- ⭐⭐⭐ **3 ดาว:** เคาะลูกแก้วเป้าหมายออกได้ครบ 7 ลูก โดยใช้โอกาสยิง ≤ 4 ครั้ง
- ⭐⭐ **2 ดาว:** เคาะลูกแก้วเป้าหมายออกได้ครบ 7 ลูก โดยใช้โอกาสยิง 5–6 ครั้ง
- ⭐ **1 ดาว:** เคาะลูกแก้วเป้าหมายออกได้ 4–6 ลูก
- ☆ **0 ดาว:** เคาะลูกแก้วเป้าหมายออกได้ < 4 ลูก

---

## 4. UI/UX Design for Elderly Players

- **Contrast & Visibility:** ลูกแก้วเป้าหมายมีสีสันและเงาสะท้อนชัดเจน ตัดกับฉากหลังและวงเป้าหมาย
- **Visual Feedback:** มีเส้นแสดงแนวเล็ง (Aim Line) พร้อมไอคอนบอกระดับแรงยิง (Power Indicator)
- **Audio Feedback:** ใช้ Web Audio API สร้างเสียงกระทบของลูกแก้วแก้วอย่างสมจริง (Collision Impact Sound) และเสียงลูกแก้วกลิ้งบนพื้น (Rolling Noise)

---

## 5. Analytics & Event Logging

เพื่อรักษามาตรฐาน contract เดียวกันกับมินิเกมอื่น ๆ ในระบบ:
- `game_start`: บันทึกเมื่อเริ่มเล่น G14 (`game_id: "G14"`)
- `marble_shot`: บันทึกเมื่อผู้เล่นยิงลูกแก้ว (`shot_number`, `power_percent`)
- `target_knockout`: บันทึกเมื่อลูกแก้วเป้าหมายหลุดออกจากวงกลม (`targets_remaining`)
- `game_complete`: บันทึกเมื่อจบเกม (`score`, `stars`, `shots_used`, `duration_ms`)

---

## 6. Project Integration Architecture

```
[G14GooslMarbles.tsx (React Component)]
      │
      ├── Fullscreen Responsive Container & HUD Overlay
      └── <iframe> -> /games/goosl-marbles/index.html
             │
             └── (postMessage) -> { type: "GOOSL_FINISH", stars, score }
```

- ซอร์สโค้ดเอนจินจัดเก็บที่: `public/games/goosl-marbles/`
- React Wrapper: [src/components/G14GooslMarbles.tsx](file:///c:/Users/noppon/source/03-NAPLAB/Media-Literacy/src/components/G14GooslMarbles.tsx)
- Dev Hub Entry: [src/app/dev/games/DevGameHubClient.tsx](file:///c:/Users/noppon/source/03-NAPLAB/Media-Literacy/src/app/dev/games/DevGameHubClient.tsx)
