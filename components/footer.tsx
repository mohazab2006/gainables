import Link from "next/link";

const links = [
  { href: "/#ride", label: "Ride" },
  { href: "/track", label: "Track" },
  { href: "/#sponsors", label: "Sponsors" },
  { href: "/#faq", label: "FAQ" },
  { href: "/donate", label: "Donate" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-12 md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Gainables</p>
          <h2 className="max-w-xl text-3xl font-medium tracking-tight md:text-4xl">
            Ride for Mental Health. Ottawa to Montreal. One day, one route, one shared cause.
          </h2>
        </div>
        <div className="space-y-4">
          <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">
            Built for a live campaign workflow with editable content, sponsor management, and rider updates.
          </p>
        </div>
      </div>
    </footer>
  );
}
