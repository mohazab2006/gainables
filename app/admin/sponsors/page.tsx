import type { ReactNode } from "react";

import { connection } from "next/server";

import { AdminSubmitButton } from "@/components/admin/submit-button";
import { createSponsor, deleteSponsor, updateSponsor } from "@/lib/actions/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { getAllSponsors } from "@/lib/content";

type AdminSponsorsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sponsorTiers = ["lead", "supporting", "community"] as const;

export default async function AdminSponsorsPage({ searchParams }: AdminSponsorsPageProps) {
  await connection();
  const params = searchParams ? await searchParams : {};
  const sponsors = await getAllSponsors();
  const session = await getAdminSession();
  const canEdit = session.status === "authorized";
  const message = typeof params.message === "string" ? params.message : null;
  const type = typeof params.type === "string" ? params.type : null;

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Sponsors</p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight">Manage sponsor tiers, links, logos, and ordering.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Upload a logo to Supabase storage or keep text-only sponsor cards. Hidden sponsors stay in the system but do
            not render on the public site.
          </p>
          {message ? (
            <div
              className={`mt-6 rounded-[1.25rem] border px-5 py-4 text-sm ${
                type === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-border bg-background text-foreground"
              }`}
            >
              {message}
            </div>
          ) : null}
        </section>

        <form action={createSponsor} className="rounded-[2rem] border border-border bg-background p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Add sponsor</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Name">
              <input name="name" required disabled={!canEdit} className={fieldClassName} />
            </Field>
            <Field label="Tier">
              <select name="tier" defaultValue="community" disabled={!canEdit} className={fieldClassName}>
                {sponsorTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Link">
              <input type="url" name="link" disabled={!canEdit} className={fieldClassName} />
            </Field>
            <Field label="Sort order">
              <input type="number" name="sortOrder" defaultValue={sponsors.length + 1} disabled={!canEdit} className={fieldClassName} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <Field label="Tagline">
              <textarea name="tagline" rows={3} disabled={!canEdit} className={`${fieldClassName} min-h-24 py-3`} />
            </Field>
            <Field label="Logo file">
              <input type="file" name="logo" accept="image/*" disabled={!canEdit} className={`${fieldClassName} h-11 py-2`} />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <input type="checkbox" name="visible" defaultChecked disabled={!canEdit} />
            Visible on the public site
          </label>
          <div className="mt-6">
            <AdminSubmitButton idleLabel="Create sponsor" pendingLabel="Creating..." className="rounded-full px-5" disabled={!canEdit} />
          </div>
        </form>

        <section className="grid gap-4">
          {sponsors.map((sponsor) => (
            <article key={sponsor.id} className="rounded-[1.75rem] border border-border bg-background p-6">
              <form action={updateSponsor}>
                <input type="hidden" name="id" value={sponsor.id} />
                <input type="hidden" name="existingLogoUrl" value={sponsor.logoUrl ?? ""} />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_200px_140px]">
                  <Field label="Name">
                    <input name="name" defaultValue={sponsor.name} required disabled={!canEdit} className={fieldClassName} />
                  </Field>
                  <Field label="Tier">
                    <select name="tier" defaultValue={sponsor.tier} disabled={!canEdit} className={fieldClassName}>
                      {sponsorTiers.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Link">
                    <input type="url" name="link" defaultValue={sponsor.link} disabled={!canEdit} className={fieldClassName} />
                  </Field>
                  <Field label="Sort order">
                    <input type="number" name="sortOrder" defaultValue={sponsor.sortOrder} disabled={!canEdit} className={fieldClassName} />
                  </Field>
                </div>
                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
                  <Field label="Tagline">
                    <textarea name="tagline" defaultValue={sponsor.tagline} rows={3} disabled={!canEdit} className={`${fieldClassName} min-h-24 py-3`} />
                  </Field>
                  <Field label="Replace logo">
                    <div className="space-y-3">
                      {sponsor.logoUrl ? (
                        <img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} className="h-12 w-auto object-contain" />
                      ) : (
                        <p className="text-sm text-muted-foreground">No logo uploaded</p>
                      )}
                      <input type="file" name="logo" accept="image/*" disabled={!canEdit} className={`${fieldClassName} h-11 py-2`} />
                    </div>
                  </Field>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <label className="flex items-center gap-3 text-sm text-muted-foreground">
                    <input type="checkbox" name="visible" defaultChecked={sponsor.visible} disabled={!canEdit} />
                    Visible on public site
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <AdminSubmitButton idleLabel="Save sponsor" pendingLabel="Saving..." className="rounded-full px-5" disabled={!canEdit} />
                  </div>
                </div>
              </form>
              <form action={deleteSponsor} className="mt-3">
                <input type="hidden" name="id" value={sponsor.id} />
                <AdminSubmitButton idleLabel="Delete" pendingLabel="Deleting..." variant="destructive" className="rounded-full px-5" disabled={!canEdit} />
              </form>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const fieldClassName =
  "h-11 w-full rounded-xl border border-border bg-secondary/40 px-4 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60";
