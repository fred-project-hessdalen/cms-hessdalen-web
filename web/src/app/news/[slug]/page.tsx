import Image from "next/image";
import { fetchAndParse } from "@/lib/sanity/fetch";
import {
    NEWS_BY_SLUG_QUERY,
    NEWS_LIST_QUERY,
    News,
    NewsList,
    type NewsType
} from "@/lib/sanity/query/news.query";
import { NewsCard } from "@/components/NewsCard";
import { AdvancedPortableText } from "@/components/AdvancedPortableText";
import { SimplePortableText } from "@/components/SimplePortableText";
import { CategoryList } from "@/components/CategoryList";
import { formatDateByLocale } from "@/lib/dateFunctions";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const news = await fetchAndParse(NEWS_BY_SLUG_QUERY, { slug }, News) as NewsType | null;
    const newsList = await fetchAndParse(NEWS_LIST_QUERY, {}, NewsList);

    return (
        <div className="bg-gray-100 dark:bg-gray-700 w-full">
            {news ? (
                <div className="w-full">
                    <div className="mx-auto max-w-3xl py-8 flex flex-col items-stretch gap-8 px-4">
                        <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col gap-4 w-full">
                            {/* Main Image */}
                            {news.mainImage?.asset?.url ? (
                                <div className="w-full aspect-[16/9] relative mb-4">
                                    <Image
                                        src={news.mainImage.asset.url}
                                        alt={news.mainImage.alt || news.title}
                                        fill
                                        className="object-cover rounded-xl"
                                        sizes="100vw"
                                    />
                                </div>
                            ) : null}
                            {/* Title */}
                            <h1 className="text-3xl font-semibold mb-2">{news.title}</h1>
                            {/* Authors */}
                            {news.authors && news.authors.length > 0 && (
                                <div className="text-sm text-gray-600 mb-2">
                                    By {news.authors.map((author, idx) => (
                                        <span key={idx} className="mr-2">
                                            {author.person?.name}{author.role?.title ? ` (${author.role.title})` : ""}
                                            {idx < news.authors.length - 1 ? "," : ""}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {/* Dates */}
                            <div className="text-xs text-gray-500 mb-2">
                                {news.publishedHereDate && (
                                    <span>Published: {formatDateByLocale(news.publishedHereDate)}</span>
                                )}
                                {news.originalPublishedDate && (
                                    <span className="ml-4">Original: {formatDateByLocale(news.originalPublishedDate)}</span>
                                )}
                                {news.originCountry && (
                                    <span className="ml-4">Country: {news.originCountry}</span>
                                )}
                            </div>

                            {/* Original Article Link */}
                            {news.originalArticleUrl && (
                                <a
                                    href={news.originalArticleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm mb-2"
                                >
                                    Read original article
                                </a>
                            )}
                            {/* Summary */}
                            {news.summary && news.summary.length > 0 && (
                                <div className="prose text-center text-md text-gray-700 dark:text-gray-200 mb-4">
                                    <SimplePortableText value={news.summary} />
                                </div>
                            )}
                            {/* Categories & Country */}
                            <div className="flex justify-center mb-2">
                                {news.categories && news.categories.length > 0 && (
                                    <CategoryList categories={news.categories} />
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Body (PortableText) */}
                    {news.body && news.body.length > 0 && (
                        <div className="mx-auto max-w-3xl py-4 items-center text-left prose p-4">
                            <AdvancedPortableText value={news.body} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="mb-8 mx-auto max-w-3xl prose text-left" >
                    <h1 className="mt-8">Unknown news article {slug}</h1>
                </div>
            )}
            {/* List of other news articles */}
            <div className="mx-auto px-4 not-prose py-8 bg-gray-100 dark:bg-gray-700 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(newsList ?? []).map((n: any) => (
                        <NewsCard key={n.slug} info={n} current={news?.slug} />
                    ))}
                </div>
            </div>
        </div>
    );
}
