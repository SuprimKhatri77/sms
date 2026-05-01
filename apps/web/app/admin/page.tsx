import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CircleHelp,
  Settings,
  Users,
  UserSquare2,
} from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1
            className="text-[1.8rem] font-bold text-(--brand-green)"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Dashboard
          </h1>
          <p
            className="text-[0.9rem] text-[rgba(47,78,64,0.55)]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Quick links to core admin areas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Students",
              desc: "Manage student records, payments, certificates.",
              href: "/admin/students",
              icon: UserSquare2,
            },
            {
              title: "Courses",
              desc: "Create and manage programs and pricing.",
              href: "/admin/courses",
              icon: BookOpen,
            },
            {
              title: "Inquiries",
              desc: "Review incoming inquiries and follow-ups.",
              href: "/admin/inquiries",
              icon: CircleHelp,
            },
            {
              title: "Analytics",
              desc: "Track admissions, revenue, and performance.",
              href: "/admin/analytics",
              icon: BarChart3,
            },
            {
              title: "Users",
              desc: "Admin users and roles.",
              href: "/admin/users",
              icon: Users,
            },
            {
              title: "Settings",
              desc: "School and system settings.",
              href: "/admin/settings",
              icon: Settings,
            },
          ].map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group rounded-2xl border border-[rgba(47,78,64,0.12)] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[rgba(194,138,79,0.35)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="text-[1.05rem] font-bold text-(--brand-green)"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {c.title}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(194,138,79,0.14)] ring-1 ring-[rgba(194,138,79,0.24)]">
                  <c.icon className="h-4 w-4 text-(--brand-brown)" />
                </span>
              </div>
              <p
                className="text-[0.88rem] text-[rgba(47,78,64,0.55)]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {c.desc}
              </p>
              <div
                className="mt-4 text-[0.8rem] font-semibold text-(--brand-brown)"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Open →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
