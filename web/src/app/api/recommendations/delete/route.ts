import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeClient } from "@/lib/sanity/live"

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { recommendationId } = body

        if (!recommendationId) {
            return NextResponse.json(
                { error: "Missing recommendation ID" },
                { status: 400 }
            )
        }

        // Verify the recommendation belongs to this user's person
        const recommendation = await writeClient.fetch(
            `*[_type == "recommendation" && _id == $recommendationId][0]{
                _id,
                person->{
                    _id,
                    authUserId,
                    email
                }
            }`,
            { recommendationId }
        )

        if (!recommendation) {
            return NextResponse.json(
                { error: "Recommendation not found" },
                { status: 404 }
            )
        }

        // Check if this user owns the recommendation
        const isOwner = 
            recommendation.person?.authUserId === session.user.id ||
            recommendation.person?.email === session.user.email

        if (!isOwner) {
            return NextResponse.json(
                { error: "Unauthorized to delete this recommendation" },
                { status: 403 }
            )
        }

        // Delete the recommendation
        await writeClient.delete(recommendationId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting recommendation:", error)
        return NextResponse.json(
            { error: "Failed to delete recommendation" },
            { status: 500 }
        )
    }
}
