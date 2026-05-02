import { IconKey } from "@/app/courses/[slug]/page";
import {
  Coffee,
  CroissantIcon,
  GlassWater,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type UserRole = "user" | "admin" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  image_url: string | null;
  role: UserRole;
  created_at: string;
}

export const MOCK_USERS: User[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    password_hash: "$2b$10$hashedpassword1",
    image_url: null,
    role: "superadmin",
    created_at: "2024-01-15T08:30:00Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Bob Martinez",
    email: "bob.martinez@example.com",
    password_hash: "$2b$10$hashedpassword2",
    image_url: null,
    role: "admin",
    created_at: "2024-02-10T10:15:00Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "Carol White",
    email: "carol.white@example.com",
    password_hash: "$2b$10$hashedpassword3",
    image_url: null,
    role: "user",
    created_at: "2024-02-20T14:00:00Z",
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    name: "David Kim",
    email: "david.kim@example.com",
    password_hash: "$2b$10$hashedpassword4",
    image_url: null,
    role: "user",
    created_at: "2024-03-05T09:45:00Z",
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    name: "Eva Rossi",
    email: "eva.rossi@example.com",
    password_hash: "$2b$10$hashedpassword5",
    image_url: null,
    role: "admin",
    created_at: "2024-03-18T11:30:00Z",
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    name: "Frank Nguyen",
    email: "frank.nguyen@example.com",
    password_hash: "$2b$10$hashedpassword6",
    image_url: null,
    role: "user",
    created_at: "2024-04-02T16:20:00Z",
  },
  {
    id: "a7b8c9d0-e1f2-3456-abcd-567890123456",
    name: "Grace Lee",
    email: "grace.lee@example.com",
    password_hash: "$2b$10$hashedpassword7",
    image_url: null,
    role: "user",
    created_at: "2024-04-22T13:10:00Z",
  },
  {
    id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    name: "Henry Patel",
    email: "henry.patel@example.com",
    password_hash: "$2b$10$hashedpassword8",
    image_url: null,
    role: "user",
    created_at: "2024-05-08T08:00:00Z",
  },
  {
    id: "c9d0e1f2-a3b4-5678-cdef-789012345678",
    name: "Iris Chen",
    email: "iris.chen@example.com",
    password_hash: "$2b$10$hashedpassword9",
    image_url: null,
    role: "admin",
    created_at: "2024-05-25T15:45:00Z",
  },
  {
    id: "d0e1f2a3-b4c5-6789-defa-890123456789",
    name: "James Walker",
    email: "james.walker@example.com",
    password_hash: "$2b$10$hashedpassword10",
    image_url: null,
    role: "user",
    created_at: "2024-06-12T12:30:00Z",
  },
  {
    id: "e1f2a3b4-c5d6-7890-efab-901234567890",
    name: "Karen Thompson",
    email: "karen.thompson@example.com",
    password_hash: "$2b$10$hashedpassword11",
    image_url: null,
    role: "user",
    created_at: "2024-06-30T10:00:00Z",
  },
  {
    id: "f2a3b4c5-d6e7-8901-fabc-012345678901",
    name: "Liam Brooks",
    email: "liam.brooks@example.com",
    password_hash: "$2b$10$hashedpassword12",
    image_url: null,
    role: "user",
    created_at: "2024-07-15T07:30:00Z",
  },
  {
    id: "a3b4c5d6-e7f8-9012-abcd-123456789012",
    name: "Mia Santos",
    email: "mia.santos@example.com",
    password_hash: "$2b$10$hashedpassword13",
    image_url: null,
    role: "admin",
    created_at: "2024-07-28T14:15:00Z",
  },
  {
    id: "b4c5d6e7-f8a9-0123-bcde-234567890123",
    name: "Noah Davis",
    email: "noah.davis@example.com",
    password_hash: "$2b$10$hashedpassword14",
    image_url: null,
    role: "user",
    created_at: "2024-08-10T11:00:00Z",
  },
  {
    id: "c5d6e7f8-a9b0-1234-cdef-345678901234",
    name: "Olivia Brown",
    email: "olivia.brown@example.com",
    password_hash: "$2b$10$hashedpassword15",
    image_url: null,
    role: "user",
    created_at: "2024-08-25T09:20:00Z",
  },
  {
    id: "d6e7f8a9-b0c1-2345-defa-456789012345",
    name: "Peter Wilson",
    email: "peter.wilson@example.com",
    password_hash: "$2b$10$hashedpassword16",
    image_url: null,
    role: "superadmin",
    created_at: "2024-09-05T16:50:00Z",
  },
  {
    id: "e7f8a9b0-c1d2-3456-efab-567890123456",
    name: "Quinn Taylor",
    email: "quinn.taylor@example.com",
    password_hash: "$2b$10$hashedpassword17",
    image_url: null,
    role: "user",
    created_at: "2024-09-18T13:40:00Z",
  },
  {
    id: "f8a9b0c1-d2e3-4567-fabc-678901234567",
    name: "Rachel Green",
    email: "rachel.green@example.com",
    password_hash: "$2b$10$hashedpassword18",
    image_url: null,
    role: "user",
    created_at: "2024-10-02T08:10:00Z",
  },
  {
    id: "a9b0c1d2-e3f4-5678-abcd-789012345678",
    name: "Samuel Harris",
    email: "samuel.harris@example.com",
    password_hash: "$2b$10$hashedpassword19",
    image_url: null,
    role: "admin",
    created_at: "2024-10-20T15:00:00Z",
  },
  {
    id: "b0c1d2e3-f4a5-6789-bcde-890123456789",
    name: "Tina Clark",
    email: "tina.clark@example.com",
    password_hash: "$2b$10$hashedpassword20",
    image_url: null,
    role: "user",
    created_at: "2024-11-08T12:00:00Z",
  },
];

