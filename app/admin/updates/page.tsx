import { connection } from "next/server";

import { AdminField, adminFieldClassName } from "@/components/admin/field";
import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { createRideUpdate, deleteRideUpdate, updateRideUpdate } from "@/lib/actions/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getRideUpdates } from "@/lib/content";

type AdminUpdatesPageProps = {
  searchParams?: AdminSearchParams;
};

export default async function AdminUpdatesPage({ searchParams }: AdminUpdatesPageProps) {
  await connection();
  const updates = await getRideUpdates();
  const session = await getAdminSession();
  const canEdit = session.status === "authorized";
  const { message, type } = await resolveAdminFlashState(searchParams);

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
          <AdminFlashBanner message={message} type={type} className="mt-6" />
        </section>

        <form action={createRideUpdate} className="rounded-[2rem] border border-border bg-background p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Post new update</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <AdminField label="Location">
              <input name="location" required disabled={!canEdit} className={adminFieldClassName} />
            </AdminField>
            <AdminField label="KM completed">
              <input type="number" step="0.01" name="kmCompleted" required disabled={!canEdit} className={adminFieldClassName} />
            </AdminField>
            <AdminField label="Next checkpoint">
              <input name="nextCheckpoint" required disabled={!canEdit} className={adminFieldClassName} />
            </AdminField>
            <AdminField label="Latitude">
              <input type="number" step="0.000001" name="lat" disabled={!canEdit} className={adminFieldClassName} />
            </AdminField>
            <AdminField label="Longitude">
              <input type="number" step="0.000001" name="lng" disabled={!canEdit} className={adminFieldClassName} />
            </AdminField>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <AdminField label="Message">
              <textarea name="message" rows={4} required disabled={!canEdit} className={`${adminFieldClassName} min-h-28 py-3`} />
            </AdminField>
            <AdminField label="Created at">
              <input type="datetime-local" name="createdAt" disabled={!canEdit} className={adminFieldClassName} />
            </AdminField>
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
                  <AdminField label="Location">
                    <input name="location" defaultValue={update.location} required disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
                  <AdminField label="KM completed">
                    <input type="number" step="0.01" name="kmCompleted" defaultValue={update.kmCompleted} required disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
                  <AdminField label="Next checkpoint">
                    <input name="nextCheckpoint" defaultValue={update.nextCheckpoint} required disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
                  <AdminField label="Latitude">
                    <input type="number" step="0.000001" name="lat" defaultValue={update.lat} disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
                  <AdminField label="Longitude">
                    <input type="number" step="0.000001" name="lng" defaultValue={update.lng} disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                  <AdminField label="Message">
                    <textarea name="message" defaultValue={update.message} rows={4} required disabled={!canEdit} className={`${adminFieldClassName} min-h-28 py-3`} />
                  </AdminField>
                  <AdminField label="Created at">
                    <input type="datetime-local" name="createdAt" defaultValue={toDateTimeLocal(update.createdAt)} disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
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
function toDateTimeLocal(value: string) {
  return new Date(value).toISOString().slice(0, 16);
}
