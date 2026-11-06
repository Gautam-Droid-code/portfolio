"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

const options = [
  { value: "light", label: "L", name: "Light" },
  { value: "system", label: "S", name: "System" },
  { value: "dark", label: "D", name: "Dark" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Client-only flag without an effect: avoids hydration mismatch while the
  // theme resolves from storage/system.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center gap-0.5 rounded-pill border border-line bg-surface/60 p-0.5"
    >
      {options.map((option) => {
        const isActive = mounted && theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-label={`${option.name} theme`}
            aria-pressed={isActive}
            title={`${option.name} theme`}
            className={cn(
              "grid size-6 place-items-center rounded-pill font-mono text-[0.625rem] uppercase leading-none tracking-[0.08em] transition-colors duration-fast sm:size-7",
              isActive
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground",
            )}
          >
            <span aria-hidden="true">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
