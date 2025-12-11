import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeClient } from "@/lib/sanity/live"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { title, link, expiresAt, personId } = body

        // Validate required fields
        if (!title || !link || !expiresAt || !personId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Verify the person belongs to this user
        const person = await writeClient.fetch(
            `*[_type == "person" && _id == $personId && (authUserId == $userId || email == $email)][0]{_id}`,
            { personId, userId: session.user.id, email: session.user.email }
        )

        if (!person) {
            return NextResponse.json(
                { error: "Unauthorized to create recommendation for this person" },
                { status: 403 }
            )
        }

        // Create the recommendation
        const recommendation = await writeClient.create({
            _type: "recommendation",
            title,
            link,
            expiresAt,
            person: {
                _type: "reference",
                _ref: personId,
            },
        })

        return NextResponse.json({ success: true, recommendation })
    } catch (error) {
        console.error("Error creating recommendation:", error)
        return NextResponse.json(
            { error: "Failed to create recommendation" },
            { status: 500 }
        )
    }
}
