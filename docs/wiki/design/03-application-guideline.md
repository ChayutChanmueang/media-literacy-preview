# Guideline การประยุกต์ใช้ในการเขียนโค้ดและระบบธีม (Next.js, Tailwind, shadcn/ui)

> เป้าหมาย: แนวทางการนำดีไซน์โทเค็นและจานสี 5 รูปแบบ ไปพัฒนาต่อยอดในโปรเจกต์ Next.js, Tailwind CSS และ shadcn/ui (`รู้ทันสื่อวัยเก๋า`) เพื่อรองรับการสลับธีมและการปรับขนาดฟอนต์ของผู้สูงอายุ

---

## 1. การตั้งค่าตัวแปร CSS ส่วนกลาง (Global CSS Variables)

แทนการแก้สไตล์แยกแต่ละจุด ให้ประกาศตัวแปร CSS ในไฟล์ `app/globals.css` (ซึ่งใช้งานร่วมกับ Tailwind CSS และ shadcn/ui) เพื่อรองรับแอตทริบิวต์ `data-theme` ในระดับของ `:root` หรือ `body`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* ----------------------------------------------------
     1. ค่าเริ่มต้นของระบบธีม (Default Teal Theme)
     ---------------------------------------------------- */
  :root, [data-theme="teal"] {
    --primary: #0d9488;
    --primary-hover: #0f766e;
    --primary-light: #ccfbf1;
    --primary-dark: #115e59;
    --primary-rgb: 13, 148, 136;
    
    --bg-app: #f8fafc;
    --bg-card: #ffffff;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --border: #e2e8f0;
    
    --accent-success: #16a34a;
    --accent-error: #dc2626;
    
    --radius-lg: 16px;
    --radius-xl: 24px;
    --shadow-premium: 0 20px 25px -5px rgba(13, 148, 136, 0.08), 0 8px 10px -6px rgba(13, 148, 136, 0.08);
  }

  /* ----------------------------------------------------
     2. ธีมจำแนกตามจังหวัดจัดกิจกรรมหลัก (Regional Themes)
     ---------------------------------------------------- */
  /* ธีมเชียงใหม่ (ม่วง) */
  [data-theme="purple"] {
    --primary: #7b2cbf;
    --primary-hover: #5a189a;
    --primary-light: #f3e5f5;
    --primary-dark: #4a148c;
    --primary-rgb: 123, 44, 191;
    --shadow-premium: 0 20px 25px -5px rgba(123, 44, 191, 0.08), 0 8px 10px -6px rgba(123, 44, 191, 0.08);
  }

  /* ธีมแพร่ (ส้ม) */
  [data-theme="orange"] {
    --primary: #e65100;
    --primary-hover: #bf360c;
    --primary-light: #fff3e0;
    --primary-dark: #b23c00;
    --primary-rgb: 230, 81, 0;
    --shadow-premium: 0 20px 25px -5px rgba(230, 81, 0, 0.08), 0 8px 10px -6px rgba(230, 81, 0, 0.08);
  }

  /* ธีมน่าน (เขียว) */
  [data-theme="green"] {
    --primary: #2e7d32;
    --primary-hover: #1b5e20;
    --primary-light: #e8f5e9;
    --primary-dark: #1b5e20;
    --primary-rgb: 46, 125, 50;
    --shadow-premium: 0 20px 25px -5px rgba(46, 125, 50, 0.08), 0 8px 10px -6px rgba(46, 125, 50, 0.08);
  }

  /* ธีม GreenTravel (เขียวหัวเป็ดสไตล์พรีเมียม) */
  [data-theme="mint"] {
    --primary: #00796b;
    --primary-hover: #004d40;
    --primary-light: #e0f2f1;
    --primary-dark: #004d40;
    --primary-rgb: 0, 121, 107;
    --shadow-premium: 0 20px 25px -5px rgba(0, 121, 107, 0.08), 0 8px 10px -6px rgba(0, 121, 107, 0.08);
  }
}

---

