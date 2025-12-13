import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";

type BusinessCardBlockProps = {
    cardPage: {
        title: string;
        path: string;
        mainImage?: {
            asset?: { url?: string };
            alt?: string;
        };
        summary?: any[];
    };
    layout?: "horizontal" | "vertical";
};

export function BusinessCardBlock({ cardPage, layout = "horizontal" }: BusinessCardBlockProps) {
    if (!cardPage) return null;

    const isHorizontal = layout === "horizontal";

    return (
        <Link href={`/${cardPage.path}`} className="no-underline">
            <div className={`my-6 p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-md hover:shadow-lg ${isHorizontal ? 'flex gap-6 items-center' : 'flex flex-col items-center text-center'}`}>
                {/* Image */}
                {cardPage.mainImage?.asset?.url && (
                    <div className={`flex-shrink-0 ${isHorizontal ? 'w-32 h-32' : 'w-48 h-48'}`}>
                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <Image
                                src={cardPage.mainImage.asset.url}
                                alt={cardPage.mainImage.alt || cardPage.title}
                                fill
                                className="object-cover"
                                sizes="200px"
                            />
                        </div>
                    </div>
                )}
                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        {cardPage.title}
                    </h3>
                    {cardPage.summary && cardPage.summary.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none">
                            <PortableText value={cardPage.summary} />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
