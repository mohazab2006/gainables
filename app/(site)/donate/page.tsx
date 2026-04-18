import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, HeartHandshake } from "lucide-react";

import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Ride for Mental Health and help turn the Ottawa to Montreal campaign into direct mental health impact.",
};

export default async function DonatePage() {
  const content = await getSiteContent();
  const { donate, donationUrl, donationEmbedUrl } = content;

  return (
    <main className="bg-background pb-24 pt-36 md:pt-44">
      <div className="container-shell px-6 md:px-12 lg:px-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-10">
            <div className="ring-token w-fit">
              <HeartHandshake size={14} className="text-accent" /> Donate
            </div>
            <h1 className="max-w-4xl font-display text-5xl leading-[0.96] tracking-[-0.03em] md:text-7xl lg:text-[6.5vw]">
              Help turn a two-city ride into <span className="display-italic">direct</span> mental health support.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">{donate.story}</p>

            <div className="grid gap-4 md:grid-cols-3">
              {donate.impact.map((item, idx) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(14,14,12,0.06)]"
                >
                  <p className="font-display text-3xl text-accent-foreground/80">
                    <span className="text-foreground">{String(idx + 1).padStart(2, "0")}</span>
                  </p>
                  <p className="mt-4 font-display text-xl tracking-tight">{item.title}</p>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="grain-bg overflow-hidden rounded-[2rem] border border-foreground/10 bg-foreground p-8 text-background md:p-12">
            <p className="ring-token border-white/15 bg-white/10 text-white/80">Where funds go</p>
            <div className="mt-8 space-y-7">
              {donate.fundAllocation.map((item) => (
                <div key={item.label} className="border-b border-white/10 pb-7 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-display text-2xl tracking-tight">{item.label}</h2>
                    <span className="text-xs uppercase tracking-[0.24em] text-background/65">{item.value}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-background/72">{item.description}</p>
                </div>
              ))}
            </div>
            <Link
              href={donationUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-base font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(200,226,92,0.5)]"
            >
              Donate now
              <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </aside>
        </div>

        {donationEmbedUrl ? (
          <section className="mt-16 rounded-[2rem] border border-border bg-surface p-4 md:p-6">
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
