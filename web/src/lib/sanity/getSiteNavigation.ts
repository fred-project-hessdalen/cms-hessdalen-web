// src/lib/sanity/getSiteNavigation.ts
import { fetchAndParse } from "@/lib/sanity/fetch";
import { NAV_MENU, NAV_QUERY, NAV_TAG } from "@/lib/sanity/query/nav.query";
import type { NavMenu } from "@/lib/sanity/query/nav.query";

let navCache: NavMenu | null = null;
let navCacheTimestamp = 0;
const NAV_CACHE_DURATION = 60_000; // 1 minute in ms

export async function getSiteNavigation(): Promise<NavMenu> {
    const now = Date.now();
    if (navCache && now - navCacheTimestamp < NAV_CACHE_DURATION) return navCache;

    //  revalidate:  300 (5 minutes) / 60 (1 minute) 

    const nav = await fetchAndParse(
        NAV_QUERY,
        {},
        NAV_MENU,
        { next: { revalidate: 0, tags: [NAV_TAG] } }
    );

    navCache = nav ?? { menuItems: [] };
    navCacheTimestamp = now;
    return navCache;
}
