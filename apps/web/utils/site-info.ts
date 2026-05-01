export const siteInfo = {
  company: {
    name: "Bake & Brew Barista Coffee School",
    shortName: "Brew & Bake Academy",
    tagline: "Industry-first training in coffee, bakery, and hospitality.",
  },
  contact: {
    phone: "+977 98XXXXXXXX",
    email: "brewandbake@example.com",
    address: "New Baneshwor, Kathmandu, Nepal",
    officeHours: "Mon - Fri, 8:00 AM - 5:00 PM",
  },
  assets: {
    logo: "/assets/logo.png",
    noBGLogo: "/assets/logo-no-bg.png",
    emblem: "/assets/watermark.png",
    watermarkNoBG: "/assets/watermark-no-bg.png",
  },
  social: {
    facebook: "#",
    instagram: "#",
    tiktok: "#",
  },
  admission: {
    cycleLabel: "Admissions Open",
  },
  stats: [
    { number: "1,200+", label: "Trainees Enrolled" },
    { number: "96%", label: "Placement Support Rate" },
    { number: "35+", label: "Industry Mentors" },
    { number: "15+", label: "Years of Training Experience" },
  ],
} as const;
