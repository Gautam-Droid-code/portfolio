# Motion toolkit

Shared scroll + reveal primitives. The scroll engine (GSAP ScrollTrigger synced
to Lenis) is wired up once in `providers/smooth-scroll-provider.tsx`; everything
here builds on it. Always import GSAP from `@/lib/gsap`, never from the packages
directly, so the plugins register exactly once.

| Primitive        | Engine        | Use for |
| ---------------- | ------------- | ------- |
| `Reveal` / `useReveal` | Framer Motion | Enter-once fade + slide for copy, cards, list items. |
| `Parallax`       | GSAP (scrub)  | A layer that drifts against the scroll for depth. |
| `useScrollScene` | GSAP (pin+scrub) | Pinned, scroll-scrubbed chapters — the cinematic workhorse. |

```tsx
import { Reveal, useReveal, Parallax, useScrollScene } from "@/components/motion";
```

## Reveal

```tsx
<Reveal className="…" delay={0.1}>…</Reveal>

// or spread onto any motion element (matches the existing section pattern):
const reveal = useReveal();
<motion.h2 {...reveal({ delay: index * 0.05 })} />
```

Options: `direction` (`up` | `down` | `left` | `right` | `none`), `distance`,
`delay`, `duration`, `once`, `amount`.

## Parallax

```tsx
<Parallax speed={0.3}>…</Parallax>   // positive & negative both work
```

## useScrollScene

Attach the returned ref to the section to pin; build a timeline against its
children. Progress is tied to scroll through the pinned range.

```tsx
const scope = useScrollScene((tl) => {
  tl.from(".headline", { yPercent: 40, opacity: 0 })
    .to(".backdrop", { scale: 1.2 }, 0);
}, { end: "+=150%" });

return (
  <section ref={scope} className="min-h-svh">
    <div className="backdrop" />
    <h2 className="headline">…</h2>
  </section>
);
```

While tuning, pass `{ markers: true }` to see the start/end lines, then remove.

## Ground rules

- Every primitive honours `prefers-reduced-motion` — the resting state shows
  immediately, with no pin, scrub, or parallax left running. Keep it that way.
- Put a `scrollTrigger` only on a **top-level** tween or on the timeline, never
  on a child tween inside a timeline.
- After anything that changes layout height after first paint (fonts, async
  content, images without a reserved box), call `ScrollTrigger.refresh()`. The
  loading gate already refreshes once on reveal.
- Cleanup is automatic inside `useScrollScene` / `Parallax` (via `useGSAP`).
