"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/**
 * The companion card that sits beside the hero in the top glass frame. The card
 * chrome and copy stay put; the media layer is an original 3D monolith robot
 * (Three.js via React Three Fiber) whose slabs lean and stagger toward the
 * cursor. It is lazy-loaded (ssr: false) so Three.js never ships in the server
 * bundle and never blocks first paint.
 *
 * Earlier takes are kept in the repo if you want to switch back: the X-wing
 * (`./xwing`), the 3D mech drone (`./drone-3d`), the 2D vector drone (`./drone`)
 * and the robot (`./mascot`) — just swap the import below.
 */
const Ship = dynamic(
  () => import("./monolith").then((module) => module.Monolith),
  {
    ssr: false,
    loading: () => <div className="drone-loading" aria-hidden="true" />,
  },
);
export function AvatarCard({ className }: { className?: string }) {
  return (
    <div
      id="about"
      aria-labelledby="about-heading"
      className={cn("about-card", className)}
    >
      <div className="about-card__top">
        <span aria-hidden="true" className="about-card__idx">
          01
        </span>
        <span className="label text-foreground">About</span>
      </div>

      <div className="about-card__media">
        <div className="absolute inset-0 pb-40 pt-4">
          <Ship />
        </div>
      </div>

      <div className="about-card__foot">
        <h2
          id="about-heading"
          className="text-[clamp(1.4rem,2.6vw,2rem)] leading-[0.95]"
        >
          One developer,
          <br />
          full attention<span className="text-accent">.</span>
        </h2>

        <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-paper/75">
          One person, full attention, no agency overhead. If it can be custom,
          it probably should be.
        </p>

        <div className="mt-6 flex items-center justify-between">
          <a
            href="#work"
            aria-label="See selected work"
            className="about-arrow"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M3 9h12M10 4l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <span aria-hidden="true" className="about-tag">
            #1
          </span>
        </div>
      </div>
    </div>
  );
}
