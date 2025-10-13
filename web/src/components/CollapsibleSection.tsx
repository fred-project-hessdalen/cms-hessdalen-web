'use client';

import { useState } from "react";
import { PortableText } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";

interface CollapsibleSectionProps {
    header: string;
    content?: PortableTextBlock[];
    defaultOpen?: boolean;
}

export function CollapsibleSection({ header, content, defaultOpen = false }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="my-6 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-expanded={isOpen}
            >
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {header}
                </span>
                <svg
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && content && (
                <div className="px-6 py-4 prose prose-zinc dark:prose-invert max-w-none">
                    <PortableText value={content} />
                </div>
            )}
        </div>
    );
}
