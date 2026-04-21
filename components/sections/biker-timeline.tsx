"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { RouteContent, TrackerStatus } from "@/lib/fallback-content";

type BikerTimelineProps = {
  route: RouteContent;
  /** Live progress (0..100) derived from the latest ride update. Only used in
   *  `live` mode — pre_ride drives a local loop, finished pins to 100. */
  progressPercent: number;
  /** Real-world km covered. Only shown in `live` / `finished`. */
  kmCompleted?: number;
  /** Real-world "Currently X" label from the latest update. Live mode only. */
  currentLocation: string;
  donationUrl: string;
  trackerStatus: TrackerStatus;
  /** ISO timestamp of ride day — drives the pre-ride countdown + "Ride day" label. */
  rideDate: string;
};

// Single source of truth for the route curve. Used by the SVG <path>,
// by milestone dots (via getPointAtLength), and by the biker's motion.
// Three uniform half-periods (up → down → up) with a tight ±12 amplitude.
// Endpoints at x=95/835 — asymmetric because OTTAWA is visually narrower
// than MONTREAL, so this gives both dots a comparable perceived gap from
// their label. Each half-period is 250 units wide; C + S + S keeps tangents
// continuous so the biker leans through the waves cleanly.
const ROUTE_PATH_D =
  "M 115 120 C 198 108, 282 108, 365 120 S 532 132, 615 120 S 772 108, 855 120";
const ROUTE_START = { x: 115, y: 120 };
const ROUTE_END = { x: 855, y: 120 };
const VIEWBOX_W = 1000;
const VIEWBOX_H = 240;
const LABEL_BASELINE_Y = 210;

