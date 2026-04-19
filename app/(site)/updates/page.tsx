import type { Metadata } from "next";
import Link from "next/link";

import { getRideUpdates, getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "Read campaign updates, checkpoint notes, and media references from the Ride for Mental Health build-up and ride day.",
};

export default async function UpdatesPage() {
  const [content, updates] = await Promise.all([getSiteContent(), getRideUpdates()]);

  return (
    <main className="min-h-screen bg-background pt-32 md:pt-40">
      <section className="border-b border-foreground px-6 pb-16 md:px-10">
        <div className="container-shell">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
            Ride updates
          </p>
          <h1 className="mt-8 max-w-6xl font-display text-6xl leading-[0.9] md:text-8xl lg:text-[8vw]">
            FROM THE ROAD.
          </h1>
          <p className="mt-8 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
            Use this page for longer-form updates, sponsor mentions, media recaps, and milestone posts.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
              Social and media
            </p>
            <div className="mt-6 border-t border-foreground">
              {content.media.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border-b border-foreground py-4 text-xs uppercase tracking-[0.24em] transition-colors hover:bg-foreground/[0.03]"
                >
                  <span>{link.label}</span>
                  <span className="text-muted-foreground">@{link.handle}</span>
                </Link>
              ))}
            </div>
          </aside>
          <section className="space-y-0 border-t border-foreground">
            {updates.map((update) => (
              <article key={update.id} className="border-b border-foreground py-10">
                <div className="flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
                  <span>{update.createdAtLabel}</span>
                  <span className="h-1 w-1 bg-foreground" />
                  <span>{update.location}</span>
                  <span className="h-1 w-1 bg-foreground" />
                  <span>{update.kmCompleted} km complete</span>
                </div>
                <h2 className="mt-6 font-display text-3xl leading-tight md:text-5xl">
                  {update.message.toUpperCase()}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Next checkpoint: {update.nextCheckpoint}
                </p>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
