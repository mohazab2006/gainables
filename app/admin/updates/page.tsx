import { getRideUpdates } from "@/lib/content";

export default async function AdminUpdatesPage() {
  const updates = await getRideUpdates();

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-secondary/50 p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Ride updates</p>
        <h2 className="mt-4 text-3xl font-medium tracking-tight">Manual update cards are ready for posting workflow.</h2>
        <div className="mt-8 space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="rounded-[1.5rem] border border-border bg-background p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{update.createdAtLabel}</span>
                <span>{update.location}</span>
                <span>{update.kmCompleted} km</span>
              </div>
              <p className="mt-3 text-lg font-medium">{update.message}</p>
              <p className="mt-2 text-sm text-muted-foreground">Next checkpoint: {update.nextCheckpoint}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
