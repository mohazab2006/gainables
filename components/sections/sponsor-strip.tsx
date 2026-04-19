"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useMarquee } from "@/hooks/use-marquee";
import { useReveal } from "@/hooks/use-reveal";
import type { Sponsor } from "@/lib/fallback-content";

const SPONSOR_CONTACT_HREF = "mailto:sponsor@gainables.ca?subject=Gainables%20Ride%20Sponsorship";

export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  const head = useReveal<HTMLDivElement>({ y: 20, stagger: 0.06 });
  const marquee = useMarquee<HTMLDivElement>({ speed: 40 });
  const empty = useReveal<HTMLDivElement>({ y: 22, stagger: 0.08 });

  const visible = sponsors.filter((s) => s.visible !== false);

  if (!visible.length) {
    return (
      <section
        id="sponsors"
        className="relative bg-background px-6 py-24 md:px-12 md:py-28 lg:px-20"
      >
        <div ref={empty} className="container-shell">
          <p data-reveal className="eyebrow">Sponsors</p>

          <h2
            data-reveal
            className="mt-6 display-hero max-w-4xl text-5xl leading-[0.94] md:text-7xl lg:text-[6rem]"
          >
            Your <span className="display-italic text-muted-foreground">logo</span> belongs here.
          </h2>

          <p
            data-reveal
            className="mt-8 max-w-2xl font-serif text-xl leading-[1.4] text-muted-foreground md:text-2xl"
          >
            The first sponsors on this page will be part of the campaign story —
            tied to every kilometre, every update, every donor moment from Ottawa to Montreal.
          </p>

          <div data-reveal className="mt-10 flex flex-wrap gap-3">
            <Link
              href={SPONSOR_CONTACT_HREF}
              className="pill-cta bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]"
            >
              Become a sponsor
              <ArrowUpRight size={16} />
            </Link>
            <Link href="/donate" className="pill-ghost">
              See the cause
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="sponsors"
      className="relative bg-background px-6 py-24 md:px-12 md:py-28 lg:px-20"
    >
      <div className="container-shell">
        <div ref={head} className="flex items-baseline justify-between gap-6">
          <p data-reveal className="eyebrow">Sponsors</p>
          <p data-reveal className="eyebrow text-foreground/50">Partners making it possible</p>
        </div>

        {/* Names-only ticker — sponsor name in Anton uppercase, scrolls infinitely */}
        <div
          ref={marquee}
          className="marquee-mask mt-12 overflow-hidden border-y border-white/10 py-8"
        >
          <div
            data-marquee-track
            className="flex w-max items-center gap-16 will-change-transform md:gap-24"
          >
            {[...visible, ...visible].map((sponsor, i) => (
              <span
                key={`${sponsor.id}-${i}`}
                className="flex shrink-0 items-center gap-16 font-display text-3xl uppercase tracking-tight text-foreground/60 md:gap-24 md:text-5xl"
              >
                {sponsor.name}
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/30" aria-hidden />
              </span>
            ))}
          </div>
        </div>

        {/* Logo grid — clickable, float-hover */}
        <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-16 md:grid-cols-4 md:gap-x-10 lg:grid-cols-6">
          {visible.map((sponsor) => (
            <SponsorLogo key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const hasLink = Boolean(sponsor.link && sponsor.link.trim().length > 0);

  const body = (
    <div className="group relative flex h-20 items-center justify-center md:h-24">
      {/* Soft lime glow on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -m-4 rounded-[2rem] bg-accent/0 blur-2xl transition duration-500 group-hover:bg-accent/10"
      />

      {sponsor.logoUrl ? (
        <img
          src={sponsor.logoUrl}
          alt={`${sponsor.name} logo`}
          loading="lazy"
          className="relative max-h-14 w-auto max-w-[160px] object-contain opacity-60 brightness-0 invert transition duration-500 will-change-transform group-hover:-translate-y-1 group-hover:opacity-100 md:max-h-16"
        />
      ) : (
        <span className="relative whitespace-nowrap font-display text-xl uppercase tracking-tight text-foreground/60 transition duration-500 group-hover:-translate-y-1 group-hover:text-foreground md:text-2xl">
          {sponsor.name}
        </span>
      )}
    </div>
  );

  if (hasLink) {
    return (
      <Link
        href={sponsor.link}
        target="_blank"
        rel="noreferrer"
        aria-label={`Visit ${sponsor.name}`}
        className="block"
      >
        {body}
      </Link>
    );
  }

  return (
    <div aria-label={sponsor.name} className="block">
      {body}
    </div>
  );
}
