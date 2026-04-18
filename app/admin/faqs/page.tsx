import { getFaqs } from "@/lib/content";

export default async function AdminFaqsPage() {
  const faqs = await getFaqs();

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-secondary/50 p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">FAQs</p>
        <h2 className="mt-4 text-3xl font-medium tracking-tight">Accordion content is modeled and ready for editing.</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-[1.5rem] border border-border bg-background p-6">
              <p className="text-lg font-medium">{faq.question}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
