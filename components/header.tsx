"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/#ride", label: "Ride" },
  { href: "/track", label: "Track" },
  { href: "/#sponsors", label: "Sponsors" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-1/2 top-4 z-50 w-[92%] max-w-5xl -translate-x-1/2 transition-all duration-300 ${
        isScrolled ? "rounded-full border border-border bg-background/85 backdrop-blur-md" : "bg-transparent"
      }`}
      style={{
        boxShadow: isScrolled
          ? "rgba(17, 17, 17, 0.04) 0px 0px 0px 1px, rgba(17, 17, 17, 0.05) 0px 18px 50px"
          : "none",
      }}
    >
      <div className="flex items-center justify-between transition-all duration-300 px-2 pl-5 py-2">
        <Link href="/" className={`text-lg font-medium tracking-tight transition-colors duration-300 ${isScrolled ? "text-foreground" : "text-white"}`}>
          Gainables
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/75 hover:text-white"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/donate"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${isScrolled ? "bg-foreground text-background hover:opacity-80" : "bg-white text-foreground hover:bg-white/90"}`}
          >
            Donate
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`transition-colors md:hidden ${isScrolled ? "text-foreground" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background px-6 py-8 md:hidden rounded-b-2xl">
          <nav className="flex flex-col gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/donate"
              className="mt-4 bg-foreground px-5 py-3 text-center text-sm font-medium text-background rounded-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Donate
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
