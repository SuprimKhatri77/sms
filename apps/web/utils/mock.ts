import { IconKey } from "@/app/courses/[slug]/page";

export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  image_url: string | null;
  role: UserRole;
  created_at: string;
}

export const PAGE_SIZE = 10;

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Format =
  | "Full-Time"
  | "Part-Time"
  | "Weekend"
  | "Physical"
  | "Online";

export interface CurriculumModule {
  week: string;
  title: string;
  topics: string[];
}

export interface InstructorExperience {
  role: string;
  place: string;
  period: string;
}

export interface InstructorProfile {
  headline: string;
  experience: InstructorExperience[];
  expertise: string[];
}

export interface Instructor {
  name: string;
  title: string;
  bio: string;
  yearsExp: number;
  imagePlaceholder: string;
  image?: string;
  profileCard?: string;
  hasProfileCard?: boolean;
  profile?: InstructorProfile;
}

export interface CourseDetail {
  slug: string;
  course: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  duration: string;
  durationWeeks: number;
  format: Format;
  difficulty: Difficulty;
  seats: number;
  startDates: string[];
  tuitionNPR: number;
  color: string;
  textClass: string;
  borderClass: string;
  bgClass: string;
  accentBar: string;
  icon: IconKey;
  outcomes: string[];
  curriculum: CurriculumModule[];
  instructor: Instructor;
  stats: { label: string; value: string }[];
  videoPlaceholder: string;
  videoSrc?: string;
  faqs: { question: string; answer: string }[];
}

