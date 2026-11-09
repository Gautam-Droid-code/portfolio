"use client";

import { useEffect, useRef } from "react";
import "./aurora.css";

/**
 * Fixed 3D-style background: a dark glossy sheet whose shape morphs continuously
 * (SMIL path animation) with a bright bloom and sliding specular highlights.
 * Each section is a frosted-glass panel that scrolls over this layer. Styles
 * live in ./aurora.css; the CSS blob motion is frozen on phones and under
 * prefers-reduced-motion there.
 *
 * The SVG morph is SMIL, which CSS can't stop, so it's paused from JS: on phones
 * and under reduced motion it freezes entirely, and it pauses while the tab is
 * hidden. This keeps scrolling smooth on mobile and fixes reduced-motion (which
 * previously left the SMIL running).
 */
export function AuroraField() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== "function") return;

    const mobile = window.matchMedia("(max-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const freeze = mobile.matches || reduce.matches || document.hidden;
      try {
        if (freeze) svg.pauseAnimations();
        else svg.unpauseAnimations();
      } catch {
        /* no-op */
      }
    };

    update();
    mobile.addEventListener("change", update);
    reduce.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);

    return () => {
      mobile.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div className="aurora" aria-hidden="true">
      <span className="aurora__flow aurora__flow--1" />
      <span className="aurora__flow aurora__flow--2" />
      <span className="aurora__flow aurora__flow--3" />
      <span className="aurora__flow aurora__flow--bloom" />

      <svg
        ref={svgRef}
        className="aurora__fold"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="aurora-dark" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#04050b" />
            <stop offset="0.5" stopColor="#0a0f1e" />
            <stop offset="1" stopColor="#04050b" />
          </linearGradient>
          <linearGradient id="aurora-spec" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0" stopColor="var(--color-blue-light)" stopOpacity="0" />
            <stop offset="0.5" stopColor="var(--color-blue-light)" />
            <stop offset="1" stopColor="var(--color-blue-light)" stopOpacity="0" />
          </linearGradient>
          <filter id="aurora-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id="aurora-specf">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>

        <g className="aurora__fold-move">
          <path fill="url(#aurora-dark)" filter="url(#aurora-soft)" d="M430 -60 C 500 220 820 260 760 500 C 710 700 980 780 940 980 L 1500 980 L 1500 -60 C 1360 120 1180 60 1120 280 C 1070 470 1280 560 1180 760 Z">
            <animate
              attributeName="d"
              dur="13s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.22;0.49;0.76;1"
              keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
              values="M430 -60 C 500 220 820 260 760 500 C 710 700 980 780 940 980 L 1500 980 L 1500 -60 C 1360 120 1180 60 1120 280 C 1070 470 1280 560 1180 760 Z;
                M380 -60 C 560 180 760 320 820 520 C 880 720 900 800 980 980 L 1500 980 L 1500 -60 C 1320 160 1220 100 1160 320 C 1100 520 1240 600 1160 800 Z;
                M470 -60 C 460 260 880 240 720 480 C 620 660 1020 760 900 980 L 1500 980 L 1500 -60 C 1380 90 1140 40 1100 260 C 1050 440 1320 540 1200 740 Z;
                M410 -60 C 540 200 780 300 800 520 C 820 740 940 820 920 980 L 1500 980 L 1500 -60 C 1340 140 1200 80 1140 300 C 1080 500 1260 580 1170 780 Z;
                M430 -60 C 500 220 820 260 760 500 C 710 700 980 780 940 980 L 1500 980 L 1500 -60 C 1360 120 1180 60 1120 280 C 1070 470 1280 560 1180 760 Z"
            />
          </path>

          <path fill="none" stroke="url(#aurora-spec)" strokeWidth="6" opacity="0.75" filter="url(#aurora-specf)" d="M620 80 C 640 280 820 360 800 560">
            <animate
              attributeName="d"
              dur="13s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.22;0.49;0.76;1"
              keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
              values="M620 80 C 640 280 820 360 800 560;
                M660 60 C 700 280 860 380 820 580;
                M600 90 C 620 300 800 380 780 600;
                M640 70 C 680 290 840 370 810 590;
                M620 80 C 640 280 820 360 800 560"
            />
          </path>

          <path fill="none" stroke="url(#aurora-spec)" strokeWidth="3" opacity="0.55" filter="url(#aurora-specf)" d="M1120 160 C 1080 340 1200 460 1140 660">
            <animate
              attributeName="d"
              dur="13s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.22;0.49;0.76;1"
              keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
              values="M1120 160 C 1080 340 1200 460 1140 660;
                M1160 140 C 1120 360 1240 480 1180 680;
                M1100 170 C 1060 330 1180 450 1120 650;
                M1140 150 C 1100 350 1220 470 1160 670;
                M1120 160 C 1080 340 1200 460 1140 660"
            />
          </path>
        </g>
      </svg>
    </div>
  );
}
