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

      <input type="hidden" name="existingBackgroundKind" value={value.backgroundMedia?.kind ?? ""} />
      <input type="hidden" name="existingBackgroundUrl" value={value.backgroundMedia?.url ?? ""} />
      <input type="hidden" name="existingBackgroundPosterUrl" value={value.backgroundMedia?.posterUrl ?? ""} />

      <ContentField
        label="Background media"
        hint="Upload a hero photo or video. Images render as a full-bleed background; videos autoplay muted with an optional poster."
      >
        <input type="file" name="backgroundMedia" accept="image/*,video/*" className={contentInputClassName} />
      </ContentField>

      <ContentField
        label="Background alt text"
        hint="Used for accessibility and editor context. Keep it short and descriptive."
      >
        <input
          name="backgroundAlt"
          defaultValue={value.backgroundMedia?.alt ?? ""}
          className={contentInputClassName}
          placeholder="Cyclist riding beside the Gainables support crew."
        />
      </ContentField>

      <ContentField
        label="Video poster"
        hint="Optional still image shown before video playback starts. Only needed for video backgrounds."
      >
        <input type="file" name="backgroundPoster" accept="image/*" className={contentInputClassName} />
      </ContentField>

      {value.backgroundMedia ? (
        <div className="rounded-2xl border border-border/60 bg-secondary/15 p-5">
          <p className="text-sm font-semibold">Current background</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {value.backgroundMedia.kind} - {value.backgroundMedia.url}
          </p>
          <label className="mt-4 flex items-center gap-3 text-sm text-foreground">
            <input type="checkbox" name="clearBackground" className="h-4 w-4 rounded border-border" />
            Clear the current hero background
          </label>
        </div>
      ) : null}
    </TypedContentForm>
  );
}
