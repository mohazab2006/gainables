"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Drives a continuous horizontal marquee on the first child of the scope.
 * Expects the inner track to contain the content **twice** so the loop is seamless.
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
        if (!ref.current) return;
        const track = ref.current.querySelector<HTMLElement>("[data-marquee-track]");
        if (!track) return;

        const setX = gsap.quickSetter(track, "x", "px");
        let x = 0;
        let width = track.scrollWidth / 2;
        const direction = reverse ? 1 : -1;

        const handleResize = () => {
          width = track.scrollWidth / 2;
        };
        window.addEventListener("resize", handleResize);

        const tick = (time: number, deltaTime: number) => {
          x += (direction * speed * deltaTime) / 1000;
          if (direction < 0 && x <= -width) x += width;
          if (direction > 0 && x >= 0) x -= width;
          setX(x);
        };
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          window.removeEventListener("resize", handleResize);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return ref;
}
