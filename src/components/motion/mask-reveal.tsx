"use client";

/**
 * Masked line reveal. The single child slides up from behind an overflow clip —
 * the "type rises from behind a mask" move that makes display headings feel
 * deliberate rather than merely faded. Stagger siblings with `delay`.
 *
 *   <MaskReveal><p className="label">02 / Concept</p></MaskReveal>
 *   <MaskReveal delay={0.08}><h3>Aether Motors</h3></MaskReveal>
 *
 * Pass exactly one element child — it's the line that travels. A little bottom
 * padding is reserved so descenders aren't clipped, with no layout shift.
 * Honours reduced motion (renders in place).
 */

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type MaskRevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds — stagger lines with this. */
  delay?: number;
  /** Duration in seconds. Defaults to 0.9. */
  duration?: number;
  /** ScrollTrigger start. Defaults to "top 88%". */
  start?: string;
};

export function MaskReveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  start = "top 88%",
}: MaskRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() === true;

  useGSAP(
    () => {
      const inner = ref.current?.firstElementChild;
      if (reduce || !inner) {
        return;
      }

      gsap.fromTo(
        inner,
        { yPercent: 118 },
        {
          yPercent: 0,
          ease: "power3.out",
          duration,
          delay,
          scrollTrigger: { trigger: ref.current, start, once: true },
        },
      );
    },
    { scope: ref, dependencies: [reduce, delay, duration, start] },
  );

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden", className)}
      style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
    >
      {children}
    </div>
  );
}