export const PAGE_SIZE = 10;

export function getPaginatedUsers(
  page: number,
  source: User[] = MOCK_USERS,
): {
  users: User[];
  total: number;
  hasMore: boolean;
} {
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const users = source.slice(start, end);
  return {
    users,
    total: source.length,
    hasMore: end < source.length,
  };
}

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Format = "Full-Time" | "Part-Time" | "Weekend";

export interface CurriculumModule {
  week: string;
  title: string;
  topics: string[];
}

export interface Instructor {
  name: string;
  title: string;
  bio: string;
  yearsExp: number;
  imagePlaceholder: string;
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
  faqs: { question: string; answer: string }[];
}

export const courses: CourseDetail[] = [
  {
    slug: "barista",
    course: "Barista",
    tagline: "The Art of Coffee",
    shortDescription:
      "Master espresso extraction, milk texturing, latte art, and café workflow.",
    longDescription:
      "Coffee is one of the world's most traded commodities — and the skill gap between an average barista and a great one is enormous. This program goes far beyond pulling shots. You will study the entire coffee supply chain, from origin and processing methods to roast profiles and extraction science. You will develop muscle memory on professional espresso machines, learn milk microfoam physics, and practise latte art patterns until they become second nature. By graduation, you will be able to design a seasonal menu, calibrate a grinder blind, and manage a busy café service with confidence.",
    duration: "8 Weeks",
    durationWeeks: 8,
    format: "Full-Time",
    difficulty: "Beginner",
    seats: 16,
    startDates: ["February 3, 2025", "May 5, 2025", "August 4, 2025"],
    tuitionNPR: 45000,
    color: "#E8552A",
    textClass: "text-[#E8552A]",
    borderClass: "border-[#E8552A]/35",
    bgClass: "bg-[#E8552A]/10",
    accentBar: "bg-[#E8552A]",
    icon: "coffee",
    outcomes: [
      "Operate commercial espresso equipment professionally",
      "Dial in grind and extraction by taste",
      "Steam milk to barista-competition standard",
      "Execute five signature latte art patterns",
      "Design and cost a café beverage menu",
      "Apply food-safety and hygiene protocols",
    ],
    curriculum: [
      {
        week: "Week 1–2",
        title: "Coffee Origins & Roasting Science",
        topics: [
          "Bean varieties: Arabica, Robusta, and specialty hybrids",
          "Processing methods: washed, natural, honey",
          "Roast profiles and their flavour implications",
          "Sensory cupping sessions",
        ],
      },
      {
        week: "Week 3–4",
        title: "Espresso Theory & Machine Mastery",
        topics: [
          "Espresso extraction variables: dose, yield, time, temperature",
          "Grinder calibration and burr maintenance",
          "Channelling, under- and over-extraction diagnosis",
          "Machine anatomy and daily servicing",
        ],
      },
      {
        week: "Week 5–6",
        title: "Milk Science & Latte Art",
        topics: [
          "Milk fat and protein behaviour under steam",
          "Microfoam texture: silky vs. airy foam",
          "Pouring mechanics: heart, rosetta, tulip, swan",
          "Alternative milks: oat, almond, soy behaviour",
        ],
      },
      {
        week: "Week 7",
        title: "Menu Design & Café Operations",
        topics: [
          "Seasonal signature drink development",
          "Food costing and GP margin calculation",
          "POS systems and order workflow",
          "Customer service and upselling techniques",
        ],
      },
      {
        week: "Week 8",
        title: "Industry Simulation & Assessment",
        topics: [
          "Live café service simulation",
          "Speed and consistency drills",
          "Written theory examination",
          "Portfolio and practical assessment",
        ],
      },
    ],
    instructor: {
      name: "Aarav Shrestha",
      title: "Head Barista Trainer · SCA Certified",
      bio: "Aarav spent eight years as head barista at three-Michelin-adjacent restaurants in Singapore before returning to Kathmandu to teach. He has competed in the Nepal Barista Championship and holds an SCA Brewing and Sensory Skills certification.",
      yearsExp: 8,
      imagePlaceholder: "#3a5a49",
    },
    stats: [
      { label: "Graduates placed", value: "200+" },
      { label: "Avg. salary uplift", value: "40%" },
      { label: "Industry partners", value: "18" },
      { label: "Completion rate", value: "97%" },
    ],
    videoPlaceholder:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1280&auto=format&fit=crop&q=80",
    faqs: [
      {
        question: "Do I need any prior experience?",
        answer:
          "None at all. The program is designed for complete beginners, though experienced baristas looking to formalise their skills are equally welcome.",
      },
      {
        question: "What equipment will I train on?",
        answer:
          "You will work on commercial La Marzocco Linea PB and Synesso machines paired with Mahlkönig EK43 grinders — the same equipment used in specialty cafés worldwide.",
      },
      {
        question: "Is the certificate internationally recognised?",
        answer:
          "Our in-house certificate is respected by hospitality employers across Nepal and South Asia. We also offer an optional SCA exam pathway at additional cost.",
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
    duration: "10 Weeks",
    durationWeeks: 10,
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
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1280&auto=format&fit=crop&q=80",
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
    duration: "6 Weeks",
    durationWeeks: 6,
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
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1280&auto=format&fit=crop&q=80",
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
    duration: "10 Weeks",
    durationWeeks: 10,
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
