"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useReveal } from "@/hooks/use-reveal";
import type { FaqItem } from "@/lib/fallback-content";

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const ref = useReveal<HTMLDivElement>({ y: 24, stagger: 0.06 });

  return (
    <section id="faq" className="bg-background px-6 py-24 md:px-12 md:py-28 lg:px-20">
      <div ref={ref} className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="lg:sticky lg:top-32 lg:self-start" data-reveal>
          <p className="eyebrow">Frequently asked</p>
          <h2 className="mt-4 max-w-md font-display text-4xl leading-[1.02] tracking-[-0.025em] md:text-6xl">
            Questions <span className="display-italic">supporters</span> ask first.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
            Need something else? Reach out at{" "}
            <a className="text-foreground underline-offset-4 hover:underline" href="mailto:admin@gainables.ca">
              admin@gainables.ca
            </a>
            .
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <div data-reveal key={faq.id}>
              <AccordionItem
                value={faq.id}
                className="rounded-2xl border border-border bg-surface px-6 transition hover:border-foreground/30"
              >
                <AccordionTrigger className="py-5 text-left font-display text-xl leading-tight tracking-tight hover:no-underline md:text-2xl">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 pr-4 text-base leading-7 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
