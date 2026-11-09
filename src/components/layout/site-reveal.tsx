"use client";

import type { ReactNode } from "react";
import { useLoading } from "@/context/loading-context";

export function SiteReveal({ children }: { children: ReactNode }) {
  const { ready } = useLoading();

  return (
    <div
      id="top"
      data-ready={ready}
      // Content paints immediately and the Preloader covers it as an opaque
      // overlay (fixed inset-0 z-100) until `ready`. Hiding this subtree with
      // `opacity-0` instead would keep the browser from counting it for LCP,
      // which is what pushed mobile LCP to 4.6s. `inert` still blocks
      // interaction and focus while the overlay is up.
      inert={!ready}
      className="relative z-[1] flex min-h-svh flex-col"
    >
      {children}
    </div>
  );
}
