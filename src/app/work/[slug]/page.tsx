import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title =
    project.status === "upcoming"
      ? `${project.title} — Upcoming product`
      : `${project.title} — ${project.category}`;

  return {
    title,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "website",
      url: `/work/${project.slug}`,
      title: `${title} | Gautam Singh`,
      description: project.description,
    },
  };
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

function ProjectFallback() {
  return <div className="shell pb-32 pt-32 sm:pb-40 sm:pt-40" aria-hidden="true" />;
}

export default function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  return (
    <Suspense fallback={<ProjectFallback />}>
      <ProjectView params={params} />
    </Suspense>
  );
}

async function ProjectView({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const isUpcoming = project.status === "upcoming";

  return (
    <div className="shell pb-32 pt-32 sm:pb-40 sm:pt-40">
      <article className="glass-panel mx-auto max-w-5xl bg-[color-mix(in_srgb,var(--background)_90%,transparent)] px-6 py-12 sm:px-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/#work"
          className="label inline-flex items-center gap-2 text-faint transition-colors duration-300 hover:text-foreground focus-visible:text-foreground"
        >
          <span aria-hidden="true">←</span> Selected work
        </Link>

        {/* Hero */}
        <header className="mt-10">
          <p className="label flex items-center gap-2.5 text-accent">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-accent"
            />
            {isUpcoming ? "Upcoming product · In discovery" : project.category}
          </p>

          <h1 className="mt-6 text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-[-0.045em]">
            {project.title}
            <span className="text-accent">.</span>
          </h1>

          {project.tagline && (
            <p className="mt-8 max-w-3xl text-[clamp(1.35rem,3vw,2.1rem)] font-medium leading-[1.2] text-foreground">
              {project.tagline}
            </p>
          )}

          {(project.overview ?? [project.description]).map((para, i) => (
            <p
              key={i}
              className="mt-6 max-w-2xl leading-copy text-muted first:mt-10"
            >
              {para}
            </p>
          ))}

          {/* Primary CTA */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 rounded-pill bg-accent-solid px-5 py-3 text-accent-on-solid transition-[background-color,color,transform] duration-base ease-out-expo hover:-translate-y-px hover:bg-foreground hover:text-background"
              >
                <span className="label">Visit live site</span>
                <ArrowUpRight className="size-3 transition-transform duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 rounded-pill bg-accent-solid px-5 py-3 text-accent-on-solid transition-[background-color,color,transform] duration-base ease-out-expo hover:-translate-y-px hover:bg-foreground hover:text-background"
              >
                <span className="label">Talk about it</span>
                <ArrowUpRight className="size-3 transition-transform duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        </header>

        {/* Thesis (product-style) */}
        {project.thesis && (
          <aside className="glass-panel mt-16 p-7 sm:p-9">
            <p className="label text-accent">Product thesis</p>
            <p className="mt-4 text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-foreground">
              {project.thesis}
            </p>
          </aside>
        )}

        {/* How it works */}
        {project.pipeline && (
          <section className="mt-20">
            <h2 className="text-3xl sm:text-4xl">
              How it works<span className="text-accent">.</span>
            </h2>
            <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {project.pipeline.map((step) => (
                <li key={step.n} className="bg-background p-6 sm:p-7">
                  <span className="label text-accent">{step.n}</span>
                  <h3 className="mt-3 text-xl normal-case tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-copy text-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Highlights (case-study) */}
        {project.highlights && (
          <section className="mt-20">
            <h2 className="text-3xl sm:text-4xl">
              Highlights<span className="text-accent">.</span>
            </h2>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {project.highlights.map((item) => (
                <li key={item.title} className="bg-background p-6 sm:p-7">
                  <h3 className="text-xl normal-case tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-copy text-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Is / is not (product-style) */}
        {(project.isList || project.isNotList) && (
          <section className="mt-20 grid gap-6 lg:grid-cols-2">
            {project.isList && (
              <div className="glass-panel p-7 sm:p-8">
                <p className="label text-accent">What it is</p>
                <ul className="mt-6 space-y-4">
                  {project.isList.map((item) => (
                    <li key={item} className="flex gap-3 leading-copy text-muted">
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.isNotList && (
              <div className="glass-panel p-7 sm:p-8">
                <p className="label text-faint">What it&apos;s not</p>
                <ul className="mt-6 space-y-4">
                  {project.isNotList.map((item) => (
                    <li key={item} className="flex gap-3 leading-copy text-muted">
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-line-strong"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Stack + meta */}
        <section className="mt-20 border-t border-line pt-12">
          <p className="label text-faint">
            {isUpcoming ? "Focus" : "Built with"}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="label rounded-pill border border-line bg-surface/40 px-3 py-1.5 text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>

          {project.meta && (
            <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3">
              {project.meta.map((item) => (
                <div key={item.label}>
                  <dt className="label text-faint">{item.label}</dt>
                  <dd className="mt-2 text-muted">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="mt-8 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm">
            <span className="label text-faint">Role</span>
            <span aria-hidden="true" className="text-accent">
              —
            </span>
            <span className="text-muted">{project.role}</span>
          </p>
        </section>

        {project.note && (
          <p className="mt-12 text-xs leading-copy text-faint">{project.note}</p>
        )}

        {/* Footer nav */}
        <div className="mt-16 border-t border-line pt-10">
          <Link
            href="/#work"
            className="label inline-flex items-center gap-2 text-faint transition-colors duration-300 hover:text-foreground focus-visible:text-foreground"
          >
            <span aria-hidden="true">←</span> Back to all work
          </Link>
        </div>
      </article>
    </div>
  );
}
