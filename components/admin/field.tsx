import type { ReactNode } from "react";

type AdminFieldProps = {
  label: string;
  children: ReactNode;
};

export function AdminField({ label, children }: AdminFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const adminFieldClassName =
  "h-11 w-full rounded-xl border border-border bg-secondary/40 px-4 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60";
