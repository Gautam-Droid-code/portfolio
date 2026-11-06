"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { StackCard } from "@/components/motion";

const faqs = [
  {
    question: "Do you use templates?",
    answer:
      "No. Everything is built custom — that's the whole point. No themes I'm hiding, no page-builder doing the work. If you wanted a template, you wouldn't be here.",
  },
  {
    question: "Can you do Shopify and WordPress?",
    answer:
      "Yep — standard, customized, or fully headless. I'll use the platform when it's the right call, and build from scratch when it isn't.",
  },
  {
    question: "What's 'vibe coding'?",
    answer:
      "Moving fast and trusting instinct on the build — but shipping something that's actually solid underneath. Vibe-coded, properly built. The vibes are free; the engineering isn't an afterthought.",
  },
  {
    question: "Can you add AI features?",
    answer:
      "Yes. Chatbots, concierges, automations — the kind of thing that quietly handles the repetitive work so you don't have to.",
  },
  {
    question: "How do we start?",
    answer:
      "Message me on WhatsApp or email with a rough idea of what you need. We'll talk it through, I'll tell you honestly if I'm the right fit, and we go from there.",
  },
] as const;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Faq() {
  const reduceMotion = useReducedMotion() === true;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const reveal = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.6, delay, ease: EASE },
  });

  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative">
      <div className="shell section-gap">
        <StackCard className="glass-pad">
        <motion.div className="faq-reveal" {...reveal(0)}>
          <p className="label flex items-center gap-2.5 text-muted">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-accent"
            />
            FAQ
          </p>

          <h2
            id="faq-heading"
            className="mt-6 text-4xl lg:text-[clamp(2.5rem,4.7vw,3.75rem)]"
          >
            Things you might ask
            <span className="text-accent">.</span>
          </h2>
        </motion.div>

        <div className="mt-14 border-t border-line sm:mt-20">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-question-${index + 1}`;
            const panelId = `faq-panel-${index + 1}`;

            return (
              <motion.div
                key={faq.question}
                className="faq-reveal border-b border-line"
                {...reveal(index * 0.05)}
              >
                <h3 className="font-sans text-lg font-medium normal-case leading-snug tracking-tight sm:text-xl">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="group flex w-full items-start justify-between gap-6 py-6 text-left sm:py-8"
                  >
                    <span className="text-balance">{faq.question}</span>

                    <span
                      aria-hidden="true"
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center transition-[color,rotate] duration-300 ease-out-expo group-hover:text-accent ${
                        isOpen ? "rotate-45 text-accent" : "text-faint"
                      }`}
                    >
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        className="size-3"
                      >
                        <path
                          d="M6 1.5v9M1.5 6h9"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </button>
                </h3>

                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.4, ease: EASE }
                  }
                  className="overflow-hidden"
                >
                  <p className="max-w-[60ch] pb-7 text-sm leading-relaxed text-muted sm:pb-8 sm:text-base">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        </StackCard>
      </div>
    </section>
  );
}
