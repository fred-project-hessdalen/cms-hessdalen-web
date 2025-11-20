import Link from "next/link";
import Image from "next/image";
import { PeopleCard } from "@/components/PeopleCard";
import type { PortableTextBlock } from "sanity";
import { auth } from "@/lib/auth";

import { fetchAndParse } from "@/lib/sanity/fetch";
import {
    PEOPLE_BY_ROLE_QUERY,
    PEOPLE_BY_AFFILIATION_QUERY,
    PeopleList,
    ALL_ORGANIZATIONAL_ROLES_QUERY,
    OrganizationalRolesList,
    ALL_AFFILIATIONS_QUERY,
    AffiliationsList,
} from "@/lib/sanity/query/people.query";

import { SITE_SETTINGS_QUERY, SITE_SETTINGS } from "@/lib/sanity/query/site.query";
import PeopleMapWrapper from "@/components/PeopleMapWrapper";
import { publicClient } from "@/sanity/client";
import { defineQuery } from "next-sanity";

// Define queries for all people (when logged in)
const PEOPLE_FIELDS = `
  _id,
  _type,
  name,
  displayName,
  "slug": slug.current,
  email,
  "mobile": select(canShowMobileNumber == true => mobileNumber, null),
  canShowEmail,
  canShowMobileNumber,
  isPublic,
  country,
  website,
  isActive,
  group,
  "image": image.asset->url,
  summary,
  professionalTitle->{
    _id,
    title,
    "slug": slug.current
  },
  membershipType->{
    _id,
    title,
    "slug": slug.current,
    description,
    order
  },
  organizationalRoles[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    order
  },
  affiliations[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    type,
    color
  },
  professionalAffiliations[]{
    title,
    organization,
    organizationUrl,
    startDate,
    endDate,
    isPrimary,
    description
  },
  bio,
  socials[]{
    label,
    url
  },
  location {
    lat,
    lng
  }
`;

const ALL_PEOPLE_LIST_QUERY = defineQuery(`
  *[_type == "person" && isActive == true] | order(group asc, name asc) {
    ${PEOPLE_FIELDS}
  }
`);

const ALL_PEOPLE_BY_ROLE_QUERY = defineQuery(`
  *[_type == "person" && isActive == true && $roleSlug in organizationalRoles[]->slug.current] | order(group asc, name asc) {
    ${PEOPLE_FIELDS}
  }
`);

const ALL_PEOPLE_BY_AFFILIATION_QUERY = defineQuery(`
  *[_type == "person" && isActive == true && $groupSlug in affiliations[]->slug.current] | order(group asc, name asc) {
    ${PEOPLE_FIELDS}
  }
`);

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

    // Check if user is admin (has @hessdalen.org email)
    const isAdmin = session?.user?.email?.endsWith('@hessdalen.org') ?? false;

    // Fetch people based on filters or show all
    // If logged in, show ALL people; otherwise only public ones
    let peoples;
    if (session) {
        // Logged in - show ALL people
        if (roleSlug) {
            const data = await publicClient.fetch(ALL_PEOPLE_BY_ROLE_QUERY, { roleSlug });
            peoples = PeopleList.parse(data);
        } else if (groupSlug) {
            const data = await publicClient.fetch(ALL_PEOPLE_BY_AFFILIATION_QUERY, { groupSlug });
            peoples = PeopleList.parse(data);
        } else {
            const data = await publicClient.fetch(ALL_PEOPLE_LIST_QUERY);
            peoples = PeopleList.parse(data);
        }
    } else {
        // Not logged in - show only public people
        if (roleSlug) {
            peoples = await fetchAndParse(PEOPLE_BY_ROLE_QUERY, { roleSlug }, PeopleList);
        } else if (groupSlug) {
            peoples = await fetchAndParse(PEOPLE_BY_AFFILIATION_QUERY, { groupSlug }, PeopleList);
        } else {
            // Use public query from people.query.ts
            const data = await publicClient.fetch(defineQuery(`
              *[_type == "person" && (isPublic == true || !defined(isPublic))] | order(group asc, name asc) {
                ${PEOPLE_FIELDS}
              }
            `));
            peoples = PeopleList.parse(data);
        }
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


    // Prepare data for PeopleMap
    const peopleWithLocation = (peoples ?? [])
        .filter(
            (p) =>
                p.location &&
                typeof p.location.lat === "number" &&
                typeof p.location.lng === "number" &&
                p.location.lat !== undefined &&
                p.location.lng !== undefined
        )
        .map((p) => ({
            name: p.displayName ? p.displayName : p.name,
            location: { lat: p.location!.lat as number, lng: p.location!.lng as number },
        }));

    return (
        <div>
            <div className="bg-gray-100 dark:bg-gray-700 w-full">
                <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8 py-8 px-1">
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
                            <div className="flex flex-row md:flex-col gap-2">
                                <Link
                                    href="/member/dashboard"
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition-colors text-xs"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Dashboard
                                </Link>
                                <Link
                                    href="/forum"
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-colors text-xs"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                    Forum
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-colors text-xs"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Map of member locations */}
            {peopleWithLocation.length > 0 && (
                <div className="mx-auto max-w-6xl px-4 py-0">
                    <PeopleMapWrapper members={peopleWithLocation} />
                </div>
            )}


            <div className="mx-auto max-w-6xl px-4 py-0">
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
                                    <PeopleCard
                                        key={p.slug}
                                        info={{ ...p, bio: (p.bio as PortableTextBlock[]) || [] }}
                                        isLoggedIn={!!session}
                                        isAdmin={isAdmin}
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
