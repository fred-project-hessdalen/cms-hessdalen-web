import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function MemberDashboard() {
    const session = await auth()

    // Redirect to sign-in if not authenticated
    if (!session) {
        redirect("/auth/signin")
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Member Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Welcome back, {session.user?.email}!
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
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
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                            >
                                Edit Profile
                            </Link>
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

                        {/* Settings Card */}
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
