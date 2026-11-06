"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const PHRASES = [
  "custom web apps",
  "ai automations",
  "headless shopify & wordpress",
  "3d websites",
  "things without templates",
] as const;

const TYPE_MS = 52;
const DELETE_MS = 26;
const HOLD_MS = 1900;
const GAP_MS = 380;

type Phase = "typing" | "deleting";

export function TerminalCard({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const phrase = PHRASES[phraseIndex];
    let timer: number;

    if (phase === "typing") {
      if (typed.length < phrase.length) {
        timer = window.setTimeout(() => {
          setTyped(phrase.slice(0, typed.length + 1));
        }, TYPE_MS);
      } else {
        timer = window.setTimeout(() => setPhase("deleting"), HOLD_MS);
      }
    } else if (typed.length > 0) {
      timer = window.setTimeout(() => {
        setTyped(typed.slice(0, -1));
      }, DELETE_MS);
    } else {
      timer = window.setTimeout(() => {
        setPhraseIndex((current) => (current + 1) % PHRASES.length);
        setPhase("typing");
      }, GAP_MS);
    }

    return () => window.clearTimeout(timer);
  }, [phase, phraseIndex, reduceMotion, typed]);

  const output = reduceMotion ? PHRASES[0] : typed;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md border border-line bg-surface/95 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm",
        className,
      )}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line bg-surface-raised/50 px-3.5 py-2.5">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-accent/80" />
          <span className="size-1.5 rounded-full bg-muted/50" />
          <span className="size-1.5 rounded-full bg-line-strong" />
        </span>
        <span className="text-center font-mono text-[0.625rem] tracking-[0.08em] text-faint">
          gautam@portfolio ~
        </span>
        <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-faint/70">
          zsh
        </span>
      </div>

      <div className="space-y-1.5 px-4 py-4 font-mono text-[0.78rem] leading-[1.55] sm:text-[0.8125rem]">
        <p className="text-foreground/90">
          <span className="text-accent">›</span> whoami
        </p>
        <p className="text-muted">gautam singh — vibe coder</p>
        <p className="text-foreground/90">
          <span className="text-accent">›</span> building{" "}
          <span className="text-foreground">{output}</span>
          {!reduceMotion && <span className="terminal-caret" />}
        </p>
      </div>
    </div>
  );
}
