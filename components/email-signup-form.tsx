"use client";

import { useActionState } from "react";
import { ArrowUpRight } from "lucide-react";

import { subscribeAction, type SubscribeActionState } from "@/lib/actions/subscribe";

const initialState: SubscribeActionState = {
  message: "",
  status: "idle",
};

export function EmailSignupForm() {
  const [state, action, pending] = useActionState(subscribeAction, initialState);
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  return (
    <form action={action} className="rounded-2xl border border-border bg-background p-6 md:p-8">
      <label className="text-sm font-medium text-foreground" htmlFor="email">
        Email address
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="rider@supporter.com"
          className="h-12 w-full flex-1 rounded-full border border-border bg-secondary px-5 text-sm outline-none transition focus:border-foreground"
        />
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(14,14,12,0.18)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
        >
          {pending ? "Submitting…" : "Subscribe"}
          {!pending ? (
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          ) : null}
        </button>
      </div>
      <p
        className={`mt-4 text-sm leading-7 ${
          isError ? "text-destructive" : isSuccess ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {state.message || "No spam. Just campaign launch, ride day, and a quick recap after."}
      </p>
    </form>
  );
}
