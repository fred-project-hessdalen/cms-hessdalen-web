import Link from "next/link";
import Image from "next/image";
import type { EventType } from "@/lib/sanity/query/event.query";
import { SimplePortableText } from "./SimplePortableText";
import { formatDateByLocale } from "@/lib/dateFunctions";

export function EventCard({ info, current }: { info: EventType, current?: string }) {
    const isCurrent = current === info.slug;
    
    // Format date and time
    const formatEventDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const dateFormatted = formatDateByLocale(dateString);
        const timeFormatted = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        return `${dateFormatted} at ${timeFormatted}`;
    };

    return (
        <div
            className={`relative rounded-2xl border ${isCurrent
                ? 'border-black dark:border-yellow-300'
                : 'border-gray-300 dark:border-gray-800 hover:border-blue-500 hover:dark:border-blue-400'} bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-4`}
        >
            {!isCurrent && (
                <Link
                    href={`/event/${info.slug}`}
                    aria-label={`Open event: ${info.name}`}
                    className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
            )}
            {/* Event image with 16:9 aspect ratio */}
            {info.image?.asset?.url ? (
                <div className="w-full aspect-[16/9] relative mb-2">
                    <Image
                        src={info.image.asset.url}
                        alt={info.image.alt || info.name}
                        fill
                        className="object-contain rounded-xl"
                        sizes="100vw"
                    />
                </div>
            ) : null}
            {/* Event name */}
            <h3 className="text-lg font-semibold truncate mb-1">{info.name}</h3>
            {/* Summary */}
            {Array.isArray(info.summary) && info.summary.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <SimplePortableText value={info.summary} />
                </div>
            )}
            {/* Event date and venue */}
            <div className="text-xs text-gray-500 mt-2 space-y-1">
                {info.start && (
                    <div className="font-medium">{formatEventDate(info.start)}</div>
                )}
                {info.venue && (
                    <div>
                        📍 {info.venue.name}
                        {info.venue.city && `, ${info.venue.city}`}
                    </div>
                )}
            </div>
        </div>
    );
}
