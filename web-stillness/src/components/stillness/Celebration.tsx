import { memo, useMemo } from "react";

import { PixelFrame } from "@/components/pixel/PixelFrame";
import { PixelStar } from "@/components/pixel/PixelStar";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const SPOTS: readonly [number, number, number][] = [
  [0.09, 0.16, 26],
  [0.2, 0.09, 16],
  [0.05, 0.3, 30],
  [0.46, 0.13, 18],
  [0.86, 0.2, 26],
  [0.94, 0.35, 18],
  [0.79, 0.06, 16],
  [0.1, 0.48, 22],
  [0.44, 0.62, 24],
  [0.9, 0.55, 28],
  [0.13, 0.68, 18],
  [0.47, 0.78, 22],
  [0.06, 0.83, 30],
  [0.9, 0.74, 20],
  [0.16, 0.92, 18],
  [0.83, 0.9, 24],
];

const PALETTE: readonly string[] = ["var(--pixel-gold)", "var(--pixel-flame)", "var(--pixel-blood)"];

function letterColor(index: number): string {
  switch (index % 3) {
    case 0:
      return "var(--pixel-flame)";
    case 1:
      return "var(--pixel-blood)";
    default:
      return "var(--pixel-ink)";
  }
}

interface CelebrationProps {
  onClose: () => void;
}

/**
 * Victory flourish shown for ten seconds when the daily goal is cleared:
 * pixel sparkles burst around the health bar and a multicolour arcade
 * "YOU DID IT!" plaque flashes over the meter.
 */
export const Celebration = memo(function Celebration({ onClose }: CelebrationProps) {
  const sparkles = useMemo<Sparkle[]>(
    () =>
      SPOTS.map((spot, index) => ({
        id: index,
        x: spot[0],
        y: spot[1],
        size: spot[2],
        color: PALETTE[index % PALETTE.length],
        delay: index * 0.07,
        duration: 0.5 + (index % 3) * 0.18,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x * 100}%`,
            top: `${sparkle.y * 100}%`,
            marginLeft: -sparkle.size / 2,
            marginTop: -sparkle.size / 2,
            animation: `pixel-twinkle ${sparkle.duration * 2}s ease-in-out ${sparkle.delay}s infinite`,
          }}
        >
          <PixelStar size={sparkle.size} color={sparkle.color} />
        </div>
      ))}

      <div
        className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2"
        style={{ animation: "pixel-pop 0.45s ease-out both" }}
        role="status"
      >
        <div style={{ animation: "pixel-throb 0.84s ease-in-out infinite" }}>
          <Plaque letters="YOU" rotate={-3} />
          <Plaque letters="DID IT!" rotate={2} className="-mt-[6px]" />
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss celebration"
        className="pointer-events-auto absolute left-0 top-0"
      >
        <PixelFrame
          step={5}
          lineWidth={3}
          className="h-[40px] w-[40px]"
          innerClassName="flex items-center justify-center font-display text-[13px] text-[var(--pixel-ink)]"
        >
          X
        </PixelFrame>
      </button>
    </div>
  );
});

interface PlaqueProps {
  letters: string;
  rotate: number;
  className?: string;
}

function Plaque({ letters, rotate, className }: PlaqueProps) {
  return (
    <div className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <PixelFrame
        step={6}
        lineWidth={4}
        innerClassName="flex items-center justify-center px-[14px] py-[10px]"
      >
        {letters.split("").map((character, index) =>
          character === " " ? (
            <span key={index} style={{ width: 14 }} />
          ) : (
            <span
              key={index}
              className="font-display leading-none"
              style={{
                fontSize: 34,
                color: letterColor(index),
                textShadow: [
                  "-2px -2px 0 var(--pixel-ink)",
                  "0 -2px 0 var(--pixel-ink)",
                  "2px -2px 0 var(--pixel-ink)",
                  "-2px 0 0 var(--pixel-ink)",
                  "2px 0 0 var(--pixel-ink)",
                  "-2px 2px 0 var(--pixel-ink)",
                  "0 2px 0 var(--pixel-ink)",
                  "2px 2px 0 var(--pixel-ink)",
                ].join(", "),
              }}
            >
              {character}
            </span>
          ),
        )}
      </PixelFrame>
    </div>
  );
}
