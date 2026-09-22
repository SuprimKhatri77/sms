export type AdminShortcut = {
  keys: string[];
  label: string;
  description: string;
  scope?: string;
};

export type AdminShortcutGroup = {
  title: string;
  description?: string;
  shortcuts: AdminShortcut[];
};

export const ADMIN_SHORTCUT_GROUPS: AdminShortcutGroup[] = [
  {
    title: "Navigation",
    description: "Move between the public site and admin panel.",
    shortcuts: [
      {
        keys: ["H"],
        label: "Go home",
        description: "Leave the admin panel and open the public site home page.",
        scope: "Admin panel",
      },
      {
        keys: ["D"],
        label: "Open admin",
        description: "Open the admin dashboard from anywhere on the public site.",
        scope: "Public site · admins only",
      },
      {
        keys: ["?"],
        label: "This page",
        description: "Open the keyboard shortcuts reference.",
        scope: "Admin panel",
      },
      {
        keys: ["L"],
        label: "Log out",
        description: "Sign out of your account and return to the login page.",
        scope: "Admin panel",
      },
    ],
  },
  {
    title: "Interface",
    description: "Adjust the admin layout.",
    shortcuts: [
      {
        keys: ["["],
        label: "Toggle sidebar",
        description: "Collapse or expand the navigation sidebar.",
        scope: "Admin panel",
      },
    ],
  },
  {
    title: "Actions",
    description: "Common tasks on list and ledger pages.",
    shortcuts: [
      {
        keys: ["N"],
        label: "New entry",
        description: "Open or close the primary create form. Press once to open, again to close.",
        scope: "See supported pages below",
      },
      {
        keys: ["F"],
        label: "Focus search",
        description: "Jump to the page search field.",
        scope: "Pages with search",
      },
      {
        keys: ["R"],
        label: "Refresh",
        description:
          "Reload the current page data. Limited to once every 3 seconds across the admin panel.",
        scope: "Data pages",
      },
      {
        keys: ["C"],
        label: "Clear filters",
        description:
          "Reset search and dropdown filters on the current page. Same as the Clear all button.",
        scope: "Pages with filters",
      },
      {
        keys: ["B"],
        label: "Go back",
        description: "Return to the parent list page.",
        scope: "Detail pages",
      },
      {
        keys: ["Esc"],
        label: "Close overlay",
        description: "Close the topmost modal, drawer, confirm dialog, or dropdown.",
        scope: "When something is open",
      },
    ],
  },
  {
    title: "Student finance",
    description: "On a student profile page only. Same rules as the on-screen buttons.",
    shortcuts: [
      {
        keys: ["P"],
        label: "Add payment",
        description: "Open the add payment dialog when balance is due.",
        scope: "Student detail",
      },
      {
        keys: ["S"],
        label: "Scholarship",
        description: "Award a scholarship or edit the existing one. New awards require balance due.",
        scope: "Student detail",
      },
      {
        keys: ["D"],
        label: "Add discount",
        description: "Open the add discount dialog when balance is due.",
        scope: "Student detail",
      },
    ],
  },
  {
    title: "Go to section",
    description:
      "Press G, then a letter within one second — like GitHub. Cancels if no letter is pressed in time.",
    shortcuts: [
      {
        keys: ["G", "D"],
        label: "Dashboard",
        description: "Open the admin dashboard.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "A"],
        label: "Analytics",
        description: "Open analytics.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "S"],
        label: "Students",
        description: "Open the student list.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "O"],
        label: "Outstanding",
        description: "Open outstanding balances.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "R"],
        label: "Sales revenue",
        description: "Open sales revenue.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "Y"],
        label: "Student payments",
        description: "Open all student payments.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "F"],
        label: "Student discounts",
        description: "Open all student discounts.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "J"],
        label: "Student scholarships",
        description: "Open all student scholarships.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "C"],
        label: "Courses",
        description: "Open courses.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "I"],
        label: "Inquiries",
        description: "Open inquiries.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "U"],
        label: "Users",
        description: "Open users.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "T"],
        label: "Settings",
        description: "Open settings.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "P"],
        label: "Products",
        description: "Open inventory products.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "N"],
        label: "Purchase",
        description: "Open purchase.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "X"],
        label: "Sales",
        description: "Open sales.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "W"],
        label: "Wastage",
        description: "Open wastage.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "M"],
        label: "Inventory summary",
        description: "Open inventory summary.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "K"],
        label: "Banks",
        description: "Open banks.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "B"],
        label: "Bank ledger",
        description: "Open bank ledger.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "L"],
        label: "Cash ledger",
        description: "Open cash ledger.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "E"],
        label: "Suppliers",
        description: "Open suppliers.",
        scope: "Admin panel",
      },
      {
        keys: ["G", "V"],
        label: "Supplier ledger",
        description: "Open supplier ledger.",
        scope: "Admin panel",
      },
    ],
  },
];

