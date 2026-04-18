import type { Sponsor } from "@/lib/fallback-content";

export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <section className="mt-8 rounded-[2rem] border border-border bg-secondary/50 p-6">
      <div className="flex flex-wrap items-center gap-3">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
            {sponsor.name}
          </div>
        ))}
      </div>
    </section>
  );
}
