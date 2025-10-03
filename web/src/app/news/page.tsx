import { NewsCard } from "@/components/NewsCard";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { NEWS_LIST_QUERY, NewsList } from "@/lib/sanity/query/news.query";

export default async function NewsPage() {
    const newsList = await fetchAndParse(
        NEWS_LIST_QUERY,
        {},
        NewsList,
        { next: { revalidate: 60 } }
    );

    return (
        <div>
            <div className="mx-auto px-4 not-prose py-8 bg-gray-100 dark:bg-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {newsList.map((n: any) => (
                        <NewsCard key={n.slug} info={n} />
                    ))}
                </div>
            </div>
        </div>
    );
}
