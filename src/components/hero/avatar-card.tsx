"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The "about" box that sits beside the hero in the top glass frame. It shows a
 * static avatar poster (no Spline runtime — near-zero load) behind a skeleton
 * shimmer that crossfades out once the image decodes. Drop a full-figure export
 * in at /hero/avatar-poster.png and this upgrades automatically.
 */
export function AvatarCard({ className }: { className?: string }) {
  const [loaded, setLoaded] = useState(false);

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
        <div
          aria-hidden="true"
          className={cn("skeleton", loaded && "skeleton--hidden")}
        />
        <Image
          src="/hero/avatar-poster.png"
          alt="Gautam Singh"
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 100vw"
          onLoad={() => setLoaded(true)}
          className={cn("about-card__img", loaded && "is-loaded")}
        />
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
