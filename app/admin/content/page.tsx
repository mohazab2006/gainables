import { connection } from "next/server";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { upsertSiteContentSection } from "@/lib/actions/admin";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { adminJsonContentSections, adminScalarContentSections } from "@/lib/admin/content-sections";
import { getSiteContent } from "@/lib/content";

type AdminContentPageProps = {
  searchParams?: AdminSearchParams;
};

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  await connection();
  await requireAuthorizedAdmin();
  const content = await getSiteContent();
  const canEdit = true;
  const { message, type } = await resolveAdminFlashState(searchParams);

  const jsonValues = {
    hero: content.hero,
    stats: content.stats,
    why_it_matters: content.whyItMatters,
    about: content.about,
    route: content.route,
    pillars: content.pillars,
    gallery: content.gallery,
    cause_partner: content.causePartner,
    media: content.media,
    donate: content.donate,
  } as const;

  const scalarValues = {
    donation_url: content.donationUrl,
    donation_embed_url: content.donationEmbedUrl ?? "",
    tracker_embed_url: content.trackerEmbedUrl ?? "",
    tracker_status: content.trackerStatus,
    ride_date: content.rideDate,
  } as const;

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Content</p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight">Edit the live structured content model.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            JSON sections map directly to the `site_content` table. Save a block and the public pages will revalidate
            immediately.
          </p>
          <AdminFlashBanner message={message} type={type} className="mt-6" />
          {!canEdit ? (
            <div className="mt-6 rounded-[1.25rem] border border-border bg-background p-5 text-sm text-muted-foreground">
              Sign in with an allowlisted admin account to save changes from this screen.
            </div>
          ) : null}
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          {adminJsonContentSections.map((section) => (
            <form key={section.key} action={upsertSiteContentSection} className="rounded-[1.75rem] border border-border bg-background p-6">
              <input type="hidden" name="key" value={section.key} />
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{section.title}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.description}</p>
              <textarea
                name="value"
                defaultValue={JSON.stringify(jsonValues[section.key], null, 2)}
                className="mt-5 min-h-72 w-full rounded-[1.25rem] border border-border bg-secondary/40 px-4 py-4 font-mono text-sm outline-none transition focus:border-foreground"
                spellCheck={false}
                disabled={!canEdit}
              />
              <div className="mt-5">
                <AdminSubmitButton idleLabel={`Save ${section.title}`} pendingLabel="Saving..." className="rounded-full px-5" disabled={!canEdit} />
              </div>
            </form>
          ))}
        </section>
        <section className="grid gap-6 md:grid-cols-3">
          {adminScalarContentSections.map((section) => (
            <form key={section.key} action={upsertSiteContentSection} className="rounded-[1.75rem] border border-border bg-background p-6">
              <input type="hidden" name="key" value={section.key} />
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{section.title}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.description}</p>
              {section.key === "tracker_status" ? (
                <select
                  name="value"
                  defaultValue={scalarValues[section.key]}
                  className="mt-5 h-11 w-full rounded-xl border border-border bg-secondary/40 px-4 text-sm outline-none transition focus:border-foreground"
                  disabled={!canEdit}
                >
                  <option value="pre_ride">pre_ride</option>
                  <option value="live">live</option>
                  <option value="finished">finished</option>
                </select>
              ) : (
                <input
                  type={section.key.includes("url") ? "url" : "text"}
                  name="value"
                  defaultValue={scalarValues[section.key]}
                  className="mt-5 h-11 w-full rounded-xl border border-border bg-secondary/40 px-4 text-sm outline-none transition focus:border-foreground"
                  disabled={!canEdit}
                />
              )}
              <div className="mt-5">
                <AdminSubmitButton idleLabel="Save URL" pendingLabel="Saving..." className="rounded-full px-5" disabled={!canEdit} />
              </div>
            </form>
          ))}
        </section>
      </div>
    </main>
  );
}
