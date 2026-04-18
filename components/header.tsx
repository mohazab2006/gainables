"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick =
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Only intercept primary-button clicks without modifier keys.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const hashIndex = href.indexOf("#");
      const targetPath = hashIndex === -1 ? href : href.slice(0, hashIndex) || "/";
      const targetHash = hashIndex === -1 ? "" : href.slice(hashIndex + 1);

      // Home link: if already on home, scroll to top instead of no-op.
      if (!targetHash && targetPath === "/" && pathname === "/") {
        event.preventDefault();
        setIsMenuOpen(false);
        window.history.replaceState(null, "", "/");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Hash link: always re-scroll when already on the target route,
      // even if the hash is already set in the URL.
      if (targetHash && pathname === targetPath) {
        event.preventDefault();
        setIsMenuOpen(false);
        const el = document.getElementById(targetHash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // Keep the URL hash in sync without triggering a jump.
          window.history.replaceState(null, "", `#${targetHash}`);
        } else {
          // Fallback: let the router handle it (e.g. if section renders later).
          router.push(href);
        }
      }
    };

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
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-3">
      <header
        ref={headerRef}
        data-scrolled={isScrolled}
        data-hidden={isHidden}
        className="pointer-events-auto w-full max-w-5xl will-change-transform transition-[transform,opacity] duration-500 data-[hidden=true]:-translate-y-[180%] data-[hidden=true]:opacity-0"
      >
        <div
          className={`relative flex items-center justify-between rounded-full pl-5 pr-2 py-2 transition-all duration-300 ${
          isScrolled
            ? "border border-border bg-background/85 shadow-[0_18px_50px_rgba(14,14,12,0.07)] backdrop-blur-lg"
            : "border border-border/60 bg-background/70 backdrop-blur-md"
        }`}
      >
        <Link
          href="/"
          onClick={handleNavClick("/")}
          className="font-display text-xl tracking-tight text-foreground transition-colors duration-300"
        >
          Gainables
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick(item.href)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/donate"
            className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(14,14,12,0.18)]"
          >
            Donate
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="mt-2 rounded-2xl border border-border bg-background/95 px-6 py-7 shadow-[0_30px_80px_rgba(14,14,12,0.12)] backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-5">
            {navItems.map((item) => {
              const intercept = handleNavClick(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-display text-2xl tracking-tight text-foreground"
                  onClick={(event) => {
                    intercept(event);
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
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
    </div>
  );
}