export function BikerTimelineSection({
  route,
  progressPercent,
  kmCompleted,
  currentLocation,
  donationUrl,
  trackerStatus,
  rideDate,
}: BikerTimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // 0..100 — driven by the mode-dependent effect below.
  const [progress, setProgress] = useState(() => {
    if (trackerStatus === "finished") return 100;
    if (trackerStatus === "live") return Math.max(0, Math.min(100, progressPercent));
    return 0;
  });

  // Pre-ride: scroll-scrubbed. As the user scrolls through the section the
  // cyclist rides 0 → 100 across the route. Reduced-motion viewers see a
  // static mid-route preview instead of a scrubbed animation.
  useGSAP(
    () => {
      if (trackerStatus !== "pre_ride" || !sectionRef.current) return;

      const mediaQuery =
        typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

      if (mediaQuery?.matches) {
        setProgress(42);
        return;
      }

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        // Start scrubbing as the section enters the lower third of the
        // viewport, and complete as its top reaches the upper quarter —
        // so the cyclist hits Montreal while the section is fully in view,
        // not as it's about to scroll off the top.
        start: "top 80%",
        end: "top 20%",
        scrub: 0.6,
        onUpdate: (self) => {
          setProgress(self.progress * 100);
        },
      });

      return () => {
        st.kill();
      };
    },
    { scope: sectionRef, dependencies: [trackerStatus] },
  );

  // Live: ease the on-screen bar to the real progressPercent whenever it
  // changes (Realtime subscription updates can make it jump — smooth it).
  useGSAP(
    () => {
      if (trackerStatus !== "live") return;
      const target = Math.max(0, Math.min(100, progressPercent));
      const state = { value: progress };
      const tween = gsap.to(state, {
        value: target,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => setProgress(state.value),
      });
      return () => {
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [trackerStatus, progressPercent] },
  );

  const clamped = trackerStatus === "finished" ? 100 : Math.max(0, Math.min(100, progress));

  const startCp = route.checkpoints[0];
  const endCp = route.checkpoints.at(-1);
  const midCheckpoints = route.checkpoints.slice(1, -1);

  const midWithPercent = useMemo(
    () =>
      midCheckpoints.map((cp) => ({
        name: cp.name,
        km: cp.km,
        pct: Math.max(0, Math.min(100, (cp.km / Math.max(route.totalDistanceKm, 1)) * 100)),
      })),
    [midCheckpoints, route.totalDistanceKm],
  );

  const rideDay = useMemo(() => formatRideDay(rideDate), [rideDate]);
  const countdown = useRideDayCountdown(rideDate, trackerStatus === "pre_ride");

  // Panel copy — what the right-side "Currently" block shows. Pre-ride
  // never claims to be tracking; live reads the real update.
  const panel = describePanel({
    trackerStatus,
    currentLocation,
    kmCompleted: kmCompleted ?? 0,
    totalDistanceKm: route.totalDistanceKm,
    rideDay,
    countdown,
  });

  // Bottom stat grid (Progress / Distance / Status).
  const stats = describeStats({
    trackerStatus,
    clamped,
    kmCompleted: kmCompleted ?? 0,
    totalDistanceKm: route.totalDistanceKm,
    checkpointCount: route.checkpoints.length,
    rideDay,
    countdown,
  });

  return (
    <section
      id="track"
      ref={sectionRef}
      className="relative overflow-hidden bg-background px-6 py-18 md:px-12 md:py-32 lg:px-20"
    >
      <div className="container-shell">
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-end md:justify-between md:gap-10">
          <div>
            <p className="eyebrow">{panel.eyebrow}</p>
            <h2 className="mt-4 display-hero text-5xl md:mt-5 md:text-8xl lg:text-[9rem]">
              Ottawa <span className="display-italic text-muted-foreground">to</span> Montreal
            </h2>
          </div>
          <div className="flex flex-col gap-1 font-sans text-sm text-muted-foreground md:max-w-xs md:text-right">
            <span className="eyebrow text-foreground/60">{panel.label}</span>
            <span className="text-lg text-foreground">{panel.primary}</span>
            <span>{panel.secondary}</span>
          </div>
        </div>

        <div className="relative mt-14 md:mt-28">
          <RouteCurve progressPercent={clamped} midCheckpoints={midWithPercent} />

          <EndpointLabel name={startCp?.name ?? "Ottawa"} km={startCp?.km ?? 0} align="left" />
          <EndpointLabel
            name={endCp?.name ?? "Montreal"}
            km={endCp?.km ?? route.totalDistanceKm}
            align="right"
          />
        </div>

        <div className="mt-16 grid gap-8 border-t border-white/10 pt-8 md:mt-32 md:grid-cols-3 md:gap-10 md:pt-10">
          <div>
            <p className="eyebrow">{stats.progress.label}</p>
            <p className="mt-3 font-display text-6xl leading-none tracking-tight md:mt-4 md:text-8xl">
              {stats.progress.main}
              {stats.progress.suffix ? (
                <span className="text-muted-foreground">{stats.progress.suffix}</span>
              ) : null}
            </p>
          </div>
          <div>
            <p className="eyebrow">{stats.distance.label}</p>
            <p className="mt-3 font-display text-6xl leading-none tracking-tight md:mt-4 md:text-8xl">
              {stats.distance.main}
              {stats.distance.suffix ? (
                <span className="text-muted-foreground text-3xl md:text-5xl"> {stats.distance.suffix}</span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="eyebrow">Status</p>
              <p className="mt-4 font-display text-3xl tracking-tight md:text-4xl">{stats.status.main}</p>
              {stats.status.detail ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{stats.status.detail}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/track" className="pill-ghost">Full tracker</Link>
              <Link
                href={donationUrl || "/donate"}
                className="pill-cta bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]"
              >
                Donate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- copy helpers ---------------------------------------------------------

type PanelCopy = {
  eyebrow: string;
  label: string;
  primary: string;
  secondary: string;
};

function describePanel(args: {
  trackerStatus: TrackerStatus;
  currentLocation: string;
  kmCompleted: number;
  totalDistanceKm: number;
  rideDay: string;
  countdown: string;
}): PanelCopy {
  const { trackerStatus, currentLocation, kmCompleted, totalDistanceKm, rideDay, countdown } = args;

  if (trackerStatus === "live") {
    return {
      eyebrow: "Live tracker",
      label: "Currently",
      primary: currentLocation,
      secondary: `${Math.round(kmCompleted)} km of ${totalDistanceKm} km`,
    };
  }

  if (trackerStatus === "finished") {
    return {
      eyebrow: "Ride complete",
      label: "Finished",
      primary: "Montreal",
      secondary: `${totalDistanceKm} km · thank you`,
    };
  }

  return {
    eyebrow: "Ride preview",
    label: "Ride day",
    primary: rideDay,
    secondary: countdown,
  };
}

type StatCopy = {
  progress: { label: string; main: string; suffix?: string };
  distance: { label: string; main: string; suffix?: string };
  status: { main: string; detail?: string };
};

function describeStats(args: {
  trackerStatus: TrackerStatus;
  clamped: number;
  kmCompleted: number;
  totalDistanceKm: number;
  checkpointCount: number;
  rideDay: string;
  countdown: string;
}): StatCopy {
  const {
    trackerStatus,
    clamped,
    kmCompleted,
    totalDistanceKm,
    checkpointCount,
    rideDay,
    countdown,
  } = args;

  if (trackerStatus === "live") {
    return {
      progress: { label: "Progress", main: clamped.toFixed(1), suffix: "%" },
      distance: { label: "Distance", main: String(Math.round(kmCompleted)), suffix: "km" },
      status: { main: clamped >= 100 ? "Complete" : "On route", detail: "Live signal from the road." },
    };
  }

  if (trackerStatus === "finished") {
    return {
      progress: { label: "Progress", main: "100", suffix: "%" },
      distance: { label: "Distance", main: String(totalDistanceKm), suffix: "km" },
      status: { main: "Ride complete", detail: "Thanks for riding with us." },
    };
  }

  return {
    progress: { label: "Ride day", main: rideDay },
    distance: {
      label: "Route",
      main: String(totalDistanceKm),
      suffix: `km · ${checkpointCount} checkpoints`,
    },
    status: {
      main: "Pre-ride",
      detail: `${countdown} · Live tracking activates on ride day.`,
    },
  };
}

// --- date / countdown -----------------------------------------------------

function formatRideDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "TBA";
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(date);
}

function useRideDayCountdown(iso: string, enabled: boolean) {
  const [label, setLabel] = useState("Tracker activates on ride day");

  useEffect(() => {
    if (!enabled) return;
    const update = () => setLabel(buildCountdown(iso, Date.now()));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [iso, enabled]);

  return label;
}

function buildCountdown(iso: string, nowMs: number) {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return "Ride day coming soon";
  const diff = target - nowMs;
  if (diff <= 0) return "Ride day is here";

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h until rollout`;
  return `${hours}h ${minutes}m until rollout`;
}

// --- curve + cyclist ------------------------------------------------------

export type MidCheckpoint = { name: string; km: number; pct: number };

export function RouteCurve({
  progressPercent,
  midCheckpoints,
}: {
  progressPercent: number;
  midCheckpoints: MidCheckpoint[];
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [dots, setDots] = useState<Array<{ name: string; x: number; y: number; pct: number }>>([]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    setDots(
      midCheckpoints.map((cp) => {
        const point = path.getPointAtLength((cp.pct / 100) * total);
        return { name: cp.name, x: point.x, y: point.y, pct: cp.pct };
      }),
    );
  }, [midCheckpoints]);

  return (
    <div className="relative aspect-[1000/190] w-full md:aspect-[1000/240]">
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Route curve from Ottawa to Montreal"
      >
        {/* Faint full path */}
        <path
          ref={pathRef}
          d={ROUTE_PATH_D}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Completed portion */}
        <path
          d={ROUTE_PATH_D}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${progressPercent} 100`}
        />

        <circle cx={ROUTE_START.x} cy={ROUTE_START.y} r="4" fill="white" />
        <circle cx={ROUTE_END.x} cy={ROUTE_END.y} r="4" fill="white" />

        {dots.map((d, index) => {
          const reached = progressPercent >= d.pct;
          const placeAbove = index === 0 || index === dots.length - 1;
          const lineStartY = placeAbove ? d.y - 6 : d.y + 6;
          const lineEndY = placeAbove ? 56 : LABEL_BASELINE_Y - 14;
          const labelY = placeAbove ? 42 : LABEL_BASELINE_Y;
          return (
            <g key={d.name}>
              <circle
                cx={d.x}
                cy={d.y}
                r="4"
                fill={reached ? "#C8E25C" : "#3A3A3A"}
                stroke={reached ? "#C8E25C" : "rgba(255,255,255,0.25)"}
                strokeWidth="1"
                style={{ transition: "fill 700ms ease, stroke 700ms ease" }}
              />
              <line
                x1={d.x}
                y1={lineStartY}
                x2={d.x}
                y2={lineEndY}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <text
                x={d.x}
                y={labelY}
                textAnchor="middle"
                fill={reached ? "#FFFFFF" : "rgba(255,255,255,0.45)"}
                fontFamily="var(--font-sans)"
                fontSize="18"
                fontWeight="500"
                letterSpacing="3"
                className="md:text-[13px]"
                style={{ textTransform: "uppercase", transition: "fill 700ms ease" }}
              >
                {d.name.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

    </div>
  );
}

export function EndpointLabel({
  name,
  km,
  align,
}: {
  name: string;
  km: number;
  align: "left" | "right";
}) {
  const isLeft = align === "left";
  return (
    <div
      className={`pointer-events-none absolute top-[47%] flex -translate-y-1/2 flex-col gap-2 ${
        isLeft ? "left-0 items-start pl-1 md:pl-4" : "right-0 items-end pr-1 md:pr-4"
      }`}
    >
      <span className="eyebrow">{km === 0 ? "Start" : "Finish"}</span>
      <span className="font-display text-xl leading-none tracking-tight md:text-4xl">
        {name}
      </span>
    </div>
  );
}
