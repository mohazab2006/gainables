import Link from "next/link";

import type { MediaContent } from "@/lib/fallback-content";

export function MediaSocialSection({ media }: { media: MediaContent }) {
  return (
    <section className="bg-background px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border bg-secondary/50 p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Media and community</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">{media.title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">{media.body}</p>
        </div>
        <div className="grid gap-4">
          {media.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-[1.75rem] border border-border bg-background p-6 transition hover:border-foreground"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{link.label}</p>
              <p className="mt-3 text-xl font-medium">{link.handle}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
