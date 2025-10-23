"use client";
import Image from "next/image";
import Link from "next/link";
import { PageType } from "@/lib/sanity/query/page.query";
import { AdvancedPortableText } from "@/components/AdvancedPortableText";
import { SimplePortableText } from "@/components/SimplePortableText";
import { CategoryList } from "@/components/CategoryList";
import { formatDateByLocale } from "@/lib/dateFunctions";
import React, { useEffect, useRef, useState } from "react";

interface PageRendererProps {
    page: PageType;
    showTitle?: boolean;
    showMainImage?: boolean;
    showAuthors?: boolean;
    showMetadata?: boolean;
    showSummary?: boolean;
    showBody?: boolean;
}

export function PageRenderer({
    page,
    showTitle = true,
    showMainImage = true,
    showAuthors = true,
    showMetadata = true,
    showSummary = true,
    showBody = true,
}: PageRendererProps) {
    const [showStickyTitle, setShowStickyTitle] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new window.IntersectionObserver(
            ([entry]) => {
                setShowStickyTitle(!entry.isIntersecting);
            },
            { threshold: 0 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-900 w-full">
            {/* Main Image */}
            {showMainImage && page.mainImage?.asset?.url && (
                <>
                    {page.mainImage.layout === 'original' ? (
                        // Original layout - display as is (no aspect ratio constraint)
                        <div className="mx-auto max-w-6xl py-0 flex flex-col gap-8 px-4">
                            <figure className="max-w-fit mx-auto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={page.mainImage.asset.url}
                                    alt={page.mainImage.alt || page.title || "Page image"}
                                    className="max-w-full h-auto rounded-xl"
                                />
                            </figure>
                        </div>
                    ) : (
                        // Standard and Banner layouts with aspect ratio
                        <div className="mx-auto max-w-6xl py-0 flex flex-col gap-8 px-4">
                            <div
                                className={`w-full ${page.mainImage.layout === 'banner' ||
                                    page.mainImage.layout === 'banner-top' ||
                                    page.mainImage.layout === 'banner-bottom'
                                    ? 'aspect-[16/3]'
                                    : 'aspect-[16/9]'
                                    } relative mb-4 overflow-hidden rounded-b-xl`}
                            >
                                <Image
                                    src={page.mainImage.asset.url}
                                    alt={page.mainImage.alt || page.title || "Page image"}
                                    fill
                                    className="object-cover"
                                    style={{
                                        objectPosition:
                                            page.mainImage.layout === 'banner-top'
                                                ? 'top'
                                                : page.mainImage.layout === 'banner-bottom'
                                                    ? 'bottom'
                                                    : 'center',
                                    }}
                                    sizes="100vw"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}


            {/* Header Section */}
            <div className="mx-auto max-w-3xl py-0 flex flex-col gap-1 px-4 text-center">
                {/* Title */}
                {showTitle && page.title && (
                    <h1 className="text-5xl font-semibold mt-6 mb-6">{page.title}</h1>
                )}

                {/* Authors */}
                {showAuthors && page.authors && page.authors.length > 0 && (
                    <div className="text-sm text-gray-600 mb-1">
                        By {page.authors.map((author, idx) => (
                            <span key={idx} className="mr-2">
                                {author.person?.name}{author.role?.title ? ` (${author.role.title})` : ""}
                                {idx < page.authors.length - 1 ? "," : ""}
                            </span>
                        ))}
                    </div>
                )}

                {/* Dates */}
                {showMetadata && (page.publishedDate || page.originCountry) && (
                    <div className="text-xs text-gray-500 mb-1">
                        {page.publishedDate && (
                            <span>Published: {formatDateByLocale(page.publishedDate)}</span>
                        )}
                        {page.originCountry && (
                            <span className="ml-4">Country: {page.originCountry}</span>
                        )}
                    </div>
                )}

                {/* Summary */}
                {showSummary && page.summary && page.summary.length > 0 && (
                    <div className="prose text-md text-gray-700 dark:text-gray-200 mb-2 mx-auto">
                        <SimplePortableText value={page.summary} />
                    </div>
                )}

                {/* Categories */}
                {showMetadata && page.categories?.length > 0 && (
                    <div className="flex justify-center mb-2">
                        <CategoryList categories={page.categories} />
                    </div>
                )}
            </div>

            {/* Sentinel for sticky menu */}
            <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
            {/* Sticky Menu Section (title always, menu only if present) */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                {showStickyTitle && (
                    <div className="w-full bg-gray-100 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
                        <div className="max-w-3xl mx-auto px-4 py-1 text-center">
                            <span className="truncate block font-semibold text-blue-900 dark:text-blue-200 text-sm">
                                {page.title}
                            </span>
                        </div>
                    </div>
                )}
                {page.menu && page.menu.length > 0 && (
                    <nav className="mx-auto flex flex-wrap justify-center gap-4 ">
                        {page.menu.map((item, idx) => {
                            if (!item.link) {
                                return (
                                    <span key={idx} className="font-bold text-blue-900 dark:text-blue-200">
                                        {item.name}
                                    </span>
                                );
                            } else if (item.link.includes('://')) {
                                return (
                                    <a
                                        key={idx}
                                        href={item.link}
                                        className="font-medium text-blue-600 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="flex items-center gap-1">
                                            {item.name}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </span>
                                    </a>
                                );
                            } else {
                                return (
                                    <Link key={idx} href={item.link} className="font-medium text-blue-600 hover:underline">
                                        {item.name}
                                    </Link>
                                );
                            }
                        })}
                    </nav>
                )}
            </div>


            {/* Body Content */}
            {showBody && page.body && page.body.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-700 w-full px-4 pt-2 pb-8">
                    <div className="mx-auto max-w-3xl items-center text-left prose">
                        <AdvancedPortableText value={page.body} />
                    </div>
                </div>
            )}
        </div>
    );
}
