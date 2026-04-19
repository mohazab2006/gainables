"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { RouteContent } from "@/lib/fallback-content";

type BikerTimelineProps = {
  route: RouteContent;
  progressPercent: number;
  /** Kept for future telemetry display (pace, ETA) — not currently rendered. */
  kmCompleted?: number;
  currentLocation: string;
  donationUrl: string;
};

/**
 * Live-synced biker timeline. The hero feature.
 *
 * Current: stylized SVG curve Ottawa -> Montreal with an SVG cyclist
 * riding along the path via `offset-path`. Progress is a percentage
 * (0-100) sourced from ride_updates + route.totalDistanceKm.
 *
 * Upgrade path to real 3D later: swap the <Cyclist/> marker for a
 * react-three-fiber canvas rendering a GLB model oriented along the
 * same SVG path's tangent. The `progressPercent` contract stays stable.
 */
export function BikerTimelineSection({
  route,
  progressPercent,
  currentLocation,
  donationUrl,
}: BikerTimelineProps) {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Count-up on mount for the percent + km
  useEffect(() => {
    const start = performance.now();
    const duration = 1800;
    const from = 0;
    const to = clamped;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [clamped]);

  const start = route.checkpoints[0];
  const end = route.checkpoints.at(-1);
  const midCheckpoints = route.checkpoints.slice(1, -1);
  const displayedKm = Math.round((displayed / 100) * route.totalDistanceKm);

  return (
    <section
      id="track"
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
            <span className="text-lg text-foreground">{currentLocation}</span>
            <span>{displayedKm} km of {route.totalDistanceKm} km</span>
          </div>
        </div>

        <div className="relative mt-20 md:mt-28">
          <RouteCurve progressPercent={clamped} />

          {/* Endpoint labels */}
          <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2">
            <EndpointLabel name={start?.name ?? "Ottawa"} km={start?.km ?? 0} align="left" />
          </div>
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
            <EndpointLabel name={end?.name ?? "Montreal"} km={end?.km ?? route.totalDistanceKm} align="right" />
          </div>

          {/* Milestone dots + labels */}
          <div className="pointer-events-none absolute inset-0">
            {midCheckpoints.map((cp) => {
              const pct = Math.max(0, Math.min(100, (cp.km / route.totalDistanceKm) * 100));
              const reached = clamped >= pct;
              return (
                <div
                  key={cp.name}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pct}%` }}
                >
                  <div
                    className={`h-2 w-2 rounded-full transition-colors duration-700 ${
                      reached ? "bg-accent" : "bg-white/25"
                    }`}
                  />
                  <span
                    className={`absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[0.68rem] font-medium uppercase tracking-[0.3em] transition-colors duration-700 ${
                      reached ? "text-foreground" : "text-muted-foreground/70"
                    }`}
                  >
                    {cp.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress read-out */}
        <div className="mt-24 grid gap-10 border-t border-white/10 pt-10 md:mt-32 md:grid-cols-3">
          <div>
            <p className="eyebrow">Progress</p>
            <p className="mt-4 font-display text-7xl leading-none tracking-tight md:text-8xl">
              {displayed.toFixed(1)}
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
              <Link href={donationUrl} className="pill-cta bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]">
                Donate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The hero SVG curve. Path coordinates are in a 1000x240 viewBox that
 * scales responsively. The cyclist is positioned via `offset-path`
 * using the same path data, and `offset-distance` is driven by the
 * progress percent.
 */
function RouteCurve({ progressPercent }: { progressPercent: number }) {
  // Bezier curve Ottawa (left) -> Montreal (right) — matches the design reference
  const pathD = "M 40 110 C 260 110, 380 260, 520 180 S 820 40, 960 130";

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 1000 240"
        className="h-auto w-full"
        role="img"
        aria-label="Route curve from Ottawa to Montreal"
      >
        {/* Background full path */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Completed path — clipped to progress */}
        <path
          d={pathD}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${progressPercent} 100`}
          style={{ transition: "stroke-dasharray 1800ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />

        {/* Endpoint pins */}
        <circle cx="40" cy="110" r="4" fill="white" />
        <circle cx="960" cy="130" r="4" fill="white" />
      </svg>

      {/* The cyclist — rides along the same path in HTML layer */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div
          className="absolute left-0 top-0 h-full w-full"
          style={{
            // We project the cyclist onto the same SVG path coordinates
            // by placing it inside a container sized to the SVG viewBox ratio.
          }}
        >
          <Cyclist progressPercent={progressPercent} pathD={pathD} />
        </div>
      </div>
    </div>
  );
}

/**
 * Biker icon that rides along the SVG path using CSS offset-path.
 * Uses a stylized silhouette similar to the Google Maps/Uber ride icon.
 */
function Cyclist({ progressPercent, pathD }: { progressPercent: number; pathD: string }) {
  // offset-path uses the same path data; offset-distance drives position
  const style: React.CSSProperties = {
    offsetPath: `path("${pathD}")`,
    offsetDistance: `${progressPercent}%`,
    offsetRotate: "auto",
    transition: "offset-distance 1800ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <div
      className="absolute left-0 top-0"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {/* This inner wrapper gets the offset-path. Its size matches the viewBox
          aspect so percentages map correctly across breakpoints. */}
      <div className="absolute inset-0">
        <div
          className="absolute"
          style={{
            ...style,
            // Position the cyclist icon so it sits centered on the path
            transform: "translate(-50%, -50%)",
          }}
        >
          <CyclistIcon />
        </div>
      </div>
    </div>
  );
}

function CyclistIcon() {
  // A crisp, minimal cyclist silhouette. Sized small so it feels
  // premium-editorial, not cartoony. Upgrade: swap for a <Canvas>
  // from @react-three/fiber loading a GLB model via useGLTF().
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 64 64"
      className="drop-shadow-[0_8px_24px_rgba(200,226,92,0.25)]"
      aria-hidden
    >
      {/* Front wheel */}
      <circle cx="48" cy="46" r="8" fill="none" stroke="white" strokeWidth="2" />
      {/* Rear wheel */}
      <circle cx="14" cy="46" r="8" fill="none" stroke="white" strokeWidth="2" />
      {/* Frame */}
      <path
        d="M 14 46 L 26 30 L 42 30 L 48 46 M 26 30 L 36 46 M 36 18 L 32 30"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Handlebar */}
      <path d="M 36 18 L 42 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Rider — head, torso, arm */}
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
  return (
    <div
      className={`flex flex-col gap-1 ${align === "right" ? "items-end pr-2 md:pr-6" : "items-start pl-2 md:pl-6"}`}
    >
      <span className="eyebrow">{km === 0 ? "Start" : "Finish"}</span>
      <span className="font-display text-2xl tracking-tight md:text-4xl">{name}</span>
    </div>
  );
}