## 2. การประยุกต์ใช้ใน Next.js (Dynamic Theme Switcher Component)

เมื่อผู้เรียนเลือกจังหวัดจากรายการใน `OnboardingConsent` (`app/consent/page.tsx`) ให้ระบบทำหน้าที่อัปเดตแอตทริบิวต์ `data-theme` ในระดับบนสุดของหน้าเว็บ (HTML element) โดยอัตโนมัติ:

```typescript
// lib/theme.ts

/**
 * ฟังก์ชันสำหรับสลับธีมตามจังหวัดที่ผู้เรียนเลือกเองจากรายการ (ไม่ใช้ GPS)
 * @param province - จังหวัดของพื้นที่ใช้งาน (เช่น 'เชียงใหม่', 'แพร่', 'น่าน')
 */
export const updateApplicationTheme = (province?: string | null) => {
  let themeName = 'teal'; // ค่าเริ่มต้น
  
  if (province) {
    if (province.includes('เชียงใหม่')) {
      themeName = 'purple';
    } else if (province.includes('แพร่')) {
      themeName = 'orange';
    } else if (province.includes('น่าน')) {
      themeName = 'green';
    }
  }
  
  if (typeof window !== 'undefined') {
    // อัปเดตแอตทริบิวต์บน document element เพื่อสลับตัวแปรสีอัตโนมัติ
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('user-app-theme', themeName);
    console.log(`[Theme] Applied theme "${themeName}" for province: ${province}`);
  }
};
```

ใน Root Layout (`app/layout.tsx`) หรือ Component หลักเมื่อได้ข้อมูล session หรือความยินยอมล่าสุด:
```typescript
"use client";

import { useEffect } from "react";
import { updateApplicationTheme } from "@/lib/theme";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // โหลดธีมล่าสุดจาก localStorage หรือเซสชันของผู้ใช้
    const savedTheme = localStorage.getItem('user-app-theme') || 'teal';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <html lang="th" data-theme="teal">
      <body>{children}</body>
    </html>
  );
}
```

---

## 3. ระบบช่วยเหลือนำทางและขนาดอักษร (Accessibility Scale Switcher)

เพื่อรองรับความต้องการขยายอักษรของผู้สูงอายุ ให้เก็บสถานะระดับอักษรไว้ใน LocalStorage หรือ React Context และผูกกับแอตทริบิวต์ `data-size` เพื่อปรับขนาดโดยอัตโนมัติ:

```css
/* การปรับระดับอักษรในไฟล์ CSS ส่วนกลาง (app/globals.css) */
[data-size="normal"] {
  --font-size-base: 18px;
  --font-size-title: 28px;
  --font-size-subtitle: 22px;
  --font-size-small: 16px;
}

[data-size="large"] { /* ค่าเริ่มต้นที่เหมาะสมที่สุดสำหรับวัยเก๋า */
  --font-size-base: 20px;
  --font-size-title: 32px;
  --font-size-subtitle: 24px;
  --font-size-small: 18px;
}

[data-size="xlarge"] {
  --font-size-base: 24px;
  --font-size-title: 36px;
  --font-size-subtitle: 28px;
  --font-size-small: 20px;
}
```

ฟังก์ชันช่วยเหลือใน Next.js (TypeScript):
```typescript
// lib/theme.ts
export const applyFontSizeScale = (scaleName: 'normal' | 'large' | 'xlarge') => {
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('data-size', scaleName);
    localStorage.setItem('user-font-scale', scaleName);
  }
};
```

---

## 4. คู่มือการทดสอบค่าความต่างของสี (Contrast Checklist)

การทดสอบความเหลื่อมล้ำของค่าสีตัวอักษรกับพื้นหลัง (Contrast Ratio) ตามมาตรฐาน **WCAG 2.1 AA** (ความต่างอย่างน้อย `4.5:1` สำหรับข้อความทั่วไป และ `3:1` สำหรับข้อความขนาดใหญ่) มีข้อควรระวังดังนี้:

