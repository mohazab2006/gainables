"use client";

import { useActionState } from "react";

import { subscribeAction, type SubscribeActionState } from "@/lib/actions/subscribe";

const initialState: SubscribeActionState = {
  message: "",
  status: "idle",
};

type EmailSignupFormProps = {
  variant?: "dark" | "light";
};

export function EmailSignupForm({ variant = "dark" }: EmailSignupFormProps) {
  const [state, action, pending] = useActionState(subscribeAction, initialState);
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  const isDark = variant === "dark";

  const inputClass = isDark
    ? "h-12 w-full flex-1 border border-background/40 bg-transparent px-4 text-sm text-background placeholder:text-background/40 outline-none transition focus:border-background"
    : "h-12 w-full flex-1 border border-foreground bg-background px-4 text-sm text-foreground placeholder:text-foreground/40 outline-none transition";

  const buttonClass = isDark
    ? "inline-flex h-12 shrink-0 items-center justify-center gap-2 border border-background bg-background px-6 text-xs font-medium uppercase tracking-[0.24em] text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background disabled:opacity-55 disabled:cursor-not-allowed"
    : "inline-flex h-12 shrink-0 items-center justify-center gap-2 border border-foreground bg-foreground px-6 text-xs font-medium uppercase tracking-[0.24em] text-background transition-colors duration-200 hover:bg-background hover:text-foreground disabled:opacity-55 disabled:cursor-not-allowed";

  const helperClass = isDark
    ? `mt-3 text-xs uppercase tracking-[0.18em] ${isError ? "text-background" : isSuccess ? "text-background" : "text-background/55"}`
    : `mt-3 text-xs uppercase tracking-[0.18em] ${isError ? "text-foreground" : isSuccess ? "text-foreground" : "text-muted-foreground"}`;

  return (
    <form action={action}>
      <label
        className={`text-[0.7rem] uppercase tracking-[0.32em] ${isDark ? "text-background/60" : "text-muted-foreground"}`}
        htmlFor="email"
      >
        Email
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="rider@supporter.com"
          className={inputClass}
        />
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Sending..." : "Subscribe"}
        </button>
      </div>
      <p className={helperClass}>
        {state.message || "No spam. Three emails total."}
      </p>
    </form>
  );
}
