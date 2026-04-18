import Link from "next/link";

import type { Sponsor } from "@/lib/fallback-content";

const tierLabels: Record<Sponsor["tier"], string> = {
  lead: "Lead partners",
  supporting: "Supporting sponsors",
  community: "Community backers",
};

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  const grouped = sponsors.reduce<Record<Sponsor["tier"], Sponsor[]>>(
    (acc, sponsor) => {
      acc[sponsor.tier].push(sponsor);
      return acc;
    },
    { lead: [], supporting: [], community: [] },
  );

  return (
    <section id="sponsors" className="bg-background px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Sponsors</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-6xl">
              Sponsor tiers stay editable so the page can evolve as partners join.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-muted-foreground">
            This section is built from structured records rather than hard-coded logos, so tier ordering and visibility can
            be managed from Supabase.
          </p>
        </div>
        <div className="mt-12 space-y-10">
          {(Object.keys(grouped) as Sponsor["tier"][]).map((tier) => (
            <div key={tier} className="rounded-[2rem] border border-border bg-secondary/50 p-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-medium tracking-tight">{tierLabels[tier]}</h3>
                <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{grouped[tier].length} partners</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {grouped[tier].map((sponsor) => (
                  <Link
                    key={sponsor.id}
                    href={sponsor.link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[1.75rem] border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:shadow-[0_16px_60px_rgba(10,10,10,0.06)]"
                  >
                    {sponsor.logoUrl ? (
                      <img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} className="h-12 w-auto object-contain" />
                    ) : null}
                    <p className={sponsor.logoUrl ? "mt-4 text-lg font-medium" : "text-lg font-medium"}>{sponsor.name}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{sponsor.tagline}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
