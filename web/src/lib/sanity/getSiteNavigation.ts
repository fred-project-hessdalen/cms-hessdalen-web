// src/lib/sanity/getSiteNavigation.ts
import { fetchAndParse } from "@/lib/sanity/fetch";
import { NAV_MENU, NAV_QUERY, NAV_TAG } from "@/lib/sanity/query/nav.query";
import type { NavMenu } from "@/lib/sanity/query/nav.query";

export async function getSiteNavigation(): Promise<NavMenu> {
    const nav = await fetchAndParse(
        NAV_QUERY,
        {},
        NAV_MENU,
        { next: { revalidate: 60, tags: [NAV_TAG] } }
    );

    return nav ?? { menuItems: [] };
}
