import type { ReactNode } from "react";
import Link from "next/link";

import { AdminSubmitButton } from "@/components/admin/submit-button";
import { signOutAdmin } from "@/lib/actions/admin-auth";
import { getAdminSession } from "@/lib/admin/auth";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-12 lg:px-20">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Admin</p>
            <h1 className="text-xl font-medium">Ride for Mental Health</h1>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <nav className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full border border-border px-4 py-2 transition hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
            {session.status === "authorized" ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">{session.user.email}</span>
                <form action={signOutAdmin}>
                  <AdminSubmitButton idleLabel="Sign out" pendingLabel="Signing out..." variant="outline" />
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      {session.status !== "authorized" ? <AccessState status={session.status} email={session.user?.email} /> : null}
      {children}
    </div>
  );
}

function AccessState({ status, email }: { status: "unconfigured" | "anonymous" | "forbidden"; email?: string | null }) {
  const content = {
    unconfigured: {
      title: "Supabase is not configured yet.",
      body: "Add Supabase environment variables, service role credentials, and an admin allowlist to unlock the dashboard workflow.",
    },
    anonymous: {
      title: "Magic-link login is ready.",
      body: "Sign in from the overview page with an allowlisted email to unlock the admin editors.",
    },
    forbidden: {
      title: "Signed in, but not allowlisted.",
      body: `The current account${email ? ` (${email})` : ""} is not in ADMIN_ALLOWED_EMAILS.`,
    },
  }[status];

  return (
    <div className="border-b border-border bg-secondary/60">
      <div className="mx-auto max-w-7xl px-6 py-4 text-sm text-muted-foreground md:px-12 lg:px-20">
        <strong className="font-medium text-foreground">{content.title}</strong> {content.body}
      </div>
    </div>
  );
}
