"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLoading } from "@/context/loading-context";

export function Preloader() {
  const { ready } = useLoading();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="preloader"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          role="status"
          aria-live="polite"
          aria-label="Loading portfolio"
          className="fixed inset-0 z-100 grid place-items-center overflow-hidden bg-ink text-paper"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,#f5f5f0_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f0_1px,transparent_1px)] [background-size:4.5rem_4.5rem]"
          />

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex w-full max-w-md flex-col items-center px-6 text-center"
          >
            <p className="label text-paper/45">Portfolio / 2026</p>

            <p className="mt-6 font-display text-6xl uppercase leading-[0.82] tracking-[-0.055em] sm:text-7xl">
              Gautam
              <br />
              <span className="text-blue-light">Singh</span>
            </p>

            <div className="mt-14 w-[min(72vw,18rem)]">
              <div className="h-px w-full overflow-hidden bg-paper/15">
                {reduceMotion ? (
                  <div className="h-full w-2/5 bg-blue-light" />
                ) : (
                  <motion.div
                    className="h-full w-1/3 bg-blue-light"
                    animate={{ x: ["-120%", "330%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: [0.45, 0, 0.55, 1],
                    }}
                  />
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-6">
                <span className="label text-paper/40">Loading</span>
                <span className="label text-paper/40">Please wait</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
