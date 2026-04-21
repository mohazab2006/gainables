import Link from "next/link";
import { connection } from "next/server";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { upsertSiteContentSection } from "@/lib/actions/admin";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { adminJsonContentSections, adminScalarContentSections } from "@/lib/admin/content-sections";
import { getSiteContent } from "@/lib/content";

type RawContentPageProps = {
  searchParams?: AdminSearchParams;
};

/**
 * Advanced escape-hatch editor — raw JSON per section. Kept for power users
 * and for sections that don't have a typed form yet (e.g. route). Prefer the
 * typed pages at /admin/content/<section> when available.
 */
export default async function AdminRawContentPage({ searchParams }: RawContentPageProps) {
  await connection();
  await requireAuthorizedAdmin();
  const resolvedParams = searchParams ? await searchParams : {};
  const content = await getSiteContent();
  const { message, type } = await resolveAdminFlashState(Promise.resolve(resolvedParams));

  const jsonValues = {
    hero: content.hero,
    why_it_matters: content.whyItMatters,
    route: content.route,
    media: content.media,
    donate: content.donate,
  } as const;

  const scalarValues = {
    donation_url: content.donationUrl,
    donation_embed_url: content.donationEmbedUrl ?? "",
    tracker_status: content.trackerStatus,
    ride_date: content.rideDate,
  } as const;

  // Optional deep-link: /admin/content/raw?section=route highlights that section.
  const focusedSection = typeof resolvedParams.section === "string" ? resolvedParams.section : null;

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-4xl border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Content · Advanced</p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight">Raw JSON editor</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Power-user escape hatch. Each block is the literal value in the <code className="rounded bg-background px-1 py-0.5 text-xs">site_content</code> table. Invalid JSON will be
            rejected. Prefer the typed editors at{" "}
            <Link href="/admin/content" className="underline hover:text-foreground">
              /admin/content
            </Link>{" "}
            for everyday edits.
          </p>
          <AdminFlashBanner message={message} type={type} className="mt-6" />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {adminJsonContentSections.map((section) => (
            <form
              key={section.key}
              id={section.key}
              action={upsertSiteContentSection}
              className={`rounded-[1.75rem] border bg-background p-6 ${focusedSection === section.key ? "border-foreground ring-2 ring-foreground/10" : "border-border"}`}
            >
              <input type="hidden" name="key" value={section.key} />
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{section.title}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.description}</p>
              <textarea
                name="value"
                defaultValue={JSON.stringify(jsonValues[section.key], null, 2)}
                className="mt-5 min-h-72 w-full rounded-[1.25rem] border border-border bg-secondary/40 px-4 py-4 font-mono text-sm outline-none transition focus:border-foreground"
                spellCheck={false}
              />
              <div className="mt-5">
                <AdminSubmitButton idleLabel={`Save ${section.title}`} pendingLabel="Saving..." className="rounded-full px-5" />
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
                />
              )}
              <div className="mt-5">
                <AdminSubmitButton idleLabel="Save" pendingLabel="Saving..." className="rounded-full px-5" />
              </div>
            </form>
          ))}
        </section>
      </div>
    </main>
  );
}
