# User Story: US-CF-45 - ตรึงขนาดฟอนต์ไม่ให้การตั้งค่าขยายฟอนต์ของเครื่อง/เบราว์เซอร์ทำให้ Layout เพี้ยน

**Status:** 🟢 Done (Needs QA)  
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-07 ([FB](../feedback/FB-2026-08-07-font-scaling.md) #1)  
**Owner:** TBD | **Priority:** ควรแก้ | **Estimate:** S  
**Version:** 1.0 | **Last Updated:** 2026-08-07  

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุที่ตั้งขนาดฟอนต์ของมือถือให้ใหญ่เพื่ออ่านง่าย  
**ฉันต้องการ** ให้แอป (ที่ออกแบบฟอนต์ใหญ่พอดีสำหรับผู้สูงวัยอยู่แล้ว) แสดงผลตามขนาดที่ออกแบบไว้ ไม่ถูกคูณขนาดซ้ำจนเลย์เอาต์เพี้ยน  
**เพื่อให้** หน้าจอแบบ zero-scroll ยังใช้งานได้ปกติ — ข้อความไม่ล้นกล่อง ปุ่มไม่ขยายจนดันเนื้อหาตกจอ และยังปรับขนาดผ่านปุ่มปรับขนาดในแอปเองได้ตามปกติ

---

## 🎯 สิ่งที่ต้องแก้ / รายละเอียดงาน

ปัญหามาจากกลไกขยายฟอนต์ **2 แบบที่คนละเรื่องกัน**:

| กลไก | ที่มา | กันด้วย CSS ได้ไหม |
|------|-------|--------------------|
| **OS / ระบบตั้ง Font ใหญ่** | Settings → Display → Font size ของเครื่อง | ✅ ได้ ด้วย `text-size-adjust` |
| **Chrome in-browser "Text scaling"** | Chrome → Settings → Accessibility → Text scaling | ❌ ไม่ได้ — Chrome จงใจไม่ให้เว็บ override (เป็น accessibility preference ของผู้ใช้) |

สิ่งที่ต้องดำเนินการ:
1. ตรึงขนาดฟอนต์กันการขยายระดับ **OS** โดยตั้ง `-webkit-text-size-adjust` / `text-size-adjust: 100%` บน `html, body` ใน `src/app/globals.css` (ใช้ค่า `100%` ที่ระบุชัด แทน `none` เพราะ Chrome/Android honor เสถียรกว่า และครอบ `body` ด้วยเพราะบาง build อ่าน property จาก element ที่ถือ text จริงเท่านั้น)
2. บันทึกข้อจำกัดของ **Chrome in-browser Text scaling** ไว้ในเอกสาร (แก้ด้วย CSS ไม่ได้; ผู้ใช้ควรปรับขนาดผ่านปุ่มในแอป `data-size` แทน)

---

## ✅ Acceptance Criteria

1. [x] `src/app/globals.css` ตั้ง `text-size-adjust: 100%` (ทั้ง `-webkit-` และมาตรฐาน) บน selector `html, body`
2. [x] เมื่อตั้ง **OS font size ใหญ่สุด** แล้วเปิดแอป — layout ยังคงตามที่ออกแบบ ไม่เพี้ยน (ทดสอบบนเครื่องจริง Android + Chrome ✅)
3. [x] ปุ่มปรับขนาดฟอนต์ในแอป (`data-size` ปกติ/ใหญ่/ใหญ่มาก) ยังทำงานปกติ ไม่ถูกกระทบ
4. [x] บันทึกข้อจำกัดของ Chrome in-browser "Text scaling" ที่ CSS กันไม่ได้ ไว้ในเอกสาร feedback
5. [ ] (QA) ทดสอบซ้ำแยกกัน 2 กรณี — "OS font ใหญ่สุด" และ "Chrome Text scaling ใหญ่สุด" — ในหน้า Landing, เกม (G3/G13), หน้าวิดีโอ

---

## 🛠 Technical Tasks

- [x] แก้ `src/app/globals.css`: `html { text-size-adjust: none }` → `html, body { text-size-adjust: 100% }` พร้อมคอมเมนต์อธิบายเหตุผล
- [x] ประเมินทางเลือก JS counter-scale (วัด boost + `zoom`) — พบว่า Chrome Text Autosizing ไม่ assign ตัวคูณให้ probe ที่ insert-วัด-ลบ ใน tick เดียว จึงวัดไม่ได้อย่างน่าเชื่อถือ → **ถอดออก คงเฉพาะส่วนที่ได้ผล**
- [x] `npx tsc --noEmit` ผ่าน + `npm run build` ผ่าน
- [ ] (QA) ทดสอบบนอุปกรณ์จริงตาม AC #5

---

## 📝 หมายเหตุ / ข้อจำกัดที่รับทราบ

- **Chrome in-browser "Text scaling" slider** ยังขยายฟอนต์อยู่ ไม่ว่าจะตั้ง `text-size-adjust` เป็น `none` หรือ `100%` — เป็นข้อจำกัดที่ Chrome จงใจ (ไม่ให้เว็บปิด accessibility preference ของผู้ใช้)
- **ยอมรับข้อจำกัดนี้** เพราะ (1) เป็นเคสที่ผู้ใช้ต้องตั้งใจเข้าไปตั้งในเมนู Accessibility ของเบราว์เซอร์เอง พบน้อยกว่า OS font scale มาก และ (2) แอปมีปุ่มปรับขนาดฟอนต์ของตัวเองอยู่แล้ว
- ถ้าอนาคตจำเป็นต้องกัน Chrome slider ด้วยจริง ๆ ต้องทำ scale-to-fit ที่คง probe ไว้ข้ามเฟรม (rAF) แล้ววัด boost — ซับซ้อนและกระทบ overlay/ปุ่มกด ควรประเมินความคุ้มก่อน

---

## 🔗 Related

- Feedback: [FB-2026-08-07-font-scaling](../feedback/FB-2026-08-07-font-scaling.md) #1
- Backlog: [Product Backlog](../01-product-backlog.md)
- กติกา Accessibility ฟอนต์ผู้สูงวัย ($\ge 20\text{px}$): `AGENT.md`
- ปรับขนาดฟอนต์ dropdown เลือกพื้นที่ (คนละเรื่อง): [US-CF-36](./US-CF-36.md)
