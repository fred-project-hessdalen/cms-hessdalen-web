"use client";

import Image from "next/image";
import Link from "next/link";
import type { PortableTextBlock } from "sanity";
import { SimplePortableText } from "./SimplePortableText";

interface ForumResponse {
    _id: string;
    title: string;
    body: PortableTextBlock[];
    image?: {
        asset: {
            url: string;
        };
    };
    author: {
        _id: string;
        name: string;
        displayName?: string;
        slug: {
            current: string;
        };
        image?: {
            asset: {
                url: string;
            };
        };
    };
    createdAt: string;
    links?: Array<{
        label: string;
        url: string;
    }>;
    replyTo?: {
        _id: string;
        title: string;
    };
}

interface ForumResponsesListProps {
    responses: ForumResponse[];
    onReply: (responseId: string, responseTitle: string) => void;
}

export default function xForumResponsesList({
    responses,
    onReply,
}: ForumResponsesListProps) {
    if (responses.length === 0) {
        return (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No responses yet. Be the first to respond!
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {responses.map((response) => {
                const formattedDate = new Date(response.createdAt).toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                );

                return (
                    <article
                        key={response._id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    >
                        {/* First row: Date & Reply info on left, Author on right */}
                        <div className="flex items-center justify-between mb-3">
                            {/* Left side: User icon, name, and Reply indicator */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {response.author.image?.asset?.url ? (
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                            <Image
                                                src={response.author.image.asset.url}
                                                alt={response.author.displayName || response.author.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                            <span className="text-gray-600 dark:text-gray-300 font-semibold">
                                                {(response.author.displayName || response.author.name).charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <Link
                                        href={`/people/${response.author.slug.current}`}
                                        className="font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm"
                                    >
                                        {response.author.displayName || response.author.name}
                                    </Link>
                                </div>
                                {response.replyTo && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="inline-flex items-center gap-1">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                                />
                                            </svg>
                                            <strong>{response.replyTo.title}</strong>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Right side: Date */}
                            <div className="text-right">
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {formattedDate}
                                </div>
                            </div>
                        </div>

                        {/* Two-column layout: 3/4 content, 1/4 image/links */}
                        <div className="flex flex-col md:flex-row gap-2">
                            {/* Left column: Title and Body (3/4 or full width if no image) */}
                            <div className={`flex-1 ${response.image?.asset?.url ? 'md:w-3/4' : 'md:w-full'}`}>
                                {/* Title */}
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    {response.title}&nbsp;&nbsp;&nbsp;
                                    {/* Reply button */}
                                    <button
                                        onClick={() => onReply(response._id, response.title)}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-normal"
                                    >
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                            />
                                        </svg>
                                        Reply
                                    </button>
                                </h3>

                                {/* Body */}
                                <div className="prose prose-zinc dark:prose-invert max-w-none [&>*:first-child]:mt-0">
                                    <SimplePortableText value={response.body} />
                                </div>

                                {/* Links - Horizontal row */}
                                {response.links && response.links.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {response.links.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                                            >
                                                <span>{link.label}</span>
                                                <svg
                                                    className="w-3 h-3 flex-shrink-0"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                    />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right column: Image (1/4) - only render if image exists */}
                            {response.image?.asset?.url && (
                                <div className="md:w-1/4">
                                    <a
                                        href={response.image.asset.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block relative w-full h-48 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                                    >
                                        <Image
                                            src={response.image.asset.url}
                                            alt={response.title}
                                            fill
                                            className="object-contain object-left-top"
                                        />
                                    </a>
                                </div>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
