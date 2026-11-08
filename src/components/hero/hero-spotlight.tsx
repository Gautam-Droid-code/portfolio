"use client";

import { useEffect, useRef } from "react";

/**
 * A soft, accent-tinted spotlight that follows the cursor across the hero glass
 * panel. It sits behind the hero content (z-0) and is clipped to the panel's
 * rounded corners. Position is eased toward the cursor through CSS custom
 * properties; it fades out when the pointer leaves and stays off entirely under
 * reduced motion.
 */
export function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;

    if (!el || !parent) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const target = { x: 0.5, y: 0.28 };
    const current = { x: 0.5, y: 0.28 };
    let raf = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      el.style.setProperty("--spot-x", `${current.x * 100}%`);
      el.style.setProperty("--spot-y", `${current.y * 100}%`);

      if (
        Math.abs(target.x - current.x) > 0.0005 ||
        Math.abs(target.y - current.y) > 0.0005
      ) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const wake = () => {
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    const handleMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      target.x = (event.clientX - rect.left) / rect.width;
      target.y = (event.clientY - rect.top) / rect.height;
      el.style.opacity = "1";
      wake();
    };

    const handleLeave = () => {
      el.style.opacity = "0";
    };

    parent.addEventListener("pointermove", handleMove);
    parent.addEventListener("pointerleave", handleLeave);

    return () => {
      parent.removeEventListener("pointermove", handleMove);
      parent.removeEventListener("pointerleave", handleLeave);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="hero-spotlight" />;
}
