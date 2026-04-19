import Link from "next/link";
import { Instagram, Mail } from "lucide-react";

import { EmailSignupForm } from "@/components/email-signup-form";

const links = [
  { href: "/about", label: "About" },
  { href: "/track", label: "Track" },
  { href: "/faq", label: "FAQ" },
  { href: "/donate", label: "Donate" },
];

const socials = [
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "mailto:hello@gainables.com", label: "Email", icon: Mail },
];

const COPYRIGHT_YEAR = 2026;

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="border-b border-background/20 px-6 py-20 md:px-10 md:py-24">
        <div className="container-shell flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-background/60">Stay updated</p>
            <h2 className="mt-4 font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl">
              ONE EMAIL.
              <br />
              ONE RIDE.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-background/70">
              A note when the campaign launches, one before the ride, one after. No funnel.
            </p>
          </div>
          <div className="w-full max-w-lg">
            <EmailSignupForm />
          </div>
        </div>
      </div>

      <div className="px-6 py-10 md:px-10">
        <div className="container-shell flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="font-display text-3xl leading-none tracking-[0.02em] md:text-4xl">
            GAINABLES
          </Link>
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.24em] text-background/70 transition-colors hover:text-background"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {socials.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center border border-background/40 text-background/80 transition hover:border-background hover:text-background"
              >
                <Icon size={16} />
              </Link>
            ))}
          </div>
        </div>
        <div className="container-shell mt-10 flex flex-col gap-3 border-t border-background/20 pt-6 text-xs uppercase tracking-[0.24em] text-background/50 md:flex-row md:items-center md:justify-between">
          <p>(c) {COPYRIGHT_YEAR} Gainables - All rights reserved</p>
          <p>hello@gainables.com</p>
        </div>
      </div>
    </footer>
  );
}
