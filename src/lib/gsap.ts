"use client";

/**
 * Single registration point for GSAP and its plugins.
 *
 * Import `gsap`, `ScrollTrigger`, and `useGSAP` from here (never straight from
 * the packages) so the plugins are registered exactly once and every scroll
 * scene shares the same instance. ScrollTrigger stays in sync with Lenis via
 * `SmoothScrollProvider`, which drives both from a single RAF loop.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registration touches `document`, so guard against the server pass.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
