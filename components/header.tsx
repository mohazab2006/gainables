"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { gsap, useGSAP } from "@/lib/gsap";

const navItems = [
  { href: "/#ride", label: "Ride" },
  { href: "/track", label: "Track" },
  { href: "/#sponsors", label: "Sponsors" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScroll = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 40);
      const delta = y - lastScroll.current;
      if (y > 240 && delta > 6) setIsHidden(true);
      else if (delta < -4) setIsHidden(false);
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    () => {
      if (!headerRef.current) return;
      gsap.from(headerRef.current, { y: -24, autoAlpha: 0, duration: 0.7, ease: "power3.out", delay: 0.1 });
    },
    { scope: headerRef },
  );

  return (
    <header
      ref={headerRef}
      data-scrolled={isScrolled}
      data-hidden={isHidden}
      className="fixed left-1/2 top-4 z-50 w-[94%] max-w-5xl -translate-x-1/2 transition-[transform,opacity] duration-500 will-change-transform data-[hidden=true]:-translate-y-[180%] data-[hidden=true]:opacity-0"
    >
      <div
        className={`relative flex items-center justify-between rounded-full pl-5 pr-2 py-2 transition-all duration-300 ${
          isScrolled
            ? "border border-border bg-background/85 shadow-[0_18px_50px_rgba(14,14,12,0.07)] backdrop-blur-lg"
            : "border border-white/15 bg-white/5 backdrop-blur-md"
        }`}
      >
        <Link
          href="/"
          className={`font-display text-xl tracking-tight transition-colors duration-300 ${
            isScrolled ? "text-foreground" : "text-white"
          }`}
        >
          Gainables
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${
                isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/donate"
            className={`group inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
              isScrolled
                ? "bg-foreground text-background hover:-translate-y-0.5"
                : "bg-accent text-foreground hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(200,226,92,0.5)]"
            }`}
          >
            Donate
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden ${
            isScrolled ? "text-foreground hover:bg-secondary" : "text-white hover:bg-white/10"
          }`}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="mt-2 rounded-2xl border border-border bg-background/95 px-6 py-7 shadow-[0_30px_80px_rgba(14,14,12,0.12)] backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-2xl tracking-tight text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/donate"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
            >
              Donate now
              <ArrowUpRight size={14} />
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
