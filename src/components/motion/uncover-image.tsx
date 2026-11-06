"use client";

/**
 * Clip-path image uncover. The image holds its frame while `clip-path: inset()`
 * wipes open from the bottom and the photo eases from a 1.25 zoom back to 1 —
 * a cinematic reveal rather than a static thumbnail. Wrap the existing frame:
 *
 *   <UncoverImage className="relative aspect-[16/10] overflow-hidden rounded-lg …">
 *     <Image fill … />
 *     <span>…overlay…</span>
 *   </UncoverImage>
 *
 * It animates the frame's <img>, then clears the inline transform on complete so
 * CSS hover (e.g. group-hover:scale) takes back over. Honours reduced motion.
 */

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";

export type UncoverImageProps = {
  children: ReactNode;
  className?: string;
  /** ScrollTrigger start. Defaults to "top 85%". */
  start?: string;
};

export function UncoverImage({
  children,
  className,
  start = "top 85%",
}: UncoverImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() === true;

  useGSAP(
    () => {
      const frame = ref.current;
      const img = frame?.querySelector("img");
      if (reduce || !img) {
        return;
      }

      gsap.set(img, { willChange: "transform, clip-path" });

      gsap.fromTo(
        img,
        { clipPath: "inset(100% 0% 0% 0%)", scale: 1.25 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          ease: "power3.out",
          duration: 1.2,
          scrollTrigger: { trigger: frame, start, once: true },
          // Hand transform control back to CSS (hover scale) once revealed.
          onComplete: () =>
            gsap.set(img, { clearProps: "transform,clipPath,willChange" }),
        },
      );
    },
    { scope: ref, dependencies: [reduce, start] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
