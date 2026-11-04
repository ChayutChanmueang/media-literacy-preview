# ระบบตัวอักษรหลัก (Typography)

> **สถานะ:** ใช้เป็นระบบตัวอักษรหลักของโครงการ (ตั้งแต่ 4 พ.ย. 2569) — แทนที่ส่วนฟอนต์/ขนาดใน [02-website-design-tokens.md §2](02-website-design-tokens.md#2-ระบบตัวอักษรเพื่อผู้สูงอายุ-senior-friendly-typography) และ `design-tokens.json` (Outfit/Sarabun)
>
> **ต้นทาง:** Figma — [Scammer Game Prototype › Typography (node `1055:615`)](https://www.figma.com/design/OjTnXn9nMdooDHIyG2Gio4/Scammer-Game-Prototype?node-id=1055-615) — ค่าในตารางดึงจาก text styles/variables ของไฟล์โดยตรง ถ้า Figma เปลี่ยน ให้แก้ไฟล์นี้ตาม

---

## 1. ฟอนต์

| รายการ | ค่า |
| :--- | :--- |
| **ฟอนต์หลักทั้งโครงการ** | **Noto Looped Thai** (บน Google Fonts ชื่อ `Noto Sans Thai Looped`) |
| ข้อยกเว้นเดียว | **Mali** — เฉพาะข้อความ stage popup (ตัวหนังสือขาวขอบน้ำตาลกลางจอเล่น, `src/components/StagePopup.tsx`) |
| น้ำหนักที่ใช้ | Regular `400` · SemiBold `600` · Bold `700` |
| Letter spacing | `0` ทุก style |
| สีข้อความหลัก (`Text`) | Figma ใช้ `#4B4B4B` — **โครงการคงสีเดิมในโค้ด** (`--text-primary` และสีที่แต่ละคอมโพเนนต์ตั้งไว้) ระบบนี้กำหนดเฉพาะฟอนต์/ขนาด/น้ำหนัก/line height |
| ในโค้ด | `notoLoopedThai` จาก `src/lib/fonts.ts` (`next/font/google`, subsets `thai` + `latin`, โหลด 400/600/700 ครบแล้ว) |

---

## 2. ชุด Text Styles

| Style | ใช้กับ | ขนาด | Line height | น้ำหนัก | หมายเหตุ |
| :--- | :--- | ---: | ---: | :--- | :--- |
| **Display** | ชื่อหน้าหลัก (Major page title) | `40px` | `48px` | Bold 700 | |
| **H1** | หัวเรื่องหลัก (Main headings) | `32px` | `40px` | Bold 700 | |
| **H2** | หัวข้อส่วน (Section headings) | `28px` | `36px` | Bold 700 | |
| **H3** | หัวข้อย่อย (Subheadings) | `24px` | `32px` | SemiBold 600 | |
| **Body Large** | เนื้อหาสำคัญ (Important content) | `22px` | `32px` | Regular 400 | |
| **Body** | ข้อความทั่วไป (Default text) | `20px` | `30px` | Regular 400 | ค่าเริ่มต้นของเนื้อหา |
| **Button** | ปุ่ม/การกระทำ (Buttons/actions) | `20px` | `30px` | SemiBold 600 | |
| **Caption** | ข้อมูลรอง (Secondary information) | `18px` | `26px` | Regular 400 | |
| **Caption Underlined** (`CaptionU`) | ลิงก์/ข้อความกดได้ระดับ caption | `18px` | `26px` | Regular 400 | ขีดเส้นใต้ |
| **Small Text** (`SmallDef`) | — (Figma ไม่ได้ระบุการใช้งาน) | `12px` | `16px` | Regular 400 | ดู §3 |

**ข้อสังเกต:** ข้อความเนื้อหาและ caption เป็น **Regular 400** — ใช้ SemiBold/Bold เฉพาะหัวข้อ (H1–H3, Display) และปุ่มเท่านั้น

---

## 3. การตัดสินใจ

**ตัดสินแล้ว (4 พ.ย. 2569):**

1. **ระบบนี้มาก่อนกติกาขนาดตัวอักษรเดิมใน `AGENT.md`** — กฎเดิม "เนื้อหา ≥ 20px, ปุ่ม ≥ 22px, ทุกข้อความรวม caption ≥ 20px, `clamp()` max ≥ 20px" ยกเลิก ให้ใช้ขนาดตามตาราง §2 แทน (Button `20px`, Caption `18px`, Small Text `12px` ใช้ได้ตามที่ Figma กำหนด)
2. **Mali ใช้เฉพาะข้อความ stage popup** — ที่อื่นทั้งหมดใช้ Noto Looped Thai
3. **คงสีข้อความเดิม** — ไม่ใช้ `#4B4B4B` จาก Figma
4. **เลิกระบบปรับขนาด 3 ระดับ** (`data-size` normal/large/xlarge) — ใช้ขนาดตาม Figma ขนาดเดียว (UI ปรับขนาดถูกซ่อนไปแล้วตาม US-CF-01)
5. **Small Text 12px** — ใช้ได้เฉพาะข้อความที่ไม่ต้องอ่าน (เครดิต, เลขเวอร์ชัน) จนกว่าดีไซเนอร์จะระบุเพิ่ม
6. **ข้อยกเว้น (`type-exempt`)** — emoji/ไอคอน, ตัวเลขคะแนนขนาดใหญ่ และของตกแต่งในภาพจำลองแอป ไม่ต้องใช้ style ในตาราง แต่ต้องมีคอมเมนต์ `type-exempt` กำกับ

---

## 4. การใช้ในโค้ด (ณ 4 พ.ย. 2569)

แผนและบันทึกการนำไปใช้: [docs/implementation_plan/typography-implementation-plan.md](../../implementation_plan/typography-implementation-plan.md)

- **ฟอนต์:** Noto Looped Thai ตั้งครั้งเดียวที่ `<html>` (`notoLoopedThai.variable` ใน `src/app/layout.tsx`) — ทุกหน้า/ทุกเกมได้เอง ไม่ต้องใส่ class ฟอนต์ที่ component; Mali import ได้ที่ `src/components/StagePopup.tsx` เท่านั้น; ข้อความบน canvas ใช้ `notoLoopedThai.style.fontFamily`
- **ขนาด/น้ำหนัก/line height:** ใช้ utility ของแต่ละ style เท่านั้น — `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-button`, `text-caption`, `text-small` (ตั้งทั้งสามค่าในตัว ห้ามเติม `font-*` / `leading-*`) — ในเกมที่ย่อตามจอใช้ `gp-type-<style>` (ย่อตาม `--gp-t` ไม่ต่ำกว่า 18px) — กำหนดใน `src/app/globals.css`
- **ข้อยกเว้น:** ใส่ `data-type-exempt="<เหตุผล>"` บน element (emoji/ไอคอน, ตัวเลขคะแนนใหญ่, ของตกแต่งในภาพจำลองแอป, ข้อความ stage popup, กรอบใบประกาศ)
- **ระบบปรับขนาด 3 ระดับ (`data-size`) ถูกลบแล้ว** — ใช้ขนาดตาม Figma ขนาดเดียว
- **ยังไม่ได้ปรับ (legacy):**
  - **G14 (Goosl Marbles, iframe `public/games/goosl-marbles/`)** — ยังใช้ฟอนต์และขนาดเดิม (font stack `Inter`/`Prompt`/`Sarabun` ที่ไม่ได้โหลด → ฟอนต์ระบบ, ขนาด Tailwind เล็ก) เพราะยังไม่ได้ใช้งานจริง — ถ้าจะเปิดใช้ ต้องโฮสต์ไฟล์ Noto (woff2) ใน `public/fonts/` + `@font-face` ใน `styles.css` แล้ว map ขนาดตาม §2 (ดูแผน S5)
  - คอมโพเนนต์ที่ไม่มีหน้าใดใช้ (`LandingScreen`, `LessonSelector`, `CertificateScreen`, `VideoScreen`, `RewardScreen`, `ConsentScreen`, `G12ChuzzleStop`), ต้นแบบใน dev hub (GP1, GP2, GP5) และ `src/app/facilitator/**`
