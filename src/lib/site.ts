const projectMessage =
  "Hi Gautam, I saw your portfolio and I've got a project in mind. Can we talk?";

const email = "singhgautam200331@gmail.com";
const emailSubject = "Project enquiry";
const emailBodyEncoded = encodeURIComponent(projectMessage).replace(/'/g, "%27");

export const siteConfig = {
  name: "Gautam Singh",
  role: "Developer & Designer",
  // TODO: point this at the production domain once it is live.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gautamsingh.dev",
  description:
    "Gautam Singh is a developer and designer building custom full-stack websites, Shopify and WordPress stores, 3D experiences, and AI automation for ambitious brands.",
  email,
  emailHref: `mailto:${email}?subject=${encodeURIComponent(
    emailSubject,
  )}&body=${emailBodyEncoded}`,
  whatsapp: `https://wa.me/918855882679?text=${encodeURIComponent(
    projectMessage,
  )}`,
  // Spline-hosted export (reframed full-figure, transparent background).
  // If the CDN edge drops its CORS header on some cached requests, fall back to
  // self-hosting: drop the .splinecode into public/hero/ and point this at
  // "/hero/avatar-scene.splinecode".
  splineScene: "https://prod.spline.design/b0PZiiZ4vBcrth2e/scene.splinecode",
  socials: {
    github: "https://github.com/Gautam-Droid-code",
    x: "https://x.com/gautamsingh2003",
    linkedin: "https://www.linkedin.com/in/gautam-singh-7318b5421/",
  },
} as const;

export const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
] as const;

/**
 * Section order for the page anchors. The hero carries the page's only H1;
 * About renders directly after the hero and the remaining sections follow
 * this order.
 */
export const sections = [
  { id: "work", label: "Selected work" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;

export const footerNav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

export const socialLinks = [
  { label: "GitHub", href: siteConfig.socials.github },
  { label: "X", href: siteConfig.socials.x },
  { label: "LinkedIn", href: siteConfig.socials.linkedin },
  { label: "WhatsApp", href: siteConfig.whatsapp },
] as const;
