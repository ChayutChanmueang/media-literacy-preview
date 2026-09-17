"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import locationData from "@/data/thailand-location.json";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { notoLoopedThai } from "@/lib/fonts";
import { useDevSkip } from "@/lib/devSkip";
import Button3D from "@/components/Button3D";

// US-CF-23: จังหวัด "อื่นๆ" (เผื่อผู้เล่นจังหวัดอื่น) — ไม่ต้องเลือกอำเภอ/ตำบลต่อ
const OTHER_PROVINCE = "อื่น ๆ";
const subscribeNoop = () => () => {};

const LIST_MAX_HEIGHT = 320; // ความสูงสูงสุดของรายการตาม Figma
const LIST_MIN_HEIGHT = 124; // อย่างน้อย 2 แถว ไม่งั้นรายการเตี้ยจนใช้ยาก
const LIST_OFFSET = 8; // ระยะห่างระหว่างปุ่มกับรายการ + เว้นขอบล่าง

// Figma node 2065:6915 — ปุ่มเลือกแบบกดแล้วกางรายการ (ไม่ใช้ <select> ของเบราว์เซอร์ เพื่อให้หน้าตาตรงดีไซน์)
function SelectCard({
  placeholder,
  value,
  onChange,
  options,
  disabled,
  boundaryRef,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  /** ขอบล่างที่รายการห้ามเลยลงไป (แถบปุ่มยินยอม) — รายการจะเตี้ยลงแทนที่จะดันให้ทั้งหน้าเลื่อน */
  boundaryRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState(LIST_MAX_HEIGHT);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // วัดที่ว่างระหว่างปุ่มกับแถบปุ่มยินยอม แล้วย่อความสูงรายการให้พอดี (วัดก่อน paint กันรายการกระพริบ)
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const trigger = rootRef.current?.getBoundingClientRect();
      if (!trigger) return;
      const boundary = boundaryRef?.current?.getBoundingClientRect().top ?? window.innerHeight;
      const available = boundary - trigger.bottom - LIST_OFFSET * 2;
      setMaxHeight(Math.max(LIST_MIN_HEIGHT, Math.min(LIST_MAX_HEIGHT, available)));
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, boundaryRef]);

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="h-[64px] w-full overflow-clip rounded-[20px] bg-[#D9D9D9]">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          disabled={disabled}
          aria-label={placeholder}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`relative flex h-[62px] w-full cursor-pointer items-center justify-center rounded-[20px] border-2 border-solid border-[#D9D9D9] bg-white text-[20px] font-semibold leading-[30px] disabled:cursor-not-allowed ${
            value ? "text-[#4B4B4B]" : "text-[#A5A5A5]"
          }`}
        >
          {value || placeholder}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/consent/dropdown-arrow.svg"
            alt=""
            aria-hidden="true"
            className={`pointer-events-none absolute right-[16px] size-[24px] ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div
          role="listbox"
          aria-label={placeholder}
          style={{ maxHeight }}
          className="absolute inset-x-0 top-[72px] z-20 overflow-y-auto rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white"
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              aria-selected={value === o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`flex h-[62px] w-full cursor-pointer items-center justify-center rounded-[20px] bg-white text-[20px] font-semibold leading-[30px] ${
                value === o ? "text-[#4B4B4B]" : "text-[#A5A5A5]"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Figma node 2065:7252 "ข้อมูลผู้ใช้ - ที่อยู่" — step 2 of registration; step 1 is /consent
export default function ConsentLocationPage() {
  const router = useRouter();
  const initial = () => progressService.getOrCreateSession()?.location ?? null;
  const [province, setProvince] = useState<string>(() => initial()?.province ?? "");
  const [district, setDistrict] = useState<string>(() => initial()?.district ?? "");
  const [subdistrict, setSubdistrict] = useState<string>(() => initial()?.subdistrict ?? "");
  const [accepted, setAccepted] = useState(false);
  const [showPDPA, setShowPDPA] = useState(false);
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = progressService.getOrCreateSession();
    if (session && !session.ageGroup) {
      router.replace("/consent");
      return;
    }
    loggingService.logEvent("consent_page_view", { step: "location" });
  }, [router]);

  const provinceData = locationData.provinces.find((p) => p.name === province) ?? null;
  const districts = provinceData ? provinceData.districts : [];
  const districtData = districts.find((d) => d.name === district) ?? null;
  const subdistricts = districtData ? districtData.subdistricts : [];
  const isOtherProvince = province === OTHER_PROVINCE;
  const locationDone = isOtherProvince ? !!province : !!province && !!district && !!subdistrict;

  const handleProvinceChange = (value: string) => {
    const other = value === OTHER_PROVINCE;
    setProvince(value);
    setDistrict(other ? OTHER_PROVINCE : "");
    setSubdistrict(other ? OTHER_PROVINCE : "");
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setSubdistrict(districts.find((d) => d.name === value)?.subdistricts[0] ?? "");
  };

  const submit = async (values: { province: string; district: string; subdistrict: string }) => {
    const current = progressService.getOrCreateSession();
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    const isTesting = redirect === "/pretest" || !!current?.isTestingGroup;

    await progressService.saveSession({
      ...current,
      consentGiven: true,
      location: { ...values, source: "manual" },
      isTestingGroup: isTesting,
    });

    loggingService.logEvent("consent_submitted", {
      age_range: current?.ageGroup,
      location_consent: true,
      province: values.province,
      district: values.district,
      sub_district: values.subdistrict,
      source: "manual",
    });

    router.push("/self-assessment/pre");
  };

  useDevSkip(() => {
    const first = locationData.provinces[0];
    submit(
      locationDone
        ? { province, district, subdistrict }
        : { province: first.name, district: first.districts[0].name, subdistrict: first.districts[0].subdistricts[0] }
    );
  });

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center gap-[32px] px-[24px] pb-[28px] pt-[32px]">
          <div className="flex flex-col items-center gap-[8px] text-center">
            <p className="text-[24px] font-semibold leading-[32px]">ข้อมูลผู้ใช้</p>
            <p className="text-[28px] font-bold leading-[36px]">โปรดเลือกที่อยู่ของท่าน</p>
          </div>

          {isClient && (
            <>
              <div className="flex w-full flex-col items-center gap-[16px]">
                <SelectCard
                  placeholder="จังหวัด"
                  value={province}
                  onChange={handleProvinceChange}
                  options={[...locationData.provinces.map((p) => p.name), OTHER_PROVINCE]}
                  boundaryRef={footerRef}
                />
                {!isOtherProvince && (
                  <>
                    <SelectCard
                      placeholder="อำเภอ"
                      value={district}
                      onChange={handleDistrictChange}
                      options={districts.map((d) => d.name)}
                      disabled={!province}
                      boundaryRef={footerRef}
                    />
                    <SelectCard
                      placeholder="ตำบล"
                      value={subdistrict}
                      onChange={setSubdistrict}
                      options={subdistricts}
                      disabled={!district}
                      boundaryRef={footerRef}
                    />
                  </>
                )}
              </div>

              <div className="flex w-full items-center gap-[16px]">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={accepted}
                  aria-label="ข้าพเจ้าได้อ่านและยอมรับนโยบายความเป็นส่วนตัว (PDPA) แล้ว"
                  onClick={() => setAccepted((prev) => !prev)}
                  className="flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-2 border-solid border-[#D9D9D9] bg-white"
                >
                  {accepted && <Check size={26} strokeWidth={3} className="text-[#0078A8]" aria-hidden="true" />}
                </button>
                <p className="flex-1 text-[18px] font-normal leading-[26px]">
                  ข้าพเจ้าได้อ่านและยอมรับ
                  <button
                    type="button"
                    onClick={() => setShowPDPA(true)}
                    className="cursor-pointer text-[#0078A8] underline"
                  >
                    นโยบายความเป็นส่วนตัว
                  </button>
                  (PDPA)แล้ว
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div ref={footerRef} className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
        <Button3D
          onClick={() => submit({ province, district, subdistrict })}
          disabled={!locationDone || !accepted}
        >
          ยินยอมและเริ่มเรียนรู้
        </Button3D>
      </div>

      {showPDPA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-[24px]">
          <div className="flex w-full max-w-[352px] flex-col gap-[16px] rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white p-[24px] text-center">
            <p className="text-[24px] font-semibold leading-[32px]">การคุ้มครองข้อมูล (PDPA)</p>
            <p className="text-[18px] font-normal leading-[26px]">
              แอปพลิเคชันนี้จะบันทึกช่วงอายุ และจังหวัด/อำเภอ/ตำบลที่ท่านเลือกเอง เพื่อวิเคราะห์สถิติโครงการเท่านั้น
              โดยไม่มีการเก็บชื่อ เบอร์โทรศัพท์ พิกัด GPS หรือข้อมูลส่วนบุคคลที่ระบุตัวตนจริงของท่าน
            </p>
            <Button3D onClick={() => setShowPDPA(false)}>เข้าใจแล้ว</Button3D>
          </div>
        </div>
      )}
    </div>
  );
}
