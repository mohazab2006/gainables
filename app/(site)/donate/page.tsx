import type { Metadata } from "next";
import Link from "next/link";

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
    <main className="min-h-screen bg-background pb-24 pt-32 md:pt-40">
      <section className="border-b border-foreground px-6 pb-20 md:px-10">
        <div className="container-shell">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">Donate</p>
          <h1 className="mt-8 max-w-6xl font-display text-6xl leading-[0.9] md:text-8xl lg:text-[8vw]">
            DIRECT IMPACT.
          </h1>
          <p className="mt-10 max-w-3xl text-base leading-8 text-foreground md:text-lg">{donate.story}</p>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href={donationUrl}
              target="_blank"
              rel="noreferrer"
              className="pill-cta"
            >
              Donate now
            </Link>
            <Link href="/track" className="pill-ghost">
              Track the ride
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-foreground px-6 py-20 md:px-10 md:py-28">
        <div className="container-shell">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">Impact</p>
          <h2 className="mt-6 max-w-5xl font-display text-5xl leading-[0.92] md:text-7xl lg:text-[6vw]">
            WHERE FUNDING LANDS.
          </h2>

          <div className="mt-16 grid gap-0 border-t border-foreground md:grid-cols-3">
            {donate.impact.map((item, idx) => (
              <div
                key={item.title}
                className="border-b border-foreground p-8 last:border-b-0 md:border-b-0 md:border-r md:p-10 md:last:border-r-0"
              >
                <p className="font-display text-6xl leading-none text-foreground/30">
                  {String(idx + 1).padStart(2, "0")}
                </p>
                <p className="mt-8 font-display text-2xl leading-tight md:text-3xl">
                  {item.title.toUpperCase()}
                </p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="container-shell">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
            Where funds go
          </p>
          <h2 className="mt-6 max-w-5xl font-display text-5xl leading-[0.92] md:text-7xl lg:text-[6vw]">
            ALLOCATION.
          </h2>

          <div className="mt-12 border-t border-foreground">
            {donate.fundAllocation.map((item) => (
              <div
                key={item.label}
                className="grid gap-3 border-b border-foreground py-8 md:grid-cols-[1fr_auto] md:items-baseline md:gap-12"
              >
                <div>
                  <p className="font-display text-3xl leading-tight md:text-5xl">
                    {item.label.toUpperCase()}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <span className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground md:text-right">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {donationEmbedUrl ? (
        <section className="border-t border-foreground px-6 py-20 md:px-10">
          <div className="container-shell border border-foreground p-2">
            <div className="aspect-[16/10] overflow-hidden bg-background">
              <iframe
                title="Donation platform"
                src={donationEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
