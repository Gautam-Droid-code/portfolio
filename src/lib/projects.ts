export type PipelineStep = { n: string; title: string; body: string };
export type Highlight = { title: string; body: string };
export type MetaItem = { label: string; value: string };

export type Project = {
  slug: string;
  number: string;
  /** Omit for an upcoming project with no screenshot yet — a branded tile is drawn. */
  image?: string;
  imageAlt: string;
  category: string;
  title: string;
  /** Short summary used on the carousel card + detail intro. */
  description: string;
  tags: readonly string[];
  role: string;
  /** Internal detail-page route. */
  href: string;
  status?: "live" | "upcoming";
  /** Carousel CTA label. */
  cta?: string;

  /* ---- Detail page ---- */
  tagline?: string;
  overview?: readonly string[];
  highlights?: readonly Highlight[];
  /** External live/production site (live projects only). */
  liveUrl?: string;
  meta?: readonly MetaItem[];

  /* ---- Rich, product-style detail (e.g. OPERIQ) ---- */
  thesis?: string;
  pipeline?: readonly PipelineStep[];
  isList?: readonly string[];
  isNotList?: readonly string[];
  note?: string;
};

export const projects: readonly Project[] = [
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
    href: "/work/vanta",
    status: "live",
    tagline: "Technical streetwear, built from scratch.",
    liveUrl: "https://vanta-ecom-store.vercel.app/",
    overview: [
      "Vanta is a custom streetwear commerce platform — built from scratch rather than dropped onto a Shopify theme. It ships with its own admin CMS, customer accounts, saved bags and a wishlist, all backed by Postgres and Prisma.",
      "The design is dark and editorial, built around the brand instead of a template, and the front end is engineered for the Indian street and tuned to stay fast on real-world Indian mobile networks.",
    ],
    highlights: [
      {
        title: "Its own admin CMS",
        body: "Catalogue, products and content are managed in-house — no Shopify, no theme lock-in.",
      },
      {
        title: "Accounts, bags & wishlist",
        body: "Customer accounts with saved bags and a wishlist, backed by Postgres and Prisma.",
      },
      {
        title: "Tuned for Indian mobile",
        body: "An optimized image pipeline and a lean front end built to hold up on real mobile networks.",
      },
      {
        title: "Dark, editorial design",
        body: "A streetwear-first visual language, matched to the brand rather than a stock layout.",
      },
    ],
    meta: [
      { label: "Status", value: "Live" },
      { label: "Type", value: "Full-stack e-commerce" },
      { label: "Role", value: "Design & full-stack" },
    ],
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
    href: "/work/aether",
    status: "live",
    tagline: "A cinematic showroom for a premium EV brand.",
    liveUrl: "https://aether-ev.vercel.app/",
    overview: [
      "Aether Motors is a concept showroom for a premium electric-vehicle brand — a '$10K-feel' build that leads with a live 3D hero and GSAP scroll choreography, smoothed by Lenis.",
      "Beyond the showpiece, it works as a product: an inventory to browse, test-drive booking, and an AI concierge that helps a visitor pick the right car — kept light with a graceful fallback on mobile.",
    ],
    highlights: [
      {
        title: "Live 3D hero",
        body: "A real-time Spline scene with GSAP scroll choreography and Lenis-smoothed motion.",
      },
      {
        title: "Browse & book",
        body: "An inventory to explore and a test-drive booking flow backed by Supabase.",
      },
      {
        title: "AI concierge",
        body: "A guided assistant that helps a visitor narrow down to the right car.",
      },
      {
        title: "Light on mobile",
        body: "Heavy visuals with a graceful fallback so phones still get a fast experience.",
      },
    ],
    meta: [
      { label: "Status", value: "Live concept" },
      { label: "Type", value: "3D + AI showroom" },
      { label: "Role", value: "Design & development" },
    ],
  },
  {
    slug: "operiq",
    number: "03",
    imageAlt: "OPERIQ — AI e-commerce admin builder",
    category: "AI product · In discovery",
    title: "OPERIQ",
    description:
      "An AI system that reads an existing e-commerce codebase, works out how the store is actually built, and generates an admin panel suited to that specific store. The intelligence is the product — it understands a store's data, APIs and business rules before it writes a line of code. Currently in product discovery.",
    tags: ["AI analysis", "Admin generation", "E-commerce", "Stack TBD"],
    role: "Solo product — design, architecture & build",
    href: "/work/operiq",
    status: "upcoming",
    cta: "Explore OPERIQ",
    tagline: "Understand the store. Build its control center.",
    overview: [
      "OPERIQ is a proposed AI system that reads an existing e-commerce codebase, works out how the store is actually built, and generates an administration panel suited to that specific store — for developers and business owners, on frontend-only as well as full-stack projects.",
    ],
    thesis:
      "The intelligence is the product. The admin panel is the output — OPERIQ has to understand a store's data, relationships, APIs and workflows before it generates any code.",
    pipeline: [
      {
        n: "01",
        title: "Connect the project",
        body: "Point OPERIQ at an existing repository. It takes a snapshot and a file inventory — no uploading the whole codebase blindly at a model.",
      },
      {
        n: "02",
        title: "Detect & analyze",
        body: "Identify languages, frameworks, routing, services, database and auth. Then trace the commerce areas specifically: products, variants, cart, checkout, accounts and orders.",
      },
      {
        n: "03",
        title: "Present the findings",
        body: "An evidence-backed report of what was detected, inferred, missing or could not be inspected — each point linked to the real files behind it.",
      },
      {
        n: "04",
        title: "Ask the right questions",
        body: "Only for business rules code can't reveal — cancellation and restock behaviour, refunds, staff roles, content editing. Decisions get recorded, not re-asked.",
      },
      {
        n: "05",
        title: "Design the admin blueprint",
        body: "A versioned spec — modules, screens, fields, permissions, operations and data connections — marking what reuses existing backend and what is still missing.",
      },
      {
        n: "06",
        title: "Generate progressively",
        body: "Build modules, forms, tables and adapters in an isolated workspace, with a traceable plan. Destructive operations and migrations need explicit approval.",
      },
      {
        n: "07",
        title: "Review & deliver",
        body: "Show the file-level diff, the tests, what still needs configuration and the deployment steps — a reviewable handoff before anything merges.",
      },
    ],
    isList: [
      "Commerce-specialised — it understands products, variants, inventory, orders and payments, not a generic data model.",
      "Works for both frontend-only and full-stack e-commerce projects.",
      "Evidence-first — every finding is labelled detected, inferred, missing, unverified or user-confirmed.",
      "Safe by default — an isolated workspace with review before merge.",
    ],
    isNotList: [
      "Not a generic CRUD dashboard that assumes every store has the same shape.",
      "Not a single prompt that throws a whole repo at an LLM and hopes for an admin panel.",
      "It never invents a database, API or business rule and presents it as if it already exists.",
      "It doesn't claim a generated operation works until it is connected to a real service and validated.",
    ],
    meta: [
      { label: "Status", value: "In discovery" },
      { label: "Version", value: "0.2 · Draft" },
      { label: "First benchmark", value: "VANTA" },
    ],
    note: "Working draft based on the current product direction. Proposed technical approaches are not final decisions unless explicitly confirmed.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
