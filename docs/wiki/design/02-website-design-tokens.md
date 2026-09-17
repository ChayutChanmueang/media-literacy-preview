# Website Design Tokens — รู้ทันสื่อวัยเก๋า

> ถอดค่าจริงจากโครงสร้าง CSS ปัจจุบันของเว็บไซต์ (`src/index.css`) ผสมผสานองค์ประกอบความพรีเมียม ขอบโค้งมน และสัดส่วนระยะห่างจากแอปตัวอย่าง GreenTravel [`_idea-1.jpg`](_idea-1.jpg)

<p align="center">
  <img src="_idea-1.jpg" alt="ภาพตัวอย่างอ้างอิง GreenTravel UI — การ์ดโค้งมน สถิติ และดาชบอร์ดแบบพรีเมียม" width="640">
</p>

---

## 1. จานสีของเว็บไซต์ (Color Palettes)

จานสีถูกกำหนดผ่านระบบ CSS Custom Properties เพื่อให้สามารถสลับคลาสได้ง่าย โดยแยกตามธีมกิจกรรม 5 ธีม:

### 1.1 จานสีหลักตามธีม (Theme Tokens)

| ชื่อตัวแปร CSS | ธีมกลาง (Default Teal) | ธีมเชียงใหม่ (Purple) | ธีมแพร่ (Orange) | ธีมน่าน (Green) | ธีม GreenTravel (Mint) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`--primary`** | `#0D9488` | `#7B2CBF` | `#E65100` | `#2E7D32` | `#00796B` |
| **`--primary-hover`**| `#0F766E` | `#5A189A` | `#BF360C` | `#1B5E20` | `#004D40` |
| **`--primary-light`**| `#CCFBF1` | `#F3E5F5` | `#FFF3E0` | `#E8F5E9` | `#E0F2F1` |
| **`--primary-dark`** | `#115E59` | `#4A148C` | `#B23C00` | `#1B5E20` | `#004D40` |

### 1.2 สีพื้นผิวและสีสนับสนุน (Surface & Supportive Colors)

| ชื่อตัวแปร CSS | โหมดสว่าง (Light Mode) | โหมดมืด (Dark Mode) | การนำไปใช้งาน |
| :--- | :--- | :--- | :--- |
| **`--bg-app`** | `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) | สีพื้นหลังนอกมือถือ/หน้าจอหลัก |
| **`--bg-card`** | `#FFFFFF` | `#1E293B` (Slate 800) | สีพื้นหลังการ์ดหรือแผงปุ่ม |
| **`--text-primary`** | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | สีข้อความหลัก อ่านง่ายที่สุด |
| **`--text-secondary`**| `#475569` (Slate 600) | `#CBD5E1` (Slate 300) | สีข้อความรอง รายละเอียด |
| **`--border`** | `#E2E8F0` (Slate 200) | `#334155` (Slate 700) | สีเส้นแบ่งและเส้นขอบตัวเลือก |
| **`--accent-success`**| `#16A34A` | `#16A34A` | ใช้แสดงข้อความเฉลยคำตอบที่ถูก |
| **`--accent-error`** | `#DC2626` | `#DC2626` | ใช้แสดงข้อความเฉลยคำตอบที่ผิด |

---

## 2. ระบบตัวอักษรเพื่อผู้สูงอายุ (Senior-Friendly Typography)

ระบบตัวอักษรออกแบบมาเป็นพิเศษเพื่อให้ผู้ใช้วัยเก๋าอ่านง่าย สบายตา และมีขนาดใหญ่ชัดเจน:

### 2.1 ตระกูลฟอนต์ (Font Families)
- **ฟอนต์สำหรับหัวเรื่องและภาษาอังกฤษ (Headings / UI)**: `'Outfit'`, `'Inter'`, `system-ui`, `sans-serif` (ให้ความรู้สึกโมเดิร์น มั่นคง)
- **ฟอนต์สำหรับเนื้อหาไทยหลัก (Thai Content)**: `'Sarabun'`, `sans-serif` (ฟอนต์ไม่มีหัวกลมมากเกินไป มีช่องไฟดี อ่านง่ายที่สุดสำหรับสถิติสายตาผู้สูงอายุ)

