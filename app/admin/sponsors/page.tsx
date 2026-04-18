import { getSponsors } from "@/lib/content";

export default async function AdminSponsorsPage() {
  const sponsors = await getSponsors();

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-secondary/50 p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Sponsors</p>
        <h2 className="mt-4 text-3xl font-medium tracking-tight">Tiered sponsor data is ready for CRUD wiring.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="rounded-[1.5rem] border border-border bg-background p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{sponsor.tier}</p>
              <p className="mt-3 text-xl font-medium">{sponsor.name}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{sponsor.tagline}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
