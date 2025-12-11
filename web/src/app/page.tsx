// src/app/page.tsx
import { NewsCard } from "@/components/NewsCard";
import Link from "next/link";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { LATEST_NEWS_LIST_QUERY, NewsList, NewsType } from "@/lib/sanity/query/news.query";
import { SITE_SETTINGS_QUERY, SITE_SETTINGS } from "@/lib/sanity/query/site.query";
import { ACTIVE_RECOMMENDATIONS_QUERY, RecommendationList } from "@/lib/sanity/query/recommendation.query";
import type { PageType } from "@/lib/sanity/query/page.query";
import type { PortableTextBlock } from "sanity";
import SiteMap from "@/components/SiteMap";
import { PageRenderer } from "@/components/PageRenderer";
import { PartsGrid } from "@/components/PartsGrid";
import { RecommendationDisplay } from "@/components/RecommendationDisplay";

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

  // Fetch active recommendations
  const recommendations = await fetchAndParse(
    ACTIVE_RECOMMENDATIONS_QUERY,
    {},
    RecommendationList,
    { next: { revalidate: 60 } }
  );

  // Fetch site settings with homepage pages
  const siteSettings = await fetchAndParse(
    SITE_SETTINGS_QUERY,
    {},
    SITE_SETTINGS,
    { next: { revalidate: 60 } }
  );

  // Parse homepage pages
  const homepagePages: PageType[] = (siteSettings?.homepagePages ?? []).map((page: unknown) => {
    const p = page as Record<string, unknown>;
    return {
      ...p,
      summary: p.summary as PortableTextBlock[],
      body: p.body as PortableTextBlock[],
    } as PageType;
  });

  // Parse parts
  const parseParts = (parts: unknown[]) => (parts ?? []).map((part: unknown) => {
    const p = part as Record<string, unknown>;
    return {
      _id: p._id as string,
      name: p.name as string,
      title: p.title as string | undefined,
      description: p.description as PortableTextBlock[],
      image: p.image as { url?: string; alt?: string } | null | undefined,
      aspect: (p.aspect as 'video' | 'portrait' | 'square') || 'video',
      imageURL: p.imageURL as string | undefined,
      buttons: ((p.buttons as unknown[]) ?? []).map((btn: unknown) => {
        const b = btn as Record<string, unknown>;
        return {
          name: b.name as string,
          url: b.url as string,
          style: b.style as 'default' | 'highlight' | 'text-only' | undefined,
        };
      }),
      align: p.align as 'left' | 'center' | 'right' | undefined,
      layout: p.layout as 'plain' | 'framed' | 'featured' | 'card' | undefined,
    };
  });

  const partsOnTopOfPage = parseParts(siteSettings?.partsOnTopOfPage ?? []);
  const partsBeforeSiteMap = parseParts(siteSettings?.partsBeforeSiteMap ?? []);
  const partsOnBottomOfPage = parseParts(siteSettings?.partsOnBottomOfPage ?? []);

  return (
    <div>
      {/* Parts on Top of Page */}
      <PartsGrid parts={partsOnTopOfPage} />

      <div className="mx-auto px-4 not-prose py-8 bg-gray-100 dark:bg-gray-700">
        <div className="flex items-center justify-between px-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Latest News</h2>

          {/* Recommendations */}
          <RecommendationDisplay recommendations={recommendations ?? []} />

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

      {/* Homepage Pages */}
      {homepagePages.length > 0 && (
        <div className="flex flex-col gap-0">
          {homepagePages.map((page) => (
            <div key={page._id}>
              <PageRenderer page={page} />
            </div>
          ))}
        </div>
      )}


      {/* Parts Before SiteMap */}
      <PartsGrid parts={partsBeforeSiteMap} />

      <div className="bg-gray-100 dark:bg-gray-700 w-full">
        <SiteMap />
      </div>

      {/* Parts on Bottom of Page */}
      <PartsGrid parts={partsOnBottomOfPage} />
    </div>
  );
}
