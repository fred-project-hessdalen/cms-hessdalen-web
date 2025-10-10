import { SearchCard } from "@/components/SearchCard";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { NEWS_SEARCH_QUERY, NewsList, NewsType } from "@/lib/sanity/query/news.query";
import { PAGE_SEARCH_QUERY, PageList, PageType } from "@/lib/sanity/query/page.query";
import { PEOPLE_SEARCH_QUERY, PeopleList, PeopleType } from "@/lib/sanity/query/people.query";
import { formatDateByLocale } from "@/lib/dateFunctions";


export default async function SearchPage(props: { searchParams: { q?: string } } | { searchParams: Promise<{ q?: string }> }) {
    // Await searchParams if it's a Promise (Next.js dynamic API)
    const rawSearchParams = ("then" in props.searchParams) ? await props.searchParams : props.searchParams;
    const q = rawSearchParams?.q?.trim() ?? "";
    if (!q) return <div className="p-8 text-center text-gray-500">Please enter a search term.</div>;

    const [newsListRaw, pagesListRaw, peopleListRaw] = await Promise.all([
        fetchAndParse(NEWS_SEARCH_QUERY, { q }, NewsList) ?? [],
        fetchAndParse(PAGE_SEARCH_QUERY, { q }, PageList) ?? [],
        fetchAndParse(PEOPLE_SEARCH_QUERY, { q }, PeopleList) ?? [],
    ]);

    return (
        <div className="bg-gray-200 dark:bg-gray-900 w-full">

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6  text-left"><span className="text-blue-600">&quot;{q}&quot;</span></h1>

                <section className="mb-8">
                    {(newsListRaw ?? []).length === 0 ? (
                        <div className="text-gray-400 mb-4 text-left">No news found.</div>
                    ) : (
                        <>
                            <h2 className="text-4xl font-semibold mb-4 text-left">News</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(newsListRaw ?? []).map((news: NewsType) => (
                                    <SearchCard
                                        key={news.slug}
                                        link={`/news/${news.slug}`}
                                        label={`${news.publishedHereDate ? formatDateByLocale(news.publishedHereDate) : " "}`}
                                        title={news.title}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                <section className="mb-8">
                    {(pagesListRaw ?? []).length === 0 ? (
                        <div className="text-gray-400 mb-4 text-left">No pages found.</div>
                    ) : (
                        <>
                            <h2 className="text-4xl font-semibold mb-4 text-left">Pages</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(pagesListRaw ?? []).map((page: PageType) => (
                                    <SearchCard
                                        key={page.path}
                                        link={page.path}
                                        label={`${page.publishedDate ? formatDateByLocale(page.publishedDate) : " "}`}
                                        title={page.title}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                <section className="mb-8">
                    {(peopleListRaw ?? []).length === 0 ? (
                        <div className="text-gray-400 mb-4 text-left">No people found.</div>
                    ) : (
                        <>
                            <h2 className="text-4xl font-semibold mb-4 text-left">People</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(peopleListRaw ?? []).map((people: PeopleType) => (
                                    <SearchCard
                                        key={people.slug}
                                        link={`/people/${people.slug}`}
                                        label={`${people.title}`}
                                        title={people.name}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>


            </div>
        </div>
    );
}
