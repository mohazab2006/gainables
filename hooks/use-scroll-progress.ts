"use client";

import { useEffect, useRef, useState } from "react";

type UseScrollProgressOptions = {
  end?: number;
};

export function useScrollProgress<T extends HTMLElement>({ end = 1.4 }: UseScrollProgressOptions = {}) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      if (!ref.current) {
        frame = window.requestAnimationFrame(updateProgress);
        return;
      }

      const rect = ref.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * end;
      const scrolled = Math.max(0, -rect.top);
      setProgress(Math.min(1, scrolled / scrollableHeight));
      frame = window.requestAnimationFrame(updateProgress);
    };

    frame = window.requestAnimationFrame(updateProgress);

    return () => window.cancelAnimationFrame(frame);
  }, [end]);

  return { ref, progress };
}
