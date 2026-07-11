import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getSiteUrl } from "@/lib/seo";
import { siteInfo } from "@/utils/site-info";

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const;

export const ogImageContentType = "image/png";

const fontsDir = path.join(process.cwd(), "assets/fonts");

const playfairRegular = readFile(
  path.join(fontsDir, "PlayfairDisplay-Bold.ttf"),
);
const dmSansSemiBold = readFile(path.join(fontsDir, "DMSans-SemiBold.ttf"));
const dmSansRegular = readFile(path.join(fontsDir, "DMSans-Regular.ttf"));

function getLogoUrl() {
  return `${getSiteUrl()}${siteInfo.assets.whiteLogo}`;
}

type OgImageOptions = {
  eyebrow?: string;
  title: string;
  description: string;
  footer?: string;
  accent?: string;
};

export async function createOgImage({
  eyebrow,
  title,
  description,
  footer,
  accent = "#c28a4f",
}: OgImageOptions) {
  const [playfair, dmSansBold, dmSans] = await Promise.all([
    playfairRegular,
    dmSansSemiBold,
    dmSansRegular,
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#2f4e40",
          color: "#fbfaf7",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 360,
            height: 360,
            borderRadius: "9999px",
            background: "rgba(194,138,79,0.22)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getLogoUrl()}
            alt=""
            width={72}
            height={72}
            style={{ objectFit: "contain" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                fontFamily: "DM Sans",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(251,250,247,0.72)",
              }}
            >
              {siteInfo.company.shortName}
            </div>
            {eyebrow ? (
              <div
                style={{
                  fontFamily: "DM Sans",
                  fontSize: 18,
                  color: accent,
                  fontWeight: 600,
                }}
              >
                {eyebrow}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: 68,
              lineHeight: 1.05,
              fontWeight: 700,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: "DM Sans",
              fontSize: 30,
              lineHeight: 1.45,
              color: "rgba(251,250,247,0.78)",
              maxWidth: 920,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div
            style={{
              height: 4,
              width: 120,
              background: accent,
            }}
          />
          <div
            style={{
              fontFamily: "DM Sans",
              fontSize: 22,
              color: "rgba(251,250,247,0.62)",
            }}
          >
            {footer ?? siteInfo.contact.address}
          </div>
        </div>
      </div>
    ),
    {
      ...ogImageSize,
      fonts: [
        {
          name: "Playfair Display",
          data: playfair,
          style: "normal",
          weight: 700,
        },
        {
          name: "DM Sans",
          data: dmSansBold,
          style: "normal",
          weight: 600,
        },
        {
          name: "DM Sans",
          data: dmSans,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
