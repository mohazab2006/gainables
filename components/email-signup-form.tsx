"use client";

import { useActionState } from "react";
import { ArrowUpRight, Check, Loader2, Mail, ShieldCheck, Sparkles, X } from "lucide-react";

import { subscribeAction, type SubscribeActionState } from "@/lib/actions/subscribe";

const initialState: SubscribeActionState = {
  message: "",
  status: "idle",
};

const trustBadges = [
  { icon: ShieldCheck, label: "No spam, ever" },
  { icon: Mail, label: "3 emails total" },
  { icon: Sparkles, label: "Unsubscribe anytime" },
];

export function EmailSignupForm() {
  const [state, action, pending] = useActionState(subscribeAction, initialState);
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  return (
    <form
      action={action}
      className="group/form relative overflow-hidden rounded-4xl border border-border bg-surface p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] transition-colors focus-within:border-accent/60 md:p-10"
    >
      {/* Decorative top hairline so the panel feels engineered. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-500 group-focus-within/form:opacity-100"
      />

      <div className="flex items-center justify-between gap-4">
        <label
          className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground"
          htmlFor="email"
        >
          Get the updates
        </label>
        <span className="hidden items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Free
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <Mail
            size={18}
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/form:text-foreground"
            aria-hidden
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="rider@supporter.com"
            autoComplete="email"
            disabled={pending || isSuccess}
            aria-invalid={isError || undefined}
            aria-describedby="signup-status"
            className="h-14 w-full rounded-full border border-border bg-background pl-12 pr-5 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-200 focus:border-accent focus:bg-background focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60 md:h-16 md:text-lg"
          />
        </div>
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={pending || isSuccess}
          className="group relative inline-flex h-14 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-accent px-7 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(200,226,92,0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none md:h-16 md:px-9 md:text-base"
        >
          {pending ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden />
              <span>Sending…</span>
            </>
          ) : isSuccess ? (
            <>
              <Check size={18} aria-hidden />
              <span>You&apos;re in</span>
            </>
          ) : (
            <>
              <span>Notify me</span>
              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </>
          )}
        </button>
      </div>

      {/* Inline status — visible, color-coded, with an icon. */}
      <div
        id="signup-status"
        role="status"
        aria-live="polite"
        className={`mt-5 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm leading-6 transition-colors ${
          isError
            ? "border-destructive/40 bg-destructive/10 text-destructive"
            : isSuccess
              ? "border-accent/40 bg-accent/10 text-foreground"
              : "border-transparent bg-transparent text-muted-foreground"
        }`}
      >
        {isError ? (
          <X size={16} className="mt-0.5 shrink-0" aria-hidden />
        ) : isSuccess ? (
          <Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
        ) : (
          <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden />
        )}
        <span>
          {state.message ||
            "We only send what matters: campaign launch, ride day, and a quick recap after."}
        </span>
      </div>

      {/* Trust badges */}
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border/60 pt-5 sm:justify-start">
        {trustBadges.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground"
          >
            <Icon size={14} className="text-accent" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </form>
  );
}
