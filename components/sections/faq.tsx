import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FaqItem } from "@/lib/fallback-content";

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section id="faq" className="bg-background px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">FAQ</p>
          <h2 className="mt-4 text-4xl font-medium tracking-tight md:text-6xl">Questions the campaign page should answer fast.</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="rounded-[1.5rem] border border-border bg-secondary/50 px-6">
              <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-8 text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
