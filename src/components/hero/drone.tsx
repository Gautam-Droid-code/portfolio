"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Front-facing mech drone that hovers beside the hero. The whole craft banks
 * toward the cursor (a drone leaning the way it looks), while the central
 * sensor eye tracks more sharply and the wingtip thrusters pulse. Pure SVG plus
 * one requestAnimationFrame loop — no WebGL, no external runtime, no badge.
 * Every colour comes from the site tokens, so it adapts to light and dark.
 * Hover flares the thrusters; a click fires a burst. Honours reduced motion.
 */
export function Drone({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const craft = svg.querySelector<SVGGElement>("[data-craft]");
    const iris = svg.querySelector<SVGCircleElement>(".drn-iris");
    const spark = svg.querySelector<SVGCircleElement>(".drn-spark");
    const halos = Array.from(svg.querySelectorAll<SVGCircleElement>(".drn-halo"));
    const tracker: HTMLElement | null =
      svg.closest("section") ?? svg.parentElement;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;

    const clamp = (value: number) => (value < -1 ? -1 : value > 1 ? 1 : value);

    const apply = () => {
      craft?.setAttribute(
        "transform",
        `rotate(${current.x * 5} 110 122) translate(${current.x * 7} ${
          current.y * 5
        })`,
      );
      if (iris) {
        iris.setAttribute("cx", String(110 + current.x * 5));
        iris.setAttribute("cy", String(106 + current.y * 4));
      }
      if (spark) {
        spark.setAttribute("cx", String(107 + current.x * 5));
        spark.setAttribute("cy", String(103 + current.y * 4));
      }
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.09;
      current.y += (target.y - current.y) * 0.09;
      apply();
      raf = requestAnimationFrame(tick);
    };

    const handleMove = (event: PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      const anchorX = rect.left + rect.width / 2;
      const anchorY = rect.top + rect.height * 0.46;
      target.x = clamp(
        ((event.clientX - anchorX) / (window.innerWidth * 0.5)) * 1.2,
      );
      target.y = clamp(
        ((event.clientY - anchorY) / (window.innerHeight * 0.5)) * 1.2,
      );
    };

    const handleLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const handleEnter = () => {
      svg.classList.add("is-hot");
      if (iris) iris.setAttribute("r", "10.5");
    };
    const handleExit = () => {
      svg.classList.remove("is-hot");
      if (iris) iris.setAttribute("r", "9");
    };
    const handleClick = () => {
      svg.classList.remove("is-burst");
      void svg.getBoundingClientRect();
      svg.classList.add("is-burst");
    };
    const handleAnimationEnd = () => svg.classList.remove("is-burst");

    tracker?.addEventListener("pointermove", handleMove as EventListener);
    tracker?.addEventListener("pointerleave", handleLeave as EventListener);
    svg.addEventListener("pointerenter", handleEnter);
    svg.addEventListener("pointerleave", handleExit);
    svg.addEventListener("click", handleClick);
    halos.forEach((halo) => halo.addEventListener("animationend", handleAnimationEnd));

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      tracker?.removeEventListener("pointermove", handleMove as EventListener);
      tracker?.removeEventListener("pointerleave", handleLeave as EventListener);
      svg.removeEventListener("pointerenter", handleEnter);
      svg.removeEventListener("pointerleave", handleExit);
      svg.removeEventListener("click", handleClick);
      halos.forEach((halo) =>
        halo.removeEventListener("animationend", handleAnimationEnd),
      );
    };
  }, []);

  const metalStroke = { stroke: "var(--hairline-strong)" } as const;
  const accentFill = { fill: "var(--accent)" } as const;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 220 240"
      className={cn(
        "drone h-auto cursor-pointer select-none overflow-visible",
        className,
      )}
      role="img"
      aria-label="A mech drone whose sensor follows your cursor"
    >
      <defs>
        <linearGradient id="droneMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--surface-raised)" }} />
          <stop offset="1" style={{ stopColor: "var(--surface)" }} />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="110" cy="226" rx="56" ry="8" fill="rgb(0 0 0 / 0.3)" />

      <g className="drone-float">
        <g data-craft>
          {/* wing cannons */}
          <g strokeLinecap="round">
            <line x1="34" y1="60" x2="10" y2="42" stroke="url(#droneMetal)" strokeWidth="5" />
            <line x1="186" y1="60" x2="210" y2="42" stroke="url(#droneMetal)" strokeWidth="5" />
            <line x1="34" y1="182" x2="10" y2="200" stroke="url(#droneMetal)" strokeWidth="5" />
            <line x1="186" y1="182" x2="210" y2="200" stroke="url(#droneMetal)" strokeWidth="5" />
          </g>
          <g style={accentFill}>
            <circle cx="10" cy="42" r="3" />
            <circle cx="210" cy="42" r="3" />
            <circle cx="10" cy="200" r="3" />
            <circle cx="210" cy="200" r="3" />
          </g>

          {/* wing struts (the X) */}
          <g strokeLinecap="round" stroke="url(#droneMetal)" strokeWidth="13">
            <line x1="110" y1="122" x2="34" y2="60" />
            <line x1="110" y1="122" x2="186" y2="60" />
            <line x1="110" y1="122" x2="34" y2="182" />
            <line x1="110" y1="122" x2="186" y2="182" />
          </g>
          {/* power lines down each wing */}
          <g strokeLinecap="round" strokeWidth="2" style={{ stroke: "var(--accent)", opacity: 0.45 }}>
            <line x1="110" y1="122" x2="34" y2="60" />
            <line x1="110" y1="122" x2="186" y2="60" />
            <line x1="110" y1="122" x2="34" y2="182" />
            <line x1="110" y1="122" x2="186" y2="182" />
          </g>

          {/* wingtip thrusters */}
          <circle className="drn-halo" cx="34" cy="60" r="19" style={accentFill} />
          <circle className="drn-halo" cx="186" cy="60" r="19" style={accentFill} />
          <circle className="drn-halo" cx="34" cy="182" r="19" style={accentFill} />
          <circle className="drn-halo" cx="186" cy="182" r="19" style={accentFill} />

          <g fill="url(#droneMetal)" strokeWidth="1.5" style={metalStroke}>
            <circle cx="34" cy="60" r="13" />
            <circle cx="186" cy="60" r="13" />
            <circle cx="34" cy="182" r="13" />
            <circle cx="186" cy="182" r="13" />
          </g>
          <g style={accentFill}>
            <circle cx="34" cy="60" r="6.5" />
            <circle cx="186" cy="60" r="6.5" />
            <circle cx="34" cy="182" r="6.5" />
            <circle cx="186" cy="182" r="6.5" />
          </g>

          {/* top fin */}
          <line x1="110" y1="78" x2="110" y2="56" strokeWidth="3" strokeLinecap="round" style={{ stroke: "var(--accent)" }} />
          <circle cx="110" cy="54" r="4" style={accentFill} />

          {/* fuselage */}
          <path
            d="M110 74 L133 92 L133 150 L110 170 L87 150 L87 92 Z"
            fill="url(#droneMetal)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={metalStroke}
          />
          {/* vents */}
          <g strokeWidth="2" strokeLinecap="round" style={{ stroke: "var(--hairline)" }}>
            <line x1="98" y1="140" x2="108" y2="140" />
            <line x1="112" y1="140" x2="122" y2="140" />
            <line x1="100" y1="148" x2="108" y2="148" />
            <line x1="112" y1="148" x2="120" y2="148" />
          </g>

          {/* lower power core */}
          <circle className="drn-halo" cx="110" cy="158" r="9" style={accentFill} />
          <circle cx="110" cy="158" r="3.5" style={accentFill} />

          {/* cockpit canopy */}
          <path
            d="M100 90 L120 90 L124 122 L96 122 Z"
            style={{ fill: "var(--background)", stroke: "var(--hairline)" }}
          />

          {/* sensor eye */}
          <circle className="drn-halo" cx="110" cy="106" r="16" style={accentFill} />
          <circle cx="110" cy="106" r="13" style={{ fill: "var(--background)", stroke: "var(--hairline)" }} />
          <circle className="drn-iris" cx="110" cy="106" r="9" style={{ ...accentFill, transition: "r 160ms var(--ease-out-expo)" }} />
          <circle className="drn-spark" cx="107" cy="103" r="2.4" style={{ fill: "var(--foreground)" }} />
        </g>
      </g>
    </svg>
  );
}
