"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Drives a continuous horizontal marquee.
 *
 * Render a single copy of the items inside an element marked
 * `data-marquee-track`. The hook:
 *   1. Clones the original children at least once so it can measure the
 *      *true* cycle width — the distance from an original item to its
 *      clone — which correctly accounts for flex `gap` between the last
 *      item and the first repeat. (Using `scrollWidth` alone drops that
 *      trailing gap and produces a visible twitch every loop.)
 *   2. Keeps cloning until the track spans at least `containerWidth +
 *      cycleWidth` so the wrap is always off-screen.
 *   3. Re-measures after images load and on window resize.
 */
export function useMarquee<T extends HTMLElement>({
  speed = 60,
  reverse = false,
}: { speed?: number; reverse?: boolean } = {}) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = ref.current;
        if (!scope) return;
        const track = scope.querySelector<HTMLElement>("[data-marquee-track]");
        if (!track) return;

        const originals = Array.from(track.children) as HTMLElement[];
        if (originals.length === 0) return;

        let cycleWidth = 0;
        const setX = gsap.quickSetter(track, "x", "px");
        let x = 0;
        const direction = reverse ? 1 : -1;

        const resetTrack = () => {
          track.style.transform = "translate3d(0,0,0)";
          while (track.children.length > originals.length) {
            track.removeChild(track.lastElementChild!);
          }
        };

        const cloneOnce = () => {
          originals.forEach((node) => {
            const clone = node.cloneNode(true) as HTMLElement;
            clone.setAttribute("aria-hidden", "true");
            track.appendChild(clone);
          });
        };

        const build = () => {
          resetTrack();

          // Append one clone set up front so we can measure the real cycle
          // width (including the gap between the last original and the
          // first clone).
          cloneOnce();

          const firstOriginalRect = originals[0].getBoundingClientRect();
          const firstCloneEl = track.children[originals.length] as HTMLElement | undefined;
          if (!firstCloneEl) return;
          const firstCloneRect = firstCloneEl.getBoundingClientRect();
          cycleWidth = firstCloneRect.left - firstOriginalRect.left;
          if (cycleWidth <= 0) return;

          const containerWidth = scope.clientWidth || cycleWidth;
          const minTotal = containerWidth + cycleWidth;
          // We currently have 2 cycles worth of content on the track.
          let current = cycleWidth * 2;
          while (current < minTotal) {
            cloneOnce();
            current += cycleWidth;
          }

          x = 0;
          setX(0);
        };

        build();

        // Images can change layout after initial measurement — re-build
        // once they're all loaded so the cycle width is accurate.
        const imgs = Array.from(track.querySelectorAll("img"));
        const pendingImgs = imgs.filter((img) => !img.complete);
        if (pendingImgs.length > 0) {
          let remaining = pendingImgs.length;
          const onDone = () => {
            remaining -= 1;
            if (remaining === 0) build();
          };
          pendingImgs.forEach((img) => {
            img.addEventListener("load", onDone, { once: true });
            img.addEventListener("error", onDone, { once: true });
          });
        }

        const handleResize = () => build();
        window.addEventListener("resize", handleResize);

        const tick = (_time: number, deltaTime: number) => {
          if (cycleWidth === 0) return;
          x += (direction * speed * deltaTime) / 1000;
          if (direction < 0 && x <= -cycleWidth) x += cycleWidth;
          if (direction > 0 && x >= 0) x -= cycleWidth;
          setX(x);
        };
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          window.removeEventListener("resize", handleResize);
          resetTrack();
          track.style.transform = "";
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return ref;
}
