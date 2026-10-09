"use client";

import React, { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";
import locationData from "@/data/thailand-location.json";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { notoLoopedThai } from "@/lib/fonts";
import { useDevSkip } from "@/lib/devSkip";
import Button3D from "@/components/Button3D";
import CustomScrollArea from "@/components/CustomScrollArea";
import { LIST_SCROLL_TRACK_CLASS, PAGE_SCROLL_TRACK_CLASS, SCROLL_THUMB_CLASS } from "@/lib/scrollbarStyles";

// US-CF-23: จังหวัด "อื่นๆ" (เผื่อผู้เล่นจังหวัดอื่น) — ไม่ต้องเลือกอำเภอ/ตำบลต่อ
const OTHER_PROVINCE = "อื่น ๆ";
const subscribeNoop = () => () => {};

const LIST_MAX_HEIGHT = 320; // ความสูงสูงสุดของรายการตาม Figma
const ROW_HEIGHT = 62; // แถวละ 62px (รวมเส้นคั่น 2px)
const LIST_BORDER = 2;
// อย่างน้อย 3 ตัวเลือก เตี้ยกว่านี้ใช้ยาก (ถ้ามีตัวเลือกไม่ถึง 3 รายการก็สั้นตามจริง)
const LIST_MIN_HEIGHT = ROW_HEIGHT * 3 + LIST_BORDER * 2;
const LIST_GAP = 10; // ขอบล่างปุ่ม → ขอบบนรายการ (ใช้ใน keyframe dropdown-slide-down ด้วย)
const VIEWPORT_MARGIN = 16; // เว้นจากขอบล่างจอ

// ช่องที่ยังไม่กรอกตอนกดปุ่มยินยอม: ขอบ/ข้อความแดง + ไอคอน (ไม่สื่อด้วยสีอย่างเดียว)
// #D92D20 บนพื้นขาว ~4.9:1 ผ่าน contrast 4.5:1

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="flex items-center gap-[8px] text-[20px] font-semibold leading-[30px] text-[#D92D20]">
      <AlertCircle size={24} strokeWidth={2.5} aria-hidden="true" className="shrink-0" />
      {children}
    </p>
  );
}

type Placement = { left: number; width: number; top: number; maxHeight: number };

