import { connection } from "next/server";

import { ContentField, contentInputClassName } from "@/components/admin/content-field";
import { TypedContentForm } from "@/components/admin/typed-form";
import { saveHero } from "@/lib/actions/admin-content";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getSiteContent } from "@/lib/content";

type Props = { searchParams?: AdminSearchParams };

export default async function AdminHeroPage({ searchParams }: Props) {
  await connection();
  await requireAuthorizedAdmin();
  const content = await getSiteContent();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const value = content.hero;

  return (
    <TypedContentForm
      title="Hero"
      description="Top of the homepage — the eyebrow label above the GAINABLES wordmark and the tagline paragraph under it."
      previewHref="/"
      previewLabel="View homepage"
      action={saveHero}
      flashMessage={message}
      flashType={type}
    >
      <ContentField
        label="Eyebrow"
        hint="Small uppercase label above the wordmark (e.g. 'Ride for Mental Health')."
        required
      >
        <input name="eyebrow" defaultValue={value.eyebrow} className={contentInputClassName} required />
      </ContentField>

      <ContentField
        label="Description"
        hint="Serif tagline paragraph shown under the wordmark, next to the Donate / Track CTAs."
        required
      >
        <textarea
          name="description"
          defaultValue={value.description}
          rows={5}
          className={`${contentInputClassName} min-h-32`}
          required
        />
      </ContentField>
    </TypedContentForm>
  );
}
