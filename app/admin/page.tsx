import { TrackerReadiness } from "@/components/operations/tracker-readiness";
import Link from "next/link";
import { connection } from "next/server";

import { AdminSubmitButton } from "@/components/admin/submit-button";
import { getAdminState } from "@/lib/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { signInAdmin, signOutAdmin } from "@/lib/actions/admin-auth";
import { getOverlandSetupLink, getTrackerReadiness, hasSupabaseEnv } from "@/lib/env";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await connection();
  const params = searchParams ? await searchParams : {};
  const adminState = await getAdminState();
  const session = await getAdminSession();
  const readiness = getTrackerReadiness();
  const message = typeof params.message === "string" ? params.message : null;
  const type = typeof params.type === "string" ? params.type : null;
  const overlandSetupLink = getOverlandSetupLink();

  return (
    <main className="min-h-screen bg-background px-6 pb-24 pt-36 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Admin</p>
        <h1 className="mt-4 text-5xl font-medium tracking-tight md:text-7xl">Campaign control room.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          Manage live site content, sponsor records, FAQs, and ride-day updates from one place. Admin writes use
          Supabase directly and invalidate the public pages after each save.
        </p>
        {message ? (
          <div
            className={`mt-8 rounded-[1.5rem] border px-5 py-4 text-sm ${
              type === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-border bg-secondary/60 text-foreground"
            }`}
          >
            {message}
          </div>
        ) : null}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-border bg-secondary/60 p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Auth status</p>
            <h2 className="mt-4 text-2xl font-medium">{adminState.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{adminState.description}</p>
            {session.status === "authorized" ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.25rem] border border-border bg-background p-4 text-sm">
                  Signed in as <span className="font-medium">{session.user.email}</span>
                </div>
                <form action={signOutAdmin}>
                  <AdminSubmitButton idleLabel="Sign out" pendingLabel="Signing out..." variant="outline" />
                </form>
              </div>
            ) : hasSupabaseEnv() ? (
              <form action={signInAdmin} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Allowlisted admin email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@gainables.com"
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-foreground"
                  />
                </label>
                <AdminSubmitButton idleLabel="Send magic link" pendingLabel="Sending..." />
              </form>
            ) : null}
          </div>
          <div className="rounded-[2rem] border border-border bg-foreground p-8 text-background">
            <p className="text-sm uppercase tracking-[0.24em] text-background/60">Operations</p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-background/75">
              <p>1. Configure Supabase and run `supabase/migrations/0001_init.sql`.</p>
              <p>2. Set `ADMIN_ALLOWED_EMAILS`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, and `RIDER_TOKEN`.</p>
              <p>3. Deploy the ingest function, send the rider setup link, then use the edit screens to publish content and ride-day updates.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:opacity-85"
              >
                Open Supabase
              </Link>
              <Link
                href="/admin/content"
                className="inline-flex rounded-full border border-background/20 px-6 py-3 text-sm font-medium text-background transition hover:bg-background/10"
              >
                Open editors
              </Link>
              <Link
                href="/track"
                className="inline-flex rounded-full border border-background/20 px-6 py-3 text-sm font-medium text-background transition hover:bg-background/10"
              >
                Open tracker
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <TrackerReadiness
            items={readiness}
            title="Production readiness is surfaced here before ride day."
            description="This dashboard now calls out the exact environment dependencies behind the live tracker stack so deployment gaps are visible before you hand the link to the rider or supporters."
          />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-border bg-background p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Rider setup link</p>
            <h2 className="mt-4 text-2xl font-medium tracking-tight">Send this to the lead rider once the secrets are live.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              The deep link preloads the ingest endpoint, rider token, and device ID into Overland so the rider only has to confirm permissions and tap start.
            </p>
            <textarea
              readOnly
              value={overlandSetupLink ?? "Set NEXT_PUBLIC_SUPABASE_URL and RIDER_TOKEN to generate the final Overland setup link."}
              className="mt-5 min-h-36 w-full rounded-[1.25rem] border border-border bg-secondary/40 px-4 py-4 font-mono text-xs outline-none"
            />
          </section>
          <section className="rounded-[2rem] border border-border bg-secondary/50 p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Subscriber ops</p>
            <h2 className="mt-4 text-2xl font-medium tracking-tight">Campaign signups are now visible in admin.</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Review the current list, export CSV for follow-up, and confirm the email capture flow is storing records after you connect Supabase.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/subscribers"
                className="inline-flex rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition hover:border-foreground"
              >
                Open subscribers
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