// Figma node 2917:16430 (Component 56) — ปุ่มเลือกแบบกดแล้วกางรายการ (ไม่ใช้ <select> ของเบราว์เซอร์ เพื่อให้หน้าตาตรงดีไซน์)
// รายการเปิดอยู่ = วาดเป็นชั้นบนสุด (portal + fixed) ทับปุ่มยินยอมได้ — หน้าเพจล็อกการเลื่อนและปิดปุ่มยินยอมไว้ (ดู ConsentLocationPage)
function SelectCard({
  placeholder,
  value,
  onChange,
  options,
  disabled,
  open,
  onOpenChange,
  scrollRef,
  invalid = false,
  errorMessage,
  fieldRef,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** กล่องเลื่อนของหน้า — เลื่อนขึ้นให้ก่อนถ้าใต้ปุ่มมีที่ไม่พอ 3 ตัวเลือก */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** ยังไม่ได้เลือกตอนกดปุ่มยินยอม → ขอบแดง + ข้อความ errorMessage ใต้ปุ่ม */
  invalid?: boolean;
  errorMessage?: string;
  /** ให้หน้าเพจเลื่อนมาหา/โฟกัส/สั่นปุ่มนี้ได้ */
  fieldRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const errorId = useId();
  const [placement, setPlacement] = useState<Placement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      onOpenChangeRef.current(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChangeRef.current(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // วางรายการใต้ปุ่ม (วัดก่อน paint กันรายการกระพริบ): สูงสุด 320px สูงตามที่เหลือถึงขอบล่างจอ
  // แต่ไม่ต่ำกว่า 3 ตัวเลือก — ทับปุ่มยินยอมได้ ถ้าใต้ปุ่มมีที่ไม่พอ 3 ตัวเลือก เลื่อนหน้าขึ้นให้ก่อน
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    if (!open || !trigger) return;
    const minHeight = Math.min(LIST_MIN_HEIGHT, options.length * ROW_HEIGHT + LIST_BORDER * 2);
    const shortBy =
      trigger.getBoundingClientRect().bottom + LIST_GAP + minHeight + VIEWPORT_MARGIN - window.innerHeight;
    if (shortBy > 0 && scrollRef.current) scrollRef.current.scrollTop += shortBy;

    const measure = () => {
      const rect = trigger.getBoundingClientRect();
      const available = window.innerHeight - VIEWPORT_MARGIN - (rect.bottom + LIST_GAP);
      setPlacement({
        left: rect.left,
        width: rect.width,
        top: rect.bottom,
        maxHeight: Math.max(LIST_MIN_HEIGHT, Math.min(LIST_MAX_HEIGHT, available)),
      });
    };
    measure();
    // the page swaps to overflow-hidden while open, which can drop a desktop scrollbar and widen the trigger
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(trigger);
    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [open, options.length, scrollRef]);

  return (
    <div className="flex w-full flex-col gap-[8px]">
      <div className="relative h-[64px] w-full">
        {/* ปุ่มเปิดรายการ (Figma node 2917:16430): พื้นขาว ขอบ #A5A5A5 ตัวอักษร+ลูกศร #7F7F7F
            เลือกค่าแล้ว = สไตล์เดียวกับช่วงอายุที่เลือก (พื้นฟ้าอ่อน ขอบ+ตัวอักษรฟ้า) ให้สองหน้าดูเป็นชุดเดียวกัน
            ปิดใช้งาน (เช่น อำเภอก่อนเลือกจังหวัด) = เทาอ่อนกว่า */}
        <button
          ref={(el) => {
            triggerRef.current = el;
            if (fieldRef) fieldRef.current = el;
          }}
          type="button"
          onClick={() => onOpenChange(!open)}
          disabled={disabled}
          aria-label={placeholder}
          aria-describedby={invalid ? errorId : undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`relative flex h-[62px] w-full cursor-pointer items-center justify-center rounded-[20px] border-2 border-solid text-[20px] font-semibold leading-[30px] active:translate-y-[2px] disabled:cursor-not-allowed disabled:border-[#D9D9D9] disabled:text-[#A5A5A5] disabled:active:translate-y-0 ${
            value
              ? "border-[#00A3E0] bg-[#D9F1FA] text-[#00A3E0]"
              : invalid
                ? "border-[#D92D20] bg-[#FEF3F2] text-[#D92D20]"
                : "border-[#A5A5A5] bg-white text-[#7F7F7F]"
          }`}
        >
          {value || placeholder}
          {/* same shape as /images/consent/dropdown-arrow.svg, drawn inline so it follows the text colour */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`pointer-events-none absolute right-[22px] size-[24px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path
              fill="currentColor"
              d="M10.7791 17.4255L2.34884 8.17021C2.23256 8.04255 2.14574 7.90468 2.08837 7.7566C2.03101 7.60851 2.00155 7.44851 2 7.2766C2 6.93617 2.10698 6.6383 2.32093 6.38298C2.53488 6.12766 2.8155 6 3.16279 6H20.8372C21.186 6 21.4674 6.12766 21.6814 6.38298C21.8953 6.6383 22.0015 6.93617 22 7.2766C22 7.3617 21.8837 7.65958 21.6511 8.17021L13.2209 17.4255C13.0271 17.6383 12.8333 17.7872 12.6395 17.8723C12.4457 17.9574 12.2325 18 12 18C11.7674 18 11.5543 17.9574 11.3605 17.8723C11.1667 17.7872 10.9729 17.6383 10.7791 17.4255Z"
            />
          </svg>
        </button>
  
        {open &&
          placement &&
          createPortal(
            // Clip window starts at the trigger's bottom edge, so the list slides out from under the
            // button — same idea as Figma Component 58 (list tucked behind the trigger)
            <div
              ref={listRef}
              className={`${notoLoopedThai.className} pointer-events-none fixed z-40 overflow-hidden`}
              style={{ left: placement.left, width: placement.width, top: placement.top, paddingTop: LIST_GAP }}
            >
              {/* scroll bar วาดเอง (CustomScrollArea) ให้เห็นตลอดทุกเบราว์เซอร์/มือถือเมื่อรายการยาวเกินกรอบ */}
              <CustomScrollArea
                className="dropdown-slide-down pointer-events-auto overflow-hidden rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white"
                maxHeight={placement.maxHeight - LIST_BORDER * 2}
                contentClassName="flex flex-col overscroll-contain"
                contentProps={{ role: "listbox", "aria-label": placeholder }}
                trackClassName={LIST_SCROLL_TRACK_CLASS}
                thumbClassName={SCROLL_THUMB_CLASS}
              >
                {/* Figma node 2222:4106: แถวสูง 62px คั่นด้วยเส้น #D9D9D9 ตัวอักษร #595959
                    ตัวที่เลือกอยู่ = พื้นฟ้าอ่อน ตัวอักษรฟ้า + ✓ กำกับ (ไม่สื่อด้วยสีอย่างเดียว) */}
                {options.map((o) => {
                  const selected = value === o;
                  return (
                    <button
                      key={o}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onChange(o);
                        onOpenChange(false);
                      }}
                      className={`flex min-h-[62px] w-full shrink-0 cursor-pointer items-center justify-center gap-[8px] border-b-2 border-solid border-[#D9D9D9] px-[32px] text-[20px] font-semibold leading-[30px] last:border-b-0 active:bg-[#F2F2F2] ${
                        selected ? "bg-[#D9F1FA] text-[#00A3E0]" : "bg-white text-[#595959]"
                      }`}
                    >
                      {selected && <span aria-hidden="true">✓</span>}
                      {o}
                    </button>
                  );
                })}
              </CustomScrollArea>
            </div>,
            document.body
          )}
      </div>
      {invalid && errorMessage && <FieldError id={errorId}>{errorMessage}</FieldError>}
    </div>
  );
}

// Figma node 2917:16418 "ข้อมูลผู้ใช้ - ที่อยู่" — step 2 of registration; step 1 is /consent
export default function ConsentLocationPage() {
  const router = useRouter();
  const initial = () => progressService.getOrCreateSession()?.location ?? null;
  const [province, setProvince] = useState<string>(() => initial()?.province ?? "");
  const [district, setDistrict] = useState<string>(() => initial()?.district ?? "");
  const [subdistrict, setSubdistrict] = useState<string>(() => initial()?.subdistrict ?? "");
  const [accepted, setAccepted] = useState(false);
  const [showPDPA, setShowPDPA] = useState(false);
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // เปิดได้ทีละรายการ — ระหว่างเปิด: ล็อกการเลื่อนหน้า (เลื่อนได้แค่ในรายการ) และกดปุ่มยินยอมไม่ได้
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuProps = (name: string) => ({
    open: openMenu === name,
    onOpenChange: (open: boolean) => setOpenMenu(open ? name : null),
  });
  // กดปุ่มยินยอมทั้งที่ยังกรอกไม่ครบ → ไฮไลต์ช่องที่ขาด (หายเองทีละช่องเมื่อกรอกแล้ว)
  const [showErrors, setShowErrors] = useState(false);
  const provinceRef = useRef<HTMLButtonElement>(null);
  const districtRef = useRef<HTMLButtonElement>(null);
  const subdistrictRef = useRef<HTMLButtonElement>(null);
  const pdpaRef = useRef<HTMLButtonElement>(null);
  const pdpaErrorId = useId();

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

  // ไม่เลือกตำบลให้อัตโนมัติ — ผู้เล่นต้องเลือกเอง ไม่งั้นอาจข้ามไปและได้ข้อมูลที่ไม่ตรงจริง
  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setSubdistrict("");
  };

  // อำเภอ/ตำบลนับว่า "ขาด" ก็ต่อเมื่อกดเลือกได้แล้ว (ช่องก่อนหน้าเลือกแล้ว) — ช่องที่ยังเทาอยู่ไม่ต้องแดง
  const provinceMissing = !province;
  const districtMissing = !isOtherProvince && !!province && !district;
  const subdistrictMissing = !isOtherProvince && !!district && !subdistrict;

  const handleContinue = () => {
    const missing = [
      provinceMissing && { field: "province", el: provinceRef.current },
      districtMissing && { field: "district", el: districtRef.current },
      subdistrictMissing && { field: "subdistrict", el: subdistrictRef.current },
      !accepted && { field: "pdpa", el: pdpaRef.current },
    ].filter((m): m is { field: string; el: HTMLButtonElement | null } => !!m);

    if (missing.length === 0) {
      submit({ province, district, subdistrict });
      return;
    }

    setShowErrors(true);
    loggingService.logEvent("consent_submit_incomplete", { missing: missing.map((m) => m.field) });

    // เลื่อนไปหาช่องแรกที่ขาด (บนจอมือถืออาจมองไม่เห็นช่องติ๊ก PDPA) แล้วสั่นช่องที่ขาดให้สะดุดตา
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const first = missing[0].el;
    first?.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    first?.focus({ preventScroll: true });
    if (!reduceMotion) {
      for (const { el } of missing) {
        el?.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-6px)" },
            { transform: "translateX(6px)" },
            { transform: "translateX(-6px)" },
            { transform: "translateX(6px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 400, easing: "ease-in-out" }
        );
      }
    }
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

    // Research mode: pre-post test (self-assessment survey) gates entry to lessons.
    // Normal mode has no pre-post test — go straight to the mode-selection screen.
    router.push(progressService.getAppMode() === "research" ? "/self-assessment/pre" : "/lessons");
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
      <CustomScrollArea
        className="min-h-0 flex-1"
        scrollRef={scrollRef}
        locked={!!openMenu}
        trackClassName={PAGE_SCROLL_TRACK_CLASS}
        thumbClassName={SCROLL_THUMB_CLASS}
      >
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
                  {...menuProps("จังหวัด")}
                  scrollRef={scrollRef}
                  fieldRef={provinceRef}
                  invalid={showErrors && provinceMissing}
                  errorMessage="กรุณาเลือกจังหวัด"
                />
                {!isOtherProvince && (
                  <>
                    <SelectCard
                      placeholder="อำเภอ"
                      value={district}
                      onChange={handleDistrictChange}
                      options={districts.map((d) => d.name)}
                      disabled={!province}
                      {...menuProps("อำเภอ")}
                      scrollRef={scrollRef}
                      fieldRef={districtRef}
                      invalid={showErrors && districtMissing}
                      errorMessage="กรุณาเลือกอำเภอ"
                    />
                    <SelectCard
                      placeholder="ตำบล"
                      value={subdistrict}
                      onChange={setSubdistrict}
                      options={subdistricts}
                      disabled={!district}
                      {...menuProps("ตำบล")}
                      scrollRef={scrollRef}
                      fieldRef={subdistrictRef}
                      invalid={showErrors && subdistrictMissing}
                      errorMessage="กรุณาเลือกตำบล"
                    />
                  </>
                )}
              </div>

              <div className="flex w-full flex-col gap-[8px]">
                <div className="flex w-full items-center gap-[16px]">
                  <button
                    ref={pdpaRef}
                    type="button"
                    role="checkbox"
                    aria-checked={accepted}
                    aria-label="ข้าพเจ้าได้อ่านและยอมรับนโยบายความเป็นส่วนตัว (PDPA) แล้ว"
                    aria-invalid={(showErrors && !accepted) || undefined}
                    aria-describedby={showErrors && !accepted ? pdpaErrorId : undefined}
                    onClick={() => setAccepted((prev) => !prev)}
                    className={`flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-2 border-solid active:bg-[#F2F2F2] ${
                      accepted
                        ? "border-[#00A3E0] bg-[#D9F1FA]"
                        : showErrors
                          ? "border-[#D92D20] bg-[#FEF3F2]"
                          : "border-[#D9D9D9] bg-white"
                    }`}
                  >
                    {/* Figma node 2917:16420: ขอบ #D9D9D9 — ติ๊กแล้วใช้ฟ้าเหมือนตัวเลือกที่เลือกอยู่; ยังไม่ติ๊กตอนกดยินยอม = แดง */}
                    {accepted && <Check size={26} strokeWidth={3} className="text-[#00A3E0]" aria-hidden="true" />}
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
                {showErrors && !accepted && (
                  <FieldError id={pdpaErrorId}>กรุณาติ๊กยอมรับนโยบายความเป็นส่วนตัวก่อน</FieldError>
                )}
              </div>
            </>
          )}
        </div>
      </CustomScrollArea>

      {/* รายการที่เปิดอยู่วาดทับแถบนี้ได้ — ระหว่างนั้นปิดการกด (แตะตรงนี้ = แค่ปิดรายการ ไม่ submit) */}
      <div inert={!!openMenu} className={`shrink-0 px-[24px] pb-[64px] pt-[24px] ${openMenu ? "pointer-events-none" : ""}`}>
        {/* ยังกรอกไม่ครบ = ปุ่มสีเทา (ให้รู้ว่ายังขาดอะไรอยู่) แต่ยังกดได้ — กดแล้วไฮไลต์ช่องที่ขาดแทนการ submit */}
        <Button3D onClick={handleContinue} inactive={!locationDone || !accepted}>
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
