"use client";

import Image from "next/image";

import { useMarquee } from "@/hooks/use-marquee";
import { useReveal } from "@/hooks/use-reveal";
import type { ImageAsset } from "@/lib/fallback-content";

export function GallerySection({ gallery }: { gallery: ImageAsset[] }) {
  const headRef = useReveal<HTMLDivElement>();
  const trackRef = useMarquee<HTMLDivElement>({ speed: 40 });
  const items = gallery.length ? [...gallery, ...gallery] : gallery;

  return (
    <section id="gallery" className="overflow-hidden bg-background py-24 md:py-28">
      <div className="container-shell mb-12 px-6 md:px-12 lg:px-20" ref={headRef}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div data-reveal>
            <p className="eyebrow">Field notes</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] tracking-[-0.025em] md:text-6xl">
              Training rides, group sessions, and <span className="display-italic">campaign moments</span>.
            </h2>
          </div>
          <p data-reveal className="max-w-md text-base leading-7 text-muted-foreground">
            A living gallery — pulled into the page so supporters always see real photos from the road, not stock
            placeholders.
          </p>
        </div>
      </div>

      <div ref={trackRef} className="marquee-mask relative overflow-hidden">
        <div data-marquee-track className="flex w-max gap-4 will-change-transform md:gap-6">
          {items.map((image, index) => (
            <figure
              key={`${image.src}-${index}`}
              className="relative h-[320px] w-[260px] shrink-0 overflow-hidden rounded-[1.5rem] bg-secondary md:h-[460px] md:w-[360px] md:rounded-[2rem]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 60vw, 360px"
                className="object-cover"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
