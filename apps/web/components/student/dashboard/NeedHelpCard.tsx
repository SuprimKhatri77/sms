import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteInfo } from "@/utils/site-info";
import { DashboardSection } from "./DashboardSection";
import { dashboardInsetClass, dashboardLabelClass } from "./dashboard-styles";

const ITEMS = [
  {
    icon: Phone,
    label: "Phone",
    value: siteInfo.contact.phone,
    href: `tel:${siteInfo.contact.phone.replace(/\s/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: siteInfo.contact.email,
    href: `mailto:${siteInfo.contact.email}`,
  },
  {
    icon: Clock,
    label: "Office hours",
    value: siteInfo.contact.officeHours,
  },
  {
    icon: MapPin,
    label: "Address",
    value: siteInfo.contact.address,
  },
] as const;

export function NeedHelpCard({ showTitle = true }: { showTitle?: boolean }) {
  const content = (
    <div className={`${dashboardInsetClass} space-y-4`}>
      {ITEMS.map(({ icon: Icon, label, value, ...rest }) => (
        <div key={label}>
          <p className={dashboardLabelClass}>{label}</p>
          {"href" in rest && rest.href ? (
            <a
              href={rest.href}
              className="mt-1 inline-flex items-center gap-2 font-[family-name:var(--font-dm-sans)] text-[0.9rem] font-medium text-(--brand-green) transition-colors hover:text-(--brand-brown)"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              {value}
            </a>
          ) : (
            <p className="mt-1 flex items-start gap-2 font-[family-name:var(--font-dm-sans)] text-[0.9rem] leading-relaxed text-[rgba(47,78,64,0.62)]">
              <Icon
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--brand-brown)"
                strokeWidth={1.75}
              />
              {value}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  if (!showTitle) return content;

  return <DashboardSection title="Need help?">{content}</DashboardSection>;
}
