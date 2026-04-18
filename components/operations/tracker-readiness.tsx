type TrackerReadinessItem = {
  key: string;
  label: string;
  ready: boolean;
  detail: string;
};

export function TrackerReadiness({
  items,
  title,
  description,
}: {
  items: readonly TrackerReadinessItem[];
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[2rem] border border-border bg-secondary/35 p-8 md:p-10">
      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Tracker readiness</p>
      <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.key} className="rounded-[1.5rem] border border-border bg-background p-5 shadow-[0_10px_30px_rgba(10,10,10,0.03)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{item.label}</p>
              <span
                className={[
                  "rounded-full border px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em]",
                  item.ready
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                ].join(" ")}
              >
                {item.ready ? "Ready" : "Missing"}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
