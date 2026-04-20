import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, HelpCircle } from "lucide-react";

import { FaqSection } from "@/components/sections/faq";
import { getFaqs } from "@/lib/content";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Gainables' Ride for Mental Health — the ~200 km Ottawa to Montreal ride, donations, sponsors, and how to follow along.",
};

export default async function FaqPage() {
  const [faqs] = await Promise.all([getFaqs()]);
  const siteUrl = getSiteUrl();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
    url: `${siteUrl}/faq`,
  };

  return (
    <main className="bg-background pb-24 pt-36 md:pt-44">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container-shell px-6 md:px-12 lg:px-20">
        <div className="flex flex-col gap-6">
          <div className="ring-token w-fit">
            <HelpCircle size={14} className="text-accent" /> FAQ
          </div>
          <h1 className="max-w-4xl font-display text-5xl leading-[0.96] tracking-[-0.03em] md:text-7xl lg:text-[6.5vw]">
            Questions <span className="display-italic">supporters</span> ask first.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
            Short answers about the ride, donations, sponsors, and how to follow along in real time.
          </p>
        </div>
      </div>

      <FaqSection faqs={faqs} />

      <section className="px-6 md:px-12 lg:px-20">
        <div className="container-shell">
          <div className="rounded-4xl border border-foreground/10 bg-foreground p-8 text-background md:p-12">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="ring-token border-white/15 bg-white/10 text-white/80">
                  Still have a question?
                </p>
                <h2 className="mt-5 font-display text-3xl leading-[1.05] tracking-tight md:text-4xl">
                  Reach out and we&apos;ll get back to you.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-background/70 md:text-lg md:leading-8">
                  For sponsorship, media, or campaign questions, email us directly — we read every message.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link
                  href="mailto:admin@gainables.ca"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(200,226,92,0.35)]"
                >
                  Email us
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/donate"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-background transition hover:border-white/30 hover:bg-white/10"
                >
                  Donate
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
