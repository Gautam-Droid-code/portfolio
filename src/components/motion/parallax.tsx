"use client";

/**
 * Scroll-linked parallax layer, driven by GSAP ScrollTrigger (scrubbed, so it
 * tracks Lenis 1:1). Wrap any content and give it a `speed`:
 *
 *   <Parallax speed={0.3}>…</Parallax>   // drifts against the scroll for depth
 *   <Parallax speed={-0.2}>…</Parallax>  // negative drifts the other way
 *
 * Honours prefers-reduced-motion — the layer simply sits still.
 */

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type ParallaxProps = {
  children: ReactNode;
  /** Drift strength as a fraction of the element height. ~0.1–0.4 reads well. */
  speed?: number;
  className?: string;
};

export function Parallax({ children, speed = 0.2, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() === true;

  useGSAP(
    () => {
      if (reduce || !ref.current) {
        return;
      }

      const shift = speed * 100;

      gsap.fromTo(
        ref.current,
        { yPercent: -shift },
        {
          yPercent: shift,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [speed, reduce] },
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
