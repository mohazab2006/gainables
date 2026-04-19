"use client";

import Link from "next/link";

import { useReveal } from "@/hooks/use-reveal";
import type { Sponsor } from "@/lib/fallback-content";

const tierWeight: Record<Sponsor["tier"], number> = {
  lead: 0,
  supporting: 1,
  community: 2,
};

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  const headRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>({ y: 28, stagger: 0.06, duration: 0.8 });

  const ordered = [...sponsors]
    .filter((s) => s.visible !== false)
    .sort((a, b) => {
      const tierDelta = tierWeight[a.tier] - tierWeight[b.tier];
      if (tierDelta !== 0) return tierDelta;
      return a.sortOrder - b.sortOrder;
    });

  return (
    <section
      id="sponsors"
      className="relative border-t border-foreground bg-background text-foreground"
    >
      <div className="px-6 py-24 md:px-10 md:py-32">
        <div className="container-shell">
          <div ref={headRef} data-reveal>
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
              Sponsors
            </p>
            <h2 className="mt-6 max-w-5xl font-display text-6xl leading-[0.9] md:text-8xl lg:text-[7vw]">
              BUILT WITH
              <br />
              PARTNERS.
            </h2>
          </div>

          {ordered.length ? (
            <div
              ref={gridRef}
              className="mt-16 grid grid-cols-1 border-t border-foreground sm:grid-cols-2 lg:grid-cols-3"
            >
              {ordered.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          ) : (
            <p className="mt-16 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Sponsor announcements coming soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const hasLink = Boolean(sponsor.link && sponsor.link.trim().length > 0);

  const inner = (
    <>
      <div className="flex flex-1 items-center justify-center py-12">
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={`${sponsor.name} logo`}
            loading="lazy"
            className="max-h-20 w-auto max-w-[70%] object-contain grayscale transition duration-300 group-hover:grayscale-0"
          />
        ) : (
          <span className="text-center font-display text-3xl leading-none text-foreground md:text-4xl">
            {sponsor.name.toUpperCase()}
          </span>
        )}
      </div>
      {sponsor.tagline ? (
        <p className="border-t border-foreground p-4 text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
          {sponsor.tagline}
        </p>
      ) : null}
    </>
  );

  const className =
    "group flex flex-col border-b border-r border-foreground transition-colors hover:bg-foreground/[0.03] last:border-b-0 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0";

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
