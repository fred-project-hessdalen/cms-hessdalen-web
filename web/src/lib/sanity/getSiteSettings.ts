import { fetchAndParse } from "@/lib/sanity/fetch";
import { SITE_SETTINGS, SITE_SETTINGS_QUERY, SiteSettings, SITE_SETTINGS_TAG } from "@/lib/sanity/query/site.query";

// Cache the site settings to avoid multiple fetches
let siteSettingsCache: SiteSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 300_000; // 5 minutes in ms

export async function getSiteSettings(): Promise<SiteSettings> {
    const now = Date.now();

    // Return cached data if it's still valid
    if (siteSettingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return siteSettingsCache;
    }

    //  revalidate:  300 (5 minutes) 

    // Fetch fresh data
    const siteSettings = await fetchAndParse(
        SITE_SETTINGS_QUERY,
        {},
        SITE_SETTINGS,
        {
            next: {
                revalidate: 300,
                tags: [SITE_SETTINGS_TAG],
            }
        }
    );

    // Update cache
    siteSettingsCache = siteSettings;
    cacheTimestamp = now;

    return siteSettings ?? { siteName: "", baseUrl: "", socials: [] };
}