import { memo, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Stepped-corner outline that fakes 16-bit "rounded" corners without any radius. */
export function steppedClipPath(step: number): string {
  const n = `${step}px`;
  const far = `calc(100% - ${step}px)`;
  return `polygon(${n} 0, ${far} 0, ${far} ${n}, 100% ${n}, 100% ${far}, ${far} ${far}, ${far} 100%, ${n} 100%, ${n} ${far}, 0 ${far}, 0 ${n}, ${n} ${n})`;
}

interface PixelFrameProps {
  children?: ReactNode;
  /** Corner notch size in pixels. */
  step?: number;
  /** Black border thickness in pixels. */
  lineWidth?: number;
  /** Inner surface colour. */
  background?: string;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
}

/** Hard-edged pixel chrome: solid ink border, notched corners, flat fill. */
export const PixelFrame = memo(function PixelFrame({
  children,
  step = 6,
  lineWidth = 4,
  background = "var(--pixel-canvas)",
  className,
  innerClassName,
  style,
}: PixelFrameProps) {
  return (
    <div
      className={cn("shrink-0", className)}
      style={{
        background: "var(--pixel-ink)",
        clipPath: steppedClipPath(step),
        padding: lineWidth,
        ...style,
      }}
    >
      <div
        className={cn("h-full w-full", innerClassName)}
        style={{ background, clipPath: steppedClipPath(Math.max(2, step - lineWidth)) }}
      >
        {children}
      </div>
    </div>
  );
});
