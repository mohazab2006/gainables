import { connection } from "next/server";

import { ArrayEditor } from "@/components/admin/array-editor";
import { ContentField, contentInputClassName } from "@/components/admin/content-field";
import { TypedContentForm } from "@/components/admin/typed-form";
import { saveDonate } from "@/lib/actions/admin-content";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getSiteContent } from "@/lib/content";

type Props = { searchParams?: AdminSearchParams };

export default async function AdminDonatePage({ searchParams }: Props) {
  await connection();
  await requireAuthorizedAdmin();
  const content = await getSiteContent();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const value = content.donate;

  return (
    <TypedContentForm
      title="Donate"
      description="Copy on the /donate page — the story paragraph, the three impact tiles, and the 'Where funds go' allocation list."
      previewHref="/donate"
      previewLabel="View /donate"
      action={saveDonate}
      flashMessage={message}
      flashType={type}
    >
      <ContentField
        label="Story paragraph"
        hint="The main body copy on /donate — your most persuasive pitch for why people should give."
        required
      >
        <textarea
          name="story"
          defaultValue={value.story}
          rows={6}
          className={`${contentInputClassName} min-h-36`}
          required
        />
      </ContentField>

      <ArrayEditor
        name="impact"
        label="Impact tiles"
        description="Three small tiles under the banner. Each has a short title and a one-line description."
        initialItems={value.impact.map((i) => ({ title: i.title, description: i.description }))}
        emptyItem={{ title: "", description: "" }}
        fields={[
          { key: "title", label: "Title", hint: "Tile headline.", placeholder: "Care access" },
          { key: "description", label: "Description", hint: "One sentence describing the impact.", kind: "textarea", placeholder: "Support programs, counselling access, and community-led mental health initiatives." },
        ]}
        addLabel="Add impact tile"
        minItems={1}
        maxItems={6}
        summaryKeys={["title"]}
      />

      <ArrayEditor
        name="fundAllocation"
        label="Where funds go"
        description="The sidebar on /donate showing how contributions are allocated. Keep this honest — every row here is a real commitment."
        initialItems={value.fundAllocation.map((f) => ({
          label: f.label,
          value: f.value,
          description: f.description,
        }))}
        emptyItem={{ label: "", value: "", description: "" }}
        fields={[
          { key: "label", label: "Category", hint: "E.g. 'CHEO Foundation'.", placeholder: "CHEO Foundation" },
          { key: "value", label: "Share", hint: "Right-hand tag — percentage, 'Primary', etc.", placeholder: "100%" },
          { key: "description", label: "Description", hint: "One sentence describing the allocation.", kind: "textarea", placeholder: "Every dollar raised goes to CHEO Foundation for mental health services and support programs." },
        ]}
        addLabel="Add allocation"
        minItems={1}
        summaryKeys={["label", "value"]}
      />
    </TypedContentForm>
  );
}
