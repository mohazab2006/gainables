"use client";

import Link from "next/link";

import { useMarquee } from "@/hooks/use-marquee";
import { useReveal } from "@/hooks/use-reveal";
import type { Sponsor } from "@/lib/fallback-content";

// Used only to order logos internally — the tier itself is no longer
// surfaced in the UI. Lead partners read first-left, community last.
const tierWeight: Record<Sponsor["tier"], number> = {
  lead: 0,
  supporting: 1,
  community: 2,
};

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  const headRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>({ y: 32, stagger: 0.06 });
  const stripRef = useMarquee<HTMLDivElement>({ speed: 50 });

  const ordered = [...sponsors].sort((a, b) => {
    const tierDelta = tierWeight[a.tier] - tierWeight[b.tier];
    if (tierDelta !== 0) return tierDelta;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <section id="sponsors" className="bg-background px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div className="container-shell">
        <div ref={headRef} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div data-reveal>
            <p className="eyebrow">Sponsors</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] tracking-[-0.025em] md:text-6xl">
              Built with partners who <span className="display-italic">show up</span>.
            </h2>
          </div>
          <p data-reveal className="max-w-md text-base leading-7 text-muted-foreground">
            The partners powering this ride — together they make every kilometre possible.
          </p>
        </div>

        {sponsors.length ? (
          <div ref={stripRef} className="marquee-mask mt-12 overflow-hidden border-y border-border py-6">
            <div data-marquee-track className="flex w-max items-center gap-12 will-change-transform">
              {sponsors.map((sponsor) => (
                <span
                  key={sponsor.id}
                  className="flex shrink-0 items-center gap-3 font-display text-2xl tracking-tight text-muted-foreground"
                >
                  {sponsor.logoUrl ? (
                    <img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} className="h-8 w-auto object-contain" />
                  ) : null}
                  {sponsor.name}
                  <span className="ml-12 inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {ordered.length ? (
          <div
            ref={gridRef}
            className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-border bg-border sm:grid-cols-3 lg:grid-cols-4"
          >
            {ordered.map((sponsor) => (
              <Link
                key={sponsor.id}
                href={sponsor.link}
                target="_blank"
                rel="noreferrer"
                data-reveal
                aria-label={sponsor.name}
                className="group relative flex aspect-[4/3] items-center justify-center bg-surface p-6 transition-colors duration-300 hover:bg-background"
              >
                {sponsor.logoUrl ? (
                  <img
                    src={sponsor.logoUrl}
                    alt={`${sponsor.name} logo`}
                    className="max-h-20 w-auto max-w-[75%] object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="px-2 text-center font-display text-2xl leading-tight tracking-tight text-foreground/70 transition-colors duration-300 group-hover:text-foreground md:text-3xl">
                    {sponsor.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
