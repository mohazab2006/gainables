import type { ReactNode } from "react";
import Link from "next/link";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
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
      {children}
    </div>
  );
}
