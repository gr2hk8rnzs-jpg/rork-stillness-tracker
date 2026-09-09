import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DayKey } from "./dayKey";
import { StillnessRules, isComplete, makeRecord, type DayRecord } from "./types";

const RECORDS_KEY = "stillness.records.v1";
const CARRIED_GOAL_KEY = "stillness.carriedGoal.v1";

type RecordMap = Record<string, DayRecord>;

interface StillnessValue {
  today: DayRecord;
  todayKey: string;
  /** Recorded days, newest first. */
  history: DayRecord[];
  /** Consecutive completed days ending today (or yesterday if today is open). */
  streak: number;
  /** Longest completed run ever recorded. */
  bestStreak: number;
  /** Total minutes ever logged. */
  totalMinutes: number;
  /** Monday-first current week, always seven entries. */
  currentWeek: DayRecord[];
  setMinutes: (minutes: number) => void;
  setGoal: (goal: number) => void;
  logSession: () => void;
}

const StillnessContext = createContext<StillnessValue | null>(null);

function readRecords(): RecordMap {
  try {
    const raw = window.localStorage.getItem(RECORDS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return {};
    const map: RecordMap = {};
    for (const entry of parsed as DayRecord[]) {
      if (typeof entry?.dateKey !== "string") continue;
      map[entry.dateKey] = {
        dateKey: entry.dateKey,
        minutes: Number(entry.minutes) || 0,
        goal: Number(entry.goal) || StillnessRules.defaultGoal,
        sessions: Number(entry.sessions) || 0,
      };
    }
    return map;
  } catch {
    console.warn("Stillness: could not read saved days, starting fresh");
    return {};
  }
}

function readCarriedGoal(): number {
  const raw = window.localStorage.getItem(CARRIED_GOAL_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : StillnessRules.defaultGoal;
}

function computeStreak(records: RecordMap, todayKey: string): number {
  let cursor = new Date();
  const todayRecord = records[todayKey];
  if (!todayRecord || !isComplete(todayRecord)) {
    cursor = DayKey.addDays(cursor, -1);
  }
  let count = 0;
  for (;;) {
    const record = records[DayKey.key(cursor)];
    if (!record || !isComplete(record)) break;
    count += 1;
    cursor = DayKey.addDays(cursor, -1);
  }
  return count;
}

function computeBestStreak(records: RecordMap): number {
  const completed = new Set(
    Object.values(records)
      .filter(isComplete)
      .map((record) => record.dateKey),
  );
  let best = 0;
  for (const key of completed) {
    const date = DayKey.date(key);
    if (!date) continue;
    // Only walk forward from the start of a run.
    if (completed.has(DayKey.key(DayKey.addDays(date, -1)))) continue;
    let run = 0;
    let cursor = date;
    while (completed.has(DayKey.key(cursor))) {
      run += 1;
      cursor = DayKey.addDays(cursor, 1);
    }
    best = Math.max(best, run);
  }
  return best;
}

/**
 * Persistent source of truth for daily meditation minutes and goals.
 * Goals carry forward: changing the goal makes it the default for later days.
 */
export function StillnessProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<RecordMap>(() => readRecords());
  const [carriedGoal, setCarriedGoal] = useState<number>(() => readCarriedGoal());
  const [todayKey, setTodayKey] = useState<string>(() => DayKey.key(new Date()));
  const isFirstRun = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    try {
      window.localStorage.setItem(RECORDS_KEY, JSON.stringify(Object.values(records)));
      window.localStorage.setItem(CARRIED_GOAL_KEY, String(carriedGoal));
    } catch {
      console.warn("Stillness: could not save days");
    }
  }, [records, carriedGoal]);

  // Day rollover: re-check on focus and once a minute.
  useEffect(() => {
    const refresh = (): void => setTodayKey(DayKey.key(new Date()));
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, []);

  const today = useMemo<DayRecord>(
    () => records[todayKey] ?? makeRecord(todayKey, carriedGoal),
    [records, todayKey, carriedGoal],
  );

  const setMinutes = useCallback(
    (minutes: number) => {
      setRecords((current) => {
        const base = current[todayKey] ?? makeRecord(todayKey, carriedGoal);
        const clamped = Math.max(0, Math.min(base.goal, Math.round(minutes)));
        if (clamped === base.minutes && current[todayKey]) return current;
        return { ...current, [todayKey]: { ...base, minutes: clamped } };
      });
    },
    [todayKey, carriedGoal],
  );

  const setGoal = useCallback(
    (goal: number) => {
      const clamped = Math.max(StillnessRules.minGoal, Math.min(StillnessRules.maxGoal, Math.round(goal)));
      setCarriedGoal(clamped);
      setRecords((current) => {
        const base = current[todayKey] ?? makeRecord(todayKey, carriedGoal);
        return {
          ...current,
          [todayKey]: { ...base, goal: clamped, minutes: Math.min(base.minutes, clamped) },
        };
      });
    },
    [todayKey, carriedGoal],
  );

  const logSession = useCallback(() => {
    setRecords((current) => {
      const base = current[todayKey] ?? makeRecord(todayKey, carriedGoal);
      return { ...current, [todayKey]: { ...base, sessions: base.sessions + 1 } };
    });
  }, [todayKey, carriedGoal]);

  const value = useMemo<StillnessValue>(() => {
    const history = Object.values(records).sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
    const weekStart = DayKey.startOfWeek(new Date());
    const currentWeek = Array.from({ length: 7 }, (_, offset) => {
      const key = DayKey.key(DayKey.addDays(weekStart, offset));
      return records[key] ?? makeRecord(key, carriedGoal);
    });
    return {
      today,
      todayKey,
      history,
      streak: computeStreak(records, todayKey),
      bestStreak: computeBestStreak(records),
      totalMinutes: Object.values(records).reduce((sum, record) => sum + record.minutes, 0),
      currentWeek,
      setMinutes,
      setGoal,
      logSession,
    };
  }, [records, carriedGoal, today, todayKey, setMinutes, setGoal, logSession]);

  return <StillnessContext.Provider value={value}>{children}</StillnessContext.Provider>;
}

export function useStillness(): StillnessValue {
  const value = useContext(StillnessContext);
  if (!value) throw new Error("useStillness must be used inside StillnessProvider");
  return value;
}
