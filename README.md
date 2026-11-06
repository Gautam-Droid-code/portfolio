# Gautam Singh — Portfolio

Personal portfolio: design system, shell, theme, motion, loading gate, a hero with a terminal card and an optional Spline avatar, plus built About, Selected Work, Services, FAQ, and Contact sections.

## Stack

- Next.js 16 (App Router, TypeScript, ESLint, `src/` directory, Turbopack)
- Tailwind CSS v4 (CSS-first theme)
- Framer Motion (loading gate, section reveals)
- next-themes (light / system / dark)
- Lenis (global smooth scroll)
- Spline (`@splinetool/react-spline` + `@splinetool/runtime`), loaded dynamically on desktop only
- Geist Sans + Geist Mono (`geist`), Bricolage Grotesque (`next/font/google`)

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

## Structure

```text
src/
  app/                    layout, page, global tokens
  components/hero/        terminal card, avatar stage, scene error boundary
  components/layout/      header, footer, preloader, reveal, skip link
  components/providers/   theme + Lenis providers
  components/sections/    page sections (hero, about, work, services, faq, contact)
  components/ui/          shared UI (theme toggle)
  context/                LoadingContext ({ ready, setReady })
  lib/                    site constants, helpers
```

## Foundation notes

- **Tokens** live in `src/app/globals.css` as CSS custom properties exposed through `@theme`. Brand values (`ink`, `paper`, `white`, `blue`, `blue-light`) are fixed; every surface, hairline, and text tone is derived per theme with `color-mix`.
- **Loading gate** enforces a 600ms minimum display and a 6s hard timeout. `window.load` reveals the site as before; on desktop the hero also calls `setReady()` when the Spline scene loads or fails, with a 5s local fallback, so a slow scene can never hang the reveal. Mobile never waits on the 3D.
- **Lenis** is not instantiated at all when `prefers-reduced-motion: reduce` is set. It also starts stopped while the gate is closed.
- **Hero** (`src/components/sections/hero.tsx`) holds the page's only `<h1>`. The terminal is pure DOM/CSS; the Spline avatar is mounted only for a fine pointer, a ≥1024px viewport, and no reduced-data/save-data, and pauses when offscreen or the tab is hidden. The scene is self-hosted at `public/hero/avatar-scene.splinecode` (the exported `my.spline.design` URL is noted in `src/lib/site.ts`) because that CDN edge intermittently drops its CORS header. `public/hero/avatar-poster.png` is the static fallback shown on mobile and until the scene loads.
- **About** (`src/components/sections/about.tsx`) is the first built section after the hero: an editorial two-column block with a full-width fact strip. Heading, body, pills, and facts reveal in a short stagger on scroll (`whileInView`, `once: true`) and render at their resting state when reduced motion is requested.
- **Services** (`src/components/sections/services.tsx`) is a numbered `<ol>` of hairline-separated rows: mono index, display title, and a muted description. Rows stagger in on scroll and lift with an accent shift on hover; the layout stacks the number/title above the description on mobile.
- **FAQ** (`src/components/sections/faq.tsx`) is a single-open accordion of hairline-separated rows. Each question is a real `<button>` with `aria-expanded`/`aria-controls`; answers stay in the DOM, animate open with a measured Framer Motion height, and the plus indicator rotates into a close mark. Reduced motion opens instantly without the rotation tween.
- **Selected Work** (`src/components/sections/work.tsx`) is two full-width editorial project blocks with alternating image/text sides on desktop and a single whole-block external link each. Thumbnails use `next/image` in a 16:10 frame (capped at the 784×600 source width), with a hover zoom and accent arrow on desktop. Blocks reveal on scroll and render at rest under reduced motion.
- **Contact** (`src/components/sections/contact.tsx`) is the closing block before the footer: eyebrow, display heading, a short pitch, a large WhatsApp pill beside a selectable `mailto:` email pill, then a hairline row with the availability line and footer-style social links. Heading, CTAs, and the bottom row reveal on scroll and render at rest under reduced motion.
- **Anchors**: `#work`, `#about`, `#services`, `#faq`, `#contact` all land on built sections.
- **SEO**: page metadata lives in `src/app/layout.tsx`; `src/app/robots.ts` and `src/app/sitemap.ts` serve `/robots.txt` and `/sitemap.xml` from `siteConfig.url`.
- **Placeholders**: set `NEXT_PUBLIC_SITE_URL` when the production domain is known. Contact details live in `src/lib/site.ts`.
