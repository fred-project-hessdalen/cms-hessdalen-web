import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { client, writeClient } from "@/lib/sanity/live"

export async function POST(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
        // Find person by authUserId or email
        const person = await client.fetch<{ _id: string } | null>(
            `*[_type == "person" && (authUserId == $userId || email == $email)][0]{_id}`,
            { userId: session.user.id, email: session.user.email }
        )

        if (!person) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
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
        console.error("Error uploading image:", error)
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }
}
