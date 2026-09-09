/** One calendar day of meditation: minutes logged against that day's goal. */
export interface DayRecord {
  /** `yyyy-MM-dd` calendar-day key. */
  dateKey: string;
  /** Minutes meditated on this day. */
  minutes: number;
  /** Goal in minutes that applied to this day. */
  goal: number;
  /** How many times the day was explicitly logged. */
  sessions: number;
}

/** Shared tuning constants for goals and slider stepping. */
export const StillnessRules = {
  defaultGoal: 60,
  minGoal: 5,
  maxGoal: 600,
  /** Slider granularity in minutes. */
  step: 5,
  /** Segment count of the big health bar. */
  barSegments: 12,
} as const;

export function makeRecord(dateKey: string, goal: number): DayRecord {
  return { dateKey, minutes: 0, goal, sessions: 0 };
}

export function isComplete(record: DayRecord): boolean {
  return record.goal > 0 && record.minutes >= record.goal;
}

/** Completion ratio clamped to `0...1`. */
export function progressOf(record: DayRecord): number {
  if (record.goal <= 0) return 0;
  return Math.min(1, Math.max(0, record.minutes / record.goal));
}
