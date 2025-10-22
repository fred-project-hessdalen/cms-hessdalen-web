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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Member Dashboard
                    </h1>

                    {/* Member Profile Card */}
                    {person ? (
                        <div className="mb-6 flex justify-center">
                            <div className="w-full max-w-sm">
                                <PeopleCard
                                    info={{ ...person, bio: (person.bio as PortableTextBlock[]) || [] }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Welcome back, {session.user?.email}!
                        </p>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Homepage Card */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Homepage
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Return to the main homepage
                            </p>
                            <Link
                                href="/"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                            >
                                Go to Homepage
                            </Link>
                        </div>

                        {/* Members Card */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Members
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                View all members and their profiles
                            </p>
                            <Link
                                href="/people"
                                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                            >
                                View Members
                            </Link>
                        </div>

                        {/* Resources Card (Coming Soon) */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Resources
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Access member-only documents and files
                            </p>
                            <button
                                disabled
                                className="inline-block bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-2 px-4 rounded-md cursor-not-allowed"
                            >
                                Coming Soon
                            </button>
                        </div>

                        {/* Events Card (Coming Soon) */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Events
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                View and RSVP to upcoming events
                            </p>
                            <button
                                disabled
                                className="inline-block bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-2 px-4 rounded-md cursor-not-allowed"
                            >
                                Coming Soon
                            </button>
                        </div>

                        {/* Profile Card */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Your Profile
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

                        {/* Account Card */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Account
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Manage your account settings
                            </p>
                            <Link
                                href="/api/auth/signout"
                                className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
