"use client";

/**
 * Twist carousel — a 3D card deck you flip through by dragging.
 *
 * A recreation of the "Funky Twist" carousel interaction: a stack of cards
 * fanned in 3D space that twist (rotateY) and tilt (rotateZ) as you drag across
 * the stage or scrub the slider. The centred card is the focus; neighbours peel
 * back with depth, scale and blur. It deals itself out on first scroll-in, snaps
 * to the nearest card on release, and is driveable by drag, the scrubber, the
 * prev/next buttons and the keyboard.
 *
 *   <TwistCarousel items={items} />
 *
 * Performance: transforms are written straight to the card nodes from a single
 * GSAP tween / pointer loop, never through React state — only the active index
 * (which updates the big number, label and aria state) round-trips through React.
 * Honours prefers-reduced-motion: no 3D, no drag; cards swap instantly and the
 * buttons / scrubber still navigate.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type TwistItem = {
  /** Two-digit index shown large on the card, e.g. "01". */
  number: string;
  title: string;
  category: string;
  /** Short label shown by the scrubber, e.g. the template / project name. */
  label: string;
  tags?: readonly string[];
  href?: string;
};

export type TwistCarouselProps = {
  items: readonly TwistItem[];
  className?: string;
};

const REST_TILT = -6; // deg — the signature diagonal lean of the whole deck
const MAX_RY = 44; // deg — clamp the twist so far cards never flip past edge-on
const DRAG_PX_PER_CARD = 1.1; // multiple of card width to drag one card across

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" fill="none" className={className}>
      <path
        d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TwistCarousel({ items, className }: TwistCarouselProps) {
  const reduce = useReducedMotion() === true;
  const n = items.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLButtonElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  // Continuous position + intro progress, driven imperatively (never via state).
  const anim = useRef({ pos: 0, intro: reduce ? 1 : 0 });
  const tween = useRef<ReturnType<typeof gsap.to> | null>(null);
  const spacing = useRef(220); // px between adjacent card centres (measured)
  const cardW = useRef(360);

  const drag = useRef({
    active: false,
    startX: 0,
    startPos: 0,
    moved: false,
    source: "stage" as "stage" | "scrub",
  });

  const [active, setActive] = useState(0);

  /* ---- layout: write the deck's transforms for a given position ---------- */

  const layout = useCallback(
    (p: number) => {
      const cards = cardsRef.current;
      const intro = anim.current.intro;

      for (let i = 0; i < cards.length; i += 1) {
        const el = cards[i];
        if (!el) continue;

        const rel = i - p;
        const ax = Math.abs(rel);

        if (reduce) {
          const shown = Math.round(p) === i;
          el.style.transform = "none";
          el.style.opacity = shown ? "1" : "0";
          el.style.filter = "none";
          el.style.zIndex = shown ? "2" : "0";
          el.style.pointerEvents = shown ? "auto" : "none";
          continue;
        }

        const x = rel * spacing.current * intro;
        const lift = ax * 10 * intro;
        const z = -ax * 170 * intro;
        const ry = gsap.utils.clamp(-MAX_RY, MAX_RY, rel * -17) * intro;
        const rz = (REST_TILT + rel * -2.4) * intro;
        const scale = 1 - ax * 0.11 * intro;
        const op = ax > 2.6 ? 0 : 1;
        const blur = ax > 1 ? Math.min((ax - 1) * 2.2, 6) : 0;

        el.style.transform = `translate3d(${x}px, ${lift}px, ${z}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
        el.style.opacity = String(op);
        el.style.filter = blur ? `blur(${blur}px)` : "none";
        el.style.zIndex = String(1000 - Math.round(ax * 100));
        el.style.pointerEvents = ax < 0.5 ? "auto" : "none";
      }

      if (thumbRef.current && n > 1) {
        thumbRef.current.style.left = `${(p / (n - 1)) * 100}%`;
      }
    },
    [reduce, n],
  );

  /* ---- measure card geometry (responsive) -------------------------------- */

  const measure = useCallback(() => {
    const first = cardsRef.current[0];
    if (first) {
      cardW.current = first.offsetWidth || cardW.current;
      spacing.current = Math.max(cardW.current * 0.5, 120);
    }
  }, []);

  /* ---- navigate ---------------------------------------------------------- */

  const go = useCallback(
    (target: number, animate = true) => {
      const t = gsap.utils.clamp(0, n - 1, target);
      tween.current?.kill();

      if (reduce || !animate) {
        anim.current.pos = t;
        layout(t);
        setActive(Math.round(t));
        return;
      }

      tween.current = gsap.to(anim.current, {
        pos: t,
        duration: 0.7,
        ease: "power3.out",
        onUpdate: () => layout(anim.current.pos),
        onComplete: () => setActive(Math.round(t)),
      });
      setActive(Math.round(t));
    },
    [layout, n, reduce],
  );

  const snap = useCallback(() => {
    go(Math.round(anim.current.pos));
  }, [go]);

  /* ---- drag on the stage ------------------------------------------------- */

  const onStagePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (reduce || n < 2) return;
      tween.current?.kill();
      drag.current = {
        active: true,
        startX: e.clientX,
        startPos: anim.current.pos,
        moved: false,
        source: "stage",
      };
      stageRef.current?.setPointerCapture(e.pointerId);
    },
    [reduce, n],
  );

  const onStagePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d.active || d.source !== "stage") return;
      const dx = d.startX - e.clientX;
      if (Math.abs(dx) > 5) d.moved = true;
      const dp = dx / (cardW.current * DRAG_PX_PER_CARD);
      const next = gsap.utils.clamp(0, n - 1, d.startPos + dp);
      anim.current.pos = next;
      layout(next);
      const na = Math.round(next);
      if (na !== active) setActive(na);
    },
    [layout, n, active],
  );

  const endStageDrag = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d.active || d.source !== "stage") return;
      d.active = false;
      try {
        stageRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* capture may already be gone */
      }
      snap();
    },
    [snap],
  );

  /* ---- scrubber ---------------------------------------------------------- */

  const posFromTrack = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return anim.current.pos;
      const t = gsap.utils.clamp(0, 1, (clientX - rect.left) / rect.width);
      return t * (n - 1);
    },
    [n],
  );

  const onScrubPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (reduce || n < 2) return;
      e.stopPropagation();
      tween.current?.kill();
      drag.current = {
        active: true,
        startX: e.clientX,
        startPos: anim.current.pos,
        moved: true,
        source: "scrub",
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const next = posFromTrack(e.clientX);
      anim.current.pos = next;
      layout(next);
      setActive(Math.round(next));
    },
    [reduce, n, posFromTrack, layout],
  );

  const onScrubPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d.active || d.source !== "scrub") return;
      const next = posFromTrack(e.clientX);
      anim.current.pos = next;
      layout(next);
      const na = Math.round(next);
      if (na !== active) setActive(na);
    },
    [posFromTrack, layout, active],
  );

  const endScrubDrag = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d.active || d.source !== "scrub") return;
      d.active = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      snap();
    },
    [snap],
  );

  /* ---- keyboard ---------------------------------------------------------- */

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(active - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(active + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(n - 1);
      }
    },
    [go, active, n],
  );

  /* ---- mount: measure, deal-in on first view, resize --------------------- */

  useEffect(() => {
    measure();
    layout(0);

    if (reduce) {
      anim.current.intro = 1;
      layout(0);
    } else {
      const stage = stageRef.current;
      let played = false;
      const io = new IntersectionObserver(
        (entries) => {
          if (played || !entries[0]?.isIntersecting) return;
          played = true;
          io.disconnect();
          tween.current?.kill();
          tween.current = gsap.to(anim.current, {
            intro: 1,
            duration: 1.1,
            ease: "power3.out",
            onUpdate: () => layout(anim.current.pos),
          });
        },
        { threshold: 0.3 },
      );
      if (stage) io.observe(stage);

      const onResize = () => {
        measure();
        layout(anim.current.pos);
      };
      window.addEventListener("resize", onResize);

      return () => {
        io.disconnect();
        window.removeEventListener("resize", onResize);
        tween.current?.kill();
      };
    }

    const onResize = () => {
      measure();
      layout(anim.current.pos);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      tween.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  if (n === 0) return null;

  const activeItem = items[active] ?? items[0];
  const suppressClick = () => drag.current.moved;

  return (
    <div className={cn("select-none", className)}>
      {/* Stage ---------------------------------------------------------- */}
      <div
        ref={stageRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Project carousel — drag, scrub or use arrow keys"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={endStageDrag}
        onPointerCancel={endStageDrag}
        className={cn(
          "relative h-[clamp(20rem,46vw,30rem)] w-full",
          !reduce && n > 1 && "cursor-grab active:cursor-grabbing",
          "outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-xl",
        )}
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, i) => (
            <div
              key={item.number + item.title}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              aria-hidden={i !== active}
              className={cn(
                "absolute left-1/2 top-1/2 aspect-[16/11] w-[clamp(15rem,62vw,27rem)]",
                "-translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border",
              )}
              style={{
                willChange: "transform, filter, opacity",
                backfaceVisibility: "hidden",
                borderColor: "var(--glass-hi)",
                background:
                  "radial-gradient(130% 120% at 78% 8%, color-mix(in srgb, var(--accent) 34%, transparent), transparent 58%)," +
                  "radial-gradient(120% 130% at 12% 108%, color-mix(in srgb, var(--color-blue) 48%, var(--color-ink)), transparent 60%)," +
                  "color-mix(in srgb, var(--color-ink) 72%, transparent)",
                boxShadow: "0 40px 90px -30px rgb(0 0 0 / 0.7)",
                WebkitBackdropFilter: "blur(10px) saturate(1.25)",
                backdropFilter: "blur(10px) saturate(1.25)",
              }}
            >
              {/* label (top-left) */}
              <p className="label absolute left-5 top-5 text-foreground/70">
                {item.label}
              </p>

              {/* big index number (bottom-right) */}
              <span
                aria-hidden="true"
                className="absolute bottom-3 right-5 font-display font-extrabold leading-none tracking-tight"
                style={{
                  fontSize: "clamp(3.5rem, 11vw, 7rem)",
                  color: "color-mix(in srgb, var(--color-paper) 20%, transparent)",
                }}
              >
                {item.number}
              </span>

              {/* copy (bottom-left) */}
              <div className="absolute inset-x-5 bottom-5 max-w-[78%]">
                <p className="label text-accent">{item.category}</p>
                <h3
                  className="mt-2 text-foreground"
                  style={{ fontSize: "clamp(1.4rem, 3.4vw, 2.25rem)" }}
                >
                  {item.title}
                </h3>

                {item.tags && item.tags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 3).map((tag) => (
                      <li
                        key={tag}
                        className="label rounded-pill border border-line bg-surface/40 px-2.5 py-1 text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${item.title} — view project (opens in a new tab)`}
                  tabIndex={i === active ? 0 : -1}
                  onClick={(e) => {
                    if (suppressClick()) e.preventDefault();
                  }}
                  className="absolute right-4 top-4 grid size-10 place-items-center rounded-pill border border-line bg-background/70 text-accent backdrop-blur transition-colors duration-300 hover:bg-accent hover:text-accent-on-solid"
                >
                  <ArrowUpRight className="size-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls ------------------------------------------------------- */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active <= 0}
            aria-label="Previous project"
            className="grid size-11 place-items-center rounded-pill border border-line bg-surface/50 text-foreground transition-all duration-300 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowIcon className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active >= n - 1}
            aria-label="Next project"
            className="grid size-11 place-items-center rounded-pill border border-line bg-surface/50 text-foreground transition-all duration-300 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowIcon className="size-4" />
          </button>
        </div>

        {/* scrubber */}
        <div className="flex min-w-[9rem] flex-1 items-center gap-4">
          <span className="label tabular-nums text-faint">
            {String(active + 1).padStart(2, "0")}
          </span>
          <div
            ref={trackRef}
            onPointerDown={onScrubPointerDown}
            onPointerMove={onScrubPointerMove}
            onPointerUp={endScrubDrag}
            onPointerCancel={endScrubDrag}
            className={cn(
              "relative h-1.5 flex-1 rounded-pill bg-line",
              !reduce && n > 1 && "cursor-pointer",
            )}
          >
            <button
              ref={thumbRef}
              type="button"
              aria-label="Scrub through projects"
              className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-pill border border-line-strong bg-foreground shadow-[0_4px_12px_-2px_rgb(0_0_0/0.6)] transition-colors duration-300 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{ left: `${n > 1 ? (active / (n - 1)) * 100 : 0}%` }}
            />
          </div>
          <span className="label tabular-nums text-faint">
            {String(n).padStart(2, "0")}
          </span>
        </div>

        <p className="label ml-auto text-muted" aria-live="polite">
          {activeItem.label}
        </p>
      </div>
    </div>
  );
}
