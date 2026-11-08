"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight vector mascot that sits beside the hero. Only its HEAD turns
 * toward the cursor — the body and shadow stay planted. Pure SVG plus a single
 * requestAnimationFrame loop: no WebGL, no external runtime, no third-party
 * badge. Every colour comes from the site tokens, so it adapts to light and
 * dark on its own. Honours reduced motion (rests in a neutral pose, no loop).
 *
 * Head tracking is driven by a pointer listener on the closest <section>, so
 * the head follows the cursor across the whole hero, not just over the SVG.
 * Hover (enter the mascot) makes it smile; a click makes it hop.
 */
export function Mascot({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    // Reduced motion: leave the mascot in its rest pose, wire nothing up.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const head = svg.querySelector<SVGGElement>("[data-head]");
    const pupils = Array.from(
      svg.querySelectorAll<SVGCircleElement>(".mc-pupil"),
    );
    const sparks = Array.from(
      svg.querySelectorAll<SVGCircleElement>(".mc-spark"),
    );
    const lids = Array.from(svg.querySelectorAll<SVGRectElement>(".mc-lid"));
    const neutral = svg.querySelector<SVGPathElement>(".mc-mouth-neutral");
    const smile = svg.querySelector<SVGPathElement>(".mc-mouth-smile");
    const tracker: HTMLElement | null =
      svg.closest("section") ?? svg.parentElement;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    let blinkAt = 0;

    const clamp = (value: number) =>
      value < -1 ? -1 : value > 1 ? 1 : value;

    const apply = () => {
      head?.setAttribute(
        "transform",
        `translate(${current.x * 7} ${current.y * 5}) rotate(${
          current.x * 5
        } 110 108)`,
      );
      pupils.forEach((pupil, index) => {
        pupil.setAttribute("cx", String((index ? 128 : 92) + current.x * 5));
        pupil.setAttribute("cy", String(104 + current.y * 5));
      });
      sparks.forEach((spark, index) => {
        spark.setAttribute("cx", String((index ? 125 : 89) + current.x * 5));
        spark.setAttribute("cy", String(101 + current.y * 5));
      });
    };

    const blink = () => {
      lids.forEach((lid) => lid.setAttribute("height", "20"));
      window.setTimeout(
        () => lids.forEach((lid) => lid.setAttribute("height", "0")),
        110,
      );
    };

    const tick = (now: number) => {
      current.x += (target.x - current.x) * 0.1;
      current.y += (target.y - current.y) * 0.1;
      apply();

      if (now - blinkAt > 3200 + Math.random() * 2000) {
        blinkAt = now;
        blink();
      }

      raf = requestAnimationFrame(tick);
    };

    const handleMove = (event: PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      const anchorX = rect.left + rect.width / 2;
      const anchorY = rect.top + rect.height * 0.42;
      target.x = clamp(
        ((event.clientX - anchorX) / (window.innerWidth * 0.5)) * 1.2,
      );
      target.y = clamp(
        ((event.clientY - anchorY) / (window.innerHeight * 0.5)) * 1.2,
      );
    };

    const handleLeaveSection = () => {
      target.x = 0;
      target.y = 0;
    };

    const handleEnter = () => {
      if (neutral) neutral.style.opacity = "0";
      if (smile) smile.style.opacity = "1";
      pupils.forEach((pupil) => pupil.setAttribute("r", "10.5"));
    };

    const handleExit = () => {
      if (neutral) neutral.style.opacity = "1";
      if (smile) smile.style.opacity = "0";
      pupils.forEach((pupil) => pupil.setAttribute("r", "9"));
    };

    const handleClick = () => {
      svg.classList.remove("mascot-hop");
      void svg.getBoundingClientRect(); // reflow so the animation can replay
      svg.classList.add("mascot-hop");
      lids.forEach((lid) => lid.setAttribute("height", "0"));
    };

    const handleAnimationEnd = () => svg.classList.remove("mascot-hop");

    tracker?.addEventListener("pointermove", handleMove as EventListener);
    tracker?.addEventListener(
      "pointerleave",
      handleLeaveSection as EventListener,
    );
    svg.addEventListener("pointerenter", handleEnter);
    svg.addEventListener("pointerleave", handleExit);
    svg.addEventListener("click", handleClick);
    svg.addEventListener("animationend", handleAnimationEnd);

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      tracker?.removeEventListener("pointermove", handleMove as EventListener);
      tracker?.removeEventListener(
        "pointerleave",
        handleLeaveSection as EventListener,
      );
      svg.removeEventListener("pointerenter", handleEnter);
      svg.removeEventListener("pointerleave", handleExit);
      svg.removeEventListener("click", handleClick);
      svg.removeEventListener("animationend", handleAnimationEnd);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 220 240"
      className={cn(
        "h-auto cursor-pointer select-none overflow-visible",
        className,
      )}
      role="img"
      aria-label="A small robot whose head follows your cursor"
    >
      <g className="mascot-float">
        {/* ground shadow */}
        <ellipse cx="110" cy="228" rx="52" ry="8" fill="rgb(0 0 0 / 0.32)" />

        <g data-head>
          {/* antennae */}
          <g>
            <line
              x1="84"
              y1="54"
              x2="72"
              y2="20"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="72" cy="17" r="6" fill="var(--accent)" />
          </g>
          <g>
            <line
              x1="136"
              y1="54"
              x2="150"
              y2="22"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="150" cy="19" r="5" fill="var(--accent)" />
          </g>

          {/* head shell */}
          <rect
            x="50"
            y="52"
            width="120"
            height="110"
            rx="34"
            style={{ fill: "var(--surface-raised)" }}
            stroke="var(--hairline-strong)"
            strokeWidth="1.5"
          />
          {/* face plate */}
          <rect
            x="64"
            y="72"
            width="92"
            height="66"
            rx="22"
            style={{ fill: "var(--background)" }}
            stroke="var(--hairline)"
          />

          {/* left eye */}
          <g>
            <circle
              cx="92"
              cy="104"
              r="14"
              style={{ fill: "var(--background)" }}
              stroke="var(--hairline)"
            />
            <circle
              className="mc-pupil"
              cx="92"
              cy="104"
              r="9"
              fill="var(--accent)"
              style={{ transition: "r 160ms var(--ease-out-expo)" }}
            />
            <circle className="mc-spark" cx="89" cy="101" r="2.6" fill="var(--foreground)" />
            <rect
              className="mc-lid"
              x="76"
              y="88"
              width="32"
              height="0"
              rx="7"
              style={{
                fill: "var(--surface-raised)",
                transition: "height 90ms linear",
              }}
            />
          </g>

          {/* right eye */}
          <g>
            <circle
              cx="128"
              cy="104"
              r="14"
              style={{ fill: "var(--background)" }}
              stroke="var(--hairline)"
            />
            <circle
              className="mc-pupil"
              cx="128"
              cy="104"
              r="9"
              fill="var(--accent)"
              style={{ transition: "r 160ms var(--ease-out-expo)" }}
            />
            <circle className="mc-spark" cx="125" cy="101" r="2.6" fill="var(--foreground)" />
            <rect
              className="mc-lid"
              x="112"
              y="88"
              width="32"
              height="0"
              rx="7"
              style={{
                fill: "var(--surface-raised)",
                transition: "height 90ms linear",
              }}
            />
          </g>

          {/* mouth */}
          <path
            className="mc-mouth-neutral"
            d="M98 128 Q110 131 122 128"
            stroke="var(--accent)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            style={{ transition: "opacity 200ms var(--ease-out-expo)" }}
          />
          <path
            className="mc-mouth-smile"
            d="M96 126 Q110 139 124 126"
            stroke="var(--accent)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0"
            style={{ transition: "opacity 200ms var(--ease-out-expo)" }}
          />

          {/* ear bolts */}
          <rect
            x="42"
            y="96"
            width="10"
            height="26"
            rx="4"
            style={{ fill: "var(--surface-raised)" }}
            stroke="var(--hairline-strong)"
          />
          <rect
            x="168"
            y="96"
            width="10"
            height="26"
            rx="4"
            style={{ fill: "var(--surface-raised)" }}
            stroke="var(--hairline-strong)"
          />
        </g>
      </g>
    </svg>
  );
}
