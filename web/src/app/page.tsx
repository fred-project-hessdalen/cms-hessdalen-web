// src/app/page.tsx
import { NewsCard } from "@/components/NewsCard";
import Link from "next/link";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { LATEST_NEWS_LIST_QUERY, NewsList, NewsType } from "@/lib/sanity/query/news.query";
import type { PortableTextBlock } from "sanity";
import SiteMap from "@/components/SiteMap";

export default async function IndexPage() {
  const newsListRaw = await fetchAndParse(
    LATEST_NEWS_LIST_QUERY,
    {},
    NewsList,
    { next: { revalidate: 60 } }
  );
  const newsList: NewsType[] = (newsListRaw ?? []).map((n) => ({
    ...n,
    summary: n.summary as PortableTextBlock[],
    body: n.body as PortableTextBlock[],
  }));


  return (
    <div>
      <div className="mx-auto px-4 not-prose py-8 bg-gray-100 dark:bg-gray-700">
        <div className="flex items-center justify-between px-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Latest News</h2>
          <Link
            href="/news"
            className="text-blue-600 hover:underline font-medium"
            aria-label="View all news articles"
          >
            All News
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {newsList.map((n: NewsType) => (
            <NewsCard key={n.slug} info={n} />
          ))}
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 w-full">
        <SiteMap />
      </div>

    </div>
  );
}
