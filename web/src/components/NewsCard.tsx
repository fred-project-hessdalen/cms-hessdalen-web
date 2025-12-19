import Link from "next/link";
import Image from "next/image";
import type { NewsType } from "@/lib/sanity/query/news.query";
import { SimplePortableText } from "./SimplePortableText";
import { formatDateByLocale } from "@/lib/dateFunctions";

export function NewsCard({ info, current }: { info: NewsType, current?: string }) {
    const isCurrent = current === info.slug;
    return (
        <div
            className={`relative rounded-2xl border ${isCurrent
                ? 'border-black dark:border-yellow-300'
                : 'border-gray-300 dark:border-gray-800 hover:border-blue-500 hover:dark:border-blue-400'} bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-4`}
        >
            {!isCurrent && (
                <Link
                    href={`/news/${info.slug}`}
                    aria-label={`Open news article: ${info.title}`}
                    className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
            )}
            {/* Main image with 16:9 aspect ratio */}
            {info.mainImage?.asset?.url ? (
                <a
                    href={info.mainImage.asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-90 transition-opacity"
                >
                    <div className="w-full aspect-[16/9] relative mb-2">
                        <Image
                            src={info.mainImage.asset.url}
                            alt={info.mainImage.alt || info.title}
                            fill
                            className="object-cover rounded-xl"
                            sizes="100vw"
                        />
                    </div>
                </a>
            ) : null}
            {/* Title */}
            <h3 className="text-lg font-semibold truncate mb-1">{info.title}</h3>
            {/* Summary (first block only) */}
            {Array.isArray(info.summary) && info.summary.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {/* {info.summary[0]?.children?.[0]?.text} */}
                    {/* <div className="mx-auto max-w-3xl py-4 items-center text-left prose p-4"> */}
                    <SimplePortableText value={info.summary} />
                    {/* </div> */}
                </div>
            )}
            {/* Published date */}
            {info.publishedHereDate && (
                <span className="text-xs text-gray-500 mt-2">
                    {formatDateByLocale(info.publishedHereDate)}
                </span>
            )}
        </div>
    );
}
