"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { RouteContent } from "@/lib/fallback-content";

type BikerTimelineProps = {
  route: RouteContent;
  /** Live progress from the snapshot. Currently ignored — the visual is
   *  driven by scroll position until the live-sync integration lands.
   *  Kept on the prop list so the data layer doesn't need to change. */
  progressPercent: number;
  /** Kept for future telemetry display (pace, ETA) — not currently rendered. */
  kmCompleted?: number;
  /** Fallback "Currently" label if the user hasn't scrolled into the
   *  section yet. Once they do, the city is derived from scroll position. */
  currentLocation: string;
  donationUrl: string;
};

// Single source of truth for the route curve. Used by the SVG <path>,
// by milestone dots (via getPointAtLength), and by the biker's motion.
const ROUTE_PATH_D = "M 40 110 C 260 110, 380 260, 520 180 S 820 40, 960 130";
const VIEWBOX_W = 1000;
const VIEWBOX_H = 240;
const LABEL_BASELINE_Y = 220; // fixed y for milestone labels, below the curve

export function BikerTimelineSection({
  route,
  // Accepted for future live-sync; not currently used for the visual.
  progressPercent: _liveProgress,
  currentLocation,
  donationUrl,
}: BikerTimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // 0..100, driven by scroll position through the section.
  const [progress, setProgress] = useState(0);

  // Scroll-scrubbed progress: as the user scrolls through the timeline
  // section, the cyclist + city dots advance from Ottawa (0) to Montreal
  // (100). Scrub smoothing makes the motion feel inertial instead of
  // pixel-perfect to the wheel events.
  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        end: "bottom 25%",
        scrub: 0.6,
        onUpdate: (self) => {
          setProgress(self.progress * 100);
        },
      });
      return () => {
        st.kill();
      };
    },
    { scope: sectionRef },
  );

  const clamped = Math.max(0, Math.min(100, progress));

  const startCp = route.checkpoints[0];
  const endCp = route.checkpoints.at(-1);
  const midCheckpoints = route.checkpoints.slice(1, -1);
  const displayedKm = Math.round((clamped / 100) * route.totalDistanceKm);

  const midWithPercent = midCheckpoints.map((cp) => ({
    name: cp.name,
    km: cp.km,
    pct: Math.max(0, Math.min(100, (cp.km / route.totalDistanceKm) * 100)),
  }));

  // Derive the "currently in" city from scroll: most recently passed
  // checkpoint. Falls back to the prop before the user reaches the section.
  const passedCheckpoints = route.checkpoints.filter(
    (cp) => (cp.km / route.totalDistanceKm) * 100 <= clamped + 0.001,
  );
  const liveCity =
    clamped <= 0
      ? currentLocation
      : passedCheckpoints.at(-1)?.name ?? currentLocation;

  return (
    <section
      id="track"
      ref={sectionRef}
      className="relative overflow-hidden bg-background px-6 py-24 md:px-12 md:py-32 lg:px-20"
    >
      <div className="container-shell">
        <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Live tracker</p>
            <h2 className="mt-5 display-hero text-6xl md:text-8xl lg:text-[9rem]">
              Ottawa <span className="display-italic text-muted-foreground">to</span> Montreal
            </h2>
          </div>
          <div className="flex flex-col gap-1 text-right font-sans text-sm text-muted-foreground md:max-w-xs">
            <span className="eyebrow text-foreground/60">Currently</span>
            <span className="text-lg text-foreground">{liveCity}</span>
            <span>{displayedKm} km of {route.totalDistanceKm} km</span>
          </div>
        </div>

        <div className="relative mt-20 md:mt-28">
          <RouteCurve progressPercent={clamped} midCheckpoints={midWithPercent} />

          <EndpointLabel name={startCp?.name ?? "Ottawa"} km={startCp?.km ?? 0} align="left" />
          <EndpointLabel
            name={endCp?.name ?? "Montreal"}
            km={endCp?.km ?? route.totalDistanceKm}
            align="right"
          />
        </div>

        <div className="mt-24 grid gap-10 border-t border-white/10 pt-10 md:mt-32 md:grid-cols-3">
          <div>
            <p className="eyebrow">Progress</p>
            <p className="mt-4 font-display text-7xl leading-none tracking-tight md:text-8xl">
              {clamped.toFixed(1)}
              <span className="text-muted-foreground">%</span>
            </p>
          </div>
          <div>
            <p className="eyebrow">Distance</p>
            <p className="mt-4 font-display text-7xl leading-none tracking-tight md:text-8xl">
              {displayedKm}
              <span className="text-muted-foreground text-4xl md:text-5xl"> km</span>
            </p>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="eyebrow">Status</p>
              <p className="mt-4 font-display text-3xl tracking-tight md:text-4xl">
                {clamped <= 0 ? "Pre-ride" : clamped >= 100 ? "Complete" : "On route"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/track" className="pill-ghost">Full tracker</Link>
              <Link
                href={donationUrl}
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

type MidCheckpoint = { name: string; km: number; pct: number };

function RouteCurve({
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
    <div className="relative w-full" style={{ aspectRatio: `${VIEWBOX_W} / ${VIEWBOX_H}` }}>
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

        {/* Completed portion — no CSS transition: the value is already
            scroll-scrubbed by GSAP, so we want the stroke to track scroll
            position 1:1 instead of lagging behind a CSS interpolation. */}
        <path
          d={ROUTE_PATH_D}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${progressPercent} 100`}
        />

        {/* Endpoint pins */}
        <circle cx="40" cy="110" r="4" fill="white" />
        <circle cx="960" cy="130" r="4" fill="white" />

        {/* Milestone dots — on the curve, drop-line + label on fixed baseline */}
        {dots.map((d) => {
          const reached = progressPercent >= d.pct;
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
                y1={d.y + 6}
                x2={d.x}
                y2={LABEL_BASELINE_Y - 14}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <text
                x={d.x}
                y={LABEL_BASELINE_Y}
                textAnchor="middle"
                fill={reached ? "#FFFFFF" : "rgba(255,255,255,0.45)"}
                fontFamily="var(--font-sans)"
                fontSize="10"
                fontWeight="500"
                letterSpacing="3"
                style={{ textTransform: "uppercase", transition: "fill 700ms ease" }}
              >
                {d.name.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Biker — rides the same path; sits above the SVG in its own layer */}
      <Cyclist progressPercent={progressPercent} />
    </div>
  );
}

/**
 * Cyclist rides along the route via CSS offset-path. The wrapper is
 * sized to the SVG viewBox (via the parent's aspect-ratio), and we use
 * a container-query unit to scale the motion path to the rendered size
 * so percentages map 1:1 with the drawn curve.
 *
 * The position itself is scroll-scrubbed (GSAP smooths it upstream),
 * so we don't add a CSS transition on offset-distance — that would
 * cause the cyclist to lag the scroll instead of riding it.
 */
function Cyclist({ progressPercent }: { progressPercent: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
      style={{ containerType: "inline-size" }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          offsetPath: `path("${ROUTE_PATH_D}")`,
          offsetDistance: `${progressPercent}%`,
          offsetRotate: "0deg",
          transform: `translate(-50%, -50%) scale(calc(100cqw / ${VIEWBOX_W}))`,
          transformOrigin: "0 0",
        }}
      >
        <CyclistIcon />
      </div>
    </div>
  );
}

/** Stylized SVG cyclist silhouette. Slated for a revamp later. */
function CyclistIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 64 64"
      className="drop-shadow-[0_8px_24px_rgba(200,226,92,0.35)]"
      aria-hidden
    >
      <circle cx="48" cy="46" r="8" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="14" cy="46" r="8" fill="none" stroke="white" strokeWidth="2" />
      <path
        d="M 14 46 L 26 30 L 42 30 L 48 46 M 26 30 L 36 46 M 36 18 L 32 30"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M 36 18 L 42 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="10" r="4" fill="#C8E25C" />
      <path
        d="M 32 14 L 30 26 L 26 30 M 30 26 L 36 18"
        fill="none"
        stroke="#C8E25C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EndpointLabel({
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
      className={`pointer-events-none absolute top-1/2 flex -translate-y-1/2 flex-col gap-3 ${
        isLeft ? "left-0 items-start pl-2 md:pl-4" : "right-0 items-end pr-2 md:pr-4"
      }`}
    >
      <span className="eyebrow">{km === 0 ? "Start" : "Finish"}</span>
      <span className="font-display text-2xl leading-none tracking-tight md:text-4xl">
        {name}
      </span>
    </div>
  );
}
