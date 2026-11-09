import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

// Pinned date, not `new Date()`: under Cache Components a request-time value
// makes sitemap.xml a dynamic route, so every crawl would get a fresh lastmod
// and cost a function invocation. Bump this when page content changes.
const lastModified = new Date("2026-11-09T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${siteConfig.url}/work/${project.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
