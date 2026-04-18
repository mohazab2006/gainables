import Image from "next/image";

import type { Pillar } from "@/lib/fallback-content";

export function PillarsSection({ pillars }: { pillars: Pillar[] }) {
  return (
    <section className="bg-background px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Campaign pillars</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-6xl">
              The ride is built to raise visibility, direct funding, and collective momentum.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-muted-foreground">
            Each pillar maps to a concrete objective, so the site explains the campaign clearly instead of reading like a
            generic fundraiser.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="overflow-hidden rounded-[2rem] border border-border bg-secondary/50">
              <div className="relative aspect-[4/3]">
                <Image src={pillar.image.src} alt={pillar.image.alt} fill className="object-cover" />
              </div>
              <div className="p-8">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{pillar.kicker}</p>
                <h3 className="mt-4 text-2xl font-medium tracking-tight">{pillar.title}</h3>
                <p className="mt-4 text-base leading-8 text-muted-foreground">{pillar.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
