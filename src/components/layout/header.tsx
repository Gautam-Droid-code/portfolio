import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navLinks, siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-background/85 backdrop-blur-md">
      <div className="shell flex h-(--header-h) items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-2 text-muted transition-colors duration-fast hover:text-foreground focus-visible:text-foreground"
            >
              <span className="label">{link.label}</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-base ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />
            </a>
          ))}
        </nav>

        <a
          href="#top"
          aria-label="Gautam Singh — back to top"
          className="label text-foreground transition-colors duration-fast hover:text-accent md:justify-self-center"
        >
          {siteConfig.name.toUpperCase()}
        </a>

        <div className="flex items-center gap-2 sm:gap-3 md:justify-self-end">
          <ThemeToggle />

          <a
            href={siteConfig.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="Let's talk on WhatsApp"
            className="group inline-flex h-9 items-center gap-2 rounded-pill bg-accent-solid px-3.5 text-accent-on-solid transition-[background-color,color,transform] duration-base ease-out-expo hover:-translate-y-px hover:bg-foreground hover:text-background focus-visible:-translate-y-px sm:pl-4 sm:pr-3.5"
          >
            <span className="label hidden sm:inline">Let&apos;s talk</span>
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
        </div>
      </div>
    </header>
  );
}
