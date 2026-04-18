import Image from "next/image";

import type { CausePartnerContent } from "@/lib/fallback-content";

export function CausePartnerSection({ causePartner }: { causePartner: CausePartnerContent }) {
  return (
    <section className="bg-background px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-border bg-foreground p-8 text-background md:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-background/60">{causePartner.eyebrow}</p>
          <blockquote className="mt-6 text-3xl font-medium leading-tight tracking-tight md:text-5xl">
            “{causePartner.quote}”
          </blockquote>
          <p className="mt-6 text-base leading-8 text-background/72 md:text-lg">{causePartner.body}</p>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem]">
          <Image src={causePartner.image.src} alt={causePartner.image.alt} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
