"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { useReveal } from "@/hooks/use-reveal";
import type { TrackerStatus } from "@/lib/fallback-content";

type Props = {
  donationUrl: string;
  raisedAmount: number;
  goalAmount: number;
  donorCount: number;
  currency?: string;
  trackerStatus?: TrackerStatus;
  rideDate?: string;
};

export function DonationsStrip({
  donationUrl,
  raisedAmount,
  goalAmount,
  donorCount,
  currency = "CAD",
  trackerStatus = "pre_ride",
  rideDate,
}: Props) {
  // Promo mode: no real money raised yet and the campaign hasn't started.
  // We hide the "$0 / 0 donors / 0% bar" look (which reads as broken) and
  // swap to a pre-ride ask with a countdown.
  const promo = trackerStatus === "pre_ride" && raisedAmount <= 0;

  if (promo) {
    return <DonationsPromo donationUrl={donationUrl} goalAmount={goalAmount} currency={currency} rideDate={rideDate} />;
  }

  return (
    <DonationsLive
      donationUrl={donationUrl}
      raisedAmount={raisedAmount}
      goalAmount={goalAmount}
      donorCount={donorCount}
      currency={currency}
    />
  );
}

function DonationsLive({
  donationUrl,
  raisedAmount,
  goalAmount,
  donorCount,
  currency,
}: {
  donationUrl: string;
  raisedAmount: number;
  goalAmount: number;
  donorCount: number;
  currency: string;
}) {
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
            <Link
              href={donationUrl || "/donate"}
              className="pill-cta bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]"
            >
              Donate now
            </Link>
            <Link href="/faq" className="pill-ghost">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function DonationsPromo({
  donationUrl,
  goalAmount,
  currency,
  rideDate,
}: {
  donationUrl: string;
  goalAmount: number;
  currency: string;
  rideDate?: string;
}) {
  const ref = useReveal<HTMLDivElement>({ y: 24, stagger: 0.06 });
  const rideDay = useMemo(() => (rideDate ? formatRideDay(rideDate) : null), [rideDate]);
  const countdown = useRideDayCountdown(rideDate);

  return (
    <section
      id="donate"
      className="relative bg-background px-6 py-24 md:px-12 md:py-32 lg:px-20"
    >
      <div ref={ref} className="container-shell">
        <div data-reveal className="flex items-baseline justify-between">
          <p className="eyebrow">Donations</p>
          <p className="eyebrow text-foreground/70">Goal · {formatMoney(goalAmount, currency)}</p>
        </div>

        <h2
          data-reveal
          className="mt-8 font-display text-[14vw] leading-[0.9] tracking-tight md:text-[9vw] lg:text-[8rem]"
        >
          Help us raise <span className="display-italic text-muted-foreground">{formatMoney(goalAmount, currency)}</span>
          {rideDay ? (
            <>
              {" "}by <span className="whitespace-nowrap">{rideDay}</span>
            </>
          ) : null}
          .
        </h2>

        <p data-reveal className="mt-8 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Every dollar raised goes straight to mental health services and support programs. Be among the first to back
          the ride — totals will update live once donations start rolling in.
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <Meta label="Goal" value={formatMoney(goalAmount, currency)} />
            {rideDay ? <Meta label="Ride day" value={rideDay} /> : null}
            <Meta label="Countdown" value={countdown} />
          </div>
          <div data-reveal className="flex flex-wrap gap-3">
            <Link
              href={donationUrl || "/donate"}
              className="pill-cta bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]"
            >
              Be the first to donate
            </Link>
            <Link href="/faq" className="pill-ghost">
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

function formatRideDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "TBA";
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(date);
}

function useRideDayCountdown(iso?: string) {
  const [label, setLabel] = useState("Ride day coming soon");

  useEffect(() => {
    if (!iso) return;
    const update = () => setLabel(buildCountdown(iso, Date.now()));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [iso]);

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

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
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
