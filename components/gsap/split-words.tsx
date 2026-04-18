"use client";

import { type ElementType, type ReactNode } from "react";

type SplitWordsProps = {
  children: string;
  className?: string;
  wordClassName?: string;
  as?: ElementType;
  /** Adds `data-reveal` so the words pick up `useReveal` animations. */
  reveal?: boolean;
};

/**
 * Splits a string into word-level spans for character or word animations.
 * Each word becomes a `data-word` span; a parent line wraps with `overflow: hidden`
 * so animations like a translateY reveal stay clean.
 */
export function SplitWords({
  children,
  className,
  wordClassName,
  as: Tag = "span",
  reveal = false,
}: SplitWordsProps) {
  const words = children.split(/(\s+)/);
  return (
    <Tag className={className}>
      {words.map((segment, index): ReactNode => {
        if (/^\s+$/.test(segment)) return <span key={index}>{segment}</span>;
        return (
          <span key={index} className="inline-block overflow-hidden align-bottom">
            <span
              className={`inline-block ${wordClassName ?? ""}`}
              data-word
              {...(reveal ? { "data-reveal": "" } : {})}
            >
              {segment}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
