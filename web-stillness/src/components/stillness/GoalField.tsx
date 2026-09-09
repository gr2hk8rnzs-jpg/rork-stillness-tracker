import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";

import { PixelFrame } from "@/components/pixel/PixelFrame";
import { StillnessRules } from "@/lib/stillness/types";

interface GoalFieldProps {
  goal: number;
  onCommit: (goal: number) => void;
}

/**
 * Boxed numeric goal entry with a small pixel "GOAL" label.
 * Committed values carry forward to every following day.
 */
export function GoalField({ goal, onCommit }: GoalFieldProps) {
  const [draft, setDraft] = useState<string>(String(goal));
  const isFocused = useRef<boolean>(false);

  useEffect(() => {
    if (!isFocused.current) setDraft(String(goal));
  }, [goal]);

  const commit = useCallback(() => {
    const parsed = Number.parseInt(draft.replace(/\D/g, ""), 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(goal));
      return;
    }
    const clamped = Math.max(StillnessRules.minGoal, Math.min(StillnessRules.maxGoal, parsed));
    setDraft(String(clamped));
    onCommit(clamped);
  }, [draft, goal, onCommit]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value.replace(/\D/g, "").slice(0, 3));
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-[6px]">
      <span className="font-label text-[15px] font-bold tracking-[2px] text-[var(--pixel-ink)]">
        GOAL
      </span>
      <PixelFrame step={5} lineWidth={3} className="w-full">
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            isFocused.current = true;
            setDraft("");
          }}
          onBlur={() => {
            isFocused.current = false;
            commit();
          }}
          aria-label="Daily goal in minutes"
          className="h-[52px] w-full bg-transparent text-center font-display text-[22px] leading-none text-[var(--pixel-ink)] outline-none"
        />
      </PixelFrame>
    </div>
  );
}
