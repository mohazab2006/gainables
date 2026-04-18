import Link from "next/link";

import { getAdminState } from "@/lib/admin";

export default async function AdminPage() {
  const adminState = await getAdminState();

  return (
    <main className="min-h-screen bg-background px-6 pb-24 pt-36 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Admin</p>
        <h1 className="mt-4 text-5xl font-medium tracking-tight md:text-7xl">Campaign control room.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          Supabase auth, content editing, sponsor uploads, FAQs, and ride updates are scaffolded. Connect the
          environment variables and use an allowlisted email to activate the full dashboard flow.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-border bg-secondary/60 p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Auth status</p>
            <h2 className="mt-4 text-2xl font-medium">{adminState.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{adminState.description}</p>
          </div>
          <div className="rounded-[2rem] border border-border bg-foreground p-8 text-background">
            <p className="text-sm uppercase tracking-[0.24em] text-background/60">Next actions</p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-background/75">
              <p>1. Add Supabase and Mapbox environment variables.</p>
              <p>2. Run the migration in `supabase/migrations/0001_init.sql`.</p>
              <p>3. Allowlist admin emails with `ADMIN_ALLOWED_EMAILS`.</p>
            </div>
            <Link
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:opacity-85"
            >
              Open Supabase
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
