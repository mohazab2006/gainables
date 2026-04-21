import { connection } from "next/server";
import Link from "next/link";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { ContentField, contentInputClassName } from "@/components/admin/content-field";
import { upsertSiteContentSection } from "@/lib/actions/admin";
import { saveRideDate } from "@/lib/actions/admin-content";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getSiteContent } from "@/lib/content";

type SettingsPageProps = {
  searchParams?: AdminSearchParams;
};

/**
 * Scalar-setting editor: donation destination URL, donation embed URL,
 * tracker embed URL, tracker status, and ride date. Each setting gets its
 * own form because `upsertSiteContentSection` saves one key at a time.
 */
export default async function AdminContentSettingsPage({ searchParams }: SettingsPageProps) {
  await connection();
  await requireAuthorizedAdmin();
  const content = await getSiteContent();
  const { message, type } = await resolveAdminFlashState(searchParams);

  // Convert the stored ISO timestamp to a value accepted by <input type="datetime-local" />.
  const rideDateLocal = toDateTimeLocal(content.rideDate);

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-4xl border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Content · Settings</p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight">Donation &amp; tracker settings.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Ride-day switches and external URLs. Each field saves independently — small changes, no JSON.
          </p>
          <AdminFlashBanner message={message} type={type} className="mt-6" />
          <div className="mt-6">
            <Link href="/admin/content" className="text-sm text-muted-foreground transition hover:text-foreground">
              ← Back to all sections
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          {/* Donation URL */}
          <form action={upsertSiteContentSection} className="rounded-[1.75rem] border border-border bg-background p-6">
            <input type="hidden" name="key" value="donation_url" />
            <ContentField
              label="Donation destination URL"
              hint='Where "Donate" buttons send people. Accepts full URLs (https://…) or a mailto: link while the processor is being set up.'
              required
            >
              <input
                type="text"
                name="value"
                defaultValue={content.donationUrl}
                className={contentInputClassName}
                placeholder="https://donate.example.com/ride or mailto:admin@gainables.ca"
                required
              />
            </ContentField>
            <div className="mt-5">
              <AdminSubmitButton idleLabel="Save donation URL" pendingLabel="Saving..." className="rounded-full px-5" />
            </div>
          </form>

          {/* Donation embed URL */}
          <form action={upsertSiteContentSection} className="rounded-[1.75rem] border border-border bg-background p-6">
            <input type="hidden" name="key" value="donation_embed_url" />
            <ContentField
              label="Donation embed URL (optional)"
              hint="If your donation provider offers an iframe (Zeffy, Donorbox, etc.), paste its embed URL to show the form inline on the /donate page. Leave blank to just link out."
            >
              <input
                type="url"
                name="value"
                defaultValue={content.donationEmbedUrl ?? ""}
                className={contentInputClassName}
                placeholder="https://www.zeffy.com/embed/…"
              />
            </ContentField>
            <div className="mt-5">
              <AdminSubmitButton idleLabel="Save embed URL" pendingLabel="Saving..." className="rounded-full px-5" />
            </div>
          </form>

          {/* Tracker status */}
          <form action={upsertSiteContentSection} className="rounded-[1.75rem] border border-border bg-background p-6">
            <input type="hidden" name="key" value="tracker_status" />
            <ContentField
              label="Ride mode"
              hint='Controls whether the site shows the countdown ("Pre-ride"), the live tracker ("Live"), or the wrap-up message ("Finished"). Switch to Live when the ride rolls out; Finished when the rider crosses the finish line.'
              required
            >
              <select
                name="value"
                defaultValue={content.trackerStatus}
                className={`${contentInputClassName} h-11`}
                required
              >
                <option value="pre_ride">Pre-ride · countdown shown</option>
                <option value="live">Live · tracker active</option>
                <option value="finished">Finished · ride complete</option>
              </select>
            </ContentField>
            <div className="mt-5">
              <AdminSubmitButton idleLabel="Save ride mode" pendingLabel="Saving..." className="rounded-full px-5" />
            </div>
          </form>

          {/* Ride date — uses a dedicated action so the datetime-local value is normalised to ISO. */}
          <form action={saveRideDate} className="rounded-[1.75rem] border border-border bg-background p-6">
            <ContentField
              label="Ride start date &amp; time"
              hint="Used for the pre-ride countdown. Pick the time the ride rolls out of Ottawa. Saved as ISO 8601."
              required
            >
              <input
                type="datetime-local"
                name="value"
                defaultValue={rideDateLocal}
                className={`${contentInputClassName} h-11`}
                required
              />
            </ContentField>
            <div className="mt-5">
              <AdminSubmitButton idleLabel="Save ride date" pendingLabel="Saving..." className="rounded-full px-5" />
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function toDateTimeLocal(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}
