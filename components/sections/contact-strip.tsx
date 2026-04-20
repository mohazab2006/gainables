"use client";

import type { ComponentType, SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Instagram, Mail } from "lucide-react";

import { useReveal } from "@/hooks/use-reveal";
import type { MediaContent } from "@/lib/fallback-content";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

function TikTokIcon({ size = 22, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
      {...rest}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

function pickIcon(link: { href: string; label: string }): IconComponent {
  const haystack = `${link.href} ${link.label}`.toLowerCase();
  if (haystack.includes("instagram")) return Instagram;
  if (haystack.includes("tiktok")) return TikTokIcon;
  if (
    haystack.startsWith("mailto:") ||
    haystack.includes("mail") ||
    haystack.includes("email") ||
    haystack.includes("contact")
  ) {
    return Mail;
  }
  return ArrowUpRight;
}

function formatHandle(link: { href: string; handle?: string; label: string }): string {
  if (link.handle) {
    if (link.href.startsWith("mailto:") || link.handle.includes("@") && link.handle.includes(".")) {
      return link.handle;
    }
    return link.handle.startsWith("@") ? link.handle : `@${link.handle}`;
  }
  if (link.href.startsWith("mailto:")) return link.href.replace("mailto:", "");
  return link.label;
}

export function ContactStrip({ media }: { media: MediaContent }) {
  const ref = useReveal<HTMLDivElement>({ y: 18, stagger: 0.05 });

  return (
    <section id="contact" className="relative bg-background px-6 pb-20 pt-10 md:px-12 md:pb-24 md:pt-12 lg:px-20">
      <div ref={ref} className="container-shell">
        <div>
          <div className="flex flex-col items-center gap-3 text-center">
            <p data-reveal className="eyebrow text-foreground/70">
              Follow the journey
            </p>
            <h3
              data-reveal
              className="font-display text-3xl tracking-tight text-foreground md:text-4xl lg:text-5xl"
            >
              Stay close to the ride.
            </h3>
            <p
              data-reveal
              className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7"
            >
              {media.body}
            </p>
          </div>

          <div
            data-reveal
            className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-3"
          >
            {media.links.map((link) => {
              const Icon = pickIcon(link);
              const isExternal = link.href.startsWith("http");
              const handle = formatHandle(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  aria-label={`${link.label} — ${handle}`}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-accent/5 md:p-6"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(120% 80% at 0% 0%, rgba(200,226,92,0.18), transparent 60%)",
                    }}
                  />
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-foreground/5 text-foreground transition-all duration-300 group-hover:border-accent/50 group-hover:bg-accent/15 group-hover:text-accent md:h-16 md:w-16">
                    <Icon size={26} />
                  </span>
                  <span className="relative flex min-w-0 flex-1 flex-col">
                    <span className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-muted-foreground transition-colors duration-300 group-hover:text-accent">
                      {link.label}
                    </span>
                    <span className="mt-1 truncate font-display text-xl tracking-tight text-foreground md:text-2xl">
                      {handle}
                    </span>
                    {link.description ? (
                      <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground md:text-sm">
                        {link.description}
                      </span>
                    ) : null}
                  </span>
                  <ArrowUpRight
                    size={18}
                    aria-hidden
                    className="relative shrink-0 self-start text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <div data-reveal className="relative mx-auto mt-20 flex max-w-3xl flex-col items-center md:mt-24">
          <div className="flex w-full items-center gap-4 text-muted-foreground/60">
            <span aria-hidden className="h-px flex-1 bg-linear-to-r from-transparent via-white/15 to-white/15" />
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.32em]">
              Gainables
            </span>
            <span aria-hidden className="h-px flex-1 bg-linear-to-l from-transparent via-white/15 to-white/15" />
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="group relative mt-8 flex h-48 w-48 items-center justify-center rounded-full transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background md:h-60 md:w-60 lg:h-72 lg:w-72"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,255,255,0.22), rgba(200,226,92,0.1) 45%, transparent 75%)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-white/5 transition-colors duration-500 group-hover:border-white/15"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-4 rounded-full border border-white/5 transition-all duration-700 group-hover:inset-2 group-hover:border-white/10"
            />
            <Image
              src="/gainables-mark.png"
              alt="Gainables"
              width={320}
              height={320}
              sizes="(min-width: 1024px) 288px, (min-width: 768px) 240px, 192px"
              className="relative h-3/5 w-3/5 object-contain transition-transform duration-500 group-hover:scale-105"
              style={{
                filter:
                  "drop-shadow(0 0 10px rgba(255,255,255,0.3)) drop-shadow(0 0 30px rgba(255,255,255,0.15))",
              }}
            />
          </button>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group mt-8 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:text-accent"
          >
            <ArrowUp
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            />
            Back to top
          </button>
        </div>
      </div>
    </section>
  );
}
