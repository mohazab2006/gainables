"use client";

import Image from "next/image";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import type { ImageAsset } from "@/lib/fallback-content";

export function GallerySection({ gallery }: { gallery: ImageAsset[] }) {
  const { ref, progress } = useScrollProgress<HTMLElement>({ end: 1.2 });
  const prefersReducedMotion = usePrefersReducedMotion();
  const translate = prefersReducedMotion ? 0 : progress * -35;

  return (
    <section id="gallery" ref={ref} className="overflow-hidden bg-background py-24">
      <div className="mb-8 px-6 md:px-12 lg:px-20">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Gallery</p>
        <h2 className="mt-4 max-w-4xl text-4xl font-medium tracking-tight md:text-6xl">
          Training photos, group rides, sponsor moments, and campaign media all have a place on the page.
        </h2>
      </div>
      <div className="overflow-hidden">
        <div
          className="flex gap-4 px-6 will-change-transform md:px-12 lg:px-20"
          style={{ transform: `translateX(${translate}%)` }}
        >
          {gallery.map((image) => (
            <div key={image.src} className="relative h-[340px] min-w-[280px] overflow-hidden rounded-[2rem] md:h-[460px] md:min-w-[360px]">
              <Image src={image.src} alt={image.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-10" />
    </section>
  );
}
