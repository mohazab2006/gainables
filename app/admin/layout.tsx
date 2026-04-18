import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { signOutAdmin } from "@/lib/actions/admin-auth";
import { getAdminSession } from "@/lib/admin/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  // Any active Supabase session — allowlisted or not — can sign out.
  const isSignedIn = session.status === "authorized" || session.status === "forbidden";
  const showNav = session.status === "authorized";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-12 lg:px-20">
          <Link href="/admin" className="flex flex-col leading-tight">
            <span className="text-[0.68rem] uppercase tracking-[0.32em] text-muted-foreground">Admin</span>
            <span className="font-display text-lg tracking-tight">Ride for Mental Health</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {showNav ? <AdminNav /> : null}

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
              >
                View site
                <ArrowUpRight size={14} />
              </Link>

              {isSignedIn ? (
                <form action={signOutAdmin}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
