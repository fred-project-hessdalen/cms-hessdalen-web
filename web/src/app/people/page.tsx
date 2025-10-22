import Link from "next/link";
import Image from "next/image";
import { PeopleCard } from "@/components/PeopleCard";
import type { PortableTextBlock } from "sanity";
import { auth } from "@/lib/auth";

import { fetchAndParse } from "@/lib/sanity/fetch";
import {
    PEOPLE_LIST_QUERY,
    PEOPLE_BY_ROLE_QUERY,
    PEOPLE_BY_AFFILIATION_QUERY,
    PeopleList,
    ALL_ORGANIZATIONAL_ROLES_QUERY,
    OrganizationalRolesList,
    ALL_AFFILIATIONS_QUERY,
    AffiliationsList,
} from "@/lib/sanity/query/people.query";
import { SITE_SETTINGS_QUERY, SITE_SETTINGS } from "@/lib/sanity/query/site.query";

export default async function PersonPage({
    searchParams,
}: {
    searchParams: Promise<{ role?: string; group?: string }>;
}) {
    const params = await searchParams;
    const roleSlug = params.role;
    const groupSlug = params.group;

    // Check if user is logged in
    const session = await auth();

    // Fetch people based on filters or show all
    let peoples;
    if (roleSlug) {
        peoples = await fetchAndParse(PEOPLE_BY_ROLE_QUERY, { roleSlug }, PeopleList);
    } else if (groupSlug) {
        peoples = await fetchAndParse(PEOPLE_BY_AFFILIATION_QUERY, { groupSlug }, PeopleList);
    } else {
        peoples = await fetchAndParse(PEOPLE_LIST_QUERY, {}, PeopleList);
    }

    const organizationalRoles = await fetchAndParse(ALL_ORGANIZATIONAL_ROLES_QUERY, {}, OrganizationalRolesList);
    const affiliations = await fetchAndParse(ALL_AFFILIATIONS_QUERY, {}, AffiliationsList);
    const siteSettings = await fetchAndParse(SITE_SETTINGS_QUERY, {}, SITE_SETTINGS);

    // Group people by membershipType
    type MembershipGroup = {
        membershipType: {
            _id: string;
            title: string;
            slug: string;
            description?: string;
            order?: number;
        } | null | undefined;
        people: NonNullable<typeof peoples>;
    };

    const groupedPeople = (peoples ?? []).reduce((acc, person) => {
        const membershipKey = person.membershipType?._id || 'no-membership';
        if (!acc[membershipKey]) {
            acc[membershipKey] = {
                membershipType: person.membershipType,
                people: []
            };
        }
        acc[membershipKey]!.people.push(person);
        return acc;
    }, {} as Record<string, MembershipGroup>);

    // Sort groups by membershipType order (or put no-membership last)
    const sortedGroups = Object.entries(groupedPeople).sort(([keyA, groupA], [keyB, groupB]) => {
        if (keyA === 'no-membership') return 1;
        if (keyB === 'no-membership') return -1;
        const orderA = groupA.membershipType?.order ?? 999;
        const orderB = groupB.membershipType?.order ?? 999;
        return orderA - orderB;
    });


    return (
        <div>
            <div className="bg-gray-100 dark:bg-gray-700 w-full">
                <div className="mx-auto max-w-6xl flex items-center justify-between gap-8 py-8 px-1">
                    {/* Left side: Logo and Site Name */}
                    <div className="flex items-center gap-4">
                        {siteSettings?.logo ? (
                            <Image
                                src={siteSettings.logo}
                                alt={`${siteSettings.siteName} logo`}
                                width={128}
                                height={128}
                                className="h-32 w-32 object-contain"
                            />
                        ) : (
                            <div className="h-32 w-32" />
                        )}
                        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                            Members of {siteSettings?.siteName || "the organization"}
                        </h1>
                    </div>

                    {/* Right side: Member Login Link */}
                    <div className="flex-shrink-0">
                        {session ? (
                            <Link
                                href="/member/dashboard"
                                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition-colors text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Member Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-colors text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Member Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>


            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Organizational Roles Section */}
                <div className="mb-8">
                    <h2 className="text-left text-2xl font-semibold mb-4">Roles</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/people"
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${!roleSlug && !groupSlug
                                ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            All
                        </Link>
                        {(organizationalRoles ?? []).map((role) => (
                            <Link
                                key={role._id}
                                href={`/people?role=${role.slug}`}
                                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${roleSlug === role.slug
                                    ? "bg-green-600 dark:bg-green-700 text-white"
                                    : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                                    }`}
                            >
                                {role.title}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Affiliations / Groups Section */}
                <div className="mb-8">
                    <h2 className="text-left text-2xl font-semibold mb-4">Groups</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/people"
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${!roleSlug && !groupSlug
                                ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            All
                        </Link>
                        {(affiliations ?? []).map((affiliation) => (
                            <Link
                                key={affiliation._id}
                                href={`/people?group=${affiliation.slug}`}
                                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${groupSlug === affiliation.slug
                                    ? "bg-purple-600 dark:bg-purple-700 text-white"
                                    : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800"
                                    }`}
                            >
                                {affiliation.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>


            <div className="mx-auto px-4 not-prose py-8 bg-gray-100 dark:bg-gray-700">
                {/* Results count */}
                <div className="max-w-6xl mx-auto mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {roleSlug && (
                        <p>
                            Showing <strong>{peoples?.length ?? 0}</strong> {peoples?.length === 1 ? 'person' : 'people'} with role: <strong>{organizationalRoles?.find(r => r.slug === roleSlug)?.title}</strong>
                        </p>
                    )}
                    {groupSlug && (
                        <p>
                            Showing <strong>{peoples?.length ?? 0}</strong> {peoples?.length === 1 ? 'person' : 'people'} in group: <strong>{affiliations?.find(a => a.slug === groupSlug)?.title}</strong>
                        </p>
                    )}
                    {!roleSlug && !groupSlug && (
                        <p>
                            Showing all <strong>{peoples?.length ?? 0}</strong> {peoples?.length === 1 ? 'person' : 'people'}
                        </p>
                    )}
                </div>

                {/* Grouped people by membershipType */}
                <div className="mx-auto space-y-12">
                    {sortedGroups.map(([key, group]) => (
                        <div key={key} className="space-y-4">
                            {/* Membership Type Header */}
                            {group.membershipType && (
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {group.membershipType.title}
                                    </h2>
                                    {group.membershipType.description && (
                                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                            {group.membershipType.description}
                                        </p>
                                    )}
                                </div>
                            )}
                            {!group.membershipType && (
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        Other Members
                                    </h2>
                                </div>
                            )}

                            {/* People Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {group.people.map((p) => (
                                    <PeopleCard key={p.slug}
                                        info={{ ...p, bio: (p.bio as PortableTextBlock[]) || [] }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
