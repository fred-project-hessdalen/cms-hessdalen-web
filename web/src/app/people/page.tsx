import { PeopleCard } from "@/components/PeopleCard";
import type { PortableTextBlock } from "sanity";

import { fetchAndParse } from "@/lib/sanity/fetch";
import { PEOPLE_LIST_QUERY, PeopleList } from "@/lib/sanity/query/people.query";

export default async function PersonPage() {

    const peoples = await fetchAndParse(PEOPLE_LIST_QUERY, {}, PeopleList);

    return (
        <div>
            <div className="bg-gray-100 dark:bg-gray-700 w-full">
                <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 py-8 items-center">
                    {/* Left column: heading and description */}
                    <div className="prose text-left px-8 md:col-span-2">
                        <h1 className="text-3xl font-semibold tracking-tight">People in Project Hessdalen</h1>
                        <p className="text-gray-600">A list of volunteers working for the project.</p>
                        <p className="text-gray-500"><i>Some volunteers may <b>not</b> have their information publicly available.</i></p>
                    </div>
                    {/* Right column: image */}
                    <div className="flex justify-center md:col-span-1">
                        <img
                            src="/globe.svg"
                            alt="Project Hessdalen Globe"
                            className="h-32 w-32 object-contain"
                        />
                    </div>
                </div>
            </div>
            <div className="mx-auto px-4 not-prose py-8 bg-gray-100 dark:bg-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {peoples.map((p) => (
                        <PeopleCard key={p.slug}
                            info={{ ...p, bio: (p.bio as PortableTextBlock[]) || [] }}

                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
