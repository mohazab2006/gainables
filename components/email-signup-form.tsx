"use client";

import { useActionState } from "react";

import { subscribeAction, type SubscribeActionState } from "@/lib/actions/subscribe";

const initialState: SubscribeActionState = {
  message: "",
  status: "idle",
};

export function EmailSignupForm() {
  const [state, action, pending] = useActionState(subscribeAction, initialState);

  return (
    <form action={action} className="rounded-[1.75rem] border border-border bg-background p-6 md:p-8">
      <label className="block text-sm font-medium text-foreground" htmlFor="email">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        placeholder="rider@supporter.com"
        className="mt-3 h-12 w-full rounded-full border border-border bg-secondary px-5 text-sm outline-none transition focus:border-foreground"
      />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {pending ? "Submitting..." : "Get campaign updates"}
      </button>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        {state.message || "No spam. Only ride updates, fundraising milestones, and event-day alerts."}
      </p>
    </form>
  );
}
