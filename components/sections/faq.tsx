"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useReveal } from "@/hooks/use-reveal";
import type { FaqItem } from "@/lib/fallback-content";

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const ref = useReveal<HTMLDivElement>({ y: 20, stagger: 0.04 });

  return (
    <section
      id="faq"
      className="border-t border-foreground bg-background text-foreground"
    >
      <div ref={ref} className="px-6 py-24 md:px-10 md:py-32">
        <div className="container-shell">
          <div data-reveal>
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
              Frequently asked
            </p>
            <h2 className="mt-6 max-w-5xl font-display text-5xl leading-[0.92] md:text-7xl lg:text-[6vw]">
              QUESTIONS.
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Need something else? Reach out at{" "}
              <a
                className="text-foreground underline-offset-4 hover:underline"
                href="mailto:hello@gainables.com"
              >
                hello@gainables.com
              </a>
              .
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-16 border-t border-foreground">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-foreground"
              >
                <AccordionTrigger className="py-6 text-left font-display text-2xl leading-tight tracking-tight hover:no-underline md:text-4xl">
                  {faq.question.toUpperCase()}
                </AccordionTrigger>
                <AccordionContent className="pb-8 pr-4 text-base leading-7 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
