import Image, { type ImageLoader } from "next/image";

const passthroughLoader: ImageLoader = ({ src }) => src;

export function CertificateSignatureSlot({
  src,
  alt,
  width = 136,
  height = 50,
}: {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  if (!src) {
    return (
      <div
        className="cert-signature-img cert-signature-placeholder"
        aria-hidden="true"
      />
    );
  }

  return (
    <Image
      className="cert-signature-img"
      src={src}
      alt={alt}
      loader={passthroughLoader}
      unoptimized
      width={width}
      height={height}
    />
  );
}
