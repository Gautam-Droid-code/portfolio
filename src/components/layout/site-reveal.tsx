"use client";

import type { ReactNode } from "react";
import { useLoading } from "@/context/loading-context";
import { cn } from "@/lib/utils";

export function SiteReveal({ children }: { children: ReactNode }) {
  const { ready } = useLoading();

  return (
    <div
      id="top"
      data-ready={ready}
      inert={!ready}
      className={cn(
        "relative z-[1] flex min-h-svh flex-col transition-[opacity,visibility] duration-reveal ease-out-expo",
        ready ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      {children}
    </div>
  );
}
