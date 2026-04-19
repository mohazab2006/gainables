"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useReveal } from "@/hooks/use-reveal";
import type { MediaContent } from "@/lib/fallback-content";

export function MediaSocialSection({ media }: { media: MediaContent }) {
  const ref = useReveal<HTMLDivElement>({ y: 24, stagger: 0.06 });

  return (
    <section className="border-t border-foreground bg-background text-foreground">
      <div ref={ref} className="px-6 py-24 md:px-10 md:py-32">
        <div className="container-shell">
          <div data-reveal>
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
              Media &amp; community
            </p>
            <h2 className="mt-6 max-w-5xl font-display text-5xl leading-[0.92] md:text-7xl lg:text-[6vw]">
              {media.title.toUpperCase()}
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
              {media.body}
            </p>
          </div>

          <div className="mt-16 border-t border-foreground">
            {media.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                data-reveal
                className="group flex items-center justify-between gap-6 border-b border-foreground py-8 transition-colors hover:bg-foreground/[0.03]"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8">
                  <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground md:w-32">
                    {link.label}
                  </p>
                  <p className="font-display text-3xl leading-none md:text-5xl">
                    {link.handle.toUpperCase()}
                  </p>
                </div>
                <ArrowUpRight
                  size={28}
                  className="shrink-0 text-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
