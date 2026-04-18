import type { StatItem } from "@/lib/fallback-content";

export function StatsSection({ stats }: { stats: StatItem[] }) {
  return (
    <section className="bg-foreground px-6 py-24 text-background md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-background/60">Ride snapshot</p>
            <h2 className="mt-4 text-4xl font-medium tracking-tight md:text-6xl">
              A campaign site needs urgency, clarity, and live signals.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <p className="text-sm uppercase tracking-[0.2em] text-background/55">{stat.label}</p>
                <p className="mt-4 text-4xl font-medium tracking-tight">{stat.value}</p>
                <p className="mt-3 max-w-sm text-sm leading-7 text-background/70">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
