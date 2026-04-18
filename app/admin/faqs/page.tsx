import type { ReactNode } from "react";

import { connection } from "next/server";

import { AdminSubmitButton } from "@/components/admin/submit-button";
import { createFaq, deleteFaq, updateFaq } from "@/lib/actions/admin";
import { getAdminSession } from "@/lib/admin/auth";
import { getAllFaqs } from "@/lib/content";

type AdminFaqsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminFaqsPage({ searchParams }: AdminFaqsPageProps) {
  await connection();
  const params = searchParams ? await searchParams : {};
  const faqs = await getAllFaqs();
  const session = await getAdminSession();
  const canEdit = session.status === "authorized";
  const message = typeof params.message === "string" ? params.message : null;
  const type = typeof params.type === "string" ? params.type : null;

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">FAQs</p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight">Edit the public FAQ accordion.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            FAQs are ordered by `sort_order`. Hidden entries remain in storage and can be restored without retyping.
          </p>
          {message ? (
            <div
              className={`mt-6 rounded-[1.25rem] border px-5 py-4 text-sm ${
                type === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-border bg-background text-foreground"
              }`}
            >
              {message}
            </div>
          ) : null}
        </section>

        <form action={createFaq} className="rounded-[2rem] border border-border bg-background p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Add FAQ</p>
          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_140px]">
            <Field label="Question">
              <input name="question" required disabled={!canEdit} className={fieldClassName} />
            </Field>
            <Field label="Sort order">
              <input type="number" name="sortOrder" defaultValue={faqs.length + 1} disabled={!canEdit} className={fieldClassName} />
            </Field>
          </div>
          <Field label="Answer">
            <textarea name="answer" rows={5} required disabled={!canEdit} className={`${fieldClassName} mt-2 min-h-32 py-3`} />
          </Field>
          <label className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <input type="checkbox" name="visible" defaultChecked disabled={!canEdit} />
            Visible on the public site
          </label>
          <div className="mt-6">
            <AdminSubmitButton idleLabel="Create FAQ" pendingLabel="Creating..." className="rounded-full px-5" disabled={!canEdit} />
          </div>
        </form>

        <section className="space-y-4">
          {faqs.map((faq) => (
            <article key={faq.id} className="rounded-[1.75rem] border border-border bg-background p-6">
              <form action={updateFaq}>
                <input type="hidden" name="id" value={faq.id} />
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_140px]">
                  <Field label="Question">
                    <input name="question" defaultValue={faq.question} required disabled={!canEdit} className={fieldClassName} />
                  </Field>
                  <Field label="Sort order">
                    <input type="number" name="sortOrder" defaultValue={faq.sortOrder} disabled={!canEdit} className={fieldClassName} />
                  </Field>
                </div>
                <Field label="Answer">
                  <textarea name="answer" defaultValue={faq.answer} rows={5} required disabled={!canEdit} className={`${fieldClassName} mt-2 min-h-32 py-3`} />
                </Field>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <label className="flex items-center gap-3 text-sm text-muted-foreground">
                    <input type="checkbox" name="visible" defaultChecked={faq.visible} disabled={!canEdit} />
                    Visible on public site
                  </label>
                  <AdminSubmitButton idleLabel="Save FAQ" pendingLabel="Saving..." className="rounded-full px-5" disabled={!canEdit} />
                </div>
              </form>
              <form action={deleteFaq} className="mt-3">
                <input type="hidden" name="id" value={faq.id} />
                <AdminSubmitButton idleLabel="Delete" pendingLabel="Deleting..." variant="destructive" className="rounded-full px-5" disabled={!canEdit} />
              </form>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const fieldClassName =
  "h-11 w-full rounded-xl border border-border bg-secondary/40 px-4 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60";