export const courses: CourseDetail[] = [
  {
    slug: "barista",
    course: "Professional Barista Program",
    tagline: "The Art of Coffee",
    shortDescription:
      "A journey from bean to cup, mastering espresso extraction, milk texturing, and café business management.",
    longDescription:
      "This is more than just a coffee course—it’s a journey into the world of coffee, where knowledge turns into skill, and skill transforms into opportunity. Whether you aim to start a new career, earn with confidence, or become a coffee entrepreneur, everything begins here. From strong fundamentals to real industry standards, you’ll gain hands-on mastery in espresso, the art of steaming and frothing, and creating perfect microfoam. You’ll understand the complete system—from bean to cup—covering coffee knowledge, brewing techniques, extracting the perfect shot, and even planning and managing a coffee business. By the end of this course, you’ll be ready to work as a professional barista, run your own café, or confidently step into opportunities both locally and abroad.",
    duration: "4 Weeks",
    durationWeeks: 4,
    format: "Physical",
    difficulty: "Intermediate",
    seats: 16,
    startDates: ["Upcoming dates to be announced"],
    tuitionNPR: 25000,
    color: "#E8552A",
    textClass: "text-[#E8552A]",
    borderClass: "border-[#E8552A]/35",
    bgClass: "bg-[#E8552A]/10",
    accentBar: "bg-[#E8552A]",
    icon: "coffee",
    outcomes: [
      "Operate espresso machines and essential café equipment with hands-on mastery",
      "Dial in espresso, taste with purpose, and refine quality via extraction science",
      "Master milk texturing and latte art to create smooth microfoam and designs",
      "Develop complete menu lineups including hot, iced, frappes, and alternatives",
      "Apply third-wave manual brewing methods and precise coffee ratios",
      "Manage professional café workflows, customer service, and cost calculations",
    ],
    curriculum: [
      {
        week: "Week 1",
        title: "Foundations & Extraction",
        topics: [
          "Espresso Machine Operation & Café Equipment Handling",
          "Understanding Temperature & Pressure of Espresso machines",
          "Coffee Ratios & Extraction Basics",
          "Hygiene & Safety Standards",
        ],
      },
      {
        week: "Week 2",
        title: "The Art of Milk & Tasting",
        topics: [
          "Espresso Dial-In & Tasting with purpose",
          "Milk Texturing: The science of smooth microfoam",
          "Latte Art: Pouring beautiful designs",
          "Machine Cleaning & Maintenance",
        ],
      },
      {
        week: "Week 3",
        title: "Advanced Brewing & Menu Development",
        topics: [
          "Third Wave Coffee & Manual Brewing Methods",
          "Core Beverage Fundamentals",
          "Menu Development: Hot, Iced, Frappe & Coffee Alternatives",
          "Signature drink experimentation",
        ],
      },
      {
        week: "Week 4",
        title: "Café Operations & Business Management",
        topics: [
          "Station & Workflow Deployment in real café environments",
          "Customer Service Sequence & Service Recovery Techniques",
          "Costing & Menu Engineering for profitable operations",
          "Final Practical Assessment & Performance",
        ],
      },
    ],
    instructor: {
      name: "Mr. Ashish Shrestha",
      title: "Program Coordinator · Brew and Bake Academy",
      bio: "Ashish is an experienced coffee professional and hospitality strategist specializing in barista training, café operations, and branding. He has led training for Himalayan Java and founded Coffee Class & Himalayan Roaster in Pokhara.",
      yearsExp: 11,
      image: "/assets/instructors/ashish.png",
      imagePlaceholder: "#3a5a49",
      hasProfileCard: true,
      profile: {
        headline: "Program Coordinator",
        experience: [
          {
            role: "Training Director",
            place: "Himalayan Java Coffee, Pokhara",
            period: "2015–2023",
          },
          {
            role: "Operational Head",
            place: "Himalayan Java, Pokhara",
            period: "2018–2023",
          },
          {
            role: "Operation, Consultant & Branding",
            place: "Open House Academy of Culinary Arts",
            period: "",
          },
          {
            role: "Owner",
            place: "Little Big Cafe, Pokhara",
            period: "2025–Present",
          },
          {
            role: "Program Coordinator",
            place: "Brew and Bake Academy, Butwal",
            period: "",
          },
          {
            role: "Founder & Training Director",
            place: "Coffee Class & Himalayan Roaster, Pokhara",
            period: "2023–Present",
          },
        ],
        expertise: [
          "Barista Training & Coffee Education",
          "Café Operations & Team Management",
          "Specialty Coffee & Roasting",
          "Latte Art & Espresso Training",
          "Hospitality Branding & Consulting",
          "Menu Engineering & Customer Experience",
          "Staff Development & Operational Systems",
          "Coffee Workshop & Curriculum Design",
        ],
      },
    },
    stats: [
      { label: "Graduates placed", value: "200+" },
      { label: "Avg. salary uplift", value: "40%" },
      { label: "Industry partners", value: "18" },
      { label: "Completion rate", value: "97%" },
    ],
    videoPlaceholder:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1280&auto=format&fit=crop&q=80",
    videoSrc:
      "https://assets.mixkit.co/videos/preview/mixkit-making-a-coffee-with-an-espresso-machine-1216-large.mp4",
    faqs: [
      {
        question: "Do I need any prior experience?",
        answer:
          "The course is designed to take you from strong fundamentals to real industry standards, making it suitable for both beginners and those looking to turn coffee skills into a professional career.",
      },
      {
        question: "Will I learn about the business side of coffee?",
        answer:
          "Yes. Unlike standard courses, we cover cost calculation, menu engineering, and café management to prepare you for entrepreneurship.",
      },
      {
        question: "What is the certification value?",
        answer:
          "By the end, you will be prepared to work as a professional barista or run your own café, opening doors for opportunities both locally in Nepal and abroad.",
      },
    ],
  },
  {
    slug: "bakery",
    course: "Bakery",
    tagline: "From Flour to Showpiece",
    shortDescription:
      "Classical and contemporary baking — breads, pastries, cakes — in a fully equipped bakery lab.",
    longDescription:
      "Great baking is equal parts science and artistry. This program teaches you to understand why a dough behaves the way it does — gluten development, fermentation chemistry, fat ratios — so you can troubleshoot intuitively rather than just follow recipes. You will work through classical French viennoiserie, sourdough fermentation, laminated doughs, choux, and advanced cake decoration. Every session ends with tasting and critique, building your palate alongside your technique. Graduates leave with a portfolio of showpiece creations and the production knowledge to work in a professional kitchen or launch a home-bakery brand.",
    duration: "4 Weeks",
    durationWeeks: 4,
    format: "Full-Time",
    difficulty: "Beginner",
    seats: 14,
    startDates: ["March 3, 2025", "June 2, 2025", "September 1, 2025"],
    tuitionNPR: 52000,
    color: "#D4A55A",
    textClass: "text-[#D4A55A]",
    borderClass: "border-[#D4A55A]/35",
    bgClass: "bg-[#D4A55A]/10",
    accentBar: "bg-[#D4A55A]",
    icon: "bakery",
    outcomes: [
      "Bake consistent artisan breads and sourdough",
      "Produce French viennoiserie: croissants, pain au chocolat",
      "Master laminated and choux pastry",
      "Decorate celebration cakes to professional standard",
      "Calculate food cost and production timelines",
      "Understand allergen labelling and food law basics",
    ],
    curriculum: [
      {
        week: "Week 1–2",
        title: "Bread Foundations",
        topics: [
          "Flour types, hydration, and gluten development",
          "Yeast vs. sourdough fermentation science",
          "Shaping: baguette, boule, batard",
          "Scoring and oven spring principles",
        ],
      },
      {
        week: "Week 3–4",
        title: "Sourdough & Enriched Breads",
        topics: [
          "Maintaining and feeding a starter",
          "Bulk fermentation and fold techniques",
          "Brioche, milk bread, and enriched doughs",
          "Retarding and scheduling production",
        ],
      },
      {
        week: "Week 5–6",
        title: "Viennoiserie & Laminated Doughs",
        topics: [
          "Butter block preparation and lamination",
          "Croissant shaping, proofing, and glazing",
          "Pain au chocolat and kouign-amann",
          "Troubleshooting layers and shrinkage",
        ],
      },
      {
        week: "Week 7–8",
        title: "Pastry Classics",
        topics: [
          "Choux pastry: éclairs, profiteroles, Paris-Brest",
          "Tart shells: pâte sucrée and pâte sablée",
          "Crème pâtissière, mousseline, and diplomat",
          "French fruit tarts and seasonal fillings",
        ],
      },
      {
        week: "Week 9–10",
        title: "Cake Decoration & Business Readiness",
        topics: [
          "Buttercream: Swiss meringue, Italian meringue",
          "Fondant covering and modelling",
          "Isomalt showpieces and sugar work",
          "Pricing, branding, and home-bakery setup",
        ],
      },
    ],
    instructor: {
      name: "Priya Tamang",
      title: "Pastry Chef · Le Cordon Bleu Alumna",
      bio: "Priya trained at Le Cordon Bleu London before working in patisseries in Paris and Melbourne. She returned to Nepal to champion local grain varieties and now integrates heritage flours into classical European techniques.",
      yearsExp: 10,
      imagePlaceholder: "#c28a4f",
    },
    stats: [
      { label: "Graduates placed", value: "160+" },
      { label: "Own businesses launched", value: "34" },
      { label: "Industry partners", value: "12" },
      { label: "Completion rate", value: "96%" },
    ],
    videoPlaceholder:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1280&auto=format&fit=crop",
    videoSrc:
      "https://assets.mixkit.co/videos/preview/mixkit-baker-kneading-dough-4374-large.mp4",
    faqs: [
      {
        question: "Can I specialise in just bread or just pastry?",
        answer:
          "The full program covers both. We believe a complete baker should understand the entire spectrum. However, we do offer short-course intensives for those who want to focus on one area — ask our admissions team.",
      },
      {
        question: "What ovens does the lab use?",
        answer:
          "We use professional deck ovens for bread and convection ovens for pastry, replicating the equipment you will encounter in commercial bakeries and hotel kitchens.",
      },
      {
        question: "Can I take the course part-time?",
        answer:
          "A weekend-cohort version runs over 20 weeks and covers the same curriculum. Availability is limited — enquire early.",
      },
    ],
  },
  {
    slug: "bartending",
    course: "Bartending",
    tagline: "Craft Behind the Bar",
    shortDescription:
      "Classic cocktails to modern mixology — flair, bar management, and the science of flavour pairing.",
    longDescription:
      "The modern bar is as much a stage as a service counter. This program equips you with the technical precision of a competition bartender and the hospitality instincts of a seasoned host. You will study distillation, fermentation, and sensory analysis to truly understand the spirits you pour. Cocktail sessions move from Prohibition classics through tiki and sour theory into avant-garde techniques: fat-washing, clarification, carbonation, and infusion. You will also cover responsible service law, stock management, and how to design a cocktail list that tells a story and turns a profit.",
    duration: "4 Weeks",
    durationWeeks: 4,
    format: "Full-Time",
    difficulty: "Beginner",
    seats: 18,
    startDates: ["January 6, 2025", "April 7, 2025", "July 7, 2025"],
    tuitionNPR: 38000,
    color: "#9B7FC7",
    textClass: "text-[#9B7FC7]",
    borderClass: "border-[#9B7FC7]/35",
    bgClass: "bg-[#9B7FC7]/10",
    accentBar: "bg-[#9B7FC7]",
    icon: "bartending",
    outcomes: [
      "Build 60+ classic and contemporary cocktails from memory",
      "Understand and articulate spirit categories to guests",
      "Apply advanced techniques: fat-wash, clarification, foam",
      "Manage bar stock, waste, and GP margins",
      "Practise responsible alcohol service and intervention",
      "Deliver a memorable guest experience under pressure",
    ],
    curriculum: [
      {
        week: "Week 1",
        title: "Spirits Knowledge & Sensory Training",
        topics: [
          "Distillation and fermentation fundamentals",
          "Six core spirit categories: whisky, rum, gin, vodka, tequila, brandy",
          "Nosing and tasting methodology",
          "Label reading and provenance",
        ],
      },
      {
        week: "Week 2",
        title: "Classic Cocktail Canon",
        topics: [
          "The sour, the old fashioned, the highball, and the martini families",
          "Ice theory: dilution, texture, and clarity",
          "Shaking vs. stirring: when and why",
          "Glassware and garnish standards",
        ],
      },
      {
        week: "Week 3",
        title: "Flavour Pairing & Menu Design",
        topics: [
          "Flavour wheel and balance principles",
          "Brix, acidity, and sweetness calibration",
          "Building a seasonal cocktail menu",
          "Pricing and contribution margin",
        ],
      },
      {
        week: "Week 4",
        title: "Modern Techniques",
        topics: [
          "Fat-washing and oil-washing spirits",
          "Clarification: milk-washing and centrifuge",
          "Carbonation and nitro techniques",
          "Hydrocolloids: gels, foams, and caviar",
        ],
      },
      {
        week: "Week 5",
        title: "Bar Operations & Responsible Service",
        topics: [
          "Stock management, par levels, and ordering",
          "Opening and closing procedures",
          "Recognising intoxication and refusal of service",
          "Licensing law and liability basics",
        ],
      },
      {
        week: "Week 6",
        title: "Live Bar Service & Certification",
        topics: [
          "Simulated high-volume service sessions",
          "Speed-pouring accuracy drills",
          "Guest interaction and up-selling",
          "Written and practical assessment",
        ],
      },
    ],
    instructor: {
      name: "Rohan Karki",
      title: "Head Bartender · WSET Level 3",
      bio: "Rohan has tended bar at five-star properties in Dubai and Singapore, competed in the Diageo World Class regional finals, and holds a WSET Level 3 Award in Spirits. He specialises in low-ABV cocktail development and fermentation.",
      yearsExp: 12,
      imagePlaceholder: "#9B7FC7",
    },
    stats: [
      { label: "Graduates placed", value: "280+" },
      { label: "Hotel partners", value: "22" },
      { label: "Avg. time to employment", value: "3 wks" },
      { label: "Completion rate", value: "98%" },
    ],
    videoPlaceholder:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1280&auto=format&fit=crop",
    videoSrc:
      "https://assets.mixkit.co/videos/preview/mixkit-bartender-making-a-cocktail-4307-large.mp4",
    faqs: [
      {
        question: "Is alcohol consumed during the course?",
        answer:
          "Tasting is part of the sensory curriculum, but consumption is voluntary and always minimal. Participants under 21 must provide a guardian consent form.",
      },
      {
        question: "Do you teach flair bartending?",
        answer:
          "We cover foundational flair — bottle flips, tin work — as a confidence-builder, but the program prioritises craft and speed over performance flair.",
      },
      {
        question: "Will I get a placement after graduation?",
        answer:
          "We have active partnerships with 22 hotels and restaurants in Kathmandu. Most graduates receive interview offers within three weeks of completing the program.",
      },
    ],
  },
  {
    slug: "sushi",
    course: "Sushi",
    tagline: "Japanese Culinary Tradition",
    shortDescription:
      "Precision and philosophy behind Japanese cuisine — from rice prep to omakase plating.",
    longDescription:
      "Sushi is not a dish — it is a discipline. This program introduces students to the philosophical foundations of Japanese culinary culture alongside the technical rigour required to work at a professional level. You will spend significant time on the seemingly simple: water quality, rice seasoning, salt ratios, knife sharpening. Only once the foundations are solid do we move to fish butchery, curing, marinating, and the various forms — nigiri, maki, uramaki, temaki, and chirashi. The program concludes with an omakase simulation where students compose and serve a multi-course experience, demonstrating both craft and the hospitality spirit of omotenashi.",
    duration: "4 Weeks",
    durationWeeks: 4,
    format: "Full-Time",
    difficulty: "Intermediate",
    seats: 12,
    startDates: ["February 17, 2025", "June 16, 2025", "October 6, 2025"],
    tuitionNPR: 68000,
    color: "#4EA87A",
    textClass: "text-[#4EA87A]",
    borderClass: "border-[#4EA87A]/35",
    bgClass: "bg-[#4EA87A]/10",
    accentBar: "bg-[#4EA87A]",
    icon: "sushi",
    outcomes: [
      "Prepare and season sushi rice to professional standard",
      "Butcher and portion fish safely and efficiently",
      "Produce nigiri, maki, uramaki, temaki, and chirashi",
      "Apply Japanese knife skills and sharpening technique",
      "Design and execute a multi-course omakase menu",
      "Maintain HACCP food-safety standards for raw fish",
    ],
    curriculum: [
      {
        week: "Week 1–2",
        title: "Japanese Culinary Philosophy & Knife Work",
        topics: [
          "Washoku principles and seasonal eating (shun)",
          "Japanese knife anatomy: yanagiba, deba, usuba",
          "Sharpening on whetstones: 400, 1000, 6000 grit",
          "Basic cuts: katsuramuki, tanzaku, sainome",
        ],
      },
      {
        week: "Week 3–4",
        title: "Sushi Rice Mastery",
        topics: [
          "Rice variety selection: short-grain and its cultivars",
          "Washing, soaking, and cooking ratios",
          "Su-meshi seasoning: rice vinegar, sugar, and salt balance",
          "Temperature management and fanning technique",
        ],
      },
      {
        week: "Week 5–6",
        title: "Fish Butchery & Food Safety",
        topics: [
          "Whole fish breakdown: ikejime, three-fillet, and pin-bone",
          "HACCP protocols for raw-fish service",
          "Curing and marinating: shime saba, zuke, kobujime",
          "Sourcing, freshness assessment, and cold-chain management",
        ],
      },
      {
        week: "Week 7–8",
        title: "Nigiri, Maki & Hand Rolls",
        topics: [
          "Nigiri hand pressure and rice ball shaping",
          "Hosomaki, futomaki, and uramaki construction",
          "Temaki and gunkan style",
          "Vegetarian and cooked-topping variations",
        ],
      },
      {
        week: "Week 9–10",
        title: "Omakase Design & Service",
        topics: [
          "Menu narrative and seasonal composition",
          "Plating aesthetics: ma (negative space) and wabi-sabi",
          "Omotenashi: the spirit of hospitality",
          "Live multi-course omakase service and assessment",
        ],
      },
    ],
    instructor: {
      name: "Kenji Watanabe",
      title: "Executive Sushi Chef · 15 Yrs Tokyo & International",
      bio: "Kenji apprenticed under a third-generation Edo-mae sushi master in Tokyo's Ginza district for four years before working in Michelin-starred restaurants across Hong Kong and London. He is one of the few non-Japanese instructors certified by the Japan Sushi Skills Institute.",
      yearsExp: 15,
      imagePlaceholder: "#4EA87A",
    },
    stats: [
      { label: "Graduates placed", value: "90+" },
      { label: "5-star hotel partners", value: "9" },
      { label: "Avg. starting salary", value: "NPR 55k" },
      { label: "Completion rate", value: "95%" },
    ],
    videoPlaceholder:
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=1280&auto=format&fit=crop&q=80",
    faqs: [
      {
        question: "Why is this listed as Intermediate difficulty?",
        answer:
          "Unlike our other programs, Sushi involves handling raw fish and sharp Japanese knives from week one. We require applicants to have at least some kitchen experience — even home cooking — and comfort around raw protein.",
      },
      {
        question: "Where do you source fish in Kathmandu?",
        answer:
          "We work with a temperature-controlled importer who flies in sashimi-grade fish from Tokyo's Toyosu market twice weekly. Students also learn to work with high-quality freshwater species available locally.",
      },
      {
        question: "What knives do students use?",
        answer:
          "The school provides Sakai Takayuki yanagiba knives for practice. Students are encouraged — but not required — to invest in their own set toward the end of the program.",
      },
    ],
  },
];

export function getCourseBySlug(slug: string): CourseDetail | undefined {
  return courses.find((c) => c.slug === slug);
}
