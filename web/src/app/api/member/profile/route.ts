import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { client, writeClient } from "@/lib/sanity/live"

// GET /api/member/profile - Fetch logged-in user's profile
export async function GET() {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
        // First, try to find person by authUserId
        let person = await client.fetch(
            `*[_type == "person" && authUserId == $userId][0]{
                _id,
                name,
                email,
                summary,
                mobileNumber,
                website,
                isPublic,
                isActive,
                canShowEmail,
                canShowMobileNumber,
                emailOnForumPost,
                emailOnPostReply,
                location,
                profileToken,
                image {
                    asset-> {
                        _ref,
                        url
                    }
                }
            }`,
            { userId: session.user.id }
        )

        // If not found by authUserId, try to find by email and link it
        if (!person) {
            person = await client.fetch(
                `*[_type == "person" && email == $email][0]{
                    _id,
                    name,
                    email,
                    summary,
                    mobileNumber,
                    website,
                    isPublic,
                    isActive,
                    canShowEmail,
                    canShowMobileNumber,
                    emailOnForumPost,
                    emailOnPostReply,
                    location,
                    profileToken,
                    image {
                        asset-> {
                            _ref,
                            url
                        }
                    }
                }`,
                { email: session.user.email }
            )

            // If found by email, link it to this auth user
            if (person) {
                await writeClient
                    .patch(person._id)
                    .set({ authUserId: session.user.id })
                    .commit()

            }
        }

        if (!person) {
            return NextResponse.json(
                { error: "Profile not found. Contact admin to create your profile." },
                { status: 404 }
            )
        }

        return NextResponse.json({ person })
    } catch (error) {
        console.error("Error fetching member profile:", error)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}

// PATCH /api/member/profile - Update logged-in user's profile
export async function PATCH(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
        // Find person by authUserId or email
        const person = await client.fetch(
            `*[_type == "person" && (authUserId == $userId || email == $email)][0]{_id}`,
            { userId: session.user.id, email: session.user.email }
        )

        if (!person) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        const updates = await request.json()

        // Only allow updating specific fields
        const allowedFields = ["summary", "mobileNumber", "website", "isPublic", "isActive", "canShowEmail", "canShowMobileNumber", "emailOnForumPost", "emailOnPostReply", "location"]
        const sanitizedUpdates = Object.fromEntries(
            Object.entries(updates).filter(([key]) => allowedFields.includes(key))
        )

        await writeClient.patch(person._id).set(sanitizedUpdates).commit()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating member profile:", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
}
