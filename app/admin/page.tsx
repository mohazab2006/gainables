import { connection } from "next/server";
import Link from "next/link";
import { ArrowUpRight, FileText, HelpCircle, Mail, Radio, Sparkles } from "lucide-react";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { RideModeCard } from "@/components/admin/ride-mode-card";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { TrackerReadiness } from "@/components/operations/tracker-readiness";
import { setTrackerStatus } from "@/lib/actions/admin";
import { signInAdmin, signOutAdmin } from "@/lib/actions/admin-auth";
import { getAdminSession } from "@/lib/admin/auth";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getSiteContent } from "@/lib/content";
import { getOverlandSetupLink, getTrackerReadiness, hasSupabaseEnv } from "@/lib/env";

type AdminPageProps = {
  searchParams?: AdminSearchParams;
};

const quickActions = [
  {
    href: "/admin/content",
    label: "Site content",
    description: "Hero, mission, contact, donate copy, route data, and ride-day settings.",
    icon: FileText,
  },
  {
    href: "/admin/sponsors",
    label: "Sponsors",
    description: "Add, edit, reorder, and upload logos for partners.",
    icon: Sparkles,
  },
  {
    href: "/admin/updates",
    label: "Ride updates",
    description: "Post live progress on ride day — location, distance, notes.",
    icon: Radio,
  },
  {
    href: "/admin/faqs",
    label: "FAQs",
    description: "Questions and answers shown on the public site.",
    icon: HelpCircle,
  },
  {
    href: "/admin/subscribers",
    label: "Subscribers",
    description: "Review email signups and export the list as CSV.",
    icon: Mail,
  },
];

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await connection();
  const session = await getAdminSession();
  const readiness = getTrackerReadiness();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const overlandSetupLink = getOverlandSetupLink();

  // 1) Supabase not configured — show setup checklist, no login form.
  if (!hasSupabaseEnv() || session.status === "unconfigured") {
    return <UnconfiguredView message={message} type={type} />;
  }

  // 2) Signed in but not on the allowlist — focused error state.
  if (session.status === "forbidden") {
    return <ForbiddenView email={session.user.email ?? ""} message={message} type={type} />;
  }

  // 3) Anonymous — clean sign-in screen.
  if (session.status === "anonymous") {
    return <SignInView message={message} type={type} />;
  }

  // 4) Authorized — the real dashboard.
  const content = await getSiteContent();

  return (
    <main className="px-6 pb-24 pt-12 md:px-12 md:pt-16 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <AdminFlashBanner message={message} type={type} className="mb-8" />

        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Dashboard</p>
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Welcome back, <span className="display-italic">{firstName(session.user.email ?? "there")}</span>.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Manage live site content, sponsors, FAQs, and ride-day updates. Changes publish to the public site
            immediately after saving.
          </p>
        </div>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Quick actions</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-[0_20px_60px_rgba(14,14,12,0.06)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
                      <Icon size={18} />
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    />
                  </div>
                  <div>
                    <p className="font-display text-xl tracking-tight">{action.label}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-10">
          <RideModeCard current={content.trackerStatus} action={setTrackerStatus} />
        </div>

        <div className="mt-10">
          <TrackerReadiness
            items={readiness}
            title="Ride-day readiness at a glance."
            description="Environment dependencies behind the live tracker, ingest, and email flows. Green means the deploy is ready to hand to the rider."
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-4xl border border-border bg-background p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Rider setup link</p>
            <h2 className="mt-4 font-display text-2xl tracking-tight">
              Send this to the lead rider when secrets are live.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              The deep link preloads the ingest endpoint, rider token, and device ID into Overland so the rider only has
              to confirm permissions and tap start.
            </p>
            <textarea
              readOnly
              value={
                overlandSetupLink ??
                "Set NEXT_PUBLIC_SUPABASE_URL and RIDER_TOKEN to generate the final Overland setup link."
              }
              className="mt-5 min-h-32 w-full rounded-[1.25rem] border border-border bg-secondary/40 px-4 py-4 font-mono text-xs leading-6 outline-none"
            />
          </section>

          <section className="rounded-4xl border border-border bg-foreground p-8 text-background">
            <p className="text-xs uppercase tracking-[0.28em] text-background/60">Signed in</p>
            <h2 className="mt-4 font-display text-2xl tracking-tight">{session.user.email}</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-background/70">
              You&apos;re authorized to edit the public site. Use the nav above to jump to any editor. Sign out from the
              top-right when you&apos;re done.
            </p>
            <form action={signOutAdmin} className="mt-6">
              <AdminSubmitButton idleLabel="Sign out" pendingLabel="Signing out..." variant="secondary" />
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function firstName(email: string) {
  const local = email.split("@")[0] ?? email;
  const segment = local.split(/[._+-]/)[0] ?? local;
  if (!segment) return "there";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

// --- sign-in view ---------------------------------------------------------

function SignInView({ message, type }: { message: string | null; type: string | null }) {
  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-6 py-16 md:px-12">
      <div className="w-full max-w-md">
        <AdminFlashBanner message={message} type={type} className="mb-6" />
        <div className="rounded-4xl border border-border bg-surface p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Admin access</p>
          <h1 className="mt-4 font-display text-3xl leading-tight tracking-tight md:text-4xl">
            Sign in to the <span className="display-italic">control room</span>.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            We&apos;ll email a one-time magic link. Only addresses on the admin allowlist can complete sign-in.
          </p>

          <form action={signInAdmin} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@gainables.ca"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-foreground"
              />
            </label>
            <AdminSubmitButton idleLabel="Send magic link" pendingLabel="Sending..." className="w-full rounded-xl" />
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Looking for the public site?{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Go to the homepage
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

// --- forbidden view -------------------------------------------------------

function ForbiddenView({
  email,
  message,
  type,
}: {
  email: string;
  message: string | null;
  type: string | null;
}) {
  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-6 py-16 md:px-12">
      <div className="w-full max-w-md">
        <AdminFlashBanner message={message} type={type} className="mb-6" />
        <div className="rounded-4xl border border-red-200 bg-red-50 p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-red-700/80">Access denied</p>
          <h1 className="mt-4 font-display text-3xl leading-tight tracking-tight text-red-900 md:text-4xl">
            This email isn&apos;t on the allowlist.
          </h1>
          <p className="mt-4 text-sm leading-7 text-red-900/85">
            You&apos;re signed in as <span className="font-medium">{email}</span>, but that address hasn&apos;t been added to{" "}
            <code className="font-mono text-xs">ADMIN_ALLOWED_EMAILS</code>. Ask an owner to add it, or sign out and try
            a different address.
          </p>
          <form action={signOutAdmin} className="mt-6">
            <AdminSubmitButton idleLabel="Sign out" pendingLabel="Signing out..." variant="outline" className="w-full rounded-xl" />
          </form>
        </div>
      </div>
    </main>
  );
}

// --- unconfigured view ----------------------------------------------------

function UnconfiguredView({ message, type }: { message: string | null; type: string | null }) {
  return (
    <main className="px-6 pb-24 pt-12 md:px-12 md:pt-16 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <AdminFlashBanner message={message} type={type} className="mb-8" />
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Setup required</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
          Connect Supabase to activate the admin.
        </h1>
        <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base">
          The editors, auth, and live tracker are all wired up — they just need a Supabase project to talk to. Follow
          the checklist below to bring the control room online.
        </p>
        <ol className="mt-8 space-y-3">
          {[
            "Create a Supabase project at supabase.com and run supabase/migrations/0001_init.sql.",
            "Copy .env.example → .env.local and fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY.",
            "Set ADMIN_ALLOWED_EMAILS to the comma-separated list of owner emails who may sign in.",
            "Set NEXT_PUBLIC_MAPBOX_TOKEN for the branded route map and RIDER_TOKEN for the ingest endpoint.",
            "Restart pnpm dev, revisit /admin, and sign in with a magic link.",
          ].map((step, idx) => (
            <li
              key={step}
              className="flex gap-4 rounded-2xl border border-border bg-surface p-5 text-sm leading-7"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:-translate-y-0.5"
          >
            Open Supabase
            <ArrowUpRight size={14} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm transition hover:border-foreground/40"
          >
            View the public site
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
