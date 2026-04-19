"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/track", label: "Track" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground bg-background">
      <div className="flex items-center justify-between px-6 py-4 md:px-10">
        <Link
          href="/"
          aria-label="Gainables - home"
          className="font-display text-2xl leading-none tracking-[0.02em] text-foreground md:text-3xl"
        >
          GAINABLES
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`text-xs uppercase tracking-[0.24em] transition-colors duration-150 ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center md:flex">
          <Link
            href="/donate"
            className="inline-flex items-center justify-center border border-foreground bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.24em] text-background transition-colors duration-200 hover:bg-background hover:text-foreground"
          >
            Donate
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center text-foreground md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-foreground bg-background px-6 py-8 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="font-display text-4xl leading-none tracking-tight text-foreground"
              >
                {item.label.toUpperCase()}
              </Link>
            ))}
            <Link
              href="/donate"
              onClick={() => setIsMenuOpen(false)}
              className="mt-6 inline-flex w-full items-center justify-center border border-foreground bg-foreground px-6 py-4 text-xs font-medium uppercase tracking-[0.24em] text-background"
            >
              Donate
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
