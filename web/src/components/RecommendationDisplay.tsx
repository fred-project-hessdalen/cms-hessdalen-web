"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { RecommendationType } from "@/lib/sanity/query/recommendation.query";
import Tooltip from "./Tooltip";

interface RecommendationDisplayProps {
    recommendations: RecommendationType[];
}

export function RecommendationDisplay({ recommendations }: RecommendationDisplayProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const hasMultiple = recommendations.length > 1;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % recommendations.length);
    };

    // Auto-rotate every 10 seconds if there are multiple recommendations
    useEffect(() => {
        if (!hasMultiple) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % recommendations.length);
        }, 15000);

        return () => clearInterval(interval);
    }, [hasMultiple, recommendations.length]);

    // Don't render if no recommendations
    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    const current = recommendations[currentIndex];

    // Check if link is external
    const isExternalLink = current.link?.includes("://");

    return (
        <div className="mx-auto">
            <div className="max-w-6xl mx-auto flex items-center gap-4">
                {/* Left: Person Avatar */}
                <div
                    key={`avatar-${currentIndex}`}
                    className="flex-shrink-0 animate-fadeIn"
                >
                    {current.person?.image?.asset?.url ? (
                        <div className="w-10 h-10 relative rounded-full overflow-hidden  border-2 border-gray-300 dark:border-gray-600">
                            <Image
                                src={current.person.image.asset.url}
                                alt={current.person.displayName || current.person.name || "Person"}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Center: Recommendation Title/Link */}
                <div
                    key={`content-${currentIndex}`}
                    className="flex-1 min-w-0 animate-fadeIn"
                >
                    {current.link ? (
                        isExternalLink ? (
                            <a
                                href={current.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                            >
                                <span className="truncate">{current.title}</span>
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        ) : (
                            <a
                                href={current.link}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                                {current.title}
                            </a>
                        )
                    ) : (
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{current.title}</span>
                    )}

                </div>

                {/* Right: Next Button (only if multiple recommendations) */}
                {hasMultiple && (
                    <div className="flex-shrink-0">
                        <button
                            onClick={handleNext}
                            className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 flex items-center justify-center transition-colors"
                            aria-label="Next recommendation"
                            title="Next recommendation"
                        >
                            <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
