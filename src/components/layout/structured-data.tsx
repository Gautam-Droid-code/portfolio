import { siteConfig } from "@/lib/site";

/**
 * Site-wide JSON-LD structured data (schema.org) emitted in the document head.
 * A single @graph ties the entities together by @id:
 *   - Person        — Gautam Singh (identity, expertise, social profiles)
 *   - WebSite       — the site itself, published by the Person
 *   - ProfessionalService — the freelance offering and its services
 *   - FAQPage       — mirrors the visible FAQ section (kept in sync by hand)
 *
 * This is what powers rich results, knowledge-panel signals, and the facts AI
 * search engines (ChatGPT, Perplexity, Google AI Overviews) quote about the
 * site. The FAQ entries below must match the visible copy in sections/faq.tsx.
 */

const offeredServices = [
  "Custom full-stack website development",
  "Shopify store design and development",
  "WordPress website design and development",
  "Headless and customized Shopify & WordPress",
  "Custom e-commerce platforms built from scratch",
  "Web application design and development",
  "Interactive 3D website experiences",
  "AI automation, chatbots and concierges",
] as const;

const faqs = [
  {
    question: "Do you use templates?",
    answer:
      "No. Everything is built custom — that's the whole point. No themes I'm hiding, no page-builder doing the work. If you wanted a template, you wouldn't be here.",
  },
  {
    question: "Can you do Shopify and WordPress?",
    answer:
      "Yep — standard, customized, or fully headless. I'll use the platform when it's the right call, and build from scratch when it isn't.",
  },
  {
    question: "What's 'vibe coding'?",
    answer:
      "Moving fast and trusting instinct on the build — but shipping something that's actually solid underneath. Vibe-coded, properly built. The vibes are free; the engineering isn't an afterthought.",
  },
  {
    question: "Can you add AI features?",
    answer:
      "Yes. Chatbots, concierges, automations — the kind of thing that quietly handles the repetitive work so you don't have to.",
  },
  {
    question: "How do we start?",
    answer:
      "Message me on WhatsApp or email with a rough idea of what you need. We'll talk it through, I'll tell you honestly if I'm the right fit, and we go from there.",
  },
] as const;

export function StructuredData() {
  const { url, name, role, description, email } = siteConfig;
  const sameAs = [
    siteConfig.socials.github,
    siteConfig.socials.x,
    siteConfig.socials.linkedin,
  ];
  const ogImage = `${url}/opengraph-image`;

  const graph = [
    {
      "@type": "Person",
      "@id": `${url}/#person`,
      name,
      url,
      jobTitle: role,
      description,
      email,
      image: ogImage,
      knowsAbout: [
        "Next.js",
        "React",
        "TypeScript",
        "Shopify",
        "WordPress",
        "Headless commerce",
        "Three.js",
        "3D web experiences",
        "AI automation",
        "Full-stack web development",
        "UI/UX design",
      ],
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
      sameAs,
    },
    {
      "@type": "WebSite",
      "@id": `${url}/#website`,
      url,
      name: `${name} — ${role}`,
      description,
      inLanguage: "en",
      publisher: { "@id": `${url}/#person` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${url}/#service`,
      name,
      url,
      image: ogImage,
      description,
      email,
      priceRange: "$$",
      areaServed: { "@type": "Place", name: "Worldwide" },
      provider: { "@id": `${url}/#person` },
      sameAs,
      makesOffer: offeredServices.map((service) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: service },
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${url}/#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  const data = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      // schema.org JSON-LD; serialized once, no user input interpolated
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