export type AdminGoNavRoute = {
  key: string;
  label: string;
  href: string;
};

export const ADMIN_GO_NAV_ROUTES: AdminGoNavRoute[] = [
  { key: "d", label: "Dashboard", href: "/admin" },
  { key: "a", label: "Analytics", href: "/admin/analytics" },
  { key: "s", label: "Students", href: "/admin/students" },
  { key: "o", label: "Outstanding", href: "/admin/students/outstanding" },
  { key: "r", label: "Sales revenue", href: "/admin/students/sales" },
  { key: "y", label: "Student payments", href: "/admin/students/payments" },
  { key: "f", label: "Student discounts", href: "/admin/students/discounts" },
  { key: "j", label: "Student scholarships", href: "/admin/students/scholarships" },
  { key: "c", label: "Courses", href: "/admin/courses" },
  { key: "i", label: "Inquiries", href: "/admin/inquiries" },
  { key: "u", label: "Users", href: "/admin/users" },
  { key: "t", label: "Settings", href: "/admin/settings" },
  { key: "p", label: "Products", href: "/admin/inventory/products" },
  { key: "n", label: "Purchase", href: "/admin/inventory/purchase" },
  { key: "x", label: "Sales", href: "/admin/inventory/sales" },
  { key: "w", label: "Wastage", href: "/admin/inventory/wastage" },
  { key: "m", label: "Inventory summary", href: "/admin/inventory/summary" },
  { key: "k", label: "Banks", href: "/admin/banks" },
  { key: "b", label: "Bank ledger", href: "/admin/banks/ledger" },
  { key: "l", label: "Cash ledger", href: "/admin/cash-ledger" },
  { key: "e", label: "Suppliers", href: "/admin/suppliers" },
  { key: "v", label: "Supplier ledger", href: "/admin/suppliers/ledger" },
];

export type AdminPageShortcut = {
  path: string;
  category: "School" | "Accounting" | "Inventory";
  page: string;
  action: string;
  newEntry: boolean;
  focusSearch: boolean;
  clearFilters: boolean;
  back: boolean;
  payment: boolean;
  scholarship: boolean;
  discount: boolean;
};

