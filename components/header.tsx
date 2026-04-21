"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { gsap, useGSAP } from "@/lib/gsap";

type NavItem = {
  href: string;
  label: string;
  /** Identifier used to match the IntersectionObserver target on the home page. */
  sectionId?: string;
  /** Pathname this link maps to when scroll-spy isn't relevant. */
  matchPathname?: string;
};

const navItems: NavItem[] = [
  { href: "/#ride", label: "Ride", sectionId: "ride" },
  { href: "/track", label: "Track", matchPathname: "/track" },
  { href: "/#sponsors", label: "Sponsors", sectionId: "sponsors" },
  { href: "/faq", label: "FAQ", matchPathname: "/faq" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

  const lastScroll = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const pathname = usePathname();
  const router = useRouter();

  // --- nav click handler (unchanged behavior) -----------------------------

  const handleNavClick =
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
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

      if (!targetHash && targetPath === "/" && pathname === "/") {
        event.preventDefault();
        setIsMenuOpen(false);
        window.history.replaceState(null, "", "/");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (targetHash && pathname === targetPath) {
        event.preventDefault();
        setIsMenuOpen(false);
        const el = document.getElementById(targetHash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState(null, "", `#${targetHash}`);
        } else {
          router.push(href);
        }
      }
    };

  // --- scroll-direction show/hide + scrolled state ------------------------

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
      const header = headerRef.current;
      if (!header) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          motionOk: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const shell = header.querySelector<HTMLElement>("[data-header-shell]");
          const brand = header.querySelector<HTMLElement>("[data-header-brand]");
          const items = header.querySelectorAll<HTMLElement>("[data-header-nav-item]");
          const donate = header.querySelector<HTMLElement>("[data-header-donate]");
          const mobileToggle = header.querySelector<HTMLElement>("[data-header-mobile-toggle]");

          if (ctx.conditions?.reduce) {
            gsap.set(
              [shell, brand, ...Array.from(items), donate, mobileToggle].filter(Boolean),
              { autoAlpha: 1, y: 0, x: 0, scale: 1 },
            );
            return;
          }

          const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.05 });

          tl.fromTo(
            shell,
            { autoAlpha: 0, y: -32, scale: 0.96 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.85 },
          )
            .fromTo(
              brand,
              { autoAlpha: 0, x: -12 },
              { autoAlpha: 1, x: 0, duration: 0.55 },
              "-=0.45",
            )
            .fromTo(
              items,
              { autoAlpha: 0, y: -10 },
              { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 },
              "-=0.4",
            )
            .fromTo(
              [donate, mobileToggle].filter(Boolean) as HTMLElement[],
              { autoAlpha: 0, scale: 0.75 },
              { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(2)" },
              "-=0.3",
            );
        },
      );

      return () => mm.revert();
    },
    { scope: headerRef },
  );

  // --- scroll spy: which section is currently in view ---------------------

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const ids = navItems.map((n) => n.sectionId).filter((id): id is string => Boolean(id));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }
        let bestId: string | null = null;
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        setActiveSection(bestRatio > 0 ? bestId : null);
      },
      {
        // Bias toward the upper third — section becomes "active" once it
        // reaches the top of the viewport, not the middle.
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // --- compute active index -----------------------------------------------

  const activeIndex = useMemo(() => {
    const byPath = navItems.findIndex((n) => n.matchPathname && n.matchPathname === pathname);
    if (byPath !== -1) return byPath;
    if (pathname === "/" && activeSection) {
      return navItems.findIndex((n) => n.sectionId === activeSection);
    }
    return -1;
  }, [pathname, activeSection]);

  // --- pill follows hover, falls back to active --------------------------

  const targetIndex = hoveredIndex ?? (activeIndex >= 0 ? activeIndex : null);

  useEffect(() => {
    const measure = () => {
      if (targetIndex == null) {
        setPillStyle(null);
        return;
      }
      const item = itemRefs.current[targetIndex];
      const parent = navRef.current;
      if (!item || !parent) return;
      const itemRect = item.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      setPillStyle({
        left: itemRect.left - parentRect.left,
        width: itemRect.width,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [targetIndex]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-3">
      <header
        ref={headerRef}
        data-scrolled={isScrolled}
        data-hidden={isHidden}
        className="pointer-events-auto w-full max-w-5xl will-change-transform transition-[transform,opacity] duration-500 data-[hidden=true]:-translate-y-[180%] data-[hidden=true]:opacity-0"
      >
        <div
          data-header-shell
          className={`relative flex items-center justify-between rounded-full pl-4 pr-2 py-2 transition-all duration-300 ${
            isScrolled
              ? "border border-border bg-background/85 shadow-[0_18px_50px_rgba(14,14,12,0.07)] backdrop-blur-lg"
              : "border border-border/60 bg-background/70 backdrop-blur-md"
          }`}
        >
          {/* Brand */}
          <Link
            data-header-brand
            href="/"
            onClick={handleNavClick("/")}
            className="flex items-center pl-1 pr-3 font-display text-xl tracking-tight text-foreground"
            aria-label="Gainables — home"
          >
            Gainables
          </Link>

          {/* Desktop nav with sliding pill */}
          <nav
            ref={navRef}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative hidden h-10 items-center md:flex"
          >
            {/* Sliding hover/active pill */}
            <span
              aria-hidden
              className={`absolute inset-y-1 rounded-full bg-secondary transition-[transform,width,opacity] duration-300 ease-out ${
                pillStyle ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transform: pillStyle ? `translateX(${pillStyle.left}px)` : undefined,
                width: pillStyle?.width ?? 0,
              }}
            />

            {navItems.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <Link
                  key={item.href}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  data-header-nav-item
                  href={item.href}
                  onClick={handleNavClick(item.href)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative z-10 flex h-full items-center px-4 text-sm transition-colors duration-200 ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {isActive ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 -bottom-0.5 mx-auto h-1 w-1 rounded-full bg-accent"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Donate */}
          <div data-header-donate className="hidden items-center gap-3 md:flex">
            <Link
              href="/donate"
              className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(14,14,12,0.18)]"
            >
              Donate
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            data-header-mobile-toggle
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen ? (
          <div className="mt-2 rounded-2xl border border-border bg-background/95 px-6 py-7 shadow-[0_30px_80px_rgba(14,14,12,0.12)] backdrop-blur-md md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item, idx) => {
                const isActive = idx === activeIndex;
                const intercept = handleNavClick(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(event) => {
                      intercept(event);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-xl px-3 py-3 font-display text-2xl tracking-tight transition-colors ${
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-foreground/85 hover:bg-secondary/60"
                    }`}
                  >
                    {item.label}
                    {isActive ? (
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                    ) : null}
                  </Link>
                );
              })}
              <Link
                href="/donate"
                onClick={() => setIsMenuOpen(false)}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
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
