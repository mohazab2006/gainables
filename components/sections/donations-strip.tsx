"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useReveal } from "@/hooks/use-reveal";

type Props = {
  donationUrl: string;
  raisedAmount: number;
  goalAmount: number;
  donorCount: number;
  currency?: string;
};

export function DonationsStrip({
  donationUrl,
  raisedAmount,
  goalAmount,
  donorCount,
  currency = "CAD",
}: Props) {
  const ref = useReveal<HTMLDivElement>({ y: 24, stagger: 0.06 });
  const raised = useCountUp(raisedAmount, 2000);
  const donors = useCountUp(donorCount, 1600);
  const pct = Math.max(0, Math.min(100, (raisedAmount / Math.max(goalAmount, 1)) * 100));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => setProgress(pct), 250);
    return () => window.clearTimeout(id);
  }, [pct]);

  return (
    <section
      id="donate"
      className="relative bg-background px-6 py-24 md:px-12 md:py-32 lg:px-20"
    >
      <div ref={ref} className="container-shell">
        <div data-reveal className="flex items-baseline justify-between">
          <p className="eyebrow">Raised so far</p>
          <p className="eyebrow text-foreground/70">Goal · {formatMoney(goalAmount, currency)}</p>
        </div>

        <p
          data-reveal
          className="mt-8 font-display text-[18vw] leading-[0.82] tracking-tight md:text-[12vw] lg:text-[11rem]"
        >
          {formatMoney(raised, currency)}
        </p>

        {/* Live progress bar */}
        <div className="mt-10 h-px w-full bg-white/10">
          <div
            className="h-px bg-foreground"
            style={{
              width: `${progress}%`,
              transition: "width 2200ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <Meta label="Donors" value={donors.toString()} />
            <Meta label="Progress" value={`${pct.toFixed(1)}%`} />
            <Meta label="Remaining" value={formatMoney(Math.max(goalAmount - raisedAmount, 0), currency)} />
          </div>
          <div data-reveal className="flex flex-wrap gap-3">
            <Link href={donationUrl} className="pill-cta bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]">
              Donate now
            </Link>
            <Link href="/donate" className="pill-ghost">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-3xl tracking-tight md:text-4xl">{value}</p>
    </div>
  );
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));
}

function useCountUp(target: number, durationMs: number) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = target;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}