export const ADMIN_PAGE_SHORTCUTS: AdminPageShortcut[] = [
  {
    path: "/admin/users",
    category: "School",
    page: "Users",
    action: "Create user",
    newEntry: true,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/courses",
    category: "School",
    page: "Courses",
    action: "Add course",
    newEntry: true,
    focusSearch: true,
    clearFilters: false,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/inquiries",
    category: "School",
    page: "Inquiries",
    action: "Inquiry inbox",
    newEntry: false,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/students",
    category: "School",
    page: "Students",
    action: "Student list",
    newEntry: false,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/students/outstanding",
    category: "School",
    page: "Outstanding",
    action: "Fee balances",
    newEntry: false,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/students/sales",
    category: "School",
    page: "Sales revenue",
    action: "Collections",
    newEntry: false,
    focusSearch: false,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/students/payments",
    category: "School",
    page: "Student payments",
    action: "Payment records",
    newEntry: false,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/students/discounts",
    category: "School",
    page: "Student discounts",
    action: "Discount records",
    newEntry: false,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/students/scholarships",
    category: "School",
    page: "Student scholarships",
    action: "Scholarship records",
    newEntry: false,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/students/[studentID]",
    category: "School",
    page: "Student detail",
    action: "Profile & payments",
    newEntry: false,
    focusSearch: false,
    clearFilters: false,
    back: true,
    payment: true,
    scholarship: true,
    discount: true,
  },
  {
    path: "/admin/banks",
    category: "Accounting",
    page: "Banks",
    action: "Add bank",
    newEntry: true,
    focusSearch: false,
    clearFilters: false,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/suppliers",
    category: "Accounting",
    page: "Suppliers",
    action: "Add supplier",
    newEntry: true,
    focusSearch: false,
    clearFilters: false,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/banks/accounts",
    category: "Accounting",
    page: "Bank accounts",
    action: "Add account",
    newEntry: true,
    focusSearch: false,
    clearFilters: false,
    back: true,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/banks/ledger",
    category: "Accounting",
    page: "Bank ledger",
    action: "New entry",
    newEntry: true,
    focusSearch: false,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/cash-ledger",
    category: "Accounting",
    page: "Cash ledger",
    action: "New entry",
    newEntry: true,
    focusSearch: false,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/suppliers/ledger",
    category: "Accounting",
    page: "Supplier ledger",
    action: "New entry",
    newEntry: true,
    focusSearch: false,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/inventory/products",
    category: "Inventory",
    page: "Products",
    action: "Add product",
    newEntry: true,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/inventory/purchase",
    category: "Inventory",
    page: "Purchase",
    action: "Add entry",
    newEntry: true,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/inventory/sales",
    category: "Inventory",
    page: "Sales",
    action: "Add entry",
    newEntry: true,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
  {
    path: "/admin/inventory/wastage",
    category: "Inventory",
    page: "Wastage",
    action: "Add entry",
    newEntry: true,
    focusSearch: true,
    clearFilters: true,
    back: false,
    payment: false,
    scholarship: false,
    discount: false,
  },
];

export const ADMIN_QUICK_REFERENCE = [
  { keys: ["N"], label: "New" },
  { keys: ["F"], label: "Search" },
  { keys: ["C"], label: "Clear" },
  { keys: ["B"], label: "Back" },
  { keys: ["R"], label: "Refresh" },
  { keys: ["G", "…"], label: "Go to" },
  { keys: ["Esc"], label: "Close" },
  { keys: ["["], label: "Sidebar" },
  { keys: ["?"], label: "Help" },
  { keys: ["L"], label: "Log out" },
] as const;

export type FlatShortcutEntry = AdminShortcut & {
  category: string;
};

export function getFlattenedShortcuts(): FlatShortcutEntry[] {
  return ADMIN_SHORTCUT_GROUPS.flatMap((group) =>
    group.shortcuts.map((shortcut) => ({
      ...shortcut,
      category: group.title,
    })),
  );
}

export const PAGE_SHORTCUT_DEFS = [
  { field: "newEntry" as const, key: "N", label: "New" },
  { field: "focusSearch" as const, key: "F", label: "Search" },
  { field: "clearFilters" as const, key: "C", label: "Clear" },
  { field: "back" as const, key: "B", label: "Back" },
  { field: "payment" as const, key: "P", label: "Payment" },
  { field: "scholarship" as const, key: "S", label: "Scholarship" },
  { field: "discount" as const, key: "D", label: "Discount" },
] as const;

export function getPageShortcutKeys(page: AdminPageShortcut): string[] {
  const keys: string[] = PAGE_SHORTCUT_DEFS.filter((def) => page[def.field]).map(
    (def) => def.key,
  );
  keys.push("R");
  return keys;
}
