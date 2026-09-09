import { useNavigate } from "react-router-dom";

import { PixelButton } from "@/components/pixel/PixelButton";
import { PixelFrame } from "@/components/pixel/PixelFrame";
import { PixelOutlineText } from "@/components/pixel/PixelOutlineText";
import { PixelStar } from "@/components/pixel/PixelStar";
import { AppShell } from "@/components/stillness/AppShell";
import { HealthBar } from "@/components/stillness/HealthBar";
import { DayKey } from "@/lib/stillness/dayKey";
import { useStillness } from "@/lib/stillness/store";
import { isComplete, progressOf, type DayRecord } from "@/lib/stillness/types";

/** History of past days, framed as an RPG quest log. */
export default function QuestLog() {
  const { history, todayKey } = useStillness();
  const navigate = useNavigate();

  return (
    <AppShell>
      <main className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-5 pt-1">
        <div className="flex justify-center">
          <PixelOutlineText text="QUEST LOG" size={28} thickness={4} />
        </div>

        {history.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <PixelStar size={54} color="var(--pixel-steel)" />
            <span className="font-display text-[15px] text-[var(--pixel-ink)]">NO QUESTS YET</span>
            <p className="text-center font-label text-[14px] tracking-[1px] text-[var(--pixel-ink)]/60">
              LOG SOME STILLNESS
              <br />
              TO FILL THIS SCROLL
            </p>
          </div>
        ) : (
          <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto py-1">
            {history.map((record) => (
              <QuestRow key={record.dateKey} record={record} isToday={record.dateKey === todayKey} />
            ))}
          </div>
        )}

        <PixelButton title="BACK" onClick={() => navigate("/")} />
      </main>
    </AppShell>
  );
}

function QuestRow({ record, isToday }: { record: DayRecord; isToday: boolean }) {
  const cleared = isComplete(record);

  return (
    <PixelFrame
      step={6}
      lineWidth={4}
      background={isToday ? "var(--pixel-surface)" : "var(--pixel-canvas)"}
      innerClassName="flex items-center gap-4 px-3 py-[10px]"
    >
      <HealthBar
        progress={progressOf(record)}
        segments={6}
        borderWidth={3}
        notch={4}
        dividerWidth={2}
        className="h-[70px] w-[30px]"
      />

      <div className="flex flex-col gap-1">
        <span className="font-display text-[13px] text-[var(--pixel-ink)]">
          {DayKey.rowLabel(record.dateKey)}
        </span>
        <span className="font-display text-[19px] leading-none">
          <span className="text-[var(--pixel-blood)]">{record.minutes}</span>
          <span className="text-[var(--pixel-ink)]">/{record.goal}</span>
        </span>
      </div>

      <div className="ml-auto">
        {cleared ? <PixelStar size={30} color="var(--pixel-flame)" /> : null}
      </div>
    </PixelFrame>
  );
}
