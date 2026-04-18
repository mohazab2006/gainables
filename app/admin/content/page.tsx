import { getSiteContent } from "@/lib/content";

export default async function AdminContentPage() {
  const content = await getSiteContent();

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-secondary/50 p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Content model</p>
        <h2 className="mt-4 text-3xl font-medium tracking-tight">Structured keys are ready for editable sections.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card title="Hero" description={content.hero.description} />
          <Card title="About" description={content.about.body} />
          <Card title="Why it matters" description={content.whyItMatters.body} />
          <Card title="Donate" description={content.donate.bannerBody} />
        </div>
      </div>
    </main>
  );
}

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-background p-6">
      <p className="text-lg font-medium">{title}</p>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
