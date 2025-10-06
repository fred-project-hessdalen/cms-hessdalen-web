import Image from "next/image";
import { PeopleCard } from "@/components/PeopleCard";
import { PortableText } from "next-sanity";

import { fetchAndParse } from "@/lib/sanity/fetch";
import {
    PEOPLE_BY_SLUG_QUERY,
    PEOPLE_LIST_QUERY,
    People, PeopleList,               // <-- keep the Zod schema for parsing
    type PeopleType,      // <-- import the TS type alias
} from "@/lib/sanity/query/people.query";
import { AdvancedPortableText } from "@/components/AdvancedPortableText";

export default async function PersonPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const getInitials = (name?: string) =>
        name ? name.split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";


    const people = await fetchAndParse(PEOPLE_BY_SLUG_QUERY, { slug }, People) as PeopleType | null;
    const peoples = await fetchAndParse(PEOPLE_LIST_QUERY, {}, PeopleList);

    return (
        <div className="bg-gray-100 dark:bg-gray-700 w-full">

            {people ? (
                <div className="w-full">

                    <div className="mx-auto max-w-3xl py-8 flex flex-col items-stretch gap-8 px-4">
                        <div
                            className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 shadow-sm hover:shadow-md transition-shadow p-2 sm:p-8 flex items-start gap-4 w-full"
                        >
                            {/* Avatar */}
                            {people.image ? (
                                <Image
                                    src={people.image}
                                    alt={people.name}
                                    width={64}
                                    height={64}
                                    className="h-16 w-16 sm:h-32 sm:w-32 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                                    sizes="(max-width: 640px) 64px, 128px"
                                />
                            ) : (
                                <div className="h-16 w-16 sm:h-32 sm:w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-semibold text-gray-700 dark:text-gray-200 flex-none"
                                    style={{ minWidth: 64, minHeight: 64, maxWidth: 128, maxHeight: 128 }}
                                >
                                    {getInitials(people.name)}
                                </div>
                            )}

                            {/* Text */}
                            <div className="min-w-0 text-left w-full">
                                <div className="flex items-center justify-between gap-2 w-full">
                                    <h3 className="text-3xl font-semibold flex-1 truncate">
                                        {people.name}
                                    </h3>
                                    {people.country && (
                                        <span className="text-md ml-2 mr-4 text-right">
                                            {people.country}
                                        </span>
                                    )}
                                </div>

                                {people.title && (
                                    <p className="text-md text-gray-600 dark:text-gray-400 truncate pb-4">
                                        {people.title}
                                    </p>
                                )}

                                {people.email && (
                                    <a
                                        href={`mailto:${people.email}`}
                                        className="relative z-20 text-md text-blue-600 hover:underline break-all"
                                    >
                                        {people.email}
                                    </a>
                                )}
                                {people.mobile && (
                                    <a
                                        href={`tel:${people.mobile.replace(/\s+/g, "")}`}
                                        className="relative z-20 text-md text-blue-600 hover:underline break-all ml-4"
                                    >
                                        {people.mobile}
                                    </a>
                                )}
                                {people.socials && people.socials.length > 0 && (
                                    <div>
                                        {people.socials.map((social, idx) => (
                                            social.url ? (
                                                <a key={idx}
                                                    href={social.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm mr-4"
                                                >
                                                    {social.label || social.url}
                                                </a>
                                            ) : null
                                        ))}
                                    </div>
                                )}
                                {people.summary && (
                                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">
                                        {people.summary}
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>


                    {/* Bio (PortableText) */}
                    {people.bio && people.bio.length > 0 && (
                        // <div className=" mx-auto max-w-6xl py-4 items-center text-left prose p-4">
                        //     <PortableText value={people.bio} />
                        // </div>
                        <div className="mx-auto max-w-3xl py-4 items-center text-left prose p-4">
                            <AdvancedPortableText value={people.bio} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="mb-8 mx-auto max-w-6xl prose text-left" >
                    <h1 className="mt-8">Unknown person {slug}</h1>
                </div>
            )
            }


            <div className="mx-auto px-4 not-prose py-8 bg-gray-100 dark:bg-gray-700 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {peoples.map((p) => (
                        <PeopleCard key={p.slug} info={p} current={people?.slug} />
                    ))}
                </div>
            </div>



        </div >
    )
}
