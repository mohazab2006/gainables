import { connection } from "next/server";

import { AdminField, adminFieldClassName } from "@/components/admin/field";
import { AdminFlashBanner } from "@/components/admin/flash-banner";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import { createFaq, deleteFaq, updateFaq } from "@/lib/actions/admin";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getAllFaqs } from "@/lib/content";

type AdminFaqsPageProps = {
  searchParams?: AdminSearchParams;
};

export default async function AdminFaqsPage({ searchParams }: AdminFaqsPageProps) {
  await connection();
  await requireAuthorizedAdmin();
  const faqs = await getAllFaqs();
  const canEdit = true;
  const { message, type } = await resolveAdminFlashState(searchParams);

  return (
    <main className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-secondary/50 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">FAQs</p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight">Edit the public FAQ accordion.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            FAQs are ordered by `sort_order`. Hidden entries remain in storage and can be restored without retyping.
          </p>
          <AdminFlashBanner message={message} type={type} className="mt-6" />
        </section>

        <form action={createFaq} className="rounded-[2rem] border border-border bg-background p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Add FAQ</p>
          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_140px]">
            <AdminField label="Question">
              <input name="question" required disabled={!canEdit} className={adminFieldClassName} />
            </AdminField>
            <AdminField label="Sort order">
              <input type="number" name="sortOrder" defaultValue={faqs.length + 1} disabled={!canEdit} className={adminFieldClassName} />
            </AdminField>
          </div>
          <AdminField label="Answer">
            <textarea name="answer" rows={5} required disabled={!canEdit} className={`${adminFieldClassName} mt-2 min-h-32 py-3`} />
          </AdminField>
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
                  <AdminField label="Question">
                    <input name="question" defaultValue={faq.question} required disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
                  <AdminField label="Sort order">
                    <input type="number" name="sortOrder" defaultValue={faq.sortOrder} disabled={!canEdit} className={adminFieldClassName} />
                  </AdminField>
                </div>
                <AdminField label="Answer">
                  <textarea name="answer" defaultValue={faq.answer} rows={5} required disabled={!canEdit} className={`${adminFieldClassName} mt-2 min-h-32 py-3`} />
                </AdminField>
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
