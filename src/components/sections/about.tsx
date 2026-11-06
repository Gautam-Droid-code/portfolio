"use client";

import { motion, useReducedMotion } from "framer-motion";

const traits = [
  "Professional overthinker",
  "Allergic to templates",
  "Fluent in late nights",
] as const;

const facts = [
  { value: "01", label: "Developer, designer & shipper" },
  { value: "∞", label: "Templates used (zero)" },
  { value: "24/7", label: "Overthinking" },
] as const;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function About() {
  const reduceMotion = useReducedMotion() === true;

  const reveal = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative border-t border-line"
    >
      <div className="shell py-section">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16 xl:gap-24">
          <motion.div className="about-reveal" {...reveal(0)}>
            <p className="label flex items-center gap-2.5 text-muted">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-accent"
              />
              A bit about me
            </p>

            <h2
              id="about-heading"
              className="mt-6 text-4xl lg:text-[clamp(2.5rem,4.7vw,3.75rem)]"
            >
              One developer, full attention
              <span className="text-accent">.</span>
            </h2>
          </motion.div>

          <div>
            <motion.p
              className="about-reveal max-w-[60ch] text-lg leading-copy text-muted sm:text-xl"
              {...reveal(0.08)}
            >
              I&apos;m Gautam — a developer and designer who builds custom
              websites and apps that refuse to look like everyone else&apos;s.
              Standard Shopify and WordPress, headless and heavily customized
              builds, bespoke e-commerce, web apps, and 3D sites — plus AI
              automations that quietly handle the boring parts. A vibe coder
              with a serious shipping habit:{" "}
              <span className="text-foreground">
                one person, full attention, no agency overhead.
              </span>{" "}
              If it can be custom, it probably should be.
            </motion.p>

            <motion.ul
              aria-label="How I work"
              className="about-reveal mt-10 flex flex-wrap gap-2"
              {...reveal(0.16)}
            >
              {traits.map((trait) => (
                <li
                  key={trait}
                  className="label rounded-pill border border-line bg-surface/40 px-3.5 py-2 text-muted"
                >
                  {trait}
                </li>
              ))}
            </motion.ul>
          </div>
        </div>

        <motion.ul
          aria-label="Quick facts"
          className="about-reveal mt-16 grid divide-y divide-line border-t border-line sm:mt-20 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          {...reveal(0.24)}
        >
          {facts.map((fact) => (
            <li
              key={fact.label}
              className="py-6 sm:px-8 sm:py-8 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="block font-display text-4xl leading-none tracking-[-0.04em]">
                {fact.value}
              </span>
              <span className="label mt-3 flex items-center gap-2 text-faint">
                <span aria-hidden="true" className="text-accent">
                  —
                </span>
                {fact.label}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
