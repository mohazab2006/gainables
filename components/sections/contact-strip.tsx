"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useReveal } from "@/hooks/use-reveal";
import type { MediaContent } from "@/lib/fallback-content";

export function ContactStrip({ media }: { media: MediaContent }) {
  const ref = useReveal<HTMLDivElement>({ y: 18, stagger: 0.05 });

  return (
    <footer id="contact" className="relative bg-background px-6 py-16 md:px-12 md:py-20 lg:px-20">
      <div ref={ref} className="container-shell">
        <div data-reveal className="display-mega text-[20vw] leading-[0.82] md:text-[14vw]">
          GAINABLES
        </div>

        <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-[1fr_auto] md:items-start">
          <div data-reveal className="max-w-lg font-serif text-lg leading-[1.4] text-muted-foreground">
            {media.body}
          </div>

          <div data-reveal className="flex flex-wrap gap-x-10 gap-y-4 md:justify-end">
            {media.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-[0.24em] text-foreground transition hover:text-accent"
              >
                {link.label}
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            ))}
          </div>
        </div>

        <div data-reveal className="mt-12 flex items-baseline justify-between text-xs uppercase tracking-[0.32em] text-muted-foreground">
          <span>© {new Date().getFullYear()} Gainables</span>
          <span>Ottawa → Montreal</span>
        </div>
      </div>
    </footer>
  );
}
