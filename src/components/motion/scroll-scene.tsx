"use client";

/**
 * The workhorse for cinematic, pinned + scrubbed chapters. Attach the returned
 * ref to the section you want to pin, and build a timeline against its children
 * inside the callback — the timeline's progress is tied to scroll through the
 * pinned range.
 *
 *   function Chapter() {
 *     const scope = useScrollScene((tl) => {
 *       tl.from(".headline", { yPercent: 40, opacity: 0 })
 *         .to(".backdrop", { scale: 1.2 }, 0);
 *     }, { end: "+=150%" });
 *
 *     return (
 *       <section ref={scope} className="min-h-svh">
 *         <div className="backdrop" />
 *         <h2 className="headline">…</h2>
 *       </section>
 *     );
 *   }
 *
 * Cleanup (killing the timeline + its ScrollTrigger) is handled by useGSAP.
 * Honours prefers-reduced-motion — no pin, no scrub; children show at rest.
 * Flip `markers: true` while tuning start/end, then turn it off.
 */

import { useRef, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";

export type ScrollSceneOptions = {
  /** ScrollTrigger start. Defaults to "top top" (pin as it reaches the top). */
  start?: string;
  /** ScrollTrigger end. Defaults to "+=100%" (one viewport of scroll). */
  end?: string;
  /** Pin the section while active. Defaults to true. */
  pin?: boolean;
  /** Link progress to scroll. `true`, or a number of seconds of catch-up lag. */
  scrub?: boolean | number;
  /** Dev markers — leave off in committed code. */
  markers?: boolean;
  /** Extra values that should rebuild the scene when they change. */
  dependencies?: unknown[];
};

type BuildScene = (
  timeline: gsap.core.Timeline,
  scope: HTMLElement,
) => void;

export function useScrollScene<T extends HTMLElement = HTMLDivElement>(
  build: BuildScene,
  options: ScrollSceneOptions = {},
): RefObject<T | null> {
  const scope = useRef<T>(null);
  const reduce = useReducedMotion() === true;

  const {
    start = "top top",
    end = "+=100%",
    pin = true,
    scrub = true,
    markers = false,
    dependencies = [],
  } = options;

  useGSAP(
    () => {
      if (reduce || !scope.current) {
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scope.current,
          start,
          end,
          pin,
          scrub,
          markers,
        },
      });

      build(timeline, scope.current);
    },
    {
      scope,
      dependencies: [reduce, start, end, pin, scrub, markers, ...dependencies],
    },
  );

  return scope;
}
