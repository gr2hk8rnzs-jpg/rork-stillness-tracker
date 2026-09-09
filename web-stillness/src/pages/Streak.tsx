import { useNavigate } from "react-router-dom";

import { PixelButton } from "@/components/pixel/PixelButton";
import { PixelFrame } from "@/components/pixel/PixelFrame";
import { PixelOutlineText } from "@/components/pixel/PixelOutlineText";
import { AppShell } from "@/components/stillness/AppShell";
import { HealthBar } from "@/components/stillness/HealthBar";
import { DayKey } from "@/lib/stillness/dayKey";
import { useStillness } from "@/lib/stillness/store";
import { progressOf } from "@/lib/stillness/types";

/** Arcade stats screen: current streak plus a Monday-first weekly bar chart. */
export default function Streak() {
  const { streak, bestStreak, totalMinutes, currentWeek, todayKey } = useStillness();
  const navigate = useNavigate();

  return (
    <AppShell>
      <main className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-5 pt-1">
        <div className="flex justify-center">
          <PixelOutlineText text="STREAK" size={32} thickness={4} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <PixelOutlineText
            text={String(streak)}
            size={62}
            fill="var(--pixel-blood)"
            thickness={3}
          />
          <span className="font-label text-[15px] font-bold tracking-[3px] text-[var(--pixel-ink)]">
            DAY STREAK
          </span>
        </div>

        <PixelFrame step={6} lineWidth={4} className="min-h-0 flex-1" innerClassName="p-3">
          <div className="flex h-full items-end gap-2">
            {currentWeek.map((record) => {
              const date = DayKey.date(record.dateKey);
              return (
                <div key={record.dateKey} className="flex h-full flex-1 flex-col gap-[6px]">
                  <HealthBar
                    progress={progressOf(record)}
                    segments={8}
                    borderWidth={3}
                    notch={4}
                    dividerWidth={2}
                    className="min-h-0 w-full flex-1"
                  />
                  <span
                    className="text-center font-display text-[12px]"
                    style={{
                      color:
                        record.dateKey === todayKey ? "var(--pixel-blood)" : "var(--pixel-ink)",
                    }}
                  >
                    {date ? DayKey.weekdayInitial(date) : "?"}
                  </span>
                </div>
              );
            })}
          </div>
        </PixelFrame>

        <div className="flex gap-3">
          <StatTile value={String(bestStreak)} label="BEST RUN" />
          <StatTile value={String(totalMinutes)} label="TOTAL MIN" />
        </div>

        <PixelButton title="BACK" onClick={() => navigate("/")} />
      </main>
    </AppShell>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <PixelFrame
      step={5}
      lineWidth={3}
      background="var(--pixel-surface)"
      className="flex-1"
      innerClassName="flex flex-col items-center gap-1 py-[10px]"
    >
      <span className="font-display text-[19px] text-[var(--pixel-blood)]">{value}</span>
      <span className="font-label text-[13px] font-bold tracking-[2px] text-[var(--pixel-ink)]">
        {label}
      </span>
    </PixelFrame>
  );
}
