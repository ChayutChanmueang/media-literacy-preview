import { Noto_Sans_Thai_Looped } from "next/font/google";

// Figma's "Noto Looped Thai" is published on Google Fonts as "Noto Sans Thai Looped"
export const notoLoopedThai = Noto_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
});
