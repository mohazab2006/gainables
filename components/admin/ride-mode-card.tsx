"use client";

import { useFormStatus } from "react-dom";
import { Radio } from "lucide-react";

import type { TrackerStatus } from "@/lib/fallback-content";

type RideModeCardProps = {
  current: TrackerStatus;
  action: (formData: FormData) => void | Promise<void>;
};

const MODES: Array<{
  status: TrackerStatus;
  label: string;
  description: string;
  confirm: string;
  tone: "neutral" | "primary" | "muted";
}> = [
  {
    status: "pre_ride",
    label: "Pre-ride preview",
    description:
      "Site shows the looping biker animation, ride-day countdown, and pre-ride donation copy. Nothing claims to be live.",
    confirm:
      "Switch the site back to pre-ride preview mode? The biker will stop showing real progress and revert to the looping demo.",
    tone: "neutral",
  },
  {
    status: "live",
    label: "Go live — ride day",
    description:
      "Flips the whole site to live tracking. The biker starts reflecting real kilometres from ride updates, donation totals show live counts, and the tracker page activates.",
    confirm:
      "Activate live ride-day mode? The public site will immediately start showing real progress, real donation totals, and the live tracker. Only do this once the ride actually begins.",
    tone: "primary",
  },
  {
    status: "finished",
    label: "Mark finished",
    description:
      "Freezes the tracker at complete and switches all live modules to a post-ride celebration state.",
    confirm: "Mark the ride as finished? The tracker will freeze at 100% and show the ride-complete messaging.",
    tone: "muted",
  },
];

export function RideModeCard({ current, action }: RideModeCardProps) {
  return (
    <section className="rounded-[2rem] border border-border bg-surface p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
              <Radio size={18} />
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Ride-day controls</p>
          </div>
          <h2 className="mt-5 font-display text-3xl leading-[1.05] tracking-tight md:text-4xl">
            One button flips the whole site into live mode.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            This controls the biker animation on the homepage, the donations strip, and the /track page. Pre-ride it's
            promotional; tap <span className="font-medium text-foreground">Go live</span> on ride day and everything
            starts reflecting real progress.
          </p>
        </div>
        <CurrentPill status={current} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {MODES.map((mode) => {
          const isActive = mode.status === current;
          return (
            <form
              key={mode.status}
              action={action}
              onSubmit={(event) => {
                if (isActive) {
                  event.preventDefault();
                  return;
                }
                if (!window.confirm(mode.confirm)) {
                  event.preventDefault();
                }
              }}
              className="flex h-full flex-col justify-between gap-5 rounded-[1.5rem] border border-border bg-background p-5"
            >
              <input type="hidden" name="status" value={mode.status} />
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl tracking-tight">{mode.label}</p>
                  {isActive ? (
                    <span className="rounded-full border border-foreground/20 bg-foreground/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/80">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{mode.description}</p>
              </div>
              <ModeButton tone={mode.tone} isActive={isActive} status={mode.status} />
            </form>
          );
        })}
      </div>
    </section>
  );
}

function CurrentPill({ status }: { status: TrackerStatus }) {
  const { label, dot } = describeStatus(status);
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
      <span className="text-xs uppercase tracking-[0.2em] text-foreground/80">{label}</span>
    </div>
  );
}

function describeStatus(status: TrackerStatus) {
  if (status === "live") return { label: "Live", dot: "bg-emerald-400" };
  if (status === "finished") return { label: "Finished", dot: "bg-foreground/40" };
  return { label: "Pre-ride", dot: "bg-amber-400" };
}

function ModeButton({
  tone,
  isActive,
  status,
}: {
  tone: "neutral" | "primary" | "muted";
  isActive: boolean;
  status: TrackerStatus;
}) {
  const { pending } = useFormStatus();
  const baseClasses =
    "inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

  const toneClasses =
    tone === "primary"
      ? "bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]"
      : tone === "muted"
        ? "border border-border bg-background text-foreground hover:border-foreground/40"
        : "bg-foreground text-background hover:-translate-y-0.5";

  const activeClasses = isActive ? "pointer-events-none opacity-60" : "";

  const label = isActive
    ? "Currently active"
    : pending
      ? "Switching..."
      : status === "live"
        ? "Go live"
        : status === "finished"
          ? "Mark finished"
          : "Switch to pre-ride";

  return (
    <button type="submit" disabled={pending || isActive} className={`${baseClasses} ${toneClasses} ${activeClasses}`.trim()}>
      {label}
    </button>
  );
}
