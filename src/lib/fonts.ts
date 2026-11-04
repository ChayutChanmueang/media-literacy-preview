import { Mali, Noto_Sans_Thai_Looped } from "next/font/google";

// Figma's "Noto Looped Thai" is published on Google Fonts as "Noto Sans Thai Looped"
export const notoLoopedThai = Noto_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  // set on <html> in layout.tsx; globals.css points --font-sans/--font-content at it
  variable: "--font-noto-looped",
});

// Playful display font — only for the stage popup text (StagePopup); see docs/wiki/design/07-typography.md
export const mali = Mali({
  subsets: ["thai", "latin"],
  weight: ["600", "700"],
});
