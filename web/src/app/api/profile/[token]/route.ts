import { NextRequest, NextResponse } from "next/server"
import { client, writeClient } from "@/lib/sanity/live"

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await context.params
        const body = await request.json()

        // Validate token and get person
        const person = await client.fetch<{ _id: string } | null>(
            `*[_type == "person" && profileToken == $token][0]{ _id }`,
            { token } as Record<string, unknown>
        )

        if (!person) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 403 }
            )
        }

        // Only allow updating specific fields
        const allowedFields = {
            summary: body.summary,
            mobileNumber: body.mobileNumber,
            website: body.website,
            isPublic: body.isPublic,
            isActive: body.isActive,
            canShowEmail: body.canShowEmail,
            canShowMobileNumber: body.canShowMobileNumber,
            location: body.location,
        }

        // Update person document using writeClient
        await writeClient
            .patch(person._id)
            .set(allowedFields)
            .commit()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Profile update error:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}
