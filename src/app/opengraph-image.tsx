import { ImageResponse } from "next/og";

// Generated social share image (Open Graph + Twitter summary_large_image).
// Next serves this at /opengraph-image and wires it into the page metadata.
export const alt = "Gautam Singh — Developer & Designer. Code that looks expensive.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(1200px 700px at 78% 12%, #15263f 0%, #0a0f1a 45%, #070708 100%)",
          color: "#f4f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 24,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#9ab6d2",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#9ab6d2",
            }}
          />
          Gautam Singh · Developer &amp; Designer
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 118,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
          }}
        >
          <span>Code that</span>
          <span>looks</span>
          <span style={{ color: "#9ab6d2" }}>expensive.</span>
        </div>

        <div style={{ fontSize: 30, color: "#8a8f99", maxWidth: 900 }}>
          Custom full-stack builds · Shopify &amp; WordPress · 3D experiences · AI
          automation
        </div>
      </div>
    ),
    { ...size },
  );
}
