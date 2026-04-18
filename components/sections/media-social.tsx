"use client";

import Link from "next/link";
import { ArrowUpRight, AtSign, Instagram, Mail, Music2 } from "lucide-react";

import { useReveal } from "@/hooks/use-reveal";
import type { MediaContent } from "@/lib/fallback-content";

function iconFor(label: string) {
  const key = label.toLowerCase();
  if (key.includes("insta")) return Instagram;
  if (key.includes("tik")) return Music2;
  if (key.includes("mail") || key.includes("contact") || key.includes("email")) return Mail;
  return AtSign;
}

export function MediaSocialSection({ media }: { media: MediaContent }) {
  const ref = useReveal<HTMLDivElement>({ y: 30, stagger: 0.08 });

  return (
    <section className="bg-background px-6 py-24 md:px-12 md:py-28 lg:px-20">
      <div ref={ref} className="container-shell grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div data-reveal className="rounded-[2rem] border border-border bg-surface p-8 md:p-10">
          <p className="eyebrow">Media & community</p>
          <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-5xl">
            {media.title}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            {media.body}
          </p>
        </div>
        <div className="grid gap-3">
          {media.links.map((link) => {
            const Icon = iconFor(link.label);
            return (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                data-reveal
                className="group flex items-center justify-between gap-6 rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-foreground"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="eyebrow">{link.label}</p>
                    <p className="mt-1 font-display text-2xl tracking-tight">{link.handle}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{link.description}</p>
                  </div>
                </div>
                <ArrowUpRight
                  size={18}
                  className="shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
