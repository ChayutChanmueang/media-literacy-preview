import React from 'react';
import { notoLoopedThai } from '@/lib/fonts';
import RichText from './RichText';

/**
 * NewsMessageView (US-CF-08) — Figma node 2065:7104
 * แสดง "ข่าวที่ถูกแชร์มา" ของ G1 เป็นข้อความเข้าในหน้าจอแชทจำลอง
 * หัวแชทมีเพียงรูปโปรไฟล์ + เบอร์ผู้ส่ง — ไม่ใส่ปุ่มกลับ/โทร/วิดีโอ/ค้นหา/เมนู
 * เพื่อไม่ให้ผู้สูงอายุเข้าใจผิดว่ากดออกจากเกมหรือโทรออกได้
 *
 * ผู้ส่ง/เวลาเลือกแบบ deterministic จาก `seed` (index ของโจทย์)
 * เพื่อให้คงที่ระหว่าง re-render แต่หลากหลายข้ามโจทย์
 */

const SENDERS = ['+66 82 471 9083', '099-274-1550', '081-903-6624', '02-118-4420', '+66 12 345 6789'];
const TIMES = ['9:30', '10:15', '08:47', '11:02', '11:12'];

export default function NewsMessageView({ claim, seed = 0, className = '' }) {
  const sender = SENDERS[seed % SENDERS.length];
  const time = TIMES[seed % TIMES.length];

  return (
    <div
      className={`${notoLoopedThai.className} flex flex-col overflow-hidden rounded-t-[24px] border-2 border-solid border-[#D9D9D9] bg-white shadow-[0px_2px_0px_0px_#D9D9D9] ${className}`}
    >
      {/* แถบผู้ส่ง */}
      <div className="flex h-[54px] shrink-0 items-center justify-center gap-[8px] border-b-2 border-solid border-[#D9D9D9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/games/chat-avatar.svg" alt="" aria-hidden="true" className="size-[32px] shrink-0" />
        <span className="text-[20px] font-semibold leading-[30px] text-[#4B4B4B]">{sender}</span>
      </div>

      {/* ข้อความที่ถูกแชร์เข้ามา */}
      <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[24px] pt-[12px]">
        <div className="flex flex-col items-start gap-[12px] pr-[20px]">
          <div className="w-full rounded-[24px] bg-[#D9F1FA] p-[14px] text-[20px] font-normal leading-[30px] text-[#4B4B4B] [word-break:break-word] whitespace-pre-line">
            <RichText text={claim} />
          </div>
          <span className="text-[12px] font-normal leading-[16px] text-black">{time}</span>
        </div>
      </div>
    </div>
  );
}
