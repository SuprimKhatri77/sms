/** Hero line on the certificate, e.g. Barista → Advanced Barista Course */
export function formatCertificateHeroCourseTitle(courseName: string): string {
  const trimmed = courseName.trim().replace(/,+$/, "");
  if (!trimmed) return "";

  if (/course$/i.test(trimmed)) {
    return trimmed;
  }

  const words = trimmed.split(/\s+/);
  if (words.length >= 3) {
    return trimmed;
  }

  const properName = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return `Advanced ${properName} Course`;
}

export function formatCertificateHeroCourseList(courses: string[]): string {
  return courses
    .map((course) => formatCertificateHeroCourseTitle(course))
    .filter(Boolean)
    .join(", ");
}
