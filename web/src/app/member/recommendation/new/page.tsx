import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { RecommendationForm } from "@/components/RecommendationForm"
import { PreviousRecommendationsList } from "@/components/PreviousRecommendationsList"
import { client } from "@/lib/sanity/live"

export default async function NewRecommendationPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/signin?callbackUrl=/member/recommendation/new")
    }

    // Fetch member's profile to get their person ID
    let person = await client.fetch(
        `*[_type == "person" && authUserId == $userId][0]{
            _id,
            name,
            displayName
        }`,
        { userId: session.user.id }
    )

    // If not found by authUserId, try to find by email
    if (!person && session.user.email) {
        person = await client.fetch(
            `*[_type == "person" && email == $email][0]{
                _id,
                name,
                displayName
            }`,
            { email: session.user.email }
        )
    }

    if (!person) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-600">Profile Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Could not find a profile linked to your account.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        You need a profile to create recommendations. Please contact an administrator.
                    </p>
                    <Link
                        href="/member/dashboard"
                        className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Fetch previous recommendations by this person
    const previousRecommendations = await client.fetch(
        `*[_type == "recommendation" && person._ref == $personId] | order(expiresAt desc) {
            _id,
            title,
            link,
            expiresAt,
            _createdAt
        }`,
        { personId: person._id }
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/member/dashboard"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                    >
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Add Recommendation
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Share a resource, article, or website with the community
                    </p>
                </div>

                {/* Recommendation Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <RecommendationForm personId={person._id} personName={person.displayName || person.name} />
                </div>

                {/* Previous Recommendations */}
                <PreviousRecommendationsList recommendations={previousRecommendations ?? []} />
            </div>
        </div>
    )
}
