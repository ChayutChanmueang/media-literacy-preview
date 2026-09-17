import React from 'react';

/**
 * แสดงข้อความที่มี markdown `**เน้น**` เป็น <strong> (ตัวหนาจริง) — US-CF-29
 * render เป็น React node ล้วน (ปลอดภัย ไม่ใช้ dangerouslySetInnerHTML)
 * ข้อความปกติที่ไม่มี ** จะแสดงตามเดิม
 *
 * @param {string} text ข้อความต้นฉบับ (อาจมี `**...**`)
 */
export default function RichText({ text }) {
  if (text == null) return null;
  // แยกส่วน **...** ออกจากข้อความปกติ
  const parts = String(text).split(/(\*\*[\s\S]+?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\*\*([\s\S]+?)\*\*$/.exec(part);
        return m ? (
          <strong key={i}>{m[1]}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        );
      })}
    </>
  );
}
