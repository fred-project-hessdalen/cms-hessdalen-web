import { PortableText, PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "sanity";
import Image from "next/image";
import type { PTImageBlock, PTImageGalleryBlock, PTTextColumnsBlock, PTCalloutBlock } from "@/lib/sanity/portableTextTypes";


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
        image: ({ value }: { value: PTImageBlock }) => {
            const layout = value?.layout ?? "standard";
            const width = 1600;
            const height = layout === "banner" ? 300 : 900;
            const url = value?.asset?.url ?? null
            if (!url) return null;
            return (
                <figure className="my-6">
                    <Image
                        src={url}
                        alt={value?.alt || "Article image"}
                        width={width}
                        height={height}
                        className="w-full h-auto rounded-xl object-cover"
                        sizes="(min-width: 1024px) 800px, 100vw"
                    />
                    {value?.caption && (
                        <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400">{value.caption}</figcaption>
                    )}
                </figure>
            );
        },
        imageGallery: ({ value }: { value: PTImageGalleryBlock }) => {
            const cols = Math.min(Math.max(value?.columns ?? 3, 2), 3);
            const gridCols = cols === 3 ? "grid grid-cols-1 gap-8 md:grid-cols-3" : "grid grid-cols-1 gap-8 md:grid-cols-2";
            return (
                <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gray-200 dark:bg-gray-600">
                    <div className="mx-auto max-w-screen-2xl px-12 my-12">                    <div className={`grid gap-3 ${gridCols}`}>
                        {value?.images?.map((img: {
                            asset: { url: string };
                            alt?: string;
                            caption?: string;
                        }, i: number) => {
                            const url = img?.asset?.url ?? null;
                            if (!url) return null;
                            return (
                                <figure key={i} className="aspect-square flex flex-col justify-between">
                                    <div className="relative w-full aspect-square">
                                        <Image
                                            src={url}
                                            alt={img?.alt || ""}
                                            fill
                                            className="object-contain rounded-lg"
                                            sizes="(min-width: 1024px) 400px, 100vw"
                                        />
                                    </div>
                                    {img?.caption && (
                                        <figcaption className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">{img.caption}</figcaption>
                                    )}
                                </figure>
                            );
                        })}
                    </div>
                    </div>
                </div>
            );
        },
        textColumns: ({ value }: { value: PTTextColumnsBlock }) => {
            const count = Math.min(Math.max(value?.cols ?? value?.columns ?? 2, 1), 3);
            const mdCols = count === 3 ? "md:columns-3" : count === 2 ? "md:columns-2" : "md:columns-1";
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
    },
};

export function AdvancedPortableText({ value }: { value: PortableTextBlock[] }) {
    return (
        <article className="mt-8 prose prose-zinc dark:prose-invert max-w-none">
            <PortableText value={value} components={portableTextComponents} />
        </article>
    )
}
