import { memo } from "react";

import { PixelFrame } from "@/components/pixel/PixelFrame";
import { cn } from "@/lib/utils";

interface HealthBarProps {
  /** Fill ratio in `0...1`. */
  progress: number;
  segments?: number;
  borderWidth?: number;
  notch?: number;
  dividerWidth?: number;
  className?: string;
}

/**
 * RPG-style vertical health meter: black pixel border, white when empty,
 * red blocks stacking from the bottom as minutes accumulate.
 */
export const HealthBar = memo(function HealthBar({
  progress,
  segments = 12,
  borderWidth = 4,
  notch = 6,
  dividerWidth = 3,
  className,
}: HealthBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <PixelFrame
      step={notch}
      lineWidth={borderWidth}
      className={cn("h-full", className)}
      innerClassName="relative overflow-hidden"
    >
      <div
        className="absolute inset-x-0 bottom-0 transition-[height] duration-200 ease-out"
        style={{ height: `${clamped * 100}%`, background: "var(--pixel-blood)" }}
      />
      {Array.from({ length: Math.max(0, segments - 1) }, (_, index) => (
        <div
          key={index}
          className="absolute inset-x-0"
          style={{
            bottom: `${((index + 1) / segments) * 100}%`,
            height: dividerWidth,
            background: "var(--pixel-ink)",
          }}
        />
      ))}
    </PixelFrame>
  );
});
