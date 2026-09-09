import { useCallback, useEffect, useRef, useState } from "react";

import { PixelButton } from "@/components/pixel/PixelButton";
import { PixelOutlineText } from "@/components/pixel/PixelOutlineText";
import { AppShell } from "@/components/stillness/AppShell";
import { Celebration } from "@/components/stillness/Celebration";
import { GoalField } from "@/components/stillness/GoalField";
import { HealthBar } from "@/components/stillness/HealthBar";
import { MinuteSlider } from "@/components/stillness/MinuteSlider";
import { useStillness } from "@/lib/stillness/store";
import { isComplete, progressOf } from "@/lib/stillness/types";

/**
 * Root screen: health bar on the left, minute slider, numeric readout and
 * carry-forward goal field on the right, log action along the bottom.
 */
export default function Index() {
  const { today, setMinutes, setGoal, logSession } = useStillness();
  const [isCelebrating, setIsCelebrating] = useState<boolean>(false);
  const [justLogged, setJustLogged] = useState<boolean>(false);
  const wasComplete = useRef<boolean>(isComplete(today));
  const dismissTimer = useRef<number | null>(null);

  const complete = isComplete(today);

  const startCelebration = useCallback(() => {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    setIsCelebrating(true);
    dismissTimer.current = window.setTimeout(() => setIsCelebrating(false), 10_000);
  }, []);

  const endCelebration = useCallback(() => {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    setIsCelebrating(false);
  }, []);

  useEffect(() => {
    if (complete && !wasComplete.current) startCelebration();
    wasComplete.current = complete;
  }, [complete, startCelebration]);

  useEffect(() => () => {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
  }, []);

  const handleLog = useCallback(() => {
    logSession();
    setJustLogged(true);
    window.setTimeout(() => setJustLogged(false), 1600);
    if (isComplete(today)) startCelebration();
  }, [logSession, today, startCelebration]);

  return (
    <AppShell>
      <main className="relative flex min-h-0 flex-1 flex-col gap-3 px-4 pb-5 pt-1">
        <div className="flex justify-center">
          <PixelOutlineText text="STILLNESS" size={34} thickness={4} />
        </div>

        <div className="flex min-h-0 flex-1 gap-4">
          <HealthBar progress={progressOf(today)} className="w-[38%] max-w-[132px]" />

          <div className="flex min-h-0 flex-1 flex-col items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="flex items-end">
                <PixelOutlineText
                  text={String(today.minutes)}
                  size={34}
                  fill="var(--pixel-blood)"
                  thickness={2}
                />
                <PixelOutlineText
                  text={`/${today.goal}`}
                  size={34}
                  fill="var(--pixel-ink)"
                  thickness={0}
                />
              </div>
              <span className="font-label text-[15px] font-bold tracking-[3px] text-[var(--pixel-ink)]">
                MIN
              </span>
            </div>

            <div className="flex min-h-0 flex-1 items-stretch justify-center py-1">
              <MinuteSlider minutes={today.minutes} goal={today.goal} onChange={setMinutes} />
            </div>

            <GoalField goal={today.goal} onCommit={setGoal} />
          </div>
        </div>

        <PixelButton
          title={justLogged ? "SAVED!" : "LOG SESSION"}
          disabled={today.minutes <= 0}
          onClick={handleLog}
        />

        {isCelebrating ? <Celebration onClose={endCelebration} /> : null}
      </main>
    </AppShell>
  );
}
