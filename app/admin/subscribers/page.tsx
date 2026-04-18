import Link from "next/link";
import { connection } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { getSubscribers } from "@/lib/content";

export default async function AdminSubscribersPage() {
  await connection();
  const session = await getAdminSession();
  const canView = session.status === "authorized";
  const subscribers = canView ? await getSubscribers() : [];

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Subscribers</p>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-medium tracking-tight">Review campaign signups and export the list.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                This view is read-only. Use the CSV export for handoff to email or CRM tools after the campaign.
              </p>
            </div>
            {canView ? (
              <Link
                href="/admin/subscribers/export"
                className="inline-flex rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition hover:border-foreground"
              >
                Download CSV
              </Link>
            ) : null}
          </div>
        </section>

        {!canView ? (
          <section className="rounded-[1.75rem] border border-border bg-background p-6 text-sm text-muted-foreground">
            Sign in with an allowlisted admin account to view subscriber records.
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Stat label="Total subscribers" value={String(subscribers.length)} />
              <Stat
                label="Most recent signup"
                value={subscribers[0] ? new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(subscribers[0].createdAt)) : "No signups yet"}
              />
              <Stat
                label="Tracked source"
                value={subscribers.some((subscriber) => Boolean(subscriber.source)) ? "Captured" : "Pending"}
              />
            </section>

            <section className="overflow-hidden rounded-[1.75rem] border border-border bg-background">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-secondary/40 text-left text-muted-foreground">
                    <tr>
                      <th className="px-5 py-4 font-medium">Email</th>
                      <th className="px-5 py-4 font-medium">Source</th>
                      <th className="px-5 py-4 font-medium">Signed up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {subscribers.length ? (
                      subscribers.map((subscriber) => (
                        <tr key={subscriber.id}>
                          <td className="px-5 py-4 font-medium text-foreground">{subscriber.email}</td>
                          <td className="px-5 py-4 text-muted-foreground">{subscriber.source ?? "website"}</td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" }).format(
                              new Date(subscriber.createdAt),
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">
                          No subscribers yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[1.75rem] border border-border bg-background p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-4 text-2xl font-medium tracking-tight">{value}</p>
    </article>
  );
}
