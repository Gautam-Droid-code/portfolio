import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "lenis/dist/lenis.css";
import "./globals.css";

import { AuroraField } from "@/components/layout/aurora-field";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Preloader } from "@/components/layout/preloader";
import { SiteReveal } from "@/components/layout/site-reveal";
import { SkipLink } from "@/components/layout/skip-link";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { StructuredData } from "@/components/layout/structured-data";
import { LoadingProvider } from "@/context/loading-context";
import { siteConfig } from "@/lib/site";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Gautam Singh — Developer & Designer",
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: "@gautamsingh2003",
  publisher: siteConfig.name,
  category: "technology",
  keywords: [
    "Gautam Singh",
    "freelance web developer",
    "web designer",
    "Next.js developer",
    "React developer",
    "Shopify developer",
    "WordPress developer",
    "headless commerce",
    "custom e-commerce development",
    "3D websites",
    "Three.js developer",
    "AI automation",
    "full-stack developer India",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: "Gautam Singh — Developer & Designer",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Gautam Singh — Developer & Designer",
    description: siteConfig.description,
    creator: "@gautamsingh2003",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D0D0D",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${GeistSans.variable} ${GeistMono.variable} is-loading`}
    >
      <body className="min-h-svh bg-background font-sans text-foreground antialiased">
        <StructuredData />
        <AuroraField />

        <ThemeProvider>
          <LoadingProvider>
            <Preloader />

            <SmoothScrollProvider>
              <SiteReveal>
                <SkipLink />
                <Header />
                <main id="main-content" tabIndex={-1} className="flex-1">
                  {children}
                </main>
                <Footer />
              </SiteReveal>
            </SmoothScrollProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
