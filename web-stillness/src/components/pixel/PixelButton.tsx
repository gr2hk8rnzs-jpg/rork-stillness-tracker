import { memo, type ReactNode } from "react";

import { steppedClipPath } from "@/components/pixel/PixelFrame";
import { cn } from "@/lib/utils";

interface PixelButtonProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  /** Plate colour; defaults to the blood-red hero accent. */
  tone?: "blood" | "canvas";
  className?: string;
}

/** Arcade plate button with a hard (non-blurred) offset shadow that collapses on press. */
export const PixelButton = memo(function PixelButton({
  title,
  onClick,
  disabled = false,
  tone = "blood",
  className,
}: PixelButtonProps) {
  const plate = tone === "blood" ? "var(--pixel-blood)" : "var(--pixel-canvas)";
  const ink = tone === "blood" ? "var(--pixel-canvas)" : "var(--pixel-ink)";

  return (
    <div className={cn("relative w-full select-none", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-[6px] translate-y-[6px]"
        style={{ background: "var(--pixel-ink)", clipPath: steppedClipPath(6) }}
      />
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative w-full font-display text-[18px] uppercase leading-none transition-transform duration-75",
          "px-4 py-[18px] active:translate-x-[6px] active:translate-y-[6px]",
          disabled && "opacity-40",
        )}
        style={{ background: "var(--pixel-ink)", clipPath: steppedClipPath(6), color: ink }}
      >
        <span
          className="absolute inset-[4px] flex items-center justify-center"
          style={{ background: plate, clipPath: steppedClipPath(3) }}
        >
          <span className="relative">{title}</span>
        </span>
        <span className="invisible">{title}</span>
      </button>
    </div>
  );
});

interface PixelChipProps {
  children: ReactNode;
  active?: boolean;
}

/** Small pixel nav chip used in the header. */
export const PixelChip = memo(function PixelChip({ children, active = false }: PixelChipProps) {
  return (
    <span
      className="inline-flex items-center px-[10px] py-[7px] font-display text-[11px] uppercase leading-none"
      style={{
        background: "var(--pixel-ink)",
        clipPath: steppedClipPath(4),
        color: "var(--pixel-ink)",
      }}
    >
      <span
        className="px-[8px] py-[6px]"
        style={{
          background: active ? "var(--pixel-blood)" : "var(--pixel-canvas)",
          color: active ? "var(--pixel-canvas)" : "var(--pixel-ink)",
          clipPath: steppedClipPath(2),
          margin: -3,
        }}
      >
        {children}
      </span>
    </span>
  );
});
