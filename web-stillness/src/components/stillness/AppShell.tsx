import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { PixelChip } from "@/components/pixel/PixelButton";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Phone-shaped arcade cabinet the whole app lives inside, with pixel nav chips
 * for the quest log and streak screens.
 */
export function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-full w-full justify-center bg-[var(--pixel-surface)] py-0 sm:py-6">
      <div
        className="relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-[var(--pixel-canvas)] sm:h-[min(880px,calc(100dvh-48px))] sm:border-[4px] sm:border-[var(--pixel-ink)]"
      >
        <header className="flex items-center justify-between px-4 pb-1 pt-4">
          <Link to="/quest-log" aria-label="Open quest log">
            <PixelChip active={pathname === "/quest-log"}>QUEST LOG</PixelChip>
          </Link>
          <Link to="/streak" aria-label="Open streak">
            <PixelChip active={pathname === "/streak"}>STREAK</PixelChip>
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}
