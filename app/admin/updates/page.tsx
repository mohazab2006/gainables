import { connection } from "next/server";

import { AdminField, adminFieldClassName } from "@/components/admin/field";
import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { createRideUpdate, deleteRideUpdate, updateRideUpdate } from "@/lib/actions/admin";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getAdminRideUpdates } from "@/lib/content";

type AdminUpdatesPageProps = {
  searchParams?: AdminSearchParams;
};

export default async function AdminUpdatesPage({ searchParams }: AdminUpdatesPageProps) {
  await connection();
  await requireAuthorizedAdmin();
  const updates = await getAdminRideUpdates();
  const canEdit = true;
  const { message, type } = await resolveAdminFlashState(searchParams);

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Ride updates</p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight">Post updates to the ride-day feed.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Each entry appears in the public updates feed — short messages, photos, or video from the road. These
            posts <strong>don&apos;t move the tracker</strong>: live progress and location are driven by GPS telemetry
            from the rider. Use ISO datetimes when backfilling historical entries.
          </p>
          <AdminFlashBanner message={message} type={type} className="mt-6" />
        </section>

        <form action={createRideUpdate} className="rounded-[2rem] border border-border bg-background p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Post new update</p>
          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <AdminField label="Location label">
              <input
                name="location"
                required
                disabled={!canEdit}
                placeholder="Hawkesbury pit stop"
                className={adminFieldClassName}
              />
            </AdminField>
            <AdminField label="Created at">
              <input type="datetime-local" name="createdAt" disabled={!canEdit} className={adminFieldClassName} />
            </AdminField>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Free-text label shown in the feed — it does not change tracker progress.
          </p>
          <div className="mt-4">
            <AdminField label="Message">
              <textarea name="message" rows={4} required disabled={!canEdit} className={`${adminFieldClassName} min-h-28 py-3`} />
            </AdminField>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <AdminField label="Photo or video">
              <input type="file" name="media" accept="image/*,video/*" disabled={!canEdit} className={`${adminFieldClassName} h-11 py-2`} />
            </AdminField>
            <AdminField label="Media alt / caption">
              <input name="mediaAlt" disabled={!canEdit} className={adminFieldClassName} placeholder="Rider rolling through Hawkesbury." />
            </AdminField>
          </div>
          <div className="mt-6">
            <AdminSubmitButton idleLabel="Post update" pendingLabel="Posting..." className="rounded-full px-5" disabled={!canEdit} />
          </div>
        </form>

        <section className="space-y-4">
          {updates.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-border bg-background/50 p-8 text-center text-sm text-muted-foreground">
              No ride updates yet. Use the form above to post the first update — it will appear here and on the public feed.
            </div>
          ) : null}
          {updates.map((update) => (
            <article key={update.id} className="rounded-[1.75rem] border border-border bg-background p-6">
              <form action={updateRideUpdate}>
                <input type="hidden" name="id" value={update.id} />
                <input type="hidden" name="existingMediaUrl" value={update.mediaUrl ?? ""} />
                <input type="hidden" name="existingMediaKind" value={update.mediaKind ?? ""} />
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                  <AdminField label="Location label">
                    <input name="location" defaultValue={update.location} required disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
                  <AdminField label="Created at">
                    <input type="datetime-local" name="createdAt" defaultValue={toDateTimeLocal(update.createdAt)} disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
                </div>
                <div className="mt-4">
                  <AdminField label="Message">
                    <textarea name="message" defaultValue={update.message} rows={4} required disabled={!canEdit} className={`${adminFieldClassName} min-h-28 py-3`} />
                  </AdminField>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
                  <AdminField label="Replace photo or video">
                    <input type="file" name="media" accept="image/*,video/*" disabled={!canEdit} className={`${adminFieldClassName} h-11 py-2`} />
                  </AdminField>
                  <AdminField label="Media alt / caption">
                    <input
                      name="mediaAlt"
                      defaultValue={update.mediaAlt ?? ""}
                      disabled={!canEdit}
                      className={adminFieldClassName}
                      placeholder="Support crew update from the road."
                    />
                  </AdminField>
                </div>
                {update.mediaUrl ? (
                  <div className="mt-4 rounded-2xl border border-border bg-secondary/30 p-4 text-sm">
                    <p className="font-medium">Current media</p>
                    <p className="mt-1 break-all text-muted-foreground">{update.mediaKind} - {update.mediaUrl}</p>
                    <label className="mt-3 flex items-center gap-3">
                      <input type="checkbox" name="clearMedia" className="h-4 w-4 rounded border-border" />
                      Clear current media
                    </label>
                  </div>
                ) : null}
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
