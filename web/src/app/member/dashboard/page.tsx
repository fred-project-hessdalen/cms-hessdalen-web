import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PeopleCard } from "@/components/PeopleCard"
import type { PortableTextBlock } from "sanity"
import { fetchAndParse } from "@/lib/sanity/fetch"
import { PEOPLE_BY_EMAIL_QUERY, People, type PeopleType } from "@/lib/sanity/query/people.query"

export default async function MemberDashboard() {
    const session = await auth()

    // Redirect to sign-in if not authenticated
    if (!session) {
        redirect("/auth/signin")
    }

    // Fetch the person record for this user
    const person = session.user?.email
        ? await fetchAndParse(PEOPLE_BY_EMAIL_QUERY, { email: session.user.email }, People) as PeopleType | null
        : null

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Member Dashboard
                    </h1>

                    {/* Member Profile Card */}
                    {person ? (
                        <div className="mb-8 flex justify-center">
                            <div className="w-full max-w-sm">
                                <PeopleCard
                                    info={{ ...person, bio: (person.bio as PortableTextBlock[]) || [] }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Welcome back, {session.user?.email}!
                        </p>
                    )}
                    <Link
                        href="/api/auth/signout"
                        className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold mb-8 py-2 px-4 rounded-md transition-colors"
                    >
                        Sign Out
                    </Link>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Recommendations Card */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                ⭐ Recommendations
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Share a resource or article with the community
                            </p>
                            <Link
                                href="/member/recommendation/new"
                                className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                            >
                                Add Recommendation
                            </Link>
                        </div>

                        {/* Profile Card */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                👤 Your Profile
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Manage your profile information and privacy settings
                            </p>
                            <Link
                                href="/member/profile"
                                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                            >
                                Edit Profile
                            </Link>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    )
}
