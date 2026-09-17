import type { ButtonHTMLAttributes, ReactNode } from "react";

interface BottomActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  appearanceClassName?: string;
  heightClassName?: string;
  shapeClassName?: string;
}

/**
 * Shared bottom CTA for the primary learning journey.
 *
 * Structural defaults match the minigame action buttons. Pages can replace
 * appearance, height, or shape without competing Tailwind utility classes,
 * while className remains available for page-specific additions.
 */
export default function BottomActionButton({
  children,
  appearanceClassName = "btn-primary",
  heightClassName = "min-h-[100px]",
  shapeClassName = "rounded-t-[25px] rounded-b-none",
  className = "",
  ...buttonProps
}: BottomActionButtonProps) {
  return (
    <button
      {...buttonProps}
      className={[
        "btn w-full shrink-0 text-[26px]",
        appearanceClassName,
        heightClassName,
        shapeClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
