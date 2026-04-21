"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "loading" | "natural" | "monochrome";

type SmartSponsorLogoProps = {
  src: string;
  alt: string;
  className?: string;
  monochromeClassName?: string;
  naturalClassName?: string;
};

const CORNER_OFFSET_RATIO = 0.04;
const ALPHA_TRANSPARENT_THRESHOLD = 250;
const CORNER_COLOR_TOLERANCE = 14;
const INTERIOR_COLOR_DIFFERENCE = 40;
const KNOCKOUT_INNER = 18;
const KNOCKOUT_OUTER = 60;

type Pixel = { r: number; g: number; b: number; a: number };

function readPixel(data: Uint8ClampedArray, idx: number): Pixel {
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
}

function colorDistance(a: Pixel, b: Pixel): number {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b));
}

type DetectionResult =
  | { kind: "transparent" }
  | { kind: "background"; bg: Pixel }
  | { kind: "edge-to-edge" }
  | { kind: "solid" };

function detect(img: HTMLImageElement): DetectionResult | null {
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  try {
    ctx.drawImage(img, 0, 0);
    const ox = Math.max(1, Math.floor(width * CORNER_OFFSET_RATIO));
    const oy = Math.max(1, Math.floor(height * CORNER_OFFSET_RATIO));

    const cornerCoords: Array<[number, number]> = [
      [ox, oy],
      [width - ox - 1, oy],
      [ox, height - oy - 1],
      [width - ox - 1, height - oy - 1],
    ];
    const corners = cornerCoords.map(([x, y]) => {
      const d = ctx.getImageData(x, y, 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] };
    });

    if (corners.some((p) => p.a < ALPHA_TRANSPARENT_THRESHOLD)) {
      return { kind: "transparent" };
    }

    const ref = corners[0];
    const cornersUniform = corners.every(
      (p) => colorDistance(p, ref) <= CORNER_COLOR_TOLERANCE,
    );
    if (!cornersUniform) return { kind: "edge-to-edge" };

    const interior = ctx.getImageData(0, 0, width, height).data;
    const steps = 8;
    let interiorDiffers = false;
    for (let i = 1; i < steps && !interiorDiffers; i++) {
      for (let j = 1; j < steps && !interiorDiffers; j++) {
        const x = Math.floor((width * i) / steps);
        const y = Math.floor((height * j) / steps);
        const idx = (y * width + x) * 4;
        const p = readPixel(interior, idx);
        if (colorDistance(p, ref) >= INTERIOR_COLOR_DIFFERENCE) {
          interiorDiffers = true;
        }
      }
    }
    if (!interiorDiffers) return { kind: "solid" };
    return { kind: "background", bg: ref };
  } catch {
    return null;
  }
}

function knockoutBackground(img: HTMLImageElement, bg: Pixel): string | null {
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  try {
    ctx.drawImage(img, 0, 0);
    const image = ctx.getImageData(0, 0, width, height);
    const data = image.data;
    const span = KNOCKOUT_OUTER - KNOCKOUT_INNER;

    for (let i = 0; i < data.length; i += 4) {
      const dist = Math.max(
        Math.abs(data[i] - bg.r),
        Math.abs(data[i + 1] - bg.g),
        Math.abs(data[i + 2] - bg.b),
      );
      if (dist <= KNOCKOUT_INNER) {
        data[i + 3] = 0;
      } else if (dist < KNOCKOUT_OUTER) {
        const t = (dist - KNOCKOUT_INNER) / span;
        data[i + 3] = Math.round(data[i + 3] * t);
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export function SmartSponsorLogo({
  src,
  alt,
  className = "",
  monochromeClassName = "opacity-60 brightness-0 invert group-hover:opacity-100",
  naturalClassName = "opacity-90 group-hover:opacity-100",
}: SmartSponsorLogoProps) {
  const [analysis, setAnalysis] = useState<{ source: string; variant: Variant; resolvedSrc: string }>({
    source: src,
    variant: "loading",
    resolvedSrc: src,
  });
  const dataUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    dataUrlRef.current = null;

    const probe = new Image();
    probe.crossOrigin = "anonymous";

    probe.onload = () => {
      if (cancelled) return;
      const result = detect(probe);
      if (!result) {
        setAnalysis({ source: src, variant: "natural", resolvedSrc: src });
        return;
      }
      switch (result.kind) {
        case "transparent":
        case "edge-to-edge":
          setAnalysis({ source: src, variant: "natural", resolvedSrc: src });
          return;
        case "solid":
          setAnalysis({ source: src, variant: "monochrome", resolvedSrc: src });
          return;
        case "background": {
          const dataUrl = knockoutBackground(probe, result.bg);
          if (cancelled) return;
          if (dataUrl) {
            dataUrlRef.current = dataUrl;
            setAnalysis({ source: src, variant: "natural", resolvedSrc: dataUrl });
            return;
          }
          setAnalysis({ source: src, variant: "natural", resolvedSrc: src });
          return;
        }
      }
    };

    probe.onerror = () => {
      if (!cancelled) setAnalysis({ source: src, variant: "natural", resolvedSrc: src });
    };

    probe.src = src;

    return () => {
      cancelled = true;
      probe.onload = null;
      probe.onerror = null;
    };
  }, [src]);

  const display = analysis.source === src ? analysis : { source: src, variant: "loading" as const, resolvedSrc: src };

  const variantClass =
    display.variant === "loading"
      ? "opacity-0"
      : display.variant === "natural"
        ? naturalClassName
        : monochromeClassName;

  return (
    <img
      src={display.resolvedSrc}
      alt={alt}
      loading="lazy"
      className={`${className} ${variantClass} transition duration-500`}
    />
  );
}
