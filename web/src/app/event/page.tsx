import { EventCard } from "@/components/EventCard";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { EVENT_LIST_QUERY, EventList } from "@/lib/sanity/query/event.query";

export default async function EventPage() {
    const eventList = await fetchAndParse(
        EVENT_LIST_QUERY,
        {},
        EventList,
        { next: { revalidate: 60 } }
    );

    return (
        <div>
            <div className="mx-auto px-4 not-prose py-8 bg-gray-100 dark:bg-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(eventList ?? []).map((event: any) => (
                        <EventCard key={event.slug} info={event} />
                    ))}
                </div>
            </div>
        </div>
    );
}