- **สีขาวบนปุ่มสีหลัก (White Text on Primary)**:
  - ธีมสีส้ม (`#E65100` หรือ `#b23c00`): ผ่านเกณฑ์ความต่างอย่างปลอดภัย
  - ธีมสีเขียว (`#2E7D32`): ผ่านเกณฑ์
  - ธีมสีม่วง (`#7B2CBF`): ผ่านเกณฑ์
  - ธีมสีเขียวหัวเป็ด (`#0D9488`): ผ่านเกณฑ์
- **ข้อความหลักบนพื้นขาว (Slate 900 on White)**: ความต่างของสีดำเกือบสนิท `#0F172A` บนพื้นสีขาวมีสัดส่วนความต่างสูงถึง `19:1` ทำให้มีความคมชัดสูงสุดในทุกสภาพแสง
- **สีตอบกลับการตอบคำตอบ (Success/Error States)**:
  - ให้หลีกเลี่ยงการใช้สีเขียวอ่อนหรือแดงสดเกินไปบนพื้นหลังสีขาว ให้ใช้สีเขียวข้ม `#16A34A` และสีแดงอมส้ม `#DC2626`
  - เสนอให้ใช้ร่วมกับไอคอนประกอบ (เครื่องหมายถูก/ผิด ✓ ✗) เสมอ เพื่อลดผลกระทบสำหรับผู้สูงอายุที่มีปัญหาสายตาพร่ามัวหรือตาบอดสี

---

## 5. การจัดการฟอร์มและการ Validation ข้อมูล (React Hook Form + Zod)

สำหรับการพัฒนาฟอร์ม เช่น ฟอร์ม Consent & Onboarding (ยินยอมนโยบาย, ระบุอายุ และยืนยันตำแหน่ง) จะใช้งาน **React Hook Form** ร่วมกับ **Zod** และรองรับ `@hookform/resolvers/zod` เพื่อทำ Schema Validation ดังตัวอย่างนี้:

### 5.1 โครงสร้าง Zod Schema
```typescript
import { z } from "zod";

export const onboardingSchema = z.object({
  ageRange: z.string({
    required_error: "กรุณาเลือกช่วงอายุของคุณ",
  }).min(1, "กรุณาเลือกช่วงอายุของคุณ"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().min(1, "กรุณาเลือกอำเภอ"),
  subDistrict: z.string().min(1, "กรุณาเลือกตำบล"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
```

### 5.2 การเรียกใช้ใน React Component (Next.js Client Component)
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";

export default function OnboardingForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      locationConsent: false,
      ageRange: "",
      province: "",
      district: "",
      subDistrict: "",
    },
  });

  const onSubmit = async (data: OnboardingInput) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("บันทึกข้อมูลล้มเหลว");
      // เปลี่ยนเส้นทางไปหน้าทำ Pre-test
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      {/* 1. ปุ่มช่วงอายุ (Age Range Selection) */}
      <div className="space-y-3">
        <label className="text-xl font-bold">กรุณาเลือกช่วงอายุของคุณ</label>
        <div className="grid grid-cols-2 gap-3">
          {["60-69 ปี", "70-79 ปี", "80 ปีขึ้นไป"].map((age) => (
            <Button
              key={age}
              type="button"
              variant={watch("ageRange") === age ? "default" : "outline"}
              className="h-[56px] text-lg rounded-lg"
              onClick={() => setValue("ageRange", age, { shouldValidate: true })}
            >
              {age}
            </Button>
          ))}
        </div>
        {errors.ageRange && (
          <p className="text-error text-base font-medium">{errors.ageRange.message}</p>
        )}
      </div>

      {/* 2. สวิตช์/ยินยอมข้อมูลพิกัด */}
      {/* 3. ปุ่มส่งฟอร์ม */}
      <Button type="submit" disabled={isSubmitting} className="w-full h-[64px] text-xl rounded-lg">
        {isSubmitting ? "กำลังบันทึกข้อมูล..." : "กดยินยอมและเริ่มเรียนรู้"}
      </Button>
    </form>
  );
}
```
