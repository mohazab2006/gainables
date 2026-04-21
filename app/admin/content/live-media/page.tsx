import { connection } from "next/server";

import { ContentField, contentInputClassName } from "@/components/admin/content-field";
import { TypedContentForm } from "@/components/admin/typed-form";
import { saveLiveMedia } from "@/lib/actions/admin-content";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getSiteContent } from "@/lib/content";

type Props = { searchParams?: AdminSearchParams };

export default async function AdminLiveMediaPage({ searchParams }: Props) {
  await connection();
  await requireAuthorizedAdmin();
  const content = await getSiteContent();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const value = content.liveMedia;

  return (
    <TypedContentForm
      title="Live media"
      description="Featured photo or video shown under the tracker state on the /track page. Only one item lives here at a time — uploading a new one replaces the previous."
      previewHref="/track"
      previewLabel="View /track"
      action={saveLiveMedia}
      flashMessage={message}
      flashType={type}
    >
      <input type="hidden" name="existingKind" value={value?.kind ?? ""} />
      <input type="hidden" name="existingUrl" value={value?.url ?? ""} />
      <input type="hidden" name="existingPosterUrl" value={value?.posterUrl ?? ""} />

      <ContentField
        label="Upload photo or video"
        hint="Drop in a single image (JPG/PNG) or short video (MP4/WebM). Uploading a new file replaces whatever is currently featured."
      >
        <input type="file" name="media" accept="image/*,video/*" className={contentInputClassName} />
      </ContentField>

      <ContentField
        label="Caption"
        hint="Optional short caption shown under the media (e.g. 'Halfway point — Hawkesbury')."
      >
        <input
          name="caption"
          defaultValue={value?.caption ?? ""}
          className={contentInputClassName}
          placeholder="Quick update from the road."
        />
      </ContentField>

      {value ? (
        <div className="rounded-2xl border border-border/60 bg-secondary/15 p-5">
          <p className="text-sm font-semibold">Currently featured</p>
          <p className="mt-1 break-all text-xs leading-5 text-muted-foreground">
            {value.kind} — {value.url}
          </p>
          {value.updatedAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Updated {new Date(value.updatedAt).toLocaleString()}
            </p>
          ) : null}
          {value.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt={value.caption ?? "Current live media"} className="mt-4 max-h-56 rounded-xl object-cover" />
          ) : (
            <video src={value.url} controls className="mt-4 max-h-56 rounded-xl" />
          )}
          <label className="mt-4 flex items-center gap-3 text-sm text-foreground">
            <input type="checkbox" name="clear" className="h-4 w-4 rounded border-border" />
            Clear the current live media (removes it from /track)
          </label>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border/60 bg-secondary/10 p-5 text-sm text-muted-foreground">
          No live media is currently featured. Upload a photo or video above and save — it will appear under the tracker state card on /track.
        </p>
      )}
    </TypedContentForm>
  );
}
