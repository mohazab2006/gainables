import { connection } from "next/server";

import { ArrayEditor } from "@/components/admin/array-editor";
import { ContentField, contentInputClassName } from "@/components/admin/content-field";
import { TypedContentForm } from "@/components/admin/typed-form";
import { saveMedia } from "@/lib/actions/admin-content";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getSiteContent } from "@/lib/content";

type Props = { searchParams?: AdminSearchParams };

export default async function AdminMediaPage({ searchParams }: Props) {
  await connection();
  await requireAuthorizedAdmin();
  const content = await getSiteContent();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const value = content.media;

  return (
    <TypedContentForm
      title="Contact"
      description="The 'Stay close to the ride' block near the bottom of the homepage — intro body copy and the list of social / contact links."
      previewHref="/#contact"
      previewLabel="View on homepage"
      action={saveMedia}
      flashMessage={message}
      flashType={type}
    >
      <ContentField label="Body" hint="Short paragraph under the 'Stay close to the ride' headline." required>
        <textarea
          name="body"
          defaultValue={value.body}
          rows={5}
          className={`${contentInputClassName} min-h-32`}
          required
        />
      </ContentField>

      <ArrayEditor
        name="links"
        label="Links"
        description="One row per link — Instagram, TikTok, press contact, etc. Icons auto-pick based on the label / URL."
        initialItems={value.links.map((l) => ({
          label: l.label,
          handle: l.handle,
          href: l.href,
          description: l.description,
        }))}
        emptyItem={{ label: "", handle: "", href: "", description: "" }}
        fields={[
          { key: "label", label: "Label", hint: "Platform or purpose (Instagram, Contact…).", placeholder: "Instagram" },
          { key: "handle", label: "Handle / address", hint: "Displayed under the label.", placeholder: "gainables.ca" },
          { key: "href", label: "Link", hint: "Full URL or mailto:.", kind: "url", placeholder: "https://www.instagram.com/…" },
          { key: "description", label: "Description", hint: "One-sentence context for the link.", kind: "textarea", placeholder: "Primary channel — daily updates before and during the ride." },
        ]}
        addLabel="Add link"
        minItems={1}
        summaryKeys={["label", "handle"]}
      />
    </TypedContentForm>
  );
}
