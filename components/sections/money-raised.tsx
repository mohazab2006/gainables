"use client";

import { useRef } from "react";
import Link from "next/link";

import { gsap, useGSAP } from "@/lib/gsap";
import type { StatItem } from "@/lib/fallback-content";

type MoneyRaisedSectionProps = {
  stats: StatItem[];
  donationUrl: string;
  goalAmount?: number;
};

function parseCurrency(value: string): { amount: number | null; currency: string } {
  const match = value.match(/(\$|CA\$|CAD|USD|US\$|€|£)?\s*([0-9]+(?:[,.][0-9]+)*)/i);
  if (!match) return { amount: null, currency: "$" };
  const numeric = Number(match[2].replace(/,/g, ""));
  return {
    amount: Number.isNaN(numeric) ? null : numeric,
    currency: match[1] ?? "$",
  };
}

function formatCurrency(value: number, currency = "$"): string {
  return `${currency}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function MoneyRaisedSection({
  stats,
  donationUrl,
  goalAmount = 50000,
}: MoneyRaisedSectionProps) {
  const root = useRef<HTMLElement>(null);

  // Pull the money stat from the existing content shape. Looks for a stat whose
  // label or value mentions "raised" / "$" — falls back to zero so this section
  // always renders.
  const moneyStat =
    stats.find(
      (s) =>
        /raised|pledged|donated|funded/i.test(s.label) ||
        /\$|CAD|USD/.test(s.value),
    ) ?? null;

  const parsed = moneyStat ? parseCurrency(moneyStat.value) : { amount: 0, currency: "$" };
  const raised = parsed.amount ?? 0;
  const currency = parsed.currency || "$";
  const pct = Math.min(100, Math.round((raised / goalAmount) * 100));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motionOk: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          if (!root.current) return;
          const reduce = ctx.conditions?.reduce;

          gsap.fromTo(
            "[data-money-eyebrow]",
            { autoAlpha: 0, y: 20 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: root.current, start: "top 75%" },
            },
          );

          gsap.fromTo(
            "[data-money-meta]",
            { autoAlpha: 0, y: 20 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: { trigger: root.current, start: "top 70%" },
            },
          );

          if (reduce) {
            const el = root.current.querySelector<HTMLElement>("[data-money-number]");
            if (el) el.textContent = formatCurrency(raised, currency);
            return;
          }

          const el = root.current.querySelector<HTMLElement>("[data-money-number]");
          if (el) {
            const obj = { v: 0 };
            gsap.to(obj, {
              v: raised,
              duration: 2,
              ease: "expo.out",
              scrollTrigger: { trigger: root.current, start: "top 75%" },
              onUpdate: () => {
                el.textContent = formatCurrency(Math.round(obj.v), currency);
              },
            });
          }

          gsap.fromTo(
            "[data-money-bar]",
            { scaleX: 0 },
            {
              scaleX: pct / 100,
              transformOrigin: "left center",
              duration: 1.4,
              ease: "expo.out",
              scrollTrigger: { trigger: "[data-money-bar]", start: "top 85%" },
            },
          );
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="raised"
      className="relative border-t border-foreground bg-background text-foreground"
    >
      <div className="px-6 py-24 md:px-10 md:py-36">
        <div className="container-shell flex flex-col items-center text-center">
          <p
            data-money-eyebrow
            className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground"
          >
            Raised so far
          </p>

          <p
            data-money-number
            className="mt-8 font-display text-foreground text-[24vw] leading-[0.85] tracking-[-0.02em] md:text-[18vw]"
          >
            {formatCurrency(0, currency)}
          </p>

          <div
            data-money-meta
            className="mt-8 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground"
          >
            <span>
              of {formatCurrency(goalAmount, currency)} goal &nbsp;/&nbsp; {pct}%
            </span>
          </div>

          <div
            data-money-meta
            className="mt-10 h-[2px] w-full max-w-3xl bg-secondary"
          >
            <div data-money-bar className="h-full w-full origin-left bg-foreground" />
          </div>

          <Link
            data-money-meta
            href={donationUrl}
            target={donationUrl.startsWith("http") ? "_blank" : undefined}
            rel={donationUrl.startsWith("http") ? "noreferrer" : undefined}
            className="pill-cta mt-12"
          >
            Donate now
          </Link>
        </div>
      </div>
    </section>
  );
}
