import Image from "next/image";
import Link from "next/link";
import { SimplePortableText } from "./SimplePortableText";
import type { PortableTextBlock } from "sanity";

export interface PartProps {
    part: {
        _id: string;
        name: string;
        title?: string;
        description: PortableTextBlock[];
        image?: {
            url?: string;
            alt?: string;
        } | null;
        aspect: 'video' | 'portrait' | 'square';
        imageURL?: string;
        buttons: Array<{
            name: string;
            url: string;
            style?: 'default' | 'highlight' | 'text-only';
        }>;
        align?: 'left' | 'center' | 'right';
        layout?: 'plain' | 'framed' | 'featured' | 'card';
    };
}

export function Part({ part }: PartProps) {
    const alignClass = {
        left: 'text-left items-start',
        center: 'text-center items-center',
        right: 'text-right items-end',
    }[part.align || 'center'];

    const layoutClass = {
        plain: 'bg-transparent',
        framed: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3',
        featured: 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4',
        card: 'bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3',
    }[part.layout || 'plain'];

    const aspectClass = {
        video: 'aspect-video',
        portrait: 'aspect-[9/16]',
        square: 'aspect-square',
    }[part.aspect || 'video'];

    const getButtonClass = (style?: string) => {
        switch (style) {
            case 'highlight':
                return 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors';
            case 'text-only':
                return 'text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold';
            default:
                return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded text-sm font-semibold transition-colors';
        }
    };

    const imageContent = part.image?.url ? (
        <a
            href={part.image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity"
        >
            <div className={`w-full ${aspectClass} relative overflow-hidden rounded-lg mb-2`}>
                <Image
                    src={part.image.url}
                    alt={part.image.alt || part.title || part.name}
                    fill
                    className="object-cover absolute inset-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
            </div>
        </a>
    ) : null;

    return (
        <div className={`w-full h-full ${layoutClass}`}>
            <div className={`flex flex-col gap-2 ${alignClass}`}>
                {/* Image */}
                {imageContent}

                {/* Title */}
                {part.title && (
                    <h2 className="!p-0 !m-0 text-lg font-bold text-gray-900 dark:text-gray-100">
                        {part.title}
                    </h2>
                )}

                {/* Description */}
                {part.description && part.description.length > 0 && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <SimplePortableText value={part.description} />
                    </div>
                )}

                {/* Buttons */}
                {part.buttons && part.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {part.buttons.map((button, idx) => {
                            const isExternal = button.url.includes("://");
                            if (isExternal) {
                                return (
                                    <a
                                        key={idx}
                                        href={button.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={getButtonClass(button.style)}
                                    >
                                        {button.name}
                                    </a>
                                );
                            } else {
                                return (
                                    <Link
                                        key={idx}
                                        href={button.url}
                                        className={getButtonClass(button.style)}
                                    >
                                        {button.name}
                                    </Link>
                                );
                            }
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
