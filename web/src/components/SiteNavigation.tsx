
import { Suspense } from "react";
import { getSiteNavigation } from "@/lib/sanity/getSiteNavigation";
import ClientSiteNavigation from "./ClientSiteNavigation";
import type { MenuItemType } from "@/lib/sanity/query/nav.query";

async function SiteNavigationInner() {
    const { menuItems } = await getSiteNavigation();

    // Normalize + assert to the single canonical type
    const items: MenuItemType[] = (menuItems ?? []) as MenuItemType[];

    return <ClientSiteNavigation menuItems={items} />;
}

export default function SiteNavigation() {
    return (
        <Suspense
            fallback={
                <div className="relative bg-gray-50 px-4 py-1">
                    <nav className="flex justify-center items-center gap-4">
                        <div className="text-xs text-gray-500 font-medium tracking-wide py-2 px-3">
                            Loading navigation...
                        </div>
                    </nav>
                </div>
            }
        >
            {/* Server component that fetches, then renders the client component */}
            <SiteNavigationInner />
        </Suspense>
    );
}
