import type { ReactNode } from "react";
import Link from "next/link";

import { getAdminSession } from "@/lib/admin/auth";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/faqs", label: "FAQs" },
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
          <nav className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full border border-border px-4 py-2 transition hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
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
      body: "Add Supabase environment variables and an admin allowlist to unlock the dashboard workflow.",
    },
    anonymous: {
      title: "Magic-link login is ready to connect.",
      body: "Once Supabase is configured, add a login action or send an OTP to an allowlisted email to access the dashboard.",
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
