export function formatCertificateFooterAddress(address: string): string {
  return address
    .split(",")
    .map((segment) => {
      const trimmed = segment.trim();
      if (!trimmed) return "";

      return trimmed
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    })
    .filter(Boolean)
    .join(", ");
}

export function formatCertificateFooterEmail(email: string): string {
  return email.trim().toLowerCase();
}
