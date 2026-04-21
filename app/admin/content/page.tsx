import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Code2 } from "lucide-react";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";

type AdminContentPageProps = {
  searchParams?: AdminSearchParams;
};

type SectionCard = {
  href: string;
  title: string;
  /** Plain-English explanation of what the editor controls. */
  summary: string;
  /** Where this appears on the public site. */
  appearsOn: string;
  /** Badge shown when there's no typed editor yet. */
  status?: "typed" | "raw";
};

const sections: SectionCard[] = [
  {
    href: "/admin/content/hero",
    title: "Hero",
    summary: "Top of the homepage — the small eyebrow label and the description paragraph under the wordmark.",
    appearsOn: "Homepage top",
    status: "typed",
  },
  {
    href: "/admin/content/why-it-matters",
    title: "Mission",
    summary: "The mission block — headline and body paragraph explaining why the ride exists.",
    appearsOn: "Homepage · mid-page",
    status: "typed",
  },
  {
    href: "/admin/content/media",
    title: "Contact",
    summary: "The 'Stay close to the ride' block — intro body copy and the list of social / contact links.",
    appearsOn: "Homepage · bottom",
    status: "typed",
  },
  {
    href: "/admin/content/donate",
    title: "Donate",
    summary: "Story paragraph, the three impact tiles, and the 'Where funds go' allocation rows.",
    appearsOn: "/donate page",
    status: "typed",
  },
  {
    href: "/admin/content/raw?section=route",
    title: "Route",
    summary: "Total distance, checkpoints, polyline, and map centre. Advanced — edit as JSON.",
    appearsOn: "/track page + homepage timeline",
    status: "raw",
  },
];

export default async function AdminContentHubPage({ searchParams }: AdminContentPageProps) {
  await connection();
  await requireAuthorizedAdmin();
  const { message, type } = await resolveAdminFlashState(searchParams);

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-4xl border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Content</p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight">Edit what appears on the public site.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Pick a section below. Each one opens a plain-English form — no JSON — with hints describing what every
            field controls and where it appears. Saves publish immediately.
          </p>
          <AdminFlashBanner message={message} type={type} className="mt-6" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/content/settings"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-foreground"
            >
              Donation &amp; tracker settings
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/admin/content/raw"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground transition hover:border-foreground hover:text-foreground"
            >
              <Code2 size={14} />
              Advanced · raw JSON
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col justify-between gap-4 rounded-[1.75rem] border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-[0_12px_40px_rgba(14,14,12,0.06)]"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl tracking-tight">{section.title}</h2>
                  {section.status === "raw" ? (
                    <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Raw JSON
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.summary}</p>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-4 text-xs">
                <span className="uppercase tracking-[0.18em] text-muted-foreground">{section.appearsOn}</span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground/80 transition group-hover:text-foreground">
                  Edit
                  <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
