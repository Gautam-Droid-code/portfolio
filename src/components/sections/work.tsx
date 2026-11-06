"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { MaskReveal, StackCard, UncoverImage } from "@/components/motion";

const projects = [
  {
    slug: "vanta",
    number: "01",
    image: "/work/vanta.jpg",
    imageAlt: "VANTA — technical streetwear e-commerce store",
    category: "Full-stack e-commerce",
    title: "Vanta",
    description:
      "A custom streetwear commerce platform — not a Shopify theme. Built from scratch with its own admin CMS, customer accounts, saved bags, wishlist and an optimized image pipeline. Dark editorial, engineered for the Indian street and tuned for Indian mobile networks.",
    tags: [
      "Next.js",
      "React",
      "TypeScript",
      "Postgres / Prisma",
      "Framer Motion",
    ],
    role: "Design & full-stack development",
    href: "https://vanta-ecom-store.vercel.app/",
  },
  {
    slug: "aether",
    number: "02",
    image: "/work/aether.jpg",
    imageAlt: "AETHER Motors — premium electric car showroom",
    category: "Concept · 3D + AI",
    title: "Aether Motors",
    description:
      "A cinematic showroom for a premium EV brand — a live 3D hero, GSAP scroll choreography, an inventory to browse, test-drive booking, and an AI concierge that helps pick your car. A '$10K-feel' build, kept light with a graceful fallback on mobile.",
    tags: ["Next.js", "Spline 3D", "GSAP", "Lenis", "Supabase"],
    role: "Design & development",
    href: "https://aether-ev.vercel.app/",
  },
] as const;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
    >
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

export function Work() {
  const reduceMotion = useReducedMotion() === true;

  const reveal = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.7, delay, ease: EASE },
  });

  // Articles fade only — the image uncover and masked headings own the motion,
  // so a competing translate here would just muddy them.
  const fade = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, amount: 0.12 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.6, delay, ease: EASE },
  });

  return (
    <section id="work" aria-labelledby="work-heading" className="relative">
      <div className="shell section-gap">
        <StackCard className="glass-pad">
        <motion.div
          className="work-reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-4"
          {...reveal(0)}
        >
          <div>
            <p className="label flex items-center gap-2.5 text-muted">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-accent"
              />
              Selected work
            </p>

            <h2
              id="work-heading"
              className="mt-6 text-4xl lg:text-[clamp(2.5rem,4.7vw,3.75rem)]"
            >
              Built, not templated
              <span className="text-accent">.</span>
            </h2>
          </div>

          <p className="label ml-auto tabular-nums text-faint">
            02 <span className="text-accent">—</span> Selected
          </p>
        </motion.div>

        <div className="mt-16 flex flex-col gap-16 sm:mt-20 lg:gap-24">
          {projects.map((project, index) => {
            const reversed = index % 2 === 1;

            return (
              <motion.article
                key={project.slug}
                className={`work-reveal group relative${
                  index > 0
                    ? " border-t border-line pt-16 sm:pt-20 lg:pt-24"
                    : ""
                }`}
                {...fade(index * 0.06)}
              >
                <div
                  className={`grid gap-8 lg:items-center lg:gap-12 xl:gap-16 ${
                    reversed
                      ? "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
                      : "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
                  }`}
                >
                  <UncoverImage
                    className={`relative aspect-[16/10] max-w-[784px] overflow-hidden rounded-lg border border-line bg-surface ${
                      reversed ? "lg:order-2" : ""
                    }`}
                  >
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out-expo motion-safe:group-hover:scale-[1.03] motion-safe:group-focus-within:scale-[1.03]"
                    />

                    <span
                      aria-hidden="true"
                      className="absolute right-4 top-4 grid size-11 place-items-center rounded-pill border border-line bg-background/80 text-accent opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <ArrowUpRight className="size-4" />
                    </span>
                  </UncoverImage>

                  <div
                    className={`flex max-w-[52ch] flex-col gap-6 ${
                      reversed ? "lg:order-1" : ""
                    }`}
                  >
                    <MaskReveal>
                      <p className="label flex flex-wrap items-center gap-2.5 text-faint">
                        <span className="text-accent">{project.number}</span>
                        <span aria-hidden="true">/</span>
                        {project.category}
                      </p>
                    </MaskReveal>

                    <MaskReveal delay={0.08}>
                      <h3 className="-mt-1 text-[clamp(2.25rem,5vw,4rem)]">
                        {project.title}
                      </h3>
                    </MaskReveal>

                    <p className="leading-copy text-muted">
                      {project.description}
                    </p>

                    <ul
                      aria-label={`${project.title} tech stack`}
                      className="flex flex-wrap gap-2"
                    >
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="label rounded-pill border border-line bg-surface/40 px-3 py-1.5 text-muted"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>

                    <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm">
                      <span className="label text-faint">Role</span>
                      <span aria-hidden="true" className="text-accent">
                        —
                      </span>
                      <span className="text-muted">{project.role}</span>
                    </p>

                    <span className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-accent group-focus-within:text-accent">
                      View project
                      <ArrowUpRight className="size-3.5 text-accent transition-transform duration-300 ease-out-expo motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-within:-translate-y-0.5 motion-safe:group-focus-within:translate-x-0.5" />
                    </span>
                  </div>
                </div>

                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${project.title} — view project (opens in a new tab)`}
                  className="absolute inset-0 rounded-lg"
                />
              </motion.article>
            );
          })}
        </div>
        </StackCard>
      </div>
    </section>
  );
}
