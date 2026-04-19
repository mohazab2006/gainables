"use client";

import Image from "next/image";

import { useReveal } from "@/hooks/use-reveal";
import type { ImageAsset } from "@/lib/fallback-content";

export function GallerySection({ gallery }: { gallery: ImageAsset[] }) {
  const headRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>({ y: 28, stagger: 0.06, duration: 0.8 });

  return (
    <section className="border-t border-foreground bg-background text-foreground">
      <div className="px-6 py-24 md:px-10 md:py-32">
        <div className="container-shell">
          <div ref={headRef} data-reveal>
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
              Field notes
            </p>
            <h2 className="mt-6 max-w-5xl font-display text-5xl leading-[0.92] md:text-7xl lg:text-[6vw]">
              FROM THE ROAD.
            </h2>
          </div>

          <div
            ref={gridRef}
            className="mt-16 grid grid-cols-2 gap-px bg-foreground md:grid-cols-3 lg:grid-cols-3"
          >
            {gallery.map((image, index) => (
              <figure
                key={`${image.src}-${index}`}
                data-reveal
                className="relative aspect-[4/5] overflow-hidden bg-background"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover grayscale transition duration-700 hover:grayscale-0"
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
