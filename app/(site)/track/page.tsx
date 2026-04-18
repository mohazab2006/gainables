import { DonateFloat } from "@/components/track/donate-float";
import { TrackerShell } from "@/components/track/tracker-shell";
import { getRidePositions, getRideUpdates, getSiteContent, getSponsors } from "@/lib/content";
import { getRouteGeoJson } from "@/lib/route-geojson";

export const revalidate = 15;

export default async function TrackPage() {
  const [content, ridePositions, rideUpdates, sponsors, routeFeature] = await Promise.all([
    getSiteContent(),
    getRidePositions(),
    getRideUpdates(),
    getSponsors(),
    getRouteGeoJson(),
  ]);

  return (
    <main className="bg-background px-4 pb-20 pt-32 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[96rem]">
        <div className="mb-10 flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Live tracking</p>
          <h1 className="max-w-4xl text-5xl font-medium tracking-tight md:text-7xl">
            Follow the Ottawa to Montreal ride in real time.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            The tracker is now designed around the live Overland feed: branded route map, live trail line, manual ride updates,
            and a fallback operator workflow if the rider signal drops.
          </p>
        </div>
        <TrackerShell
          donationUrl={content.donationUrl}
          initialPositions={ridePositions}
          initialUpdates={rideUpdates}
          mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          rideDate={content.rideDate}
          route={content.route}
          routeFeature={routeFeature}
          sponsors={sponsors}
          trackerStatus={content.trackerStatus}
        />
      </div>
      <DonateFloat donationUrl={content.donationUrl} />
    </main>
  );
}
