import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { siteInfo } from "@/utils/site-info";

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const;

export const ogImageContentType = "image/png";

const PHOTO_WIDTH = 480;
const PHOTO_TIMEOUT_MS = 5000;

const colors = {
  paper: "#fbfaf7",
  ink: "#1a1a1a",
  inkMuted: "#5c5b57",
  pine: "#2f4e40",
  clayDeep: "#96622f",
  hairline: "#e3ded5",
} as const;

const fontsDir = path.join(process.cwd(), "assets/fonts");
const publicDir = path.join(process.cwd(), "public");

const fonts = Promise.all([
  readFile(path.join(fontsDir, "InstrumentSerif-Regular.ttf")),
  readFile(path.join(fontsDir, "InstrumentSerif-Italic.ttf")),
  readFile(path.join(fontsDir, "Geist-Regular.ttf")),
  readFile(path.join(fontsDir, "GeistMono-Regular.ttf")),
  readFile(path.join(fontsDir, "GeistMono-Medium.ttf")),
]);

// Read from disk rather than fetched from the site, so a card renders even
// when the site itself isn't reachable (at build time, say).
const pngDataUri = (file: string) =>
  readFile(path.join(publicDir, file)).then(
    (data) => `data:image/png;base64,${data.toString("base64")}`,
  );
const emblem = pngDataUri(siteInfo.assets.watermarkNoBG);
const whiteEmblem = pngDataUri(siteInfo.assets.whiteLogoNoBG);

/**
 * A remote photo as a JPEG data URI, cropped for the photo panel. Null when
 * it can't be loaded in time; the card then shows its fallback panel.
 */
async function loadPhoto(src: string): Promise<string | null> {
  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      // auto=format would pick WebP/AVIF, which the renderer can't read.
      url.searchParams.delete("auto");
      url.searchParams.set("fm", "jpg");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(PHOTO_WIDTH * 2));
      url.searchParams.set("h", String(ogImageSize.height * 2));
      url.searchParams.set("q", "75");
    }
    const res = await fetch(url, {
      signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/^image\/(jpeg|png)/.test(type)) return null;
    const data = Buffer.from(await res.arrayBuffer());
    return `data:${type.split(";")[0]};base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Shrinks the display title as it gets longer, so it stays within the column. */
function titleSize(text: string) {
  const length = text.length;
  if (length <= 20) return 96;
  if (length <= 32) return 84;
  if (length <= 46) return 70;
  return 58;
}

export type OgImageOptions = {
  /** Mono caps line above the title. */
  eyebrow: string;
  /** The display title; `em` is set in italic after `lead`, like `.display em`. */
  title: { lead: string; em?: string };
  description: string;
  /** Mono caps footer, left and right of the hairline row. */
  footer?: string;
  detail?: string;
  /** Remote photo for the right-hand panel. */
  photo?: string;
};

export async function createOgImage({
  eyebrow,
  title,
  description,
  footer = siteInfo.contact.address,
  detail,
  photo,
}: OgImageOptions) {
  const [
    [serif, serifItalic, geist, geistMono, geistMonoMedium],
    emblemSrc,
    whiteEmblemSrc,
    photoSrc,
  ] = await Promise.all([
    fonts,
    emblem,
    whiteEmblem,
    photo ? loadPhoto(photo) : null,
  ]);

  const fontSize = titleSize(`${title.lead} ${title.em ?? ""}`.trim());
  // Each word is its own flex item, so wrapping happens between words and
  // the italic words can carry their own style.
  const words = [
    ...title.lead
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, em: false })),
    ...(title.em ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, em: true })),
  ];

  const mono = {
    fontFamily: "Geist Mono",
    fontSize: 15,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: colors.paper,
          color: colors.ink,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px 48px 72px",
          }}
        >
          {/* Wordmark, as SiteLogo draws it */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={emblemSrc} alt="" width={46} height={43} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontFamily: "Instrument Serif",
                  fontSize: 34,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: colors.pine,
                }}
              >
                Brew &amp; Bake
              </div>
              <div
                style={{
                  ...mono,
                  marginTop: 6,
                  fontSize: 11,
                  letterSpacing: "0.34em",
                  color: colors.clayDeep,
                }}
              >
                Academy
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ ...mono, color: colors.clayDeep }}>{eyebrow}</div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                columnGap: Math.round(fontSize * 0.24),
                marginTop: 22,
                fontSize,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
              }}
            >
              {words.map(({ word, em }, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "Instrument Serif",
                    fontStyle: em ? "italic" : "normal",
                    color: em ? colors.pine : colors.ink,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
            <div
              style={{
                display: "block",
                lineClamp: 3,
                marginTop: 26,
                fontFamily: "Geist",
                fontSize: 24,
                lineHeight: 1.4,
                color: colors.inkMuted,
                maxWidth: 600,
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 24,
              paddingTop: 20,
              borderTop: `1px solid ${colors.hairline}`,
              ...mono,
              fontSize: 13,
              fontWeight: 500,
              color: colors.inkMuted,
            }}
          >
            <span>{footer}</span>
            {detail ? <span style={{ color: colors.ink }}>{detail}</span> : null}
          </div>
        </div>

        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            alt=""
            width={PHOTO_WIDTH}
            height={ogImageSize.height}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: PHOTO_WIDTH,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 28,
              background: colors.pine,
              color: colors.paper,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={whiteEmblemSrc} alt="" width={180} height={170} />
            <div
              style={{
                ...mono,
                fontSize: 13,
                letterSpacing: "0.34em",
                color: "rgba(251,250,247,0.6)",
              }}
            >
              Butwal · Rupandehi
            </div>
          </div>
        )}
      </div>
    ),
    {
      ...ogImageSize,
      fonts: [
        {
          name: "Instrument Serif",
          data: serif,
          style: "normal",
          weight: 400,
        },
        {
          name: "Instrument Serif",
          data: serifItalic,
          style: "italic",
          weight: 400,
        },
        { name: "Geist", data: geist, style: "normal", weight: 400 },
        { name: "Geist Mono", data: geistMono, style: "normal", weight: 400 },
        {
          name: "Geist Mono",
          data: geistMonoMedium,
          style: "normal",
          weight: 500,
        },
      ],
    },
  );
}
