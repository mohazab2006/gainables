"use client";

import { EmailSignupForm } from "@/components/email-signup-form";
import { useReveal } from "@/hooks/use-reveal";

export function SignupStrip() {
  const ref = useReveal<HTMLDivElement>({ y: 24, stagger: 0.06 });

  return (
    <section id="signup" className="relative bg-background px-6 py-20 md:px-12 md:py-24 lg:px-20">
      <div ref={ref} className="container-shell grid gap-10 border-y border-white/10 py-16 md:grid-cols-[1fr_auto] md:items-center md:gap-20">
        <div data-reveal>
          <p className="eyebrow">Live updates</p>
          <h2 className="mt-5 display-hero text-4xl md:text-6xl">
            A quiet update <span className="display-italic text-muted-foreground">before</span> ride day.
          </h2>
        </div>
        <div data-reveal className="w-full md:min-w-[420px] md:max-w-[460px]">
          <EmailSignupForm />
        </div>
      </div>
    </section>
  );
}
