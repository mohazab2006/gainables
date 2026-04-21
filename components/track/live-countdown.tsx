"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  /** ISO timestamp of the ride start (e.g. "2026-05-04T12:00:00.000Z"). */
  rideDate: string;
  className?: string;
};

/**
 * Large, per-second ticking countdown to the ride start. Shown on /track
 * while the tracker is in its pre-ride state. Once the target time passes
 * it flips to a "Ride day" card instead of going negative.
 *
 * Implementation notes:
 * - The component is client-only because it needs `setInterval` to tick.
 * - We render a neutral SSR placeholder on the first paint so the server
 *   and client agree on the HTML and React doesn't mismatch; the real
 *   numbers fade in on mount.
 * - Ticks once per second. The cost is negligible and the UX is worth it:
 *   a static minute-granularity countdown feels broken.
 */
export function LiveCountdown({ rideDate, className }: Props) {
  const targetMs = useMemo(() => {
    const t = new Date(rideDate).getTime();
    return Number.isFinite(t) ? t : null;
  }, [rideDate]);

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const formattedTarget = useMemo(() => {
    if (!targetMs) return "TBA";
    try {
      return new Intl.DateTimeFormat("en-CA", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(targetMs));
    } catch {
      return "TBA";
    }
  }, [targetMs]);

  const diffMs = targetMs !== null && now !== null ? targetMs - now : null;
  const hasArrived = diffMs !== null && diffMs <= 0;

  const { days, hours, minutes, seconds } = splitDuration(diffMs);

  return (
    <section
      className={[
        "rounded-4xl border border-border bg-background p-6 md:p-8",
        "shadow-[0_14px_60px_rgba(10,10,10,0.04)]",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Rollout in</p>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Counting down to the Ottawa start · {formattedTarget}
          </p>
        </div>
        {hasArrived ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3.5 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
            Ride day
          </span>
        ) : null}
      </div>

      {hasArrived ? (
        <p className="mt-6 font-display text-4xl tracking-tight md:text-5xl">
          The ride is rolling out. <span className="display-italic text-muted-foreground">Live tracking is active.</span>
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-4 gap-2 md:gap-4">
          <CountdownTile label="Days" value={days} />
          <CountdownTile label="Hours" value={hours} />
          <CountdownTile label="Minutes" value={minutes} />
          <CountdownTile label="Seconds" value={seconds} mono />
        </div>
      )}
    </section>
  );
}

function CountdownTile({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-border bg-secondary/35 px-3 py-5 text-center md:px-4 md:py-7">
      <p
        className={[
          "font-display text-4xl leading-none tracking-tight md:text-6xl",
          // Seconds tile uses tabular-nums so it doesn't visibly shift every tick.
          mono ? "tabular-nums" : "",
        ].join(" ")}
      >
        {value}
      </p>
      <p className="mt-3 text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground md:text-xs">
        {label}
      </p>
    </div>
  );
}

/**
 * Break a millisecond delta into zero-padded day/hour/minute/second strings.
 * Returns dashes while the delta is still unknown (SSR or first paint) so
 * the tiles reserve space without flickering zeros.
 */
function splitDuration(diffMs: number | null) {
  if (diffMs === null || !Number.isFinite(diffMs)) {
    return { days: "–", hours: "–", minutes: "–", seconds: "–" };
  }
  const clamped = Math.max(0, diffMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}
