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
    <main className="bg-background px-6 pb-24 pt-36 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Ride updates</p>
          <h1 className="max-w-4xl text-5xl font-medium tracking-tight md:text-7xl">
            The build-up, training blocks, and ride-day checkpoints in one stream.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            Use this page for longer-form updates, sponsor mentions, media recaps, and milestone posts.
          </p>
        </div>
        <div className="mt-14 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-border bg-secondary/60 p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Social and media</p>
            <div className="mt-6 space-y-4 text-sm text-muted-foreground">
              {content.media.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-full border border-border bg-background px-5 py-3 transition hover:border-foreground"
                >
                  <span>{link.label}</span>
                  <span>@{link.handle}</span>
                </Link>
              ))}
            </div>
          </aside>
          <section className="space-y-6">
            {updates.map((update) => (
              <article key={update.id} className="rounded-[2rem] border border-border bg-background p-8 shadow-[0_16px_60px_rgba(10,10,10,0.04)]">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{update.createdAtLabel}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{update.location}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{update.kmCompleted} km complete</span>
                </div>
                <h2 className="mt-4 text-2xl font-medium tracking-tight">{update.message}</h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  Next checkpoint: {update.nextCheckpoint}
                </p>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
