export function CertificateBrandText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const segments = text.split("&");

  if (segments.length === 1) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <span key={index}>
          {index > 0 ? <span className="cert-brand-amp">&</span> : null}
          {segment}
        </span>
      ))}
    </span>
  );
}
