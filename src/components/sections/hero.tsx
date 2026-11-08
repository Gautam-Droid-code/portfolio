import { AvatarCard } from "@/components/hero/avatar-card";
import { HeroSpotlight } from "@/components/hero/hero-spotlight";
import { siteConfig } from "@/lib/site";

const traits = [
  "Professional overthinker",
  "Allergic to templates",
  "Vibe coder, serious shipper",
] as const;

/**
 * Top section: the hero text and the companion "about" card share one glass
 * frame floating over the fixed blue aurora. The word "expensive" takes a
 * theme-aware metallic treatment (see `.metal-text`); the card beside it holds
 * the cursor-tracking mascot and carries the page's `#about` anchor.
 */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative">
      <div className="shell pt-[calc(var(--header-h)_+_clamp(1.5rem,4vw,3rem))] pb-[clamp(1rem,3vw,2.5rem)]">
        <div className="glass-panel overflow-hidden p-3.5">
          <HeroSpotlight />
          <div className="relative z-10 grid gap-3.5 lg:grid-cols-[1.15fr_0.85fr]">
            {/* HERO BOX */}
            <div className="relative flex min-h-[32rem] flex-col p-[clamp(1.4rem,3vw,2.4rem)]">
              <div
                aria-hidden="true"
                className="mb-7 flex items-center gap-1.5"
              >
                <span className="inline-block h-4 w-[34px] rounded-pill bg-accent" />
                <span className="inline-block h-4 w-[34px] rounded-pill bg-blue" />
                <span
                  className="inline-block h-4 w-[34px] rounded-pill"
                  style={{
                    background: "color-mix(in srgb, var(--color-blue) 55%, #000)",
                  }}
                />
              </div>

              <p className="label flex items-center gap-2.5 text-muted">
                <span aria-hidden="true" className="status-dot size-1.5 shrink-0">
                  <span className="size-1.5 rounded-full bg-accent" />
                </span>
                Independent developer &amp; designer
              </p>

              <h1
                id="hero-heading"
                className="mt-6 text-[clamp(2.6rem,5.4vw,4.6rem)] leading-[0.9]"
              >
                Code that
                <br />
                looks
                <br />
                <span className="metal-text">expensive</span>
                <span className="text-accent">.</span>
              </h1>

              <ul
                aria-label="How I work"
                className="mt-7 flex flex-wrap gap-2"
              >
                {traits.map((trait) => (
                  <li
                    key={trait}
                    className="label rounded-pill border border-line bg-surface/40 px-3.5 py-2 text-muted"
                  >
                    {trait}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-sm text-muted sm:text-base">
                Custom builds <span className="text-accent">·</span> AI automation{" "}
                <span className="text-accent">·</span> zero templates.
              </p>

              <div className="mt-auto flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pt-9">
                <a
                  href={siteConfig.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex h-12 items-center gap-3 rounded-pill bg-accent-solid px-6 text-accent-on-solid transition-[background-color,color,transform] duration-base ease-out-expo hover:-translate-y-0.5 hover:bg-foreground hover:text-background focus-visible:-translate-y-0.5"
                >
                  <span className="label">Let&apos;s talk</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="size-3 transition-transform duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    <path
                      d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                <p className="max-w-[34ch] text-sm leading-relaxed text-muted">
                  Custom full-stack builds, Shopify &amp; WordPress stores, 3D
                  experiences and AI automation — for brands that refuse to look
                  like everyone else.
                </p>
              </div>
            </div>

            {/* COMPANION CARD */}
            <AvatarCard />
          </div>
        </div>
      </div>
    </section>
  );
}
