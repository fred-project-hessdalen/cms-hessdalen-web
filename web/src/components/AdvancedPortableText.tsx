import { PortableText, PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "sanity";
import Image from "next/image";
import Link from "next/link";
import type { PTImageBlock, PTImageGalleryBlock, PTTextColumnsBlock, PTCalloutBlock, PTYouTubeBlock, PTCollapsibleBlock } from "@/lib/sanity/portableTextTypes";
import { getYouTubeVideoId } from "@/lib/youtubeHelper";
import { CollapsibleSection } from "./CollapsibleSection";


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
                const imageElement = (
                    <figure className="max-w-fit inline-block align-top mr-4">
                        <div className="flex flex-col items-center">
                            <img
                                src={url}
                                alt={value?.alt || "Article image"}
                                className="max-w-full h-auto p-0 m-0"
                            />
                            {value?.caption && (
                                <figcaption className="-mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">{value.caption}</figcaption>
                            )}
                        </div>
                    </figure>
                );

                // Wrap in link if provided
                if (value?.link) {
                    const isExternal = value.link.includes("://");
                    if (isExternal) {
                        return (
                            <a
                                href={value.link}
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
                                href={value.link}
                                className="no-underline hover:opacity-80 transition-opacity"
                            >
                                {imageElement}
                            </Link>
                        );
                    }
                }

                return imageElement;
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

            // Wrap in link if provided
            if (value?.link) {
                const isExternal = value.link.includes("://");
                if (isExternal) {
                    return (
                        <a
                            href={value.link}
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
                            href={value.link}
                            className="no-underline hover:opacity-80 transition-opacity"
                        >
                            {imageElement}
                        </Link>
                    );
                }
            }

            return imageElement;
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
            return (
                <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gray-200 dark:bg-gray-600 py-12">
                    <div className="mx-auto max-w-screen-2xl px-12">
                        <div className={gridCols}>
                            {value?.images?.map((img, i) => {
                                const url = img?.asset?.url ?? null;
                                if (!url) return null;

                                const imageElement = (
                                    <div className="flex flex-col">
                                        <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                                            <Image
                                                src={url}
                                                alt={img?.alt || ""}
                                                fill
                                                className="object-contain"
                                                sizes="(min-width: 1024px) 400px, 100vw"
                                            />
                                        </div>
                                        {img?.caption && <div className="mt-1 text-lg font-semibold text-center text-gray-500 dark:text-gray-500">{img.caption}</div>}
                                        {img?.description && (
                                            <div className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none">
                                                <PortableText value={img.description} />
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
                            <figure className="my-4 w-full">
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
                    h1: ({ children }) => <h1 className="text-3xl font-bold mt-0 mb-2  md:break-before-column md:first:break-before-auto">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-semibold mt-0 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-semibold mt-0 mb-2">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-lg font-semibold mt-0 mb-2">{children}</h4>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 pl-4 italic text-gray-600 dark:text-gray-300 my-4">{children}</blockquote>,
                    normal: ({ children }) => <div className="mb-4">{children}</div>,
                },
                marks: {
                    code: ({ children }) => (
                        <div className="border border-gray-300 dark:border-gray-600 rounded p-4 inline-block">
                            <code className=" text-red-400 dark:text-blue-300 rounded px-1 py-0.5 text-sm font-mono">{children}</code>
                        </div>
                    ),
                },
                list: {
                    bullet: ({ children }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
                    number: ({ children }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
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

            const aspectRatios = {
                "16:9": "aspect-video", // 16:9
                "4:3": "aspect-[4/3]",  // 4:3
                "21:9": "aspect-[21/9]", // 21:9
            };

            const aspectClass = aspectRatios[value?.aspectRatio || "16:9"] || "aspect-video";

            return (
                <figure className="my-8">
                    {value?.title && (
                        <figcaption className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {value.title}
                        </figcaption>
                    )}
                    <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden shadow-lg`}>
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
    },
};

export function AdvancedPortableText({ value }: { value: PortableTextBlock[] }) {
    return (
        <article className="mt-8 prose prose-zinc dark:prose-invert max-w-none">
            <PortableText value={value} components={portableTextComponents} />
        </article>
    )
}
