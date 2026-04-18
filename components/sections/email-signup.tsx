import { EmailSignupForm } from "@/components/email-signup-form";

export function EmailSignupSection() {
  return (
    <section className="bg-background px-6 pb-24 pt-8 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-border bg-secondary/50 p-8 md:grid-cols-[0.95fr_1.05fr] md:p-10">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Stay updated</p>
          <h2 className="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
            Collect supporter emails without turning the campaign into a marketing funnel.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
            This form is wired for a server action, honeypot protection, and an optional Resend confirmation flow.
          </p>
        </div>
        <EmailSignupForm />
      </div>
    </section>
  );
}
