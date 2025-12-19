"use client";
import Image from "next/image";
import Link from "next/link";
import { PageType } from "@/lib/sanity/query/page.query";
import { AdvancedPortableText } from "@/components/AdvancedPortableText";
import { SimplePortableText } from "@/components/SimplePortableText";
import { CategoryList } from "@/components/CategoryList";
import { formatDateByLocale } from "@/lib/dateFunctions";
import React, { useEffect, useRef, useState } from "react";
import { clearStoredAccessKey } from "@/components/AccessKeyHandler";
import { useRouter } from "next/navigation";

interface AccessKeyData {
    key: string;
    name: string;
    email: string;
    expiresAt: string;
    isActive: boolean;
}

interface PageRendererProps {
    page: PageType;
    showTitle?: boolean;
    showMainImage?: boolean;
    showAuthors?: boolean;
    showMetadata?: boolean;
    showSummary?: boolean;
    showBody?: boolean;
    isAuthenticated?: boolean;
    accessKey?: AccessKeyData | null;
}

export function PageRenderer({
    page,
    showTitle = true,
    showMainImage = true,
    showAuthors = true,
    showMetadata = true,
    showSummary = true,
    showBody = true,
    isAuthenticated = false,
    accessKey = null,
}: PageRendererProps) {
    const [showStickyTitle, setShowStickyTitle] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Check if access key is expired
    const isKeyExpired = accessKey ? new Date(accessKey.expiresAt) < new Date() : false;
    const hasValidAccess = isAuthenticated || (accessKey && !isKeyExpired);

    const handleForgetKey = () => {
        clearStoredAccessKey();
        // Remove key from URL and refresh
        const url = new URL(window.location.href);
        url.searchParams.delete("key");
        router.replace(url.pathname + url.search);
    };

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
                                <a
                                    href={page.mainImage.asset.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block hover:opacity-90 transition-opacity"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={page.mainImage.asset.url}
                                        alt={page.mainImage.alt || page.title || "Page image"}
                                        className="max-w-full h-auto rounded-xl"
                                    />
                                </a>
                            </figure>
                        </div>
                    ) : (
                        // Standard and Banner layouts with aspect ratio
                        <div className="mx-auto max-w-6xl py-0 flex flex-col gap-8 px-4">
                            <a
                                href={page.mainImage.asset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block hover:opacity-90 transition-opacity"
                            >
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
                            </a>
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
                                {author.person?.displayName || author.person?.name}{author.role?.title ? ` (${author.role.title})` : ""}
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
                                // Ensure internal links start with / for root-relative paths
                                const href = item.link.startsWith('/') ? item.link : `/${item.link}`;
                                return (
                                    <Link key={idx} href={href} className="font-medium text-blue-600 hover:underline">
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

            {/* Restricted Content - Members Only */}
            {page.restricted && page.restricted.length > 0 && (
                <>
                    {hasValidAccess ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-full px-4 pt-6 pb-8 border-t-4 border-blue-500">
                            <div className="mx-auto max-w-3xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-200 m-0">Member Content
                                                {accessKey && !isAuthenticated && (
                                                    <>
                                                        &nbsp;made available to {accessKey.name} &lt;{accessKey.email}&gt;
                                                    </>
                                                )}
                                            </h2>
                                        </div>
                                    </div>
                                    {accessKey && !isAuthenticated && (
                                        <button
                                            onClick={handleForgetKey}
                                            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-1"
                                            title="Remove access key and hide member content"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <div className="mx-auto max-w-3xl items-center text-left prose">
                                    <AdvancedPortableText value={page.restricted} />
                                </div>
                            </div>
                        </div>
                    ) : accessKey && isKeyExpired ? (
                        <div className="bg-red-50 dark:bg-red-900/20 w-full px-4 py-8 border-t-4 border-red-500">
                            <div className="mx-auto max-w-3xl text-center">
                                <div className="flex flex-col items-center gap-4 p-6 border border-red-300 dark:border-red-600 rounded-lg bg-white dark:bg-gray-900">
                                    <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Access Key Expired</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                            The access key for <strong>{accessKey.name}</strong> expired on {formatDateByLocale(accessKey.expiresAt)}.
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Please contact the site administrator for a new access key or sign in as a member.
                                        </p>
                                        <Link
                                            href="/auth/signin"
                                            className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Sign in as member
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800 w-full px-4 py-8 border-t-4 border-gray-300 dark:border-gray-600">
                            <div className="mx-auto max-w-3xl text-center">
                                <div className="flex flex-col items-center gap-4 p-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Member-Only Content</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            This page has additional content available for members only.
                                        </p>
                                        <Link
                                            href="/auth/signin"
                                            className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Sign in to view
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
