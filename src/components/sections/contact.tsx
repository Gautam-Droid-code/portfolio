"use client";

import { StackCard } from "@/components/motion";
import { siteConfig, socialLinks } from "@/lib/site";

const supportingCopy =
  "Custom builds, platform work, 3D, AI automation — or something that doesn't fit a neat box. Whatever the stack or the brief, I adapt fast and ship things that look expensive. One developer, full attention.";

const availability = [
  "Based in India",
  "Working worldwide",
  "Open to new projects",
] as const;

const socialLinkClass =
  "label group inline-flex items-center gap-1.5 py-1 text-muted transition-colors duration-300 hover:text-foreground focus-visible:text-foreground";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="relative">
      <div className="shell section-gap">
        <StackCard className="glass-pad">
        <div className="contact-reveal" data-reveal>
          <p className="label flex items-center gap-2.5 text-muted">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-accent"
            />
            Let&apos;s talk
          </p>

          <h2
            id="contact-heading"
            className="mt-6 max-w-4xl text-[clamp(2.3rem,6.4vw,5.5rem)]"
          >
            Got something worth building
            <span className="text-accent">?</span>
          </h2>

          <p className="mt-8 max-w-[55ch] text-base leading-relaxed text-muted sm:text-lg">
            {supportingCopy}
          </p>
        </div>

        <div
          className="contact-reveal mt-10 flex flex-col items-stretch gap-3 sm:mt-12 sm:flex-row sm:items-center sm:gap-4"
          data-reveal
        >
          <a
            href={siteConfig.whatsapp}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-pill bg-accent-solid px-7 text-accent-on-solid transition-[background-color,color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-foreground hover:text-background focus-visible:-translate-y-0.5 sm:justify-start"
          >
            <span className="label">Message on WhatsApp</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 12 12"
              fill="none"
              className="size-3 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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

          <a
            href={siteConfig.emailHref}
            className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-pill border border-line px-5 font-mono text-[0.9375rem] text-foreground transition-[border-color,color,transform] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-accent hover:text-accent focus-visible:-translate-y-0.5 sm:justify-start sm:px-6 sm:text-lg"
          >
            <span className="break-all">{siteConfig.email}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 12 12"
              fill="none"
              className="size-3 shrink-0 text-accent transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
        </div>

        <div
          className="contact-reveal mt-16 flex flex-col gap-6 border-t border-line pt-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between"
          data-reveal
        >
          <p className="label flex flex-wrap items-center gap-x-2 gap-y-1.5 text-muted">
            {availability.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? (
                  <>
                    <span aria-hidden="true" className="text-accent">
                      ·
                    </span>
                    <span className="sr-only">, </span>
                  </>
                ) : null}
                {item}
              </span>
            ))}
          </p>

          <ul aria-label="Social links" className="flex flex-wrap gap-x-6 gap-y-1">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={socialLinkClass}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="text-accent transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        </StackCard>
      </div>
    </section>
  );
}
