import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchAndParse } from "@/lib/sanity/fetch";
import { PAGE_BY_PATH_QUERY, Page, type PageType } from "@/lib/sanity/query/page.query";
import { AdvancedPortableText } from "@/components/AdvancedPortableText";
import { SimplePortableText } from "@/components/SimplePortableText";

export default async function CatchAllPage({ params }: { params: { slug?: string[] } }) {
    const path = (params.slug ?? []).join("/");
    if (!path) return notFound();

    const doc = await fetchAndParse(PAGE_BY_PATH_QUERY, { path }, Page) as PageType | null;
    if (!doc) return notFound();

    return (
        <div className="bg-white dark:bg-gray-900 w-full ">
            <div className="mx-auto max-w-6xl py-0 flex flex-col gap-8 px-4">

                {doc.mainImage?.asset?.url && (
                    <div className={`w-full ${doc.mainImage.layout === "banner" ? "aspect-[16/3]" : "aspect-[16/9]"} relative mb-4 overflow-hidden rounded-b-xl`}>
                        <Image
                            src={doc.mainImage.asset.url}
                            alt={doc.mainImage.alt || doc.title}
                            fill
                            className="object-cover "
                            sizes="100vw"
                        />
                    </div>
                )}
            </div>
            <div className=" mx-auto max-w-3xl py-0 flex flex-col gap-1 px-4  text-center" >

                {/* Title */}
                <h1 className="text-3xl font-semibold mt-4 mb-2">{doc.title}</h1>

                {/* Authors */}
                {doc.authors && doc.authors.length > 0 && (
                    <div className="text-sm text-gray-600 mb-1">
                        By {doc.authors.map((author, idx) => (
                            <span key={idx} className="mr-2">
                                {author.person?.name}{author.role ? ` (${author.role})` : ""}
                                {idx < doc.authors.length - 1 ? "," : ""}
                            </span>
                        ))}
                    </div>
                )}
                {/* Dates */}
                <div className="text-xs text-gray-500 mb-1">
                    {doc.publishedDate && (
                        <span>Published: {new Date(doc.publishedDate).toLocaleDateString()}</span>
                    )}
                </div>


                {doc.summary && doc.summary.length > 0 && (
                    <div className="prose text-md text-gray-700 dark:text-gray-200 mb-2 mx-auto">
                        <SimplePortableText value={doc.summary} />
                    </div>
                )}
                {/* Categories & Country */}
                <div className="text-xs text-gray-500 mb-2">
                    {doc.categories && doc.categories.length > 0 && (
                        <span>Categories: {doc.categories.join(", ")}</span>
                    )}
                    {doc.originCountry && (
                        <span className="ml-4">Country: {doc.originCountry}</span>
                    )}
                </div>
            </div>
            {doc.body && doc.body.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-700 w-full px-4 pt-2 pb-8">
                    <div className="mx-auto max-w-3xl items-center text-left prose">
                        <AdvancedPortableText value={doc.body} />
                    </div>
                </div>
            )}
        </div>
    );
}
