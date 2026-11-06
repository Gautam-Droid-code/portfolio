import {
  footerNav,
  siteConfig,
  socialLinks,
} from "@/lib/site";

const externalLinkClass =
  "label inline-flex items-center gap-1.5 py-1 text-muted transition-colors duration-fast hover:text-foreground";

export function Footer() {
  // Cache Components blocks new Date() during prerender. Keep the build year
  // static here; bump it when the year changes.
  const year = 2026;

  return (
    <footer className="border-t border-line bg-surface/30">
      <div className="shell grid gap-14 py-20 md:grid-cols-[1.25fr_0.75fr] md:gap-20 md:py-28">
        <div>
          <p className="label text-muted">Based in India, working worldwide</p>

          <p className="mt-8 font-display text-[clamp(2.75rem,7vw,6rem)] uppercase leading-[0.85] tracking-[-0.05em]">
            Gautam Singh<span className="text-accent">.</span>
          </p>

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            Developer &amp; designer building considered digital experiences.
          </p>

          <a
            href={`mailto:${siteConfig.email}`}
            aria-label={`Email Gautam at ${siteConfig.email}`}
            className="mt-10 inline-block font-display text-2xl uppercase leading-none tracking-[-0.03em] transition-colors duration-fast hover:text-accent sm:text-3xl"
          >
            {siteConfig.email}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:gap-14">
          <nav aria-label="Social links">
            <h2 className="label text-faint">Elsewhere</h2>
            <ul className="mt-5 space-y-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={externalLinkClass}
                  >
                    {link.label}
                    <span aria-hidden="true" className="text-accent">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer">
            <h2 className="label text-faint">Explore</h2>
            <ul className="mt-5 space-y-2">
              {footerNav.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="label inline-block py-1 text-muted transition-colors duration-fast hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label text-muted">© {year} Gautam Singh</p>
          <p className="label text-faint">Built from scratch, no templates</p>
          <a
            href="#top"
            className="label py-1 text-muted transition-colors duration-fast hover:text-foreground"
          >
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
