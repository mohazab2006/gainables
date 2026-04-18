"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

function isActive(pathname: string, href: string) {
  // Dashboard only matches exactly; every other tab matches its prefix.
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm">
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-full bg-foreground px-4 py-2 font-medium text-background shadow-[0_10px_30px_rgba(14,14,12,0.18)]"
                : "rounded-full px-4 py-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
