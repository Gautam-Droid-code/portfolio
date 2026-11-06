"use client";

import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";
import { useLoading } from "@/context/loading-context";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const SCROLL_DURATION = 1.1;

const easeOutExpo = (time: number) =>
  time === 1 ? 1 : 1 - Math.pow(2, -10 * time);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const { ready } = useLoading();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No smooth scroll and no RAF loop — ScrollTrigger reads native scroll,
      // and each scene renders its resting state (see the motion primitives).
      return;
    }

    const lenis = new Lenis({
      // RAF is driven by GSAP's ticker below, so Lenis must not run its own.
      autoRaf: false,
      duration: SCROLL_DURATION,
      easing: easeOutExpo,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      respectReducedMotion: true,
    });

    lenisRef.current = lenis;

    // Keep ScrollTrigger locked to Lenis' virtual scroll position, and drive
    // Lenis from GSAP's ticker so smooth scroll and scrubbed timelines share a
    // single RAF loop. Two separate loops are what make scrub animations jitter.
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (!(event.target instanceof Element)) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]');

      if (!anchor) {
        return;
      }

      // Let the browser move focus natively for the skip link.
      if (anchor.classList.contains("skip-link")) {
        return;
      }

      const hash = anchor.getAttribute("href");

      if (!hash || hash === "#") {
        return;
      }

      const target = document.querySelector<HTMLElement>(hash);

      if (!target) {
        return;
      }

      event.preventDefault();
      lenis.scrollTo(target, { duration: SCROLL_DURATION });
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;

    if (lenis) {
      if (ready) {
        lenis.start();
      } else {
        lenis.stop();
      }
    }

    // The layout is locked and hidden while loading, so trigger positions
    // measured before the gate releases are stale. Recompute once it opens.
    if (ready) {
      ScrollTrigger.refresh();
    }
  }, [ready]);

  return children;
}
