// src/lib/sanity/getNews.ts
import { fetchAndParse } from "@/lib/sanity/fetch";
import {
    NEWS_LIST_QUERY,
    NewsList,
    type NewsListType
} from "@/lib/sanity/query/news.query";
import type { PortableTextBlock } from "sanity";

let newsCache: NewsListType | null = null;
let newsCacheTimestamp = 0;
const NEWS_CACHE_DURATION = 60_000; // 1 minute in ms

export async function getNews(): Promise<NewsListType> {
    const now = Date.now();
    if (newsCache && now - newsCacheTimestamp < NEWS_CACHE_DURATION) return newsCache;

    const rawNews = await fetchAndParse(
        NEWS_LIST_QUERY,
        {},
        NewsList,
        { next: { revalidate: 60 } }
    );

    // Cast summary and body to PortableTextBlock[] for each item
    const news: NewsListType = rawNews.map((item: any) => ({
        ...item,
        summary: item.summary as PortableTextBlock[],
        body: item.body as PortableTextBlock[],
    }));

    newsCache = news;
    newsCacheTimestamp = now;
    return news;
}
