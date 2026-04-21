import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";

type TypedContentFormProps = {
  /** Section title shown at the top of the page. */
  title: string;
  /** Plain-English explanation of what this section controls. */
  description: string;
  /** Optional path (e.g. "/" or "/donate") to preview the live surface. */
  previewHref?: string;
  /** Optional label for the preview link. Defaults to "View live". */
  previewLabel?: string;
  /** Server action to submit. */
  action: (formData: FormData) => Promise<void> | void;
  /** Flash banner message. */
  flashMessage: string | null;
  flashType: string | null;
  /** Hidden fields (e.g. section key) + visible form body. */
  children: ReactNode;
  /** Optional footer above the save button (e.g. "Advanced: edit raw JSON"). */
  footer?: ReactNode;
  saveLabel?: string;
};

/**
 * Shared shell for every typed content form. Provides a consistent header
 * (title + "what this controls" description + preview link), flash banner,
 * form wrapper, and save button. Section-specific fields go in `children`.
 */
export function TypedContentForm({
  title,
  description,
  previewHref,
  previewLabel = "View live",
  action,
  flashMessage,
  flashType,
  children,
  footer,
  saveLabel,
}: TypedContentFormProps) {
  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-secondary/50 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Content · {title}</p>
              <h1 className="mt-4 text-3xl font-medium tracking-tight">{title}</h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
            </div>
            {previewHref ? (
              <Link
                href={previewHref}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground/80 transition hover:text-foreground"
              >
                {previewLabel}
                <ArrowUpRight size={14} />
              </Link>
            ) : null}
          </div>
          <AdminFlashBanner message={flashMessage} type={flashType} className="mt-6" />
        </section>

        <form action={action} className="space-y-8 rounded-[2rem] border border-border bg-background p-8">
          {children}
          {footer ? <div className="pt-4">{footer}</div> : null}
          <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
            <Link
              href="/admin/content"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              ← Back to all sections
            </Link>
            <AdminSubmitButton idleLabel={saveLabel ?? `Save ${title.toLowerCase()}`} pendingLabel="Saving..." className="rounded-full px-6" />
          </div>
        </form>
      </div>
    </main>
  );
}
