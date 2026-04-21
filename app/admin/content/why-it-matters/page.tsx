import { connection } from "next/server";

import { ContentField, contentInputClassName } from "@/components/admin/content-field";
import { TypedContentForm } from "@/components/admin/typed-form";
import { saveWhyItMatters } from "@/lib/actions/admin-content";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getSiteContent } from "@/lib/content";

type Props = { searchParams?: AdminSearchParams };

export default async function AdminWhyItMattersPage({ searchParams }: Props) {
  await connection();
  await requireAuthorizedAdmin();
  const content = await getSiteContent();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const value = content.whyItMatters;

  return (
    <TypedContentForm
      title="Mission"
      description="The mission block on the homepage — a big headline with a single paragraph underneath."
      previewHref="/#mission"
      previewLabel="View on homepage"
      action={saveWhyItMatters}
      flashMessage={message}
      flashType={type}
    >
      <ContentField label="Headline" hint="The large display headline for the mission block." required>
        <input name="title" defaultValue={value.title} className={contentInputClassName} required />
      </ContentField>

      <ContentField label="Body paragraph" hint="The serif paragraph shown under the headline." required>
        <textarea
          name="body"
          defaultValue={value.body}
          rows={6}
          className={`${contentInputClassName} min-h-36`}
          required
        />
      </ContentField>
    </TypedContentForm>
  );
}
