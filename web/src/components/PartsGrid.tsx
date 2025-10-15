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
    aspect: 'video' | 'square';
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

    return (
        <div className="w-full px-4 py-4">
            <div className="mx-auto max-w-6xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
                    {parts.map((part) => (
                        <Part key={part._id} part={part} />
                    ))}
                </div>
            </div>
        </div>
    );
}
