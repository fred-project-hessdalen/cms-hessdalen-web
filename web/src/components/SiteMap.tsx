import Link from "next/link";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { PAGE_ALL_QUERY, PageList, PageType } from "@/lib/sanity/query/page.query";
import { formatDateByLocale } from "@/lib/dateFunctions";
import type { PortableTextBlock } from "sanity";

export default async function SiteMap() {
    const pageListRaw = await fetchAndParse(
        PAGE_ALL_QUERY,
        {},
        PageList,
        { next: { revalidate: 300 } }
    );
    const pageList: PageType[] = (pageListRaw ?? []).map((p) => ({
        ...p,
        summary: p.summary as PortableTextBlock[],
        body: p.body as PortableTextBlock[],
    })).filter((p) => !p.hidden);

    return (
        <div className="mx-auto max-w-4xl p-4 items-center">
            <h3 className="text-left text-2xl font-semibold truncate mb-4">Sitemap</h3>
            <ul className="space-y-2 pb-8">
                {pageList.map((page) => (
                    <li key={page._id} className="flex flex-wrap items-center gap-2 text-base">
                        <Link href={page.path} className="font-mono text-blue-700 dark:text-blue-300 hover:underline">
                            /{page.path}
                        </Link>
                        <span className="text-gray-700 dark:text-gray-300">{page.title}</span>
                        {page.publishedDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateByLocale(page.publishedDate)}</span>
                        )}
                        {page.redirectTo && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {page.redirectTo.includes("://") ? page.redirectTo : `/${page.redirectTo}`}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
