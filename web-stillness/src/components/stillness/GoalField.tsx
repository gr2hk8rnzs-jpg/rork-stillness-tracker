import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { PixelFrame } from "@/components/pixel/PixelFrame";
import { StillnessRules } from "@/lib/stillness/types";

interface GoalFieldProps {
  goal: number;
  onCommit: (goal: number) => void;
}

/**
 * Boxed numeric goal entry with a small pixel "GOAL" label. Tap anywhere on
 * the box to edit: the number is selected so typing replaces it, and
 * Done/Enter (or tapping away) saves it. Saved goals carry forward.
 */
export function GoalField({ goal, onCommit }: GoalFieldProps) {
  const [draft, setDraft] = useState<string>(String(goal));
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing) setDraft(String(goal));
  }, [goal, isEditing]);

  const commit = useCallback(() => {
    const parsed = Number.parseInt(draft.replace(/\D/g, ""), 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(goal));
      return;
    }
    const clamped = Math.max(StillnessRules.minGoal, Math.min(StillnessRules.maxGoal, parsed));
    setDraft(String(clamped));
    if (clamped !== goal) onCommit(clamped);
  }, [draft, goal, onCommit]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value.replace(/\D/g, "").slice(0, 3));
  }, []);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    inputRef.current?.blur();
  }, []);

  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, []);

  return (
    <form className="flex w-full flex-col items-center gap-[6px]" onSubmit={handleSubmit}>
      <label
        htmlFor="stillness-goal"
        className="font-label text-[15px] font-bold tracking-[2px] text-[var(--pixel-ink)]"
      >
        GOAL
      </label>
      <div className="w-full cursor-text" onClick={focusInput}>
        <PixelFrame
          step={5}
          lineWidth={3}
          background={isEditing ? "var(--pixel-surface)" : "var(--pixel-canvas)"}
          className="w-full"
          style={isEditing ? { background: "var(--pixel-blood)" } : undefined}
        >
          <input
            ref={inputRef}
            id="stillness-goal"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="done"
            autoComplete="off"
            maxLength={3}
            value={draft}
            onChange={handleChange}
            onFocus={(event) => {
              setIsEditing(true);
              event.currentTarget.select();
            }}
            onBlur={() => {
              setIsEditing(false);
              commit();
            }}
            aria-label="Daily goal in minutes"
            className="h-[52px] w-full bg-transparent text-center font-display text-[22px] leading-none text-[var(--pixel-ink)] caret-[var(--pixel-blood)] outline-none selection:bg-[var(--pixel-blood)] selection:text-white"
          />
        </PixelFrame>
      </div>
      <span className="font-label text-[11px] tracking-[1px] text-[var(--pixel-ink)]/60">
        {isEditing ? "TYPE MINUTES" : "TAP TO EDIT"}
      </span>
    </form>
  );
}
