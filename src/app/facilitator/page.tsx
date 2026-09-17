"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Presentation, Play, ExternalLink } from "lucide-react";
import { loggingService } from "@/services/loggingService";

const LESSONS = [
  {
    id: "topic-1",
    title: "บทที่ 1: รู้เท่าทันข่าวสาร",
    subTitle: "ใคร ๆ ก็ทำสื่อได้ / จริงหรือมั่ว?",
    desc: "สอนวิธีวิเคราะห์ข้อมูลข่าวสารและหัวข้อข่าวที่แชร์ต่อๆ กันในกลุ่มไลน์",
    badge: "ข่าวสารออนไลน์",
  },
  {
    id: "topic-2",
    title: "บทที่ 2: สัญญาณมิจฉาชีพ",
    subTitle: "จับสัญญาณเตือนแอบอ้างสแกม",
    desc: "สอนจุดสังเกตพิรุธและความเสี่ยงทางข้อความ SMS และห้องแชท LINE",
    badge: "ป้องกันสแกม",
  },
  {
    id: "topic-6",
    title: "บทที่ 3: จำลองแชทไลน์",
    subTitle: "จับสัญญาณมิจในแชทจำลอง (G6)",
    desc: "สอนและพาแตะจุดผิดปกติในห้องแชทไลน์จำลองที่มิจฉาชีพทักเข้ามา",
    badge: "จำลองสถานการณ์",
  },
  {
    id: "topic-5",
    title: "บทที่ 4: หยุด คิด ถาม ทำ",
    subTitle: "กางโล่สะกดภัยออนไลน์ (G5)",
    desc: "สอนวิธีฝึกสติชะลอความเร็วด้วยการกางโล่ป้องกันสแกม",
    badge: "สร้างกำลังใจ",
  },
  {
    id: "topic-3",
    title: "บทที่ 5: สังเกตสื่อจาก AI",
    subTitle: "Deepfake / AI หรือ ของจริง",
    desc: "สอนวิธีสังเกตรายละเอียดภาพใบหน้าและจุดบกพร่องที่สร้างจาก AI",
    badge: "เทคโนโลยี AI",
  },
];

export default function FacilitatorHub() {
  const router = useRouter();

  useEffect(() => {
    loggingService.logEvent("facilitator_hub_view");
  }, []);

  const handleStartLesson = (lessonId: string) => {
    loggingService.logEvent("facilitator_select_lesson", { lesson_id: lessonId });
    router.push(`/facilitator/${lessonId}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#0f172a] text-slate-100 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
          <Presentation size={36} className="text-[#38bdf8]" />
          <div>
            <h1 className="text-3xl font-extrabold text-[#38bdf8] m-0">ศูนย์ผู้นำกิจกรรมสอน (Facilitator Hub)</h1>
            <p className="text-slate-400 text-base mt-1">โหมดฉายจอโปรเจกเตอร์หรือทีวีในชุมชนเพื่อช่วยจัดการอบรม</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl">
          <h3 className="font-bold text-lg text-white mb-2">💡 คำแนะนำในการนำกิจกรรม:</h3>
          <ul className="text-slate-300 text-sm flex flex-col gap-2 list-disc pl-5 leading-relaxed">
            <li>เปิดหน้านี้บนเครื่องคอมพิวเตอร์ที่เชื่อมต่อกับ **ทีวีขนาดใหญ่** หรือ **เครื่องฉายโปรเจกเตอร์**</li>
            <li>กดเลือกบทเรียนที่ต้องการสอนเพื่อเข้าสู่โหมดการนำเสนอ (Presenter Mode)</li>
            <li>โหมดผู้นำเสนอจะมีวิดีโอคลิปขนาดใหญ่พร้อมกับ **บทเขียนตัวช่วยพูด (Script)** สำหรับครูผู้ช่วยสอนนำไปใช้อ่านอธิบายผู้สูงอายุในกลุ่มได้อย่างสะดวก</li>
            <li>ผู้นำกิจกรรมสามารถเลือกสอนข้ามบทเรียนใดก็ได้ทันทีอย่างอิสระตามความเหมาะสม</li>
          </ul>
        </div>

        {/* Lessons List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {LESSONS.map((lesson) => (
            <div 
              key={lesson.id}
              onClick={() => handleStartLesson(lesson.id)}
              className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl p-5 text-left cursor-pointer transition-all duration-150 flex flex-col justify-between gap-4 hover:border-[#38bdf8]"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold bg-[#38bdf8]/10 text-[#38bdf8] px-2.5 py-0.5 rounded-full">
                    {lesson.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{lesson.title}</h3>
                <h4 className="text-base text-slate-400 font-semibold mb-2">{lesson.subTitle}</h4>
                <p className="text-xs text-slate-400 leading-normal">{lesson.desc}</p>
              </div>

              <button className="flex items-center justify-center gap-2 bg-[#38bdf8] hover:bg-[#0ea5e9] text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm self-end">
                <Play size={16} fill="currentColor" />
                <span>เริ่มฉายสอนบทเรียน</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
