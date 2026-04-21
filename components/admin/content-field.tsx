import type { ReactNode } from "react";

export const contentInputClassName =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60";

type ContentFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
};

/**
 * Labelled field row for the content admin. Every field shows a bold label,
 * an optional plain-English hint describing where it appears on the site, and
 * the input itself. Used by both server-rendered and client array editors.
 */
export function ContentField({ label, hint, children, required }: ContentFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-sm font-semibold">
        {label}
        {required ? <span className="text-xs font-normal text-destructive">*</span> : null}
      </span>
      {hint ? <span className="block text-xs leading-5 text-muted-foreground">{hint}</span> : null}
      <div className="pt-1">{children}</div>
    </label>
  );
}
