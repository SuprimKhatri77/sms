export type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  items?: { title: string; url: string; excludeUrls?: string[] }[];
  excludeUrls?: string[];
};

export function isNavItemActive(
  pathname: string,
  url: string,
  excludeUrls: string[] = [],
): boolean {
  if (url === "/" || url === "") {
    return pathname === "/admin" || pathname === "/admin/";
  }

  const href = `/admin${url}`;

  if (excludeUrls.some((u) => pathnameMatches(pathname, u))) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavGroupActive(
  pathname: string,
  items: { url: string; excludeUrls?: string[] }[],
): boolean {
  return items.some((item) =>
    isNavItemActive(pathname, item.url, item.excludeUrls ?? []),
  );
}

function pathnameMatches(pathname: string, url: string): boolean {
  const href = `/admin${url}`;
  return pathname === href || pathname.startsWith(`${href}/`);
}
