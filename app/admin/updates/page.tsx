import type { ReactNode } from "react";

import { connection } from "next/server";

import { AdminSubmitButton } from "@/components/admin/submit-button";
import { createRideUpdate, deleteRideUpdate, updateRideUpdate } from "@/lib/actions/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { getRideUpdates } from "@/lib/content";

type AdminUpdatesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUpdatesPage({ searchParams }: AdminUpdatesPageProps) {
  await connection();
  const params = searchParams ? await searchParams : {};
  const updates = await getRideUpdates();
  const session = await getAdminSession();
  const canEdit = session.status === "authorized";
  const message = typeof params.message === "string" ? params.message : null;
  const type = typeof params.type === "string" ? params.type : null;

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Ride updates</p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight">Post ride-day location updates and progress markers.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Each entry powers the public updates feed and the latest tracker status. Use ISO datetimes when backfilling
            historical entries.
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

        <form action={createRideUpdate} className="rounded-[2rem] border border-border bg-background p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Post new update</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Field label="Location">
              <input name="location" required disabled={!canEdit} className={fieldClassName} />
            </Field>
            <Field label="KM completed">
              <input type="number" step="0.01" name="kmCompleted" required disabled={!canEdit} className={fieldClassName} />
            </Field>
            <Field label="Next checkpoint">
              <input name="nextCheckpoint" required disabled={!canEdit} className={fieldClassName} />
            </Field>
            <Field label="Latitude">
              <input type="number" step="0.000001" name="lat" disabled={!canEdit} className={fieldClassName} />
            </Field>
            <Field label="Longitude">
              <input type="number" step="0.000001" name="lng" disabled={!canEdit} className={fieldClassName} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <Field label="Message">
              <textarea name="message" rows={4} required disabled={!canEdit} className={`${fieldClassName} min-h-28 py-3`} />
            </Field>
            <Field label="Created at">
              <input type="datetime-local" name="createdAt" disabled={!canEdit} className={fieldClassName} />
            </Field>
          </div>
          <div className="mt-6">
            <AdminSubmitButton idleLabel="Post update" pendingLabel="Posting..." className="rounded-full px-5" disabled={!canEdit} />
          </div>
        </form>

        <section className="space-y-4">
          {updates.map((update) => (
            <article key={update.id} className="rounded-[1.75rem] border border-border bg-background p-6">
              <form action={updateRideUpdate}>
                <input type="hidden" name="id" value={update.id} />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <Field label="Location">
                    <input name="location" defaultValue={update.location} required disabled={!canEdit} className={fieldClassName} />
                  </Field>
                  <Field label="KM completed">
                    <input type="number" step="0.01" name="kmCompleted" defaultValue={update.kmCompleted} required disabled={!canEdit} className={fieldClassName} />
                  </Field>
                  <Field label="Next checkpoint">
                    <input name="nextCheckpoint" defaultValue={update.nextCheckpoint} required disabled={!canEdit} className={fieldClassName} />
                  </Field>
                  <Field label="Latitude">
                    <input type="number" step="0.000001" name="lat" defaultValue={update.lat} disabled={!canEdit} className={fieldClassName} />
                  </Field>
                  <Field label="Longitude">
                    <input type="number" step="0.000001" name="lng" defaultValue={update.lng} disabled={!canEdit} className={fieldClassName} />
                  </Field>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                  <Field label="Message">
                    <textarea name="message" defaultValue={update.message} rows={4} required disabled={!canEdit} className={`${fieldClassName} min-h-28 py-3`} />
                  </Field>
                  <Field label="Created at">
                    <input type="datetime-local" name="createdAt" defaultValue={toDateTimeLocal(update.createdAt)} disabled={!canEdit} className={fieldClassName} />
                  </Field>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <AdminSubmitButton idleLabel="Save update" pendingLabel="Saving..." className="rounded-full px-5" disabled={!canEdit} />
                </div>
              </form>
              <form action={deleteRideUpdate} className="mt-3">
                <input type="hidden" name="id" value={update.id} />
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

function toDateTimeLocal(value: string) {
  return new Date(value).toISOString().slice(0, 16);
}

const fieldClassName =
  "h-11 w-full rounded-xl border border-border bg-secondary/40 px-4 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60";
