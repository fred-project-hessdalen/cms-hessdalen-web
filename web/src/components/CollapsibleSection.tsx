'use client';

import { useState, type ReactNode } from "react";
import { PortableText, PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";


interface CollapsibleSectionProps {
    header: string;
    content?: PortableTextBlock[];
    children?: ReactNode;
    defaultOpen?: boolean;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

const portableTextComponents: PortableTextComponents = {
    types: {
        imageBlock: ({ value }) => {
            const url = value?.asset?.url;
            if (!url) return null;
            // Use same dimensions as main image block
            const width = 1600;
            const height = 900;
            return (
                <figure className="!my-0 w-full">
                    <Image
                        src={url}
                        alt={value?.alt || "Article image"}
                        width={width}
                        height={height}
                        className="w-full h-auto rounded-xl object-cover"
                        sizes="(min-width: 1024px) 800px, 100vw"
                    />
                    {value?.caption && (
                        <figcaption className="mt-1 text-xs text-gray-500 dark:text-gray-400">{value.caption}</figcaption>
                    )}
                </figure>
            );
        },
    },
    block: {
        h1: ({ children }) => <h1 className="text-2xl font-bold mt-0 mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mt-0 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold mt-0 mb-1">{children}</h3>,
        h4: ({ children }) => <h4 className="text-lg font-semibold mt-0 mb-1">{children}</h4>,
        blockquote: ({ children }) => <blockquote className="border-l-4 pl-4 italic text-gray-600 dark:text-gray-300 my-4">{children}</blockquote>,
        normal: ({ children }) => <div className="my-2">{children}</div>,
    },
    marks: {
        code: ({ children }) => (
            <div className="border border-gray-300 dark:border-gray-600 rounded p-4 inline-block">
                <code className=" text-red-400 dark:text-blue-300 rounded px-1 py-0.5 text-sm font-mono">{children}</code>
            </div>
        ),
    },
    list: {
        bullet: ({ children }) => <ul className="list-disc ml-6 mb-2">{children}</ul>,
        number: ({ children }) => <ol className="list-decimal ml-6 mb-2">{children}</ol>,
    },
    listItem: {
        bullet: ({ children }) => <li className="mb-1">{children}</li>,
        number: ({ children }) => <li className="mb-1">{children}</li>,
    },
};

export function CollapsibleSection({
    header,
    content,
    children,
    defaultOpen = false,
    isOpen: controlledIsOpen,
    onToggle
}: CollapsibleSectionProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

    // Use controlled state if provided, otherwise use internal state
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

    const handleToggle = () => {
        const newState = !isOpen;
        if (onToggle) {
            onToggle(newState);
        } else {
            setInternalIsOpen(newState);
        }
    };

    return (
        <div className="mb-8 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
                onClick={handleToggle}
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
            {isOpen && (
                <div className="px-6 py-4 prose prose-zinc dark:prose-invert max-w-none">
                    {content && <PortableText value={content} components={portableTextComponents} />}
                    {children}
                </div>
            )}
        </div>
    );
}
