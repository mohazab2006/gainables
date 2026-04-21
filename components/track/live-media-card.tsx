import Image from "next/image";
import { Instagram } from "lucide-react";

import type { LiveMediaContent, MediaContent } from "@/lib/fallback-content";

type Props = {
  liveMedia: LiveMediaContent | null;
  links: MediaContent["links"];
};

/**
 * Featured photo/video card shown under the tracker state on /track. Only
 * one item is ever featured at a time — the admin replaces it through
 * /admin/content/live-media. If no item is set, the card collapses to a
 * small placeholder pointing at social.
 */
export function LiveMediaCard({ liveMedia, links }: Props) {
  const instagram = links.find((l) => /instagram/i.test(l.label) || /instagram/i.test(l.href));
  const tiktok = links.find((l) => /tiktok/i.test(l.label) || /tiktok/i.test(l.href));
  const updatedLabel = liveMedia?.updatedAt ? formatUpdated(liveMedia.updatedAt) : null;

  return (
    <aside className="rounded-4xl border border-white/8 bg-surface p-7 text-foreground md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-foreground/50">Latest from the road</p>
          <p className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
            {liveMedia ? "Live media" : "No live media yet"}
          </p>
        </div>
        {updatedLabel ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-foreground/75">
            Updated {updatedLabel}
          </span>
        ) : null}
      </div>

      {liveMedia ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
          {liveMedia.kind === "video" ? (
            <video
              src={liveMedia.url}
              poster={liveMedia.posterUrl}
              className="aspect-4/5 h-auto w-full object-cover md:aspect-16/10"
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <div className="relative aspect-4/5 w-full md:aspect-16/10">
              <Image
                src={liveMedia.url}
                alt={liveMedia.caption ?? "Live update from the ride"}
                fill
                sizes="(min-width: 1280px) 520px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/3 px-5 py-8 text-center">
          <p className="text-sm leading-6 text-foreground/65">
            Fresh photos and videos from the road will appear here during the ride. Follow along on Instagram and TikTok for every update in between.
          </p>
        </div>
      )}

      {liveMedia?.caption ? (
        <p className="mt-5 text-sm leading-6 text-foreground/75">{liveMedia.caption}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
        <span className="text-[0.7rem] uppercase tracking-[0.22em] text-foreground/50">More updates</span>
        {instagram ? (
          <a
            href={instagram.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-sm font-medium transition hover:border-white/30 hover:bg-white/10"
          >
            <Instagram size={14} aria-hidden />
            Instagram
          </a>
        ) : null}
        {tiktok ? (
          <a
            href={tiktok.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-sm font-medium transition hover:border-white/30 hover:bg-white/10"
          >
            <TikTokGlyph />
            TikTok
          </a>
        ) : null}
      </div>
    </aside>
  );
}

function formatUpdated(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = Date.now();
  const diffMin = Math.round((now - d.getTime()) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 60 * 24) return `${Math.round(diffMin / 60)}h ago`;
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(d);
}

/**
 * Tiny inline TikTok glyph — lucide-react has no built-in TikTok icon, so
 * we draw it at the same stroke weight as the neighboring Instagram icon.
 */
function TikTokGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <path d="M20.9 8.3a7.3 7.3 0 0 1-4.6-1.6v8.1a5.9 5.9 0 1 1-5.1-5.9v2.7a3.2 3.2 0 1 0 2.3 3.1V2h2.8a4.6 4.6 0 0 0 4.6 4.5Z" />
    </svg>
  );
}
