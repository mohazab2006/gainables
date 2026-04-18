"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useMarquee } from "@/hooks/use-marquee";
import { useReveal } from "@/hooks/use-reveal";
import type { Sponsor } from "@/lib/fallback-content";

const tierWeight: Record<Sponsor["tier"], number> = {
  lead: 0,
  supporting: 1,
  community: 2,
};

const tierLabel: Record<Sponsor["tier"], string> = {
  lead: "Lead Partner",
  supporting: "Supporting Partner",
  community: "Community Partner",
};

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  const headRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>({ y: 36, stagger: 0.08, duration: 0.85 });
  const stripRef = useMarquee<HTMLDivElement>({ speed: 50 });

  const ordered = [...sponsors]
    .filter((s) => s.visible !== false)
    .sort((a, b) => {
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

        {ordered.length ? (
          <div ref={stripRef} className="marquee-mask mt-12 overflow-hidden border-y border-border py-6">
            <div data-marquee-track className="flex w-max items-center gap-12 will-change-transform">
              {ordered.map((sponsor) => (
                <span
                  key={sponsor.id}
                  className="flex shrink-0 items-center gap-3 font-display text-2xl tracking-tight text-muted-foreground"
                >
                  {sponsor.logoUrl ? (
                    <img
                      src={sponsor.logoUrl}
                      alt={`${sponsor.name} logo`}
                      className="h-8 w-auto object-contain"
                    />
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
            className="mt-16 flex flex-wrap justify-center gap-5 md:gap-6"
          >
            {ordered.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        ) : (
          <p className="mt-16 text-sm text-muted-foreground">Sponsor announcements coming soon.</p>
        )}
      </div>
    </section>
  );
}

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const hasLink = Boolean(sponsor.link && sponsor.link.trim().length > 0);

  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {tierLabel[sponsor.tier]}
        </span>
        {hasLink ? (
          <ArrowUpRight
            size={16}
            className="text-muted-foreground transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          />
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-center py-6">
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={`${sponsor.name} logo`}
            loading="lazy"
            className="max-h-20 w-auto max-w-[80%] object-contain opacity-85 transition duration-500 group-hover:opacity-100"
          />
        ) : (
          <span className="px-2 text-center font-display text-2xl leading-tight tracking-tight text-foreground/80 transition-colors duration-300 group-hover:text-foreground md:text-3xl">
            {sponsor.name}
          </span>
        )}
      </div>

      <div className="mt-auto">
        <p className="font-display text-lg leading-tight tracking-tight text-foreground">{sponsor.name}</p>
        {sponsor.tagline ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{sponsor.tagline}</p>
        ) : null}
      </div>
    </>
  );

  const className =
    "group relative flex aspect-[4/5] w-full max-w-sm flex-col rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(14,14,12,0.04)] transition duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:bg-background hover:shadow-[0_22px_50px_rgba(14,14,12,0.08)] sm:w-[280px] sm:p-7";

  if (hasLink) {
    return (
      <Link
        data-reveal
        href={sponsor.link}
        target="_blank"
        rel="noreferrer"
        aria-label={`Visit ${sponsor.name}`}
        className={className}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div data-reveal aria-label={sponsor.name} className={className}>
      {inner}
    </div>
  );
}