### 2.2 ชุดขนาดตัวอักษรแบ่งตามเครื่องมือ Accessibility (Flexible Type Scale)

ระบบรองรับการปรับขยายตัวอักษร 3 ระดับ เพื่อรองรับความต้องการที่ต่างกัน:

| ระดับขนาดตัวอักษร | หัวข้อใหญ่ (Title) | หัวข้อย่อย (Subtitle) | เนื้อหาหลัก (Body) | คำแนะนำเล็ก (Small) |
| :--- | :--- | :--- | :--- | :--- |
| **ขนาดปกติ (Normal - A)** | `28px` | `22px` | `18px` | `16px` |
| **ขนาดวัยเก๋า (Large - A+)** | `32px` | `24px` | `20px` | `18px` |
| **ขนาดใหญ่พิเศษ (XL - A++)**| `36px` | `28px` | `24px` | `20px` |

*น้ำหนักตัวอักษร (Font Weight): หัวเรื่องหลัก = 700 (หนา), หัวเรื่องรอง = 600 (กึ่งหนา), ข้อความเนื้อหา = 400 (ปกติ) / 700 (สำหรับเน้นคำ)*

---

## 3. ระยะห่างและเลย์เอาต์ (Layout & Spacing)

- **ความกว้างสูงสุดของแอป (Max-Width)**: **`480px`** (การออกแบบเน้นใช้งานบนอุปกรณ์มือถือแนวตั้งเป็นหลัก (Portrait-first) เพื่อเปิดลิงก์สะดวกจาก LINE)
- **ระยะขอบและการ์ด (Padding)**:
  - ระยะขอบจอปกติ (Screen Padding): `24px`
  - ระยะขอบการ์ดในจอ (Card Padding): `20px` - `24px`
- **มุมโค้งมน (Border Radius - GreenTravel Style)**:
  - โค้งมนปุ่มและตัวเลือกตัวกรอง: `--radius-lg: 16px`
  - โค้งมนการ์ดหลักและกล่องข้อความยาว: `--radius-xl: 24px`
  - โค้งมนปุ่มสลับหรือเส้นสถานะ: `--radius-pill: 9999px`
- **ระบบเงา (Elevations & Shadows)**:
  - เงาปกติ: `--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)`
  - เงาพรีเมียมสะท้อนแสงสีตามธีมหลัก (จาก GreenTravel UI):
    `--shadow-premium: 0 20px 25px -5px rgba(var(--primary-rgb), 0.08), 0 8px 10px -6px rgba(var(--primary-rgb), 0.08)`

---

## 4. ส่วนประกอบ UI สำคัญ (Core Components Specs)

- **ปุ่มกดหลักสัมผัสขนาดใหญ่ (Primary Buttons)**: ความสูงขั้นต่ำ **`56px`** (แนะนำ `64px` สำหรับปุ่ม "เริ่มต้นเรียนรู้" หรือ "ยินยอมข้อมูล") ขอบมน `16px` คอนทราสต์ระหว่างสีกราฟิกและตัวอักษรต้องมากกว่า `4.5:1`
- **การ์ดเนื้อหาพรีเมียม (Premium Cards)**: ใช้พื้นหลังการ์ดสีขาวสว่างทับเงาสะท้อนระดับธีมอ่อนๆ (ในโหมดปกติ) หรือสีเทาเข้มอมน้ำเงิน (ในโหมดมืด) มีเส้นขอบความหนา `1px` สีอ่อนล้อมรอบ และเน้นขอบซ้ายด้วยแถบสีธีมหลักหนา `6px` เพื่อสร้างจุดสังเกต
- **กล่องวิเคราะห์พื้นที่ใช้งาน (Location Box)**: ความสูงขั้นต่ำ `48px` ขอบมน `16px` แสดงไอคอนสีธีมหลักชี้บ่งพิกัดชัดเจน
- **วงแหวนแสดงคะแนน (Score Progress Ring)**: อ้างอิงหน้าจอที่ 3 ของ `_idea-1.jpg` ใช้ Donut/Ring Chart ขนาดใหญ่กลางจอแสดง % ความเข้าใจหลังทำแบบทดสอบ เส้นวงแหวนหนา `10-12px` สีธีมหลัก พื้นหลังวงแหวนสีอ่อน (`--primary-light`) ตัวเลขกลางวงใช้ฟอนต์ `Outfit` ตัวหนา ขนาด `36px+`
- **การ์ดสถิติย่อยแบบตาราง (Stat Tile Grid)**: การ์ดผลลัพธ์ย่อย 2-3 คอลัมน์ (เช่น "จำนวนบทเรียนที่ผ่าน", "คะแนนสะสม") พื้นหลังไล่โทนสีธีมเข้มบนตัวหนังสือสีขาว ขอบมน `16px` ระยะห่างระหว่างการ์ด `12px`
- **แถบเมนูล่าง (Bottom Tab Navigation)**: คงที่ (Fixed) ด้านล่างจอ ความสูง `64-72px` ไอคอน + ป้ายข้อความขนาดเล็กใต้ไอคอน ปุ่มกลาง (เช่น "เริ่มทำแบบทดสอบ") ยกตัวเป็นวงกลมสีธีมหลักลอยเหนือแถบเมนูเพื่อเน้นการกระทำหลัก (Primary Action)

