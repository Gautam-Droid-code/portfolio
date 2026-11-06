"use client";

/**
 * Framer Motion reveal primitive — the house style for simple "fade + slide in
 * on enter" moments. Use this for copy, cards, and list items; reach for the
 * GSAP primitives (Parallax, useScrollScene) when you need scrubbed or pinned
 * motion tied to scroll position.
 *
 *   <Reveal className="...">…</Reveal>                     // drop-in wrapper
 *   <Reveal direction="left" delay={0.1}>…</Reveal>
 *
 *   const reveal = useReveal();                             // spread onto any
 *   <motion.h2 {...reveal({ delay: index * 0.05 })} />      // motion element
 *
 * Both honour prefers-reduced-motion: the resting state is shown immediately.
 */

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export type Direction = "up" | "down" | "left" | "right" | "none";

export type RevealOptions = {
  /** Where the element travels from. Defaults to "up". */
  direction?: Direction;
  /** Travel distance in px. Defaults to 20. */
  distance?: number;
  /** Delay in seconds — stagger siblings with `index * step`. */
  delay?: number;
  /** Duration in seconds. Defaults to 0.7. */
  duration?: number;
  /** Fire once (default) or every time it enters the viewport. */
  once?: boolean;
  /** Fraction of the element in view before it fires. Defaults to 0.15. */
  amount?: number;
};

function offset(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
}

/**
 * Returns a `reveal()` factory producing props to spread onto a motion element.
 * Call the hook at the top of a component, then call the result per element.
 */
export function useReveal() {
  const reduce = useReducedMotion() === true;

  return (opts: RevealOptions = {}) => {
    const {
      direction = "up",
      distance = 20,
      delay = 0,
      duration = 0.7,
      once = true,
      amount = 0.15,
    } = opts;

    const transition: Transition = reduce
      ? { duration: 0 }
      : { duration, delay, ease: EASE };

    return {
      initial: reduce ? false : { opacity: 0, ...offset(direction, distance) },
      whileInView: { opacity: 1, x: 0, y: 0 },
      viewport: { once, amount },
      transition,
    } as const;
  };
}

export type RevealProps = RevealOptions & HTMLMotionProps<"div">;

export function Reveal({
  direction,
  distance,
  delay,
  duration,
  once,
  amount,
  ...rest
}: RevealProps) {
  const reveal = useReveal();

  return (
    <motion.div
      {...reveal({ direction, distance, delay, duration, once, amount })}
      {...rest}
    />
  );
}
