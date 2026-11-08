"use client";

/**
 * Stacked-card scroll reveal — the Grail-style panel move. A rounded card that
 * enters slightly shrunk and tilted, straightens to its resting size as its top
 * meets the top of the viewport, then tilts the other way and shrinks as it
 * peels off the top of the stack. Scrubbed 1:1 to scroll (synced to Lenis).
 *
 *   <StackCard className="glass-pad">…</StackCard>
 *
 * It renders the `glass-panel` surface itself, so swap it in for the panel div:
 *   <div className="glass-panel glass-pad">…</div>
 *   → <StackCard className="glass-pad">…</StackCard>
 *
 * Measured against the reference: enter 0.84 / +7°, settle 1 / 0°, leave 0.84 /
 * −7° — tune with `fromScale` / `fromRotate`. Honours prefers-reduced-motion
 * (renders flat at rest, no transform).
 */

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type StackCardProps = {
  children: ReactNode;
  /** Extra classes on the panel (e.g. "glass-pad"). `glass-panel` is applied. */
  className?: string;
  /** Scale the card enters and leaves at; it settles at 1. Reference ≈ 0.84. */
  fromScale?: number;
  /** Tilt in degrees on enter; it leaves at the negative. Reference ≈ 7. */
  fromRotate?: number;
};

export function StackCard({
  children,
  className,
  fromScale = 0.84,
  fromRotate = 7,
}: StackCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() === true;

  useGSAP(
    () => {
      const el = ref.current;
      if (reduce || !el) {
        return;
      }

      gsap.set(el, { transformOrigin: "50% 50%", willChange: "transform" });

      // Enter — from below the fold until the card's top reaches the viewport
      // top: it straightens (rotate → 0) and grows (scale → 1).
      gsap.fromTo(
        el,
        { scale: fromScale, rotate: fromRotate },
        {
          scale: 1,
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        },
      );

      // Leave — as it continues up and out, it tilts the other way and shrinks,
      // peeling off the top of the stack. immediateRender:false so it doesn't
      // fight the enter tween before the card has settled.
      gsap.fromTo(
        el,
        { scale: 1, rotate: 0 },
        {
          scale: fromScale,
          rotate: -fromRotate,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      // Content reveal — the panel's marked content staggers up and fades in as
      // the card enters. `data-reveal="fade"` opts an element into opacity-only
      // (used where inner mask / uncover reveals already own the vertical move).
      const items = el.querySelectorAll<HTMLElement>("[data-reveal]");

      if (items.length) {
        gsap.set(items, { opacity: 0 });

        const rise = Array.from(items).filter(
          (node) => node.dataset.reveal !== "fade",
        );

        if (rise.length) {
          gsap.set(rise, { y: 28 });
        }

        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            once: true,
          },
        });
      }
    },
    { scope: ref, dependencies: [reduce, fromScale, fromRotate] },
  );

  return (
    <div ref={ref} className={cn("glass-panel", className)}>
      {children}
    </div>
  );
}
