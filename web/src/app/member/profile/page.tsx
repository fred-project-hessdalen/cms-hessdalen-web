import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ProfileEditForm } from "@/components/ProfileEditForm"
import { CollapsibleSection } from "@/components/CollapsibleSection"
import { PeopleCard } from "@/components/PeopleCard"
import { client, writeClient } from "@/lib/sanity/live"

export default async function MemberProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/signin?callbackUrl=/member/profile")
    }

    // Fetch member's profile directly from Sanity
    let person = await client.fetch(
        `*[_type == "person" && authUserId == $userId][0]{
            _id,
            name,
            "slug": slug.current,
            email,
            summary,
            mobileNumber,
            isPublic,
            canShowEmail,
            canShowMobileNumber,
            profileToken,
            "image": image.asset->url,
            professionalTitle->{
                _id,
                title,
                slug
            },
            bio
        }`,
        { userId: session.user.id }
    )

    // If not found by authUserId, try to find by email and link it
    if (!person && session.user.email) {
        person = await client.fetch(
            `*[_type == "person" && email == $email][0]{
                _id,
                name,
                "slug": slug.current,
                email,
                summary,
                mobileNumber,
                isPublic,
                canShowEmail,
                canShowMobileNumber,
                profileToken,
                "image": image.asset->url,
                professionalTitle->{
                    _id,
                    title,
                    slug
                },
                bio
            }`,
            { email: session.user.email }
        )

        // If found by email, link it to this auth user
        if (person) {
            await writeClient
                .patch(person._id)
                .set({ authUserId: session.user.id })
                .commit()

            console.log(`✅ Auto-linked auth user ${session.user.id} to person ${person._id}`)
        }
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
                        Your account exists, but you don&apos;t have a profile in our system yet. Please contact an
                        administrator to create your profile with email: <strong>{session.user.email}</strong>
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/member/dashboard"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                    >
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Member Profile</h1>
                </div>

                {/* People Card Section */}
                <div className="max-w-2xl mx-auto">

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        This is how your profile appears to others on the website
                    </p>
                    <PeopleCard
                        info={{
                            ...person,
                            mobile: person.mobileNumber,
                            bio: person.bio || []
                        }}
                    />
                </div>
                {/* Profile Edit Form in CollapsibleSection */}
                <div className="mt-8">
                    <ProfileEditForm person={person} token="member" />
                </div>



            </div>
        </div>
    )
}
