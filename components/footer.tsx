import Link from "next/link";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";

const links = [
  { href: "/#ride", label: "Ride" },
  { href: "/track", label: "Track" },
  { href: "/#sponsors", label: "Sponsors" },
  { href: "/#faq", label: "FAQ" },
  { href: "/donate", label: "Donate" },
];

const socials = [
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "mailto:hello@gainables.com", label: "Email", icon: Mail },
];

const COPYRIGHT_YEAR = 2026;

export function Footer() {
  return (
    <footer className="grain-bg relative overflow-hidden bg-foreground px-6 pb-10 pt-20 text-background md:px-12 md:pt-24 lg:px-20">
      <div className="container-shell">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-6">
            <p className="ring-token border-white/15 bg-white/10 text-white/75">Presented by Gainables</p>
            <h2 className="max-w-2xl font-display text-5xl leading-[0.98] tracking-[-0.025em] md:text-7xl">
              Ride for Mental Health.
              <br />
              <span className="display-italic text-accent">Ottawa to Montreal.</span>
            </h2>
            <p className="max-w-xl text-base leading-7 text-background/70">
              One day, one route, one shared cause. Built as a live campaign hub with editable content, sponsor
              management, and rider updates.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            <Link
              href="/donate"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(200,226,92,0.4)]"
            >
              Donate now
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <div className="flex items-center gap-3">
              {socials.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-background/80 transition hover:border-accent hover:text-accent"
                >
                  <Icon size={16} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <p className="text-xs uppercase tracking-[0.24em] text-background/55">
            © {COPYRIGHT_YEAR} Gainables - All rights reserved
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-background/70">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-background">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-background/55 md:text-right">hello@gainables.com</p>
        </div>
      </div>
    </footer>
  );
}
