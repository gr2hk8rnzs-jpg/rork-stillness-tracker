import { memo, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface PixelOutlineTextProps {
  text: string;
  /** Font size in pixels. */
  size: number;
  fill?: string;
  outline?: string;
  /** Outline thickness in pixels; 0 disables the outline. */
  thickness?: number;
  className?: string;
  style?: CSSProperties;
}

function outlineShadow(thickness: number, color: string): string {
  if (thickness <= 0) return "none";
  const offsets: [number, number][] = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];
  return offsets.map(([x, y]) => `${x * thickness}px ${y * thickness}px 0 ${color}`).join(", ");
}

/** Bitmap display text with an 8-direction hard pixel outline. */
export const PixelOutlineText = memo(function PixelOutlineText({
  text,
  size,
  fill = "var(--pixel-canvas)",
  outline = "var(--pixel-ink)",
  thickness = 4,
  className,
  style,
}: PixelOutlineTextProps) {
  return (
    <span
      className={cn("font-display leading-none whitespace-nowrap", className)}
      style={{
        fontSize: size,
        color: fill,
        textShadow: outlineShadow(thickness, outline),
        ...style,
      }}
    >
      {text}
    </span>
  );
});
