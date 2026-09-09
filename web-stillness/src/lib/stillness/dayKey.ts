const WEEKDAY_NAMES: readonly string[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Calendar-day identity helpers. Days are keyed as `yyyy-MM-dd` strings. */
export const DayKey = {
  key(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  },

  date(key: string): Date | null {
    const pieces = key.split("-").map((piece) => Number.parseInt(piece, 10));
    if (pieces.length !== 3 || pieces.some((piece) => Number.isNaN(piece))) return null;
    return new Date(pieces[0], pieces[1] - 1, pieces[2]);
  },

  addDays(date: Date, days: number): Date {
    const next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  },

  /** Monday-first start of the week containing `date`. */
  startOfWeek(date: Date): Date {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - offset);
    return start;
  },

  /** Short weekday initial, e.g. `M` for Monday. */
  weekdayInitial(date: Date): string {
    return WEEKDAY_NAMES[date.getDay()].charAt(0);
  },

  /** Row label in quest-log form, e.g. `MON 09/08`. */
  rowLabel(key: string): string {
    const date = DayKey.date(key);
    if (!date) return key;
    return `${WEEKDAY_NAMES[date.getDay()]} ${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  },
};
