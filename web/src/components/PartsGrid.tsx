import { Part } from "@/components/Part";
import type { PortableTextBlock } from "sanity";

interface PartType {
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
}

interface PartsGridProps {
    parts: PartType[];
}

export function PartsGrid({ parts }: PartsGridProps) {
    if (!parts || parts.length === 0) return null;

    const getGridClasses = (count: number) => {
        if (count === 1) {
            return "grid grid-cols-1 gap-4 auto-rows-fr justify-items-center max-w-md mx-auto";
        } else if (count === 2) {
            return "grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr justify-items-center max-w-2xl mx-auto";
        } else if (count === 3) {
            return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr justify-items-center max-w-4xl mx-auto";
        } else {
            return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr";
        }
    };

    return (
        <div className="w-full px-4 py-4">
            <div className="mx-auto max-w-6xl">
                <div className={getGridClasses(parts.length)}>
                    {parts.map((part) => (
                        <Part key={part._id} part={part} />
                    ))}
                </div>
            </div>
        </div>
    );
}
