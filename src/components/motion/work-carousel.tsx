"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type WorkProject = {
  slug: string;
  number: string;
  image: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  tags: readonly string[];
  role: string;
  href: string;
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

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

/**
 * Selected Work carousel. All layout is inline-styled (computed per card from
 * the active offset) so it never depends on a separate stylesheet rebuild.
 *
 *  - Desktop (>=1024px): a single card held at a 3D tilt that twists and swings
 *    off as you change slides, with the active card's details beside it.
 *  - Mobile: a swipeable hand-of-cards fan.
 *
 * Drag/swipe the stack, use the arrows or dots, or click a card to focus it.
 */
export function WorkCarousel({ projects }: { projects: readonly WorkProject[] }) {
  const [active, setActive] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reduce, setReduce] = useState(false);
  const dragX = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const count = projects.length;
  const current = projects[active];

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setIsDesktop(desktopQuery.matches);
      setReduce(motionQuery.matches);
    };
    sync();
    desktopQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      desktopQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  const go = (dir: number) => setActive((a) => (a + dir + count) % count);

  const onPointerDown = (event: React.PointerEvent) => {
    dragX.current = event.clientX;
  };
  const onPointerUp = (event: React.PointerEvent) => {
    if (dragX.current === null) return;
    const dx = event.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) > 44) {
      suppressClick.current = true;
      go(dx < 0 ? 1 : -1);
      window.setTimeout(() => (suppressClick.current = false), 60);
    }
  };

  const cardStyle = (offset: number): React.CSSProperties => {
    const a = Math.abs(offset);
    const base: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      margin: "auto",
      borderRadius: 20,
      overflow: "hidden",
      cursor: "pointer",
      border: "1px solid var(--hairline-strong, rgba(255,255,255,0.14))",
      background: "var(--surface, #17181d)",
      padding: 0,
      zIndex: 100 - a,
      transition: reduce
        ? "none"
        : `transform 0.75s ${EASE}, opacity 0.75s ${EASE}, box-shadow 0.5s ${EASE}`,
      WebkitTapHighlightColor: "transparent",
    };

    if (isDesktop) {
      const rotY = -12 + offset * -26;
      const rotZ = -6 + offset * -5;
      return {
        ...base,
        width: 440,
        height: 300,
        opacity: Math.max(0, 1 - a * 0.9),
        boxShadow:
          offset === 0
            ? "0 34px 80px -28px color-mix(in srgb, var(--accent, #9ab6d2) 55%, #000)"
            : "0 24px 55px -24px rgba(0,0,0,0.7)",
        transform: `perspective(1500px) translateX(${offset * 110}px) translateZ(${a * -170}px) translateY(${a * -6}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${1 - a * 0.1})`,
      };
    }

    return {
      ...base,
      width: 232,
      height: 310,
      opacity: Math.max(0, 1 - a * 0.34),
      boxShadow: "0 24px 55px -24px rgba(0,0,0,0.7)",
      transform: `translateX(${offset * 50}px) translateY(${a * 20}px) rotate(${offset * 7}deg) scale(${1 - a * 0.08})`,
    };
  };

  return (
    <div
      data-reveal="fade"
      style={{
        display: "grid",
        gap: "4.5rem 3rem",
        alignItems: "center",
        gridTemplateColumns: isDesktop
          ? "minmax(0, 0.95fr) minmax(0, 1.05fr)"
          : "minmax(0, 1fr)",
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => (dragX.current = null)}
        style={{
          position: "relative",
          height: isDesktop ? 430 : 380,
          touchAction: "pan-y",
          userSelect: "none",
        }}
      >
        {projects.map((project, index) => {
          let offset = index - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const isActive = offset === 0;

          return (
            <button
              key={project.slug}
              type="button"
              aria-label={`${project.title}${isActive ? " (current)" : ""}`}
              aria-current={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                if (suppressClick.current) return;
                if (!isActive) setActive(index);
              }}
              style={cardStyle(offset)}
            >
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                sizes="(min-width: 1024px) 440px, 240px"
                style={{ objectFit: "cover", pointerEvents: "none" }}
              />
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.12) 52%, transparent 78%)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: "auto 0 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  padding: "1.1rem 1.2rem",
                  textAlign: "left",
                }}
              >
                <span className="label text-accent">{project.number}</span>
                <span
                  style={{
                    fontFamily: "var(--font-display, sans-serif)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    fontSize: "1.55rem",
                    lineHeight: 0.95,
                    letterSpacing: "-0.01em",
                    color: "#f5f5f0",
                  }}
                >
                  {project.title}
                </span>
                <span
                  className="label"
                  style={{ color: "rgba(245,245,240,0.7)" }}
                >
                  {project.category}
                </span>
              </span>
            </button>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "-3rem",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "1.1rem",
            zIndex: 200,
          }}
        >
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous project"
            className="wc-nav-btn"
          >
            <ArrowUpRight className="size-3.5 -rotate-[225deg]" />
          </button>
          <span
            role="tablist"
            aria-label="Projects"
            style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}
          >
            {projects.map((project, index) => (
              <button
                key={project.slug}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={project.title}
                onClick={() => setActive(index)}
                style={{
                  height: "0.5rem",
                  width: index === active ? "1.5rem" : "0.5rem",
                  borderRadius: 999,
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background:
                    index === active
                      ? "var(--accent, #9ab6d2)"
                      : "var(--hairline-strong, rgba(255,255,255,0.25))",
                  transition: `width 0.3s ${EASE}, background-color 0.3s ${EASE}`,
                }}
              />
            ))}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next project"
            className="wc-nav-btn"
          >
            <ArrowUpRight className="size-3.5 -rotate-45" />
          </button>
        </div>
      </div>

      <div key={current.slug}>
        <p className="label flex flex-wrap items-center gap-2.5 text-faint">
          <span className="text-accent">{current.number}</span>
          <span aria-hidden="true">/</span>
          {current.category}
        </p>

        <h3 className="mt-4 text-[clamp(2rem,4.5vw,3.25rem)]">{current.title}</h3>

        <p className="mt-5 leading-copy text-muted">{current.description}</p>

        <ul
          aria-label={`${current.title} tech stack`}
          className="mt-6 flex flex-wrap gap-2"
        >
          {current.tags.map((tag) => (
            <li
              key={tag}
              className="label rounded-pill border border-line bg-surface/40 px-3 py-1.5 text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>

        <p className="mt-6 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm">
          <span className="label text-faint">Role</span>
          <span aria-hidden="true" className="text-accent">
            —
          </span>
          <span className="text-muted">{current.role}</span>
        </p>

        <a
          href={current.href}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors duration-300 hover:text-accent focus-visible:text-accent"
        >
          View project
          <ArrowUpRight className="size-3.5 text-accent" />
        </a>
      </div>

      <style>{`
        .wc-nav-btn {
          display: grid;
          place-items: center;
          width: 2.6rem;
          height: 2.6rem;
          border-radius: 999px;
          border: 1px solid var(--line, rgba(255,255,255,0.1));
          background: var(--surface, rgba(255,255,255,0.04));
          color: var(--foreground, #f4f5f7);
          transition: background-color 0.2s ${EASE}, transform 0.2s ${EASE};
        }
        .wc-nav-btn:hover {
          background: color-mix(in srgb, var(--foreground, #fff) 10%, transparent);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
