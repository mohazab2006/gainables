"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type RevealOptions = {
  selector?: string;
  y?: number;
  stagger?: number;
  duration?: number;
  delay?: number;
  start?: string;
  once?: boolean;
};

/**
 * Reveals child elements (default: `[data-reveal]`) when the scope enters the viewport.
 * Add `data-reveal` (or pass a custom selector) to elements you want to fade/slide in.
 */
export function useReveal<T extends HTMLElement>({
  selector = "[data-reveal]",
  y = 28,
  stagger = 0.08,
  duration = 0.9,
  delay = 0,
  start = "top 82%",
  once = true,
}: RevealOptions = {}) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motionOk: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          if (!ref.current) return;
          const targets = ref.current.querySelectorAll<HTMLElement>(selector);
          if (!targets.length) return;

          if (ctx.conditions?.reduce) {
            gsap.set(targets, { autoAlpha: 1, y: 0 });
            return;
          }

          gsap.fromTo(
            targets,
            { autoAlpha: 0, y },
            {
              autoAlpha: 1,
              y: 0,
              duration,
              delay,
              stagger,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ref.current,
                start,
                toggleActions: once ? "play none none none" : "play reverse play reverse",
              },
            },
          );
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return ref;
}
