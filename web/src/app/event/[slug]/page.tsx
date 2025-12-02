import Image from "next/image";
import { fetchAndParse } from "@/lib/sanity/fetch";
import {
    EVENT_BY_SLUG_QUERY,
    EVENT_LIST_QUERY,
    Event,
    EventList,
    type EventType
} from "@/lib/sanity/query/event.query";
import { EventCard } from "@/components/EventCard";
import { AdvancedPortableText } from "@/components/AdvancedPortableText";
import { SimplePortableText } from "@/components/SimplePortableText";
import { formatDateByLocale } from "@/lib/dateFunctions";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const event = await fetchAndParse(EVENT_BY_SLUG_QUERY, { slug }, Event) as EventType | null;
    const eventList = await fetchAndParse(EVENT_LIST_QUERY, {}, EventList);

    // Format date and time
    const formatEventDateTime = (dateString?: string) => {
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
        <div className="bg-gray-100 dark:bg-gray-700 w-full">
            {event ? (
                <div className="w-full">
                    <div className="mx-auto max-w-3xl py-8 flex flex-col items-stretch gap-8 px-4">
                        <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col gap-4 w-full">
                            {/* Event Image */}
                            {event.image?.asset?.url ? (
                                <div className="w-full aspect-[16/9] relative mb-4">
                                    <Image
                                        src={event.image.asset.url}
                                        alt={event.image.alt || event.name}
                                        fill
                                        className="object-contain rounded-xl"
                                        sizes="100vw"
                                    />
                                </div>
                            ) : null}
                            {/* Event Name */}
                            <h1 className="text-3xl font-semibold mb-2">{event.name}</h1>
                            
                            {/* Event Timing */}
                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {event.start && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Start:</span>
                                        <span>{formatEventDateTime(event.start)}</span>
                                    </div>
                                )}
                                {event.end && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">End:</span>
                                        <span>{formatEventDateTime(event.end)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Venue */}
                            {event.venue && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    <span className="font-medium">📍 Venue:</span> {event.venue.name}
                                    {event.venue.address && `, ${event.venue.address}`}
                                    {event.venue.city && `, ${event.venue.city}`}
                                    {event.venue.country && `, ${event.venue.country}`}
                                </div>
                            )}

                            {/* Presenters */}
                            {event.presenters && event.presenters.length > 0 && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    <span className="font-medium">Presenters:</span>
                                    {event.presenters.map((presenter, idx) => (
                                        <span key={idx} className="ml-2">
                                            {presenter.person?.displayName || presenter.person?.name}
                                            {presenter.role?.title ? ` (${presenter.role.title})` : ""}
                                            {idx < event.presenters.length - 1 ? "," : ""}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Tickets Link */}
                            {event.tickets && (
                                <a
                                    href={event.tickets}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors w-fit"
                                >
                                    Get Tickets
                                </a>
                            )}

                            {/* Summary */}
                            {event.summary && event.summary.length > 0 && (
                                <div className="prose text-center text-md text-gray-700 dark:text-gray-200 mb-4">
                                    <SimplePortableText value={event.summary} />
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Details (PortableText) */}
                    {event.details && event.details.length > 0 && (
                        <div className="mx-auto max-w-3xl py-4 items-center text-left prose p-4">
                            <AdvancedPortableText value={event.details} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="mb-8 mx-auto max-w-3xl prose text-left">
                    <h1 className="mt-8">Unknown event {slug}</h1>
                </div>
            )}
            {/* List of other events */}
            <div className="mx-auto px-4 not-prose py-8 bg-gray-100 dark:bg-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(eventList ?? []).map((e: any) => (
                        <EventCard key={e.slug} info={e} current={event?.slug} />
                    ))}
                </div>
            </div>
        </div>
    );
}
