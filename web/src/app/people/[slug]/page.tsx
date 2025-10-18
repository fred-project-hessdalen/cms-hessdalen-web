import Image from "next/image";
import Link from "next/link";
import { PeopleCard } from "@/components/PeopleCard";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import type { PortableTextBlock } from "sanity";

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
                                    {/* Membership Type */}
                                    {people.membershipType && (
                                        <div className="mb-2">
                                            <span className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                                                {people.membershipType.title}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Professional Title */}
                                <div className="flex items-center justify-between gap-2 w-full">
                                    {people.professionalTitle && (
                                        <p className="text-md text-gray-600 dark:text-gray-400 pb-2">
                                            {people.professionalTitle.title}
                                        </p>
                                    )}

                                    {people.country && (
                                        <span className="text-md ml-2 mr-4 text-right">
                                            {people.country}
                                        </span>
                                    )}
                                </div>

                                {/* Organizational Roles */}
                                {people.organizationalRoles && people.organizationalRoles.length > 0 && (
                                    <div className="mb-2">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-2">Roles:</span>
                                        {people.organizationalRoles.map((role) => (
                                            <Link
                                                key={role._id}
                                                href={`/people?role=${role.slug}`}
                                                className="inline-flex items-center rounded-md bg-green-100 dark:bg-green-900 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 mr-1 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                                            >
                                                {role.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Affiliations / Groups */}
                                {people.affiliations && people.affiliations.length > 0 && (
                                    <div className="mb-3">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-2">
                                            Groups:
                                        </span>
                                        {people.affiliations.map((affiliation) => (
                                            <Link
                                                key={affiliation._id}
                                                href={`/people?group=${affiliation.slug}`}
                                                className="inline-flex items-center rounded-md bg-purple-100 dark:bg-purple-900 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 mr-1 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                            >
                                                {affiliation.title}
                                            </Link>
                                        ))}
                                    </div>
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


                                {/* Professional Affiliations */}
                                {people.professionalAffiliations && people.professionalAffiliations.length > 0 && (
                                    <CollapsibleSection header="Affiliations" defaultOpen={false}>
                                        <div className="space-y-4">
                                            {people.professionalAffiliations.map((aff, idx) => (
                                                <div
                                                    key={idx}
                                                    className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-1"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            {aff.title && (
                                                                <h3 className="font-semibold text-lg">
                                                                    {aff.title}
                                                                    {aff.organization && (
                                                                        <span className="text-gray-600 dark:text-gray-400">
                                                                            {" @ "}
                                                                            {aff.organizationUrl ? (
                                                                                <a
                                                                                    href={aff.organizationUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-blue-600 hover:underline"
                                                                                >
                                                                                    {aff.organization}
                                                                                </a>
                                                                            ) : (
                                                                                aff.organization
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </h3>
                                                            )}
                                                            {(aff.startDate || aff.endDate) && (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {aff.startDate || ""}
                                                                    {" – "}
                                                                    {aff.endDate || "Present"}
                                                                </p>
                                                            )}
                                                            {aff.description && (
                                                                <p className="mt-2 text-gray-700 dark:text-gray-300">
                                                                    {aff.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {aff.isPrimary && (
                                                            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleSection>
                                )}



                            </div>
                        </div>

                    </div>


                    {/* Bio (PortableText) */}
                    {people.bio && people.bio.length > 0 && (
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
                    {(peoples ?? []).map((p) => (
                        <PeopleCard key={p.slug}
                            info={{ ...p, bio: (p.bio as PortableTextBlock[]) || [] }}
                            current={people?.slug} />
                    ))}
                </div>
            </div>



        </div >
    )
}
