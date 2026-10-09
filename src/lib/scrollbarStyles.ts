// Always-visible scroll bar look for CustomScrollArea on the registration pages — same grey
// track + G2 thumb as GameSolutionCard. Track classes include their own position.

/** Page-level scroll area: sits in the 24px side gutter, clear of the full-width cards */
export const PAGE_SCROLL_TRACK_CLASS =
  "pointer-events-none absolute bottom-[8px] right-[8px] top-[8px] w-[8px] rounded-[12px] bg-[#D9D9D9]";

/** Inside a dropdown list (rows keep 32px side padding so text never runs under it) */
export const LIST_SCROLL_TRACK_CLASS =
  "pointer-events-none absolute bottom-[12px] right-[10px] top-[12px] w-[8px] rounded-[12px] bg-[#D9D9D9]";

export const SCROLL_THUMB_CLASS = "absolute left-0 w-full rounded-[12px] bg-[#7F7F7F]";
