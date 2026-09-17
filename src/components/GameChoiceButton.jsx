/**
 * GameChoiceButton — Raised 3D choice button (US-CF-04)
 *
 * A shared pill-shaped button with gradient fill, white border, and a
 * bottom-shadow "3D raised" effect derived from the Figma design spec.
 * Pressing the button triggers a subtle depress animation (≤ 100ms).
 *
 * Variants:
 *   green  — accept / จริง       (default Figma green gradient)
 *   red    — refuse / ปลอม/มั่ว   (red gradient)
 *   yellow — ignore / ไม่แน่ใจ    (yellow gradient, dark text for contrast)
 *
 * Size: inherits from parent flex layout. min-h is controlled by the caller
 * (default min-h-[100px] via the outer container in each game). No fixed w/h.
 */

import React from 'react';

export default function GameChoiceButton({
  variant = 'green',
  icon: Icon,
  label,
  onClick,
  disabled = false,
  className = '',
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`choice-btn choice-btn--${variant} flex-1 flex flex-col items-center justify-center gap-1.5 px-1 py-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {Icon && <Icon size={34} strokeWidth={2.25} />}
      <span className="text-[clamp(15px,4.78vw,22px)] font-bold leading-tight text-center">
        {label}
      </span>
    </button>
  );
}
