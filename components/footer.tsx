import Link from "next/link";

const navLinks = [
  { href: "/#ride", label: "Ride" },
  { href: "/track", label: "Track" },
  { href: "/#sponsors", label: "Sponsors" },
  { href: "/faq", label: "FAQ" },
  { href: "/donate", label: "Donate" },
];

const COPYRIGHT_YEAR = 2026;

export function Footer() {
  return (
    <footer className="bg-background px-6 py-10 text-muted-foreground md:px-12 lg:px-20">
      <div className="container-shell flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground/80">
          © {COPYRIGHT_YEAR} Gainables · Ottawa → Montreal
        </p>

        <nav
          aria-label="Footer"
          className="grid grid-cols-3 gap-x-6 gap-y-3 text-xs uppercase tracking-[0.24em] md:flex md:gap-x-6 md:gap-y-0"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
