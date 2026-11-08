import { StackCard } from "@/components/motion";
import { WorkCarousel, type WorkProject } from "@/components/motion/work-carousel";

const projects: readonly WorkProject[] = [
  {
    slug: "vanta",
    number: "01",
    image: "/work/vanta.jpg",
    imageAlt: "VANTA — technical streetwear e-commerce store",
    category: "Full-stack e-commerce",
    title: "Vanta",
    description:
      "A custom streetwear commerce platform — not a Shopify theme. Built from scratch with its own admin CMS, customer accounts, saved bags, wishlist and an optimized image pipeline. Dark editorial, engineered for the Indian street and tuned for Indian mobile networks.",
    tags: ["Next.js", "React", "TypeScript", "Postgres / Prisma", "Framer Motion"],
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
];

export function Work() {
  return (
    <section id="work" aria-labelledby="work-heading" className="relative">
      <div className="shell section-gap">
        <StackCard className="glass-pad">
          <div
            className="work-reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-4"
            data-reveal
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
              {String(projects.length).padStart(2, "0")}{" "}
              <span className="text-accent">—</span> Selected
            </p>
          </div>

          <div className="mt-14 border-t border-line pt-14 sm:mt-16 sm:pt-16">
            <WorkCarousel projects={projects} />
          </div>
        </StackCard>
      </div>
    </section>
  );
}
