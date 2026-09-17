import type { ReactNode } from "react";

interface CompletionCardProps {
  /** Icon drawn inside the yellow 100px badge circle */
  icon: ReactNode;
  eyebrow: string;
  title: ReactNode;
  caption: ReactNode;
}

// Figma component "Frame 478" (completion card). Text uses <p>, not headings: globals.css styles h1/h2 unlayered, which overrides Tailwind utilities.
// The badge circle is CSS, not Figma's exported SVG: that SVG's filter region clips the circle's anti-aliased edges.
export default function CompletionCard({ icon, eyebrow, title, caption }: CompletionCardProps) {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center rounded-[24px] border-2 border-solid border-[#D9D9D9] shadow-[0px_2px_0px_0px_#D9D9D9]">
      <div className="flex w-[300px] max-w-full flex-col items-center justify-center gap-[16px] py-[24px] text-center text-[#4B4B4B]">
        <div
          className="relative size-[100px] shrink-0 rounded-full bg-[#F0AE03] shadow-[0px_4px_0px_0px_#CC9300]"
          aria-hidden="true"
        >
          {icon}
        </div>
        <p className="w-full text-[24px] font-semibold leading-[32px]">{eyebrow}</p>
        <p className="w-full text-[28px] font-bold leading-[36px]">{title}</p>
        <p className="w-full text-[18px] font-normal leading-[26px]">{caption}</p>
      </div>
    </div>
  );
}
