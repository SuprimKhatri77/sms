"use client";

import QRCode from "react-qr-code";

type Props = {
  value: string;
  size?: number;
};

export function CertificateQrCode({ value, size = 56 }: Props) {
  return (
    <div className="cert-qr" aria-hidden="true">
      <div className="cert-qr-inner">
        <QRCode
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="#3F6B51"
          level="M"
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
}
