"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award, Share2, RefreshCw, ChevronLeft } from "lucide-react";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";
import { certificateNameSchema, type CertificateNameInput } from "@/lib/validations";

export default function CertificatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submittedName, setSubmittedName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CertificateNameInput>({
    resolver: zodResolver(certificateNameSchema),
    defaultValues: {
      nickname: "",
    },
  });

  useEffect(() => {
    // Guards: check if session & posttest are complete
    const session = progressService.getOrCreateSession();
    if (!session || !session.consentGiven || !session.ageGroup) {
      router.push("/consent");
      return;
    }

    const progress = progressService.getProgress();
    if (!progress.posttest_completed) {
      router.push("/posttest");
      return;
    }

    loggingService.logEvent("certificate_page_view");
    setLoading(false);
  }, [router]);

  const onSubmitName = (data: CertificateNameInput) => {
    setSubmittedName(data.nickname);
    loggingService.logEvent("generate_certificate", { name: data.nickname });
  };

  const handleShareLine = () => {
    const shareText = `ภูมิใจจัง! ฉันเรียนจบหลักสูตรและได้รับเกียรติบัตร "รู้ทันสื่อ" แล้วนะ มาฝึกทักษะป้องกันมิจฉาชีพด้วยกันที่นี่เลย!`;
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
    const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    
    loggingService.logEvent("share_certificate_line", { name: submittedName });
    window.open(lineShareUrl, "_blank");
  };

  const handleBackToDashboard = () => {
    loggingService.logEvent("certificate_back_to_dashboard");
    
    const progress = progressService.getProgress();
    const updatedProgress = {
      ...progress,
      currentStep: "lessons",
    };
    progressService.saveProgress(updatedProgress);

    router.push("/lessons");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <span className="text-lg">กำลังเตรียมใบประกาศเกียรติคุณ...</span>
      </div>
    );
  }

  return (
    <div className="screen-container">
      {/* Header bar */}
      <div className="flex items-center gap-2 text-left select-none">
        <button 
          onClick={handleBackToDashboard}
          className="bg-none border-none text-[var(--primary-dark)] cursor-pointer p-1 flex items-center gap-1 hover:opacity-85"
        >
          <ChevronLeft size={24} />
          <span className="text-lg font-bold">กลับหน้าหลัก</span>
        </button>
      </div>

      {!submittedName ? (
        /* Step 1: Input Name */
        <div className="content-area my-auto">
          <div className="flex justify-center text-[#eab308] mb-3">
            <Award size={64} style={{ filter: "drop-shadow(0 0 8px rgba(234, 179, 8, 0.4))" }} />
          </div>
          
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">ยินดีด้วยอย่างยิ่ง!</h2>
          <p className="text-lead mt-2">
            ท่านเรียนครบถ้วนทุกบทเรียนแล้ว กรุณาพิมพ์ชื่อของท่านเพื่อใช้สร้างใบประกาศความสำเร็จ
          </p>

          <form onSubmit={handleSubmit(onSubmitName)} className="flex flex-col gap-4 mt-4 w-full">
            <div>
              <input 
                type="text" 
                placeholder="พิมพ์ชื่อเล่น หรือ ชื่อจริงที่นี่..."
                {...register("nickname")}
                maxLength={15}
                className="w-full min-h-[60px] text-[22px] px-4 py-3 rounded-2xl border-3 border-[var(--primary)] text-center font-bold outline-none bg-white focus:border-[var(--primary-hover)] text-[var(--text-primary)]"
                required
              />
              {errors.nickname && (
                <p className="text-red-600 text-sm mt-1 text-center font-semibold">{errors.nickname.message}</p>
              )}
            </div>
            
            <button 
              type="submit"
              className="btn btn-primary text-[22px] min-h-[64px] w-full"
            >
              <span>สร้างใบประกาศทองคำ</span>
            </button>
          </form>
        </div>
      ) : (
        /* Step 2: Render Premium Certificate Card */
        <div className="flex flex-col gap-5 flex-1 min-h-0">
          <div className="content-area">
            {/* The Certificate Frame */}
            <div className="relative border-[10px] border-double border-[#eab308] rounded-2xl px-4 py-6 bg-[#fffbeb] text-[#1e293b] shadow-xl text-center mx-auto w-full max-w-[400px]">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-[#eab308] text-[18px]">✦</div>
              <div className="absolute top-2 right-2 text-[#eab308] text-[18px]">✦</div>
              <div className="absolute bottom-2 left-2 text-[#eab308] text-[18px]">✦</div>
              <div className="absolute bottom-2 right-2 text-[#eab308] text-[18px]">✦</div>

              {/* Certificate content */}
              <Award size={48} className="text-[#eab308] mx-auto mb-2" />
              
              <h3 className="font-sans text-[24px] font-extrabold text-[#b45309] my-1">
                ใบประกาศเกียรติคุณ
              </h3>
              <p className="text-[14px] italic text-[#78350f] m-0">
                หลักสูตร รู้เท่าทันภัยสื่อออนไลน์
              </p>

              <div className="my-4 border-b border-[#b45309]/20 pb-2">
                <span className="text-[15px] text-[#78350f]">ขอมอบเกียรติบัตรทองคำนี้เพื่อแสดงว่า</span>
                <h2 className="text-[28px] text-[#1e3a8a] font-black my-2 underline decoration-[#b45309] decoration-2">
                  {submittedName}
                </h2>
              </div>

              <p className="text-[16px] leading-relaxed text-[#451a03] font-bold">
                ได้ผ่านการศึกษาอบรมและทดสอบเกณฑ์สมรรถนะครบถ้วน <br />
                มีความสามารถจับสังเกตข่าวปลอม สัญญาณสแกม และสื่อ AI <br />
                เพียบพร้อมสำหรับการรู้เท่าทันสื่ออย่างดีเด่น
              </p>

              {/* Signatures */}
              <div className="flex justify-between items-center mt-6 px-2">
                <div className="text-center">
                  <div className="text-[14px] italic font-serif text-[#b45309]">NAPLAB Dev</div>
                  <div className="w-20 h-px border-b border-[#78350f] my-1 mx-auto" />
                  <span className="text-[11px] text-[#78350f]">ผู้ตรวจประเมิน</span>
                </div>
                
                {/* Stamp */}
                <div className="w-[54px] h-[54px] rounded-full border-3 border-double border-red-600 text-red-600 flex items-center justify-center text-[11px] font-bold -rotate-[15deg] z-10 shadow-sm">
                  ผ่านเกณฑ์
                </div>

                <div className="text-center">
                  <div className="text-[14px] italic font-serif text-[#b45309]">รู้ทันสื่อ</div>
                  <div className="w-20 h-px border-b border-[#78350f] my-1 mx-auto" />
                  <span className="text-[11px] text-[#78350f]">ผู้อำนวยการโครงการ</span>
                </div>
              </div>
            </div>

            {/* Instruction note */}
            <p className="text-small text-[var(--text-secondary)] mt-3 italic text-center leading-normal">
              💡 วิธีเซฟเก็บไว้: คุณลุงคุณป้าสามารถ **แคปหน้าจอ** โทรศัพท์มือถือ <br />
              เพื่อบันทึกรูปภาพเกียรติบัตรไว้อวดลูกหลานได้เลย!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full shrink-0">
            <button 
              onClick={handleShareLine}
              className="btn flex items-center justify-center bg-[#06c755] hover:bg-[#05b04b] text-white text-[22px] min-h-[64px] border-none shadow-md cursor-pointer"
            >
              <Share2 size={24} />
              <span>แชร์ลิงก์ให้เพื่อนร่วมเรียนใน LINE</span>
            </button>

            <button 
              onClick={() => {
                setValue("nickname", "");
                setSubmittedName("");
              }}
              className="btn btn-outline text-[18px] min-h-[52px] cursor-pointer"
            >
              <RefreshCw size={18} />
              <span>พิมพ์ชื่อเพื่อออกใบประกาศใหม่</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
