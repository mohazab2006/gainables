import Link from "next/link";

import type { DonateContent } from "@/lib/fallback-content";

export function DonateBannerSection({
  donate,
  donationUrl,
}: {
  donate: DonateContent;
  donationUrl: string;
}) {
  return (
    <section className="bg-background px-6 py-8 md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] bg-foreground px-8 py-10 text-background md:flex-row md:items-end md:justify-between md:px-12">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-background/60">Donate call to action</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">{donate.bannerTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-background/72 md:text-lg">{donate.bannerBody}</p>
        </div>
        <Link
          href={donationUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:opacity-85"
        >
          Donate now
        </Link>
      </div>
    </section>
  );
}
