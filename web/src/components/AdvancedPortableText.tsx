import { PortableText, PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "sanity";
import Image from "next/image";
import Link from "next/link";
import type { PTImageBlock, PTImageGalleryBlock, PTImageListBlock, PTPartsListBlock, PTTextColumnsBlock, PTCalloutBlock, PTYouTubeBlock, PTCollapsibleBlock, PTGoogleSlidesBlock, PTGoogleDocumentBlock } from "@/lib/sanity/portableTextTypes";
import { getYouTubeVideoId } from "@/lib/youtubeHelper";
import { CollapsibleSection } from "./CollapsibleSection";
import { PartsGrid } from "./PartsGrid";


const portableTextComponents: PortableTextComponents = {
    types: {
        callout: ({ value }: { value: PTCalloutBlock }) => {
            const { tone = "info", icon, title, content, compact } = value || {};
            const fallbackByTone: Record<string, string> = {
                info: "💡",
                success: "✅",
                warning: "⚠️",
                danger: "❗",
            };
            const glyph = (icon && icon.trim()) || fallbackByTone[tone] || "💡";
            const toneClasses: Record<string, string> = {
                info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-100 dark:text-blue-300",
                success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
                warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
                danger: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-600",
            };

            return (
                <div className={`my-6 border rounded-xl ${toneClasses[tone] || toneClasses.info} ${compact ? "py-4 px-4" : "py-8 px-8"}`}>
                    <div className="flex items-center gap-6">
                        <span className="text-8xl leading-none block flex-shrink-0" aria-hidden="true">
                            {glyph}
                        </span>
                        <div className="grid gap-2 self-center">
                            {title && <div className="text-lg font-semibold">{title}</div>}
                            {content && (
                                <article className="prose prose-zinc dark:prose-invert max-w-none">
                                    <PortableText value={content} />
                                </article>
                            )}
                        </div>
                    </div>
                </div>
            );
        },
        collapsible: ({ value }: { value: PTCollapsibleBlock }) => {
            return (
                <CollapsibleSection
                    header={value?.header || ""}
                    content={value?.content}
                    defaultOpen={value?.defaultOpen}
                />
            );
        },
        imageBlock: ({ value }: { value: PTImageBlock }) => {
            const layout = value?.layout ?? "standard";
            const url = value?.asset?.url ?? null;
            if (!url) return null;

            // Determine dimensions and object position based on layout
            let width = 1600;
            let height = 900; // 16:9 standard
            let objectPosition = "center";

            if (layout === "banner" || layout === "banner-top" || layout === "banner-bottom") {
                width = 1600;
                height = 300; // 16:3 banner
                if (layout === "banner-top") {
                    objectPosition = "top";
                } else if (layout === "banner-bottom") {
                    objectPosition = "bottom";
                } else {
                    objectPosition = "center"; // banner (middle)
                }
            }

            // Original layout - display as is (no aspect ratio constraint, no upscaling)
            if (layout === "original") {
                const align = value?.align ?? "left";
                const width = value?.width ?? "column";

                // Alignment classes
                const alignClasses = {
                    left: "mr-auto",
                    center: "mx-auto",
                    right: "ml-auto",
                };
                const alignClass = alignClasses[align] || alignClasses.left;

                // Width classes (only apply when centered)
                const isCenter = align === "center";
                let containerClass = "";

                if (isCenter) {
                    if (width === "screen") {
                        // Full screen width - break out of prose container
                        containerClass = "relative left-1/2 right-1/2 -mx-[50vw] w-screen";
                    } else if (width === "full") {
                        // Breakout to max-w-screen-2xl
                        containerClass = "relative left-1/2 right-1/2 -mx-[50vw] w-screen";
                    }
                    // width === "column" stays within prose container (no extra class needed)
                }

                const imageElement = (
                    <figure className={`max-w-fit block ${alignClass}`}>
                        <div className="flex flex-col items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={url}
                                alt={value?.alt || "Article image"}
                                className="max-w-full h-auto !mt-0"
                            />
                            {value?.caption && (
                                <figcaption className="-mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">{value.caption}</figcaption>
                            )}
                        </div>
                    </figure>
                );

                // Apply container wrapper if needed!!!
                if (containerClass) {
                    const linkUrl = value?.link || url;

                    const wrappedImage = (
                        <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            {imageElement}
                        </a>
                    );

                    if (width === "full") {
                        // Breakout with max-w-screen-2xl constraint
                        return (
                            <div className={containerClass}>
                                <div className="mx-auto max-w-screen-2xl px-4">
                                    {wrappedImage}
                                </div>
                            </div>
                        );
                    } else {
                        // Screen width - no max-w constraint
                        return (
                            <div className={containerClass}>
                                {wrappedImage}
                            </div>
                        );
                    }
                }

                // Always wrap in link - use custom link if provided, otherwise link to full image
                const linkUrl = value?.link || url;

                return (
                    <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        {imageElement}
                    </a>
                );
            }

            // Standard and Banner layouts with enforced aspect ratio
            const imageElement = (
                <div className="my-4">
                    <figure className="relative overflow-hidden rounded-xl" style={{ aspectRatio: `${width} / ${height}` }}>
                        <Image
                            src={url}
                            alt={value?.alt || "Article image"}
                            width={width}
                            height={height}
                            className="w-full h-full object-cover"
                            style={{ objectPosition }}
                            sizes="(min-width: 1024px) 800px, 100vw"
                        />
                        {value?.caption && (
                            <figcaption className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm px-4 py-2 z-10">
                                {value.caption}
                            </figcaption>
                        )}
                    </figure>
                </div>
            );

            // Always wrap in link - use custom link if provided, otherwise link to full image
            const linkUrl = value?.link || url;

            return (
                <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline hover:opacity-80 transition-opacity cursor-pointer block"

                >
                    {imageElement}
                </a>
            );
        },
        imageGallery: ({ value }: { value: PTImageGalleryBlock }) => {
            const cols = Math.min(Math.max(value?.columns ?? 3, 2), 6);
            const gridColsMap: Record<number, string> = {
                2: "grid grid-cols-1 gap-4 md:grid-cols-2",
                3: "grid grid-cols-1 gap-4 md:grid-cols-3",
                4: "grid grid-cols-2 gap-4 md:grid-cols-4",
                5: "grid grid-cols-2 gap-4 md:grid-cols-5",
                6: "grid grid-cols-2 gap-4 md:grid-cols-6",
            };
            const gridCols = gridColsMap[cols] || gridColsMap[3];

            // Determine aspect ratio (default: video)
            const aspect = value?.aspect || 'video';
            let aspectRatio = '16 / 9'; // video
            if (aspect === 'square') aspectRatio = '1 / 1';
            if (aspect === 'portrait') aspectRatio = '9 / 16';

            return (
                <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gray-200 dark:bg-gray-600 py-12">
                    <div className="mx-auto max-w-screen-2xl px-12">
                        <div className={gridCols}>
                            {value?.images?.map((img, i) => {
                                const url = img?.asset?.url ?? null;
                                if (!url) return null;

                                // Components for PortableText that strips links when inside a linked image
                                const descriptionComponents: PortableTextComponents = img?.link ? {
                                    marks: {
                                        link: ({ children }) => <span>{children}</span>, // Remove link, just show text
                                    },
                                } : {};

                                const imageElement = (
                                    <div className="flex flex-col">
                                        <figure className="overflow-hidden !m-0 !p-0 rounded-lg" style={{ aspectRatio }}>
                                            <Image
                                                src={url}
                                                alt={img?.alt || ""}
                                                width={800}
                                                height={800}
                                                className="w-full h-full object-cover"
                                                sizes="(min-width: 1024px) 400px, 100vw"
                                            />
                                        </figure>
                                        {img?.caption && <div className="mt-1 text-2xl font-semibold text-center text-gray-500 dark:text-gray-500">{img.caption}</div>}
                                        {img?.description && (
                                            <div className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none">
                                                <PortableText value={img.description} components={descriptionComponents} />
                                            </div>
                                        )}
                                        {img?.credit && (
                                            <div className="mt-1 text-xs text-center text-gray-500 dark:text-gray-500 italic">
                                                {img.credit}
                                            </div>
                                        )}

                                    </div>
                                );

                                // If there's a link, wrap in appropriate link element
                                if (img?.link) {
                                    const isExternal = img.link.includes("://");
                                    if (isExternal) {
                                        return (
                                            <a
                                                key={i}
                                                href={img.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="no-underline hover:opacity-80 transition-opacity"
                                            >
                                                {imageElement}
                                            </a>
                                        );
                                    } else {
                                        return (
                                            <Link
                                                key={i}
                                                href={img.link}
                                                className="no-underline hover:opacity-80 transition-opacity"
                                            >
                                                {imageElement}
                                            </Link>
                                        );
                                    }
                                }

                                return <div key={i}>{imageElement}</div>;
                            })}
                        </div>
                    </div>
                </div>
            );
        },
        imageList: ({ value }: { value: PTImageListBlock }) => {
            // Determine background color based on highlight prop
            const bgClass = value?.highlight
                ? "bg-gray-200 dark:bg-gray-700"  // More prominent when highlighted
                : "bg-gray-50 dark:bg-gray-900";   // Subtle when not highlighted

            // Determine aspect ratio for icons (default: square)
            const aspect = value?.aspect || 'square';
            let aspectRatio = '1 / 1'; // square
            if (aspect === 'video') aspectRatio = '16 / 9';
            if (aspect === 'portrait') aspectRatio = '9 / 16';

            return (
                <div className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${bgClass} pt-1 pb-12`}>
                    <div className="mx-auto max-w-screen-xl px-4">
                        {value?.title && (
                            <h3 className="text-2xl font-semibold mb-2">{value.title}</h3>
                        )}
                        {value?.description && (
                            <div className="text-base mb-6 prose prose-zinc dark:prose-invert max-w-none">
                                <PortableText value={value.description} />
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
                            {value?.items?.map((item, i) => {
                                const iconUrl = item?.icon?.url ?? null;
                                if (!iconUrl) return null;

                                const iconElement = (
                                    <Image
                                        src={iconUrl}
                                        alt={item?.title || ""}
                                        width={120}
                                        height={120}
                                        className="w-30 h-30 object-cover rounded"
                                        style={{ aspectRatio }}
                                    />
                                );

                                return (
                                    <div key={i} className="h-full">
                                        <div className="flex flex-col h-full gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                                            <div className="flex gap-4 items-start">
                                                <div className="flex-shrink-0">
                                                    {item?.link ? (
                                                        item.link.includes("://") ? (
                                                            <a
                                                                href={item.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block no-underline hover:opacity-80 transition-opacity"
                                                            >
                                                                {iconElement}
                                                            </a>
                                                        ) : (
                                                            <Link
                                                                href={item.link}
                                                                className="block no-underline hover:opacity-80 transition-opacity"
                                                            >
                                                                {iconElement}
                                                            </Link>
                                                        )
                                                    ) : (
                                                        iconElement
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg">{item.title}</h4>
                                                    {item?.description && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 prose prose-sm dark:prose-invert max-w-none">
                                                            <PortableText value={item.description} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        },
        partsList: ({ value }: { value: PTPartsListBlock }) => {
            // Determine background color based on highlight prop
            const bgClass = value?.highlight
                ? "bg-gray-200 dark:bg-gray-700"  // More prominent when highlighted
                : "bg-gray-50 dark:bg-gray-900";   // Subtle when not highlighted

            // Convert PTPartsListBlock items to PartsGrid format
            const parts = (value?.items ?? []).map((part) => ({
                ...part,
                description: part.description as unknown as PortableTextBlock[],
            }));

            return (
                <div className={`not-prose relative left-1/2 right-1/2 -mx-[50vw] w-screen ${bgClass} pt-4 pb-12`}>
                    {(value?.title || value?.description) && (
                        <div className="mx-auto max-w-screen-xl px-4 mb-8">
                            {value?.title && (
                                <h3 className="text-2xl font-semibold mb-2">{value.title}</h3>
                            )}
                            {value?.description && (
                                <div className="text-base prose prose-zinc dark:prose-invert max-w-none">
                                    <PortableText value={value.description} />
                                </div>
                            )}
                        </div>
                    )}
                    <PartsGrid parts={parts} />
                </div>
            );
        },
        textColumns: ({ value }: { value: PTTextColumnsBlock }) => {
            const count = value?.cols ?? value?.columns ?? 2;
            const mdCols = count === 4 ? "md:columns-4" : count === 3 ? "md:columns-3" : count === 2 ? "md:columns-2" : "md:columns-1";
            const textColumnsComponents: PortableTextComponents = {
                types: {
                    image: ({ value }) => {
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
                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-0 mb-1  md:break-before-column md:first:break-before-auto">{children}</h1>,
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
            return (
                <div className="bg-white dark:bg-black relative left-1/2 -translate-x-1/2 w-screen p-6">
                    <div className={`mx-auto max-w-screen-2xl 
                   columns-1 ${mdCols} gap-x-8
                   [&>*]:break-inside-avoid text-base md:text-[90%]`}>                    <PortableText value={value?.content} components={textColumnsComponents} />
                    </div>
                </div>
            );
        },
        youtubeVideo: ({ value }: { value: PTYouTubeBlock }) => {
            const videoId = getYouTubeVideoId(value?.url || "");
            if (!videoId) {
                return (
                    <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-900 dark:text-red-300">Invalid YouTube URL</p>
                    </div>
                );
            }

            const isShorts = value?.aspectRatio === "9:16";

            const aspectRatios = {
                "16:9": "aspect-video", // 16:9
                "9:16": "aspect-[9/16]", // 9:16 (Shorts/Vertical)
                "4:3": "aspect-[4/3]",  // 4:3
                "21:9": "aspect-[21/9]", // 21:9
            };

            const aspectClass = aspectRatios[value?.aspectRatio || "16:9"] || "aspect-video";

            return (
                <figure className={`my-8 ${isShorts ? 'flex flex-col items-center' : ''}`}>
                    {value?.title && (
                        <figcaption className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {value.title}
                        </figcaption>
                    )}
                    <div className={`relative ${isShorts ? 'w-[280px] h-[500px]' : `w-full ${aspectClass}`} rounded-xl overflow-hidden shadow-lg`}>
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={value?.title || "YouTube video player"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                    </div>
                </figure>
            );
        },
        googleSlidesEmbed: ({ value }: { value: PTGoogleSlidesBlock }) => {
            const embedUrl = value?.embedUrl;
            if (!embedUrl) {
                return (
                    <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-900 dark:text-red-300">Invalid Google Slides URL</p>
                    </div>
                );
            }

            // Convert /pub URL to /embed URL for iframe compatibility
            // Example: .../pub?start=false → .../embed?start=false
            const embedCompatibleUrl = embedUrl.replace('/pub?', '/embed?');

            // Build URL with query parameters, replacing defaults from publish URL
            const url = new URL(embedCompatibleUrl);
            const params = new URLSearchParams(url.search);

            // Replace autoplay parameter (start)
            params.set('start', value?.autoplay ? 'true' : 'false');

            // Replace loop parameter
            params.set('loop', value?.loop ? 'true' : 'false');

            // Replace delay in milliseconds (delaySec * 1000)
            const delaySec = value?.delaySec ?? 3;
            params.set('delayms', String(delaySec * 1000));

            url.search = params.toString();
            const finalUrl = url.toString();

            // Determine aspect ratio based on aspect field
            const aspect = value?.aspect || 'video';
            const aspectRatios = {
                video: "aspect-video",       // 16:9
                landscape: "aspect-[297/210]", // A4 Landscape 29.7:21cm
                portrait: "aspect-[210/297]", // A4 Portrait 21:29.7cm
                square: "aspect-square",     // 1:1
            };
            const aspectClass = aspectRatios[aspect] || aspectRatios.video;

            return (
                <figure className="my-8">
                    {value?.title && (
                        <figcaption className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {value.title}
                        </figcaption>
                    )}
                    <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden shadow-lg`}>
                        <iframe
                            src={finalUrl}
                            title={value?.title || "Google Slides presentation"}
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                    </div>
                </figure>
            );
        },
        googleDocumentEmbed: ({ value }: { value: PTGoogleDocumentBlock }) => {
            const embedUrl = value?.embedUrl;
            if (!embedUrl) {
                return (
                    <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-900 dark:text-red-300">Invalid Google Docs URL</p>
                    </div>
                );
            }

            // Extract document ID from URL
            // URL format: https://docs.google.com/document/d/[ID]/edit
            const docIdMatch = embedUrl.match(/\/document\/d\/([^/]+)/);
            if (!docIdMatch) {
                return (
                    <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-900 dark:text-red-300">Could not extract document ID from URL</p>
                    </div>
                );
            }

            const docId = docIdMatch[1];
            // Build embed URL: https://docs.google.com/document/d/[ID]/preview
            const embedCompatibleUrl = `https://docs.google.com/document/d/${docId}/preview`;

            // Determine aspect ratio based on aspect field
            const aspect = value?.aspect || 'portrait';
            const aspectRatios = {
                landscape: "aspect-[297/210]",   // Narrow (A4 Landscape)
                square: "aspect-square",         // Square (1:1)
                portrait: "aspect-[210/297]",    // Tall (A4 Portrait)
            };
            const aspectClass = aspectRatios[aspect] || aspectRatios.portrait;

            return (
                <figure className="my-8">
                    {value?.title && (
                        <figcaption className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {value.title}
                        </figcaption>
                    )}
                    <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden shadow-lg`}>
                        <iframe
                            src={embedCompatibleUrl}
                            title={value?.title || "Google Document"}
                            className="absolute top-0 left-0 w-full h-full"
                        />
                    </div>
                </figure>
            );
        },
    },
};

export function AdvancedPortableText({ value }: { value: PortableTextBlock[] }) {
    return (
        <article className="mt-8 prose prose-zinc dark:prose-invert max-w-none">
            <PortableText value={value} components={portableTextComponents} />
        </article>
    )
}
