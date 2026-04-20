"use client";

import { EmailSignupForm } from "@/components/email-signup-form";
import { useReveal } from "@/hooks/use-reveal";

export function SignupStrip() {
  const ref = useReveal<HTMLDivElement>({ y: 24, stagger: 0.06 });

  return (
    <section
      id="signup"
      className="relative overflow-hidden bg-background px-6 pb-10 pt-24 md:px-12 md:pb-14 md:pt-32 lg:px-20"
    >
      {/* Soft accent glow so the section reads as a destination, not a footnote. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] max-w-[900px] opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(200,226,92,0.18), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
      />

      <div ref={ref} className="container-shell relative">
        <div className="mx-auto max-w-3xl text-center">
          <p data-reveal className="eyebrow">
            <span className="inline-flex items-center gap-2">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Live updates
            </span>
          </p>
          <h2
            data-reveal
            className="mt-6 display-hero text-5xl md:text-7xl lg:text-[5.5rem]"
          >
            Join the <span className="display-italic text-muted-foreground">waitlist</span> before ride day.
          </h2>
          <p
            data-reveal
            className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8"
          >
            Drop your email — we&apos;ll send the campaign launch, the morning the ride starts, and a quick recap when it&apos;s done. That&apos;s it.
          </p>
        </div>

        <div data-reveal className="mx-auto mt-12 w-full max-w-2xl md:mt-16">
          <EmailSignupForm />
        </div>
      </div>
    </section>
  );
}
