"use client";

import { Mail } from "lucide-react";

import { EmailSignupForm } from "@/components/email-signup-form";
import { useReveal } from "@/hooks/use-reveal";

export function EmailSignupSection() {
  const ref = useReveal<HTMLDivElement>({ y: 30, stagger: 0.08 });

  return (
    <section className="bg-background px-6 pb-24 pt-8 md:px-12 lg:px-20">
      <div
        ref={ref}
        className="container-shell grid gap-10 rounded-[2.25rem] border border-border bg-surface p-8 md:grid-cols-[0.95fr_1.05fr] md:p-12"
      >
        <div data-reveal>
          <p className="ring-token">
            <Mail size={14} className="text-accent" /> Stay updated
          </p>
          <h2 className="mt-5 max-w-xl font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-5xl">
            Get a quiet update before <span className="display-italic">ride day</span>.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            One email when the campaign launches, one before the ride, and one after. No marketing funnel.
          </p>
        </div>
        <div data-reveal>
          <EmailSignupForm />
        </div>
      </div>
    </section>
  );
}
