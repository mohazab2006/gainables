import { DonateFloat } from "@/components/track/donate-float";
import { TrackerShell } from "@/components/track/tracker-shell";
import { getRideUpdates, getSiteContent, getSponsors } from "@/lib/content";

export const revalidate = 15;

export default async function TrackPage() {
  const [content, rideUpdates, sponsors] = await Promise.all([
    getSiteContent(),
    getRideUpdates(),
    getSponsors(),
  ]);

  return (
    <main className="bg-background px-6 pb-20 pt-36 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Live tracking</p>
          <h1 className="max-w-4xl text-5xl font-medium tracking-tight md:text-7xl">
            Follow the Ottawa to Montreal ride in real time.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            The tracking page always keeps a manual status card available. If the live GPS feed drops, supporters still
            have the latest checkpoint, distance completed, and next destination.
          </p>
        </div>
        <TrackerShell
          donationUrl={content.donationUrl}
          initialUpdates={rideUpdates}
          mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          trackerEmbedUrl={content.trackerEmbedUrl}
          route={content.route}
          sponsors={sponsors}
        />
      </div>
      <DonateFloat donationUrl={content.donationUrl} />
    </main>
  );
}
