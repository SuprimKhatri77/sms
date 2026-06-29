import { siteInfo } from "@/utils/site-info";

export function StudentStatusHelp({ className }: { className?: string }) {
  return (
    <p
      className={`font-[family-name:var(--font-dm-sans)] text-[0.78rem] leading-relaxed text-[rgba(47,78,64,0.45)] ${className ?? ""}`}
    >
      Questions?{" "}
      <a
        href={`mailto:${siteInfo.contact.email}`}
        className="font-semibold text-(--brand-green) underline-offset-2 hover:underline"
      >
        {siteInfo.contact.email}
      </a>
      {" · "}
      <a
        href={`tel:${siteInfo.contact.phone.replace(/\s/g, "")}`}
        className="font-semibold text-(--brand-green) underline-offset-2 hover:underline"
      >
        {siteInfo.contact.phone}
      </a>
    </p>
  );
}
