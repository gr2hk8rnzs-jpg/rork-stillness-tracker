import { useCallback, useRef, type KeyboardEvent, type PointerEvent } from "react";

import { PixelFrame } from "@/components/pixel/PixelFrame";
import { StillnessRules } from "@/lib/stillness/types";

const HANDLE_HEIGHT = 38;
const HANDLE_WIDTH = 62;
const TRACK_WIDTH = 22;
const TICK_COUNT = 13;

interface MinuteSliderProps {
  minutes: number;
  goal: number;
  onChange: (minutes: number) => void;
}

/**
 * Vertical pixel slider that drives today's minutes. Drag the metal grip up to
 * fill the health bar, down to empty it. Snaps to five-minute steps.
 */
export function MinuteSlider({ minutes, goal, onChange }: MinuteSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fraction = goal > 0 ? Math.min(1, Math.max(0, minutes / goal)) : 0;

  const snap = useCallback(
    (raw: number): number => {
      const snapped = Math.round(raw / StillnessRules.step) * StillnessRules.step;
      return Math.min(goal, Math.max(0, snapped));
    },
    [goal],
  );

  const updateFromClientY = useCallback(
    (clientY: number) => {
      const element = trackRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const usable = Math.max(1, rect.height - HANDLE_HEIGHT);
      const local = Math.min(
        Math.max(clientY - rect.top, HANDLE_HEIGHT / 2),
        rect.height - HANDLE_HEIGHT / 2,
      );
      const ratio = 1 - (local - HANDLE_HEIGHT / 2) / usable;
      onChange(snap(ratio * goal));
    },
    [goal, onChange, snap],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromClientY(event.clientY);
    },
    [updateFromClientY],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      updateFromClientY(event.clientY);
    },
    [updateFromClientY],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowUp" || event.key === "ArrowRight") {
        event.preventDefault();
        onChange(Math.min(goal, minutes + StillnessRules.step));
      } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
        event.preventDefault();
        onChange(Math.max(0, minutes - StillnessRules.step));
      } else if (event.key === "Home") {
        event.preventDefault();
        onChange(0);
      } else if (event.key === "End") {
        event.preventDefault();
        onChange(goal);
      }
    },
    [goal, minutes, onChange],
  );

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Minutes meditated today"
      aria-valuemin={0}
      aria-valuemax={goal}
      aria-valuenow={minutes}
      aria-valuetext={`${minutes} of ${goal} minutes`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      className="relative h-full cursor-ns-resize touch-none select-none outline-none focus-visible:ring-4 focus-visible:ring-[var(--pixel-blood)]"
      style={{ width: HANDLE_WIDTH + 26 }}
    >
      {/* tick column */}
      <div
        className="pointer-events-none absolute left-0 flex w-[20px] flex-col justify-between"
        style={{ top: HANDLE_HEIGHT / 2, bottom: HANDLE_HEIGHT / 2 }}
      >
        {Array.from({ length: TICK_COUNT }, (_, index) => (
          <div
            key={index}
            className="ml-auto"
            style={{
              width: index % 3 === 0 ? 18 : 11,
              height: 3,
              background: "var(--pixel-ink)",
            }}
          />
        ))}
      </div>

      {/* track */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{ left: 26, width: TRACK_WIDTH }}
      >
        <PixelFrame
          step={4}
          lineWidth={3}
          className="h-full"
          innerClassName="relative overflow-hidden"
        >
          <div
            className="absolute inset-x-0 bottom-0 transition-[height] duration-100 ease-out"
            style={{
              height: `calc(${fraction * 100}% + ${(1 - fraction) * HANDLE_HEIGHT * 0.5}px)`,
              background: "var(--pixel-blood)",
            }}
          />
        </PixelFrame>
      </div>

      {/* grip */}
      <div
        className="pointer-events-none absolute transition-[top] duration-100 ease-out"
        style={{
          left: 26,
          width: HANDLE_WIDTH,
          height: HANDLE_HEIGHT,
          top: `calc(${(1 - fraction) * 100}% - ${(1 - fraction) * HANDLE_HEIGHT}px)`,
        }}
      >
        <PixelFrame
          step={5}
          lineWidth={3}
          background="var(--pixel-steel)"
          className="h-full w-full"
          innerClassName="flex flex-col items-center justify-center gap-[4px]"
        >
          {[0, 1, 2].map((index) => (
            <div key={index} style={{ width: 26, height: 3, background: "var(--pixel-ink)" }} />
          ))}
        </PixelFrame>
      </div>
    </div>
  );
}