---

## 5. การประยุกต์ใช้กับ Tailwind CSS & shadcn/ui

การแปลง Design Tokens ไปเป็นค่าคอนฟิกูเรชันใน Tailwind CSS เพื่อใช้ร่วมกับ shadcn/ui ใน Next.js โครงการนี้ มีตัวอย่างโครงสร้างดังนี้:

### 5.1 โครงสร้าง tailwind.config.ts / tailwind.config.js
เพื่อให้สามารถสลับสีตามภูมิภาค (Teal, Purple, Orange, Green, Mint) และขนาดตัวอักษรได้สะดวกรวดเร็ว ให้ทำการผูกสีหลักเข้ากับ CSS Custom Properties ที่อัปเดตแบบ Dynamic:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        background: "var(--bg-app)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
        },
        muted: {
          DEFAULT: "var(--text-secondary)",
        },
        success: {
          DEFAULT: "var(--accent-success)",
        },
        error: {
          DEFAULT: "var(--accent-error)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)", // 16px สำหรับปุ่ม / Dropdown
        xl: "var(--radius-xl)", // 24px สำหรับการ์ด
      },
      boxShadow: {
        premium: "var(--shadow-premium)", // เงาสะท้อนแสงตามสีธีมหลัก
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

### 5.2 การติดตั้งและใช้งาน shadcn/ui
shadcn/ui จะใช้ Tailwind CSS เป็นหลักในการกำหนดสไตล์ และมีโครงสร้าง Component ที่ยืดหยุ่นสูง:
- คอมโพเนนต์จะถูกติดตั้งลงในโฟลเดอร์ `components/ui/` โดยตรง (เช่น `button.tsx`, `card.tsx`, `dialog.tsx`)
- ทีมพัฒนาสามารถเข้าไปแก้ไขโค้ด JSX และ Tailwind classes ในคอมโพเนนต์เหล่านั้นเพื่อปรับขนาดตัวอักษรและระยะสัมผัส (Touch Target) ให้เหมาะกับผู้สูงอายุได้โดยตรง โดยไม่ต้องกังวลเรื่องการกระทบต่อสไตล์ส่วนกลาง ตัวอย่างการเรียกใช้งาน:
  ```tsx
  import { Button } from "@/components/ui/button"
  import { Card, CardContent } from "@/components/ui/card"

  export default function OnboardingCard() {
    return (
      <Card className="shadow-premium border-l-6 border-l-primary">
        <CardContent className="p-5">
          <p className="text-muted text-sm">ยินดีต้อนรับวัยเก๋า</p>
          <Button className="h-[56px] text-lg rounded-lg w-full mt-4 bg-primary hover:bg-primary-hover">
            เริ่มต้นเรียนรู้
          </Button>
        </CardContent>
      </Card>
    )
  }
  ```
