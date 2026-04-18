import type { AboutContent, RouteContent } from "@/lib/fallback-content";

export function RouteSection({ about, route }: { about: AboutContent; route: RouteContent }) {
  return (
    <section className="bg-background px-6 py-24 md:px-12 md:py-28 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-border bg-secondary/50 p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">{about.eyebrow}</p>
          <h2 className="mt-5 text-4xl font-medium tracking-tight md:text-5xl">{about.title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">{about.body}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {about.highlights.map((highlight) => (
              <div key={highlight.label} className="rounded-[1.75rem] border border-border bg-background p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{highlight.label}</p>
                <p className="mt-2 text-lg font-medium">{highlight.value}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[2rem] border border-border bg-foreground p-8 text-background md:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-background/60">{route.eyebrow}</p>
          <h2 className="mt-5 text-4xl font-medium tracking-tight md:text-5xl">{route.title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-background/72 md:text-lg">{route.summary}</p>
          <div className="mt-8 space-y-3">
            {route.checkpoints.map((checkpoint) => (
              <div key={checkpoint.name} className="flex items-center justify-between gap-4 rounded-full border border-white/10 px-5 py-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-background/55">{checkpoint.stage}</p>
                  <p className="mt-1 text-lg font-medium">{checkpoint.name}</p>
                  {checkpoint.note ? <p className="mt-1 text-sm text-background/60">{checkpoint.note}</p> : null}
                </div>
                <span className="text-sm text-background/65">{checkpoint.distanceLabel}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
