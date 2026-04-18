import Link from "next/link";

import { getSiteContent } from "@/lib/content";

export default async function DonatePage() {
  const content = await getSiteContent();
  const { donate, donationUrl, donationEmbedUrl } = content;

  return (
    <main className="bg-background px-6 pb-24 pt-36 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-8">
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Donate</p>
            <h1 className="max-w-4xl text-5xl font-medium tracking-tight md:text-7xl">
              Help turn a two-city ride into direct mental health support.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              {donate.story}
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {donate.impact.map((item) => (
                <div key={item.title} className="rounded-[2rem] border border-border bg-secondary/60 p-6">
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{item.title}</p>
                  <p className="mt-3 text-base leading-7 text-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
          <aside className="rounded-[2rem] border border-border bg-foreground p-8 text-background md:p-10">
            <p className="text-sm uppercase tracking-[0.28em] text-background/60">Where funds go</p>
            <div className="mt-8 space-y-6">
              {donate.fundAllocation.map((item) => (
                <div key={item.label} className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-medium">{item.label}</h2>
                    <span className="text-sm text-background/70">{item.value}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-background/70">{item.description}</p>
                </div>
              ))}
            </div>
            <Link
              href={donationUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:opacity-85"
            >
              Donate now
            </Link>
          </aside>
        </div>
        {donationEmbedUrl ? (
          <section className="mt-16 rounded-[2rem] border border-border bg-secondary/40 p-4 md:p-6">
            <div className="aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-white">
              <iframe
                title="Donation platform"
                src={donationEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
