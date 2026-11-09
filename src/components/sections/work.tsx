import { StackCard } from "@/components/motion";
import { WorkCarousel } from "@/components/motion/work-carousel";
import { projects } from "@/lib/projects";

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
