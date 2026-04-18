"use client";

import Link from "next/link";

import { useMarquee } from "@/hooks/use-marquee";
import { useReveal } from "@/hooks/use-reveal";
import type { Sponsor } from "@/lib/fallback-content";

const tierLabels: Record<Sponsor["tier"], string> = {
  lead: "Lead partners",
  supporting: "Supporting sponsors",
  community: "Community backers",
};

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  const headRef = useReveal<HTMLDivElement>();
  const tierRef = useReveal<HTMLDivElement>({ y: 40, stagger: 0.1 });
  const stripRef = useMarquee<HTMLDivElement>({ speed: 50 });

  const grouped = sponsors.reduce<Record<Sponsor["tier"], Sponsor[]>>(
    (acc, sponsor) => {
      acc[sponsor.tier].push(sponsor);
      return acc;
    },
    { lead: [], supporting: [], community: [] },
  );

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
            Sponsor tiers stay editable so this page can evolve as more partners join. Logos and links come from
            structured records.
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

        <div ref={tierRef} className="mt-14 space-y-8">
          {(Object.keys(grouped) as Sponsor["tier"][]).map((tier) =>
            grouped[tier].length ? (
              <div
                key={tier}
                data-reveal
                className="rounded-[2rem] border border-border bg-surface p-8 transition hover:shadow-[0_30px_120px_rgba(14,14,12,0.06)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        tier === "lead" ? "bg-accent" : tier === "supporting" ? "bg-foreground" : "bg-muted-foreground"
                      }`}
                    />
                    <h3 className="font-display text-2xl tracking-tight">{tierLabels[tier]}</h3>
                  </div>
                  <span className="eyebrow">{grouped[tier].length} partners</span>
                </div>
                <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {grouped[tier].map((sponsor) => (
                    <Link
                      key={sponsor.id}
                      href={sponsor.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex h-full flex-col rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-[0_20px_60px_rgba(14,14,12,0.06)]"
                    >
                      {sponsor.logoUrl ? (
                        <img
                          src={sponsor.logoUrl}
                          alt={`${sponsor.name} logo`}
                          className="h-10 w-auto object-contain grayscale transition group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="font-display text-2xl tracking-tight">{sponsor.name}</div>
                      )}
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">{sponsor.tagline}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}
