"use client";

import { StackCard } from "@/components/motion";

const services = [
  {
    number: "01",
    title: "Shopify & WordPress",
    description:
      "Standard Shopify stores and WordPress sites, done properly — fast, clean, and built to sell.",
  },
  {
    number: "02",
    title: "Headless & customized",
    description:
      "Headless or heavily customized Shopify and WordPress, for when the defaults aren't enough.",
  },
  {
    number: "03",
    title: "Custom e-commerce & sites",
    description:
      "Bespoke e-commerce and sites built from scratch — no page-builders, no templates, exactly what you need.",
  },
  {
    number: "04",
    title: "Web apps & apps",
    description:
      "Full web apps and applications, designed and built end to end.",
  },
  {
    number: "05",
    title: "3D websites",
    description:
      "Immersive, interactive 3D experiences — the kind that make people stop scrolling.",
  },
] as const;

export function Services() {
  return (
    <section id="services" aria-labelledby="services-heading" className="relative">
      <div className="shell section-gap">
        <StackCard className="glass-pad">
        <div className="services-reveal" data-reveal>
          <p className="label flex items-center gap-2.5 text-muted">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-accent"
            />
            What I do
          </p>

          <h2
            id="services-heading"
            className="mt-6 text-4xl lg:text-[clamp(2.5rem,4.7vw,3.75rem)]"
          >
            What I actually do
            <span className="text-accent">.</span>
          </h2>
        </div>

        <ol className="mt-14 border-t border-line sm:mt-20">
          {services.map((service, index) => (
            <li
              key={service.number}
              className="services-reveal group border-b border-line"
              data-reveal
            >
              <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 py-7 transition-transform duration-base ease-out-expo lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.1fr)_2rem] lg:gap-x-8 lg:py-9 lg:group-hover:-translate-y-0.5">
                <span className="label pt-0.5 tabular-nums text-faint transition-colors duration-fast group-hover:text-accent lg:pt-1">
                  {service.number}
                </span>

                <h3 className="text-xl leading-[0.95]">{service.title}</h3>

                <p className="col-span-2 col-start-2 max-w-[48ch] text-sm leading-relaxed text-muted lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:text-base">
                  {service.description}
                </p>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="col-start-3 row-start-1 mt-1 size-3.5 shrink-0 text-faint transition-[color,transform] duration-base ease-out-expo group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 lg:col-start-4 lg:mt-1.5 lg:size-4"
                >
                  <path
                    d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </li>
          ))}
        </ol>
        </StackCard>
      </div>
    </section>
  );
}
