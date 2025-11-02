import { NextRequest, NextResponse } from "next/server"
import { client, writeClient } from "@/lib/sanity/live"

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await context.params

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

        const formData = await request.formData()
        const file = formData.get('image') as File

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 })
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Upload to Sanity
        const asset = await writeClient.assets.upload('image', buffer, {
            filename: file.name,
            contentType: file.type,
        })

        // Update person document with new image reference
        await writeClient
            .patch(person._id)
            .set({
                image: {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: asset._id,
                    }
                }
            })
            .commit()

        return NextResponse.json({
            success: true,
            imageUrl: asset.url
        })
    } catch (error) {
        console.error("Profile image upload error:", error)
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        )
    }
}
