import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeClient } from "@/lib/sanity/live";
import { htmlToPortableText } from "@/lib/htmlToPortableText";

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const formData = await request.formData();

        const title = formData.get("title") as string;
        const body = formData.get("body") as string;
        const linksJson = formData.get("links") as string | null;
        const parentPostId = formData.get("parentPostId") as string;
        const replyToId = formData.get("replyToId") as string | null;
        const imageFile = formData.get("image") as File | null;

        // Debug logging
        console.log("Received data:", { title, body: body?.substring(0, 100), parentPostId, replyToId });

        // Validate required fields - trim to check for empty strings
        if (!title || !title.trim()) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        if (!body || !body.trim()) {
            return NextResponse.json(
                { error: "Body is required" },
                { status: 400 }
            );
        }

        if (!parentPostId) {
            return NextResponse.json(
                { error: "Parent post ID is required" },
                { status: 400 }
            );
        }

        // Get the authenticated user's person record
        const person = await writeClient.fetch(
            `*[_type == "person" && (authUserId == $userId || email == $email)][0]{_id}`,
            { userId: session.user.id, email: session.user.email }
        );

        if (!person) {
            return NextResponse.json(
                { error: "You must have a person profile to create a response" },
                { status: 403 }
            );
        }

        const now = new Date().toISOString();

        // Convert HTML body to Sanity block content
        console.log("HTML body received:", body);
        const blockContent = htmlToPortableText(body);
        console.log("Converted to blocks:", JSON.stringify(blockContent, null, 2));

        // Parse and filter links
        let validLinks: Array<{ _type: string; _key: string; label: string; url: string }> = [];
        if (linksJson) {
            try {
                const links = JSON.parse(linksJson);
                validLinks = links
                    .filter((link: { label: string; url: string }) => link.label && link.url)
                    .map((link: { label: string; url: string }) => ({
                        _type: "object",
                        _key: crypto.randomUUID(),
                        label: link.label,
                        url: link.url,
                    }));
            } catch (e) {
                console.error("Error parsing links:", e);
            }
        }

        // Upload image to Sanity if provided
        let imageAsset = null;
        if (imageFile) {
            const buffer = await imageFile.arrayBuffer();
            const uploadedAsset = await writeClient.assets.upload("image", Buffer.from(buffer), {
                filename: imageFile.name,
            });
            imageAsset = {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: uploadedAsset._id,
                },
            };
        }

        // Create the forum response document
        const doc = {
            _type: "forumPostResponse",
            title,
            body: blockContent,
            author: {
                _type: "reference",
                _ref: person._id,
            },
            parentPost: {
                _type: "reference",
                _ref: parentPostId,
            },
            createdAt: now,
            ...(replyToId && {
                replyTo: {
                    _type: "reference",
                    _ref: replyToId,
                },
            }),
            ...(imageAsset && { image: imageAsset }),
            ...(validLinks.length > 0 && { links: validLinks }),
        };

        const result = await writeClient.create(doc);

        return NextResponse.json({
            success: true,
            _id: result._id,
        });
    } catch (error) {
        console.error("Error creating forum response:", error);
        return NextResponse.json(
            { error: "Failed to create forum response" },
            { status: 500 }
        );
    }
}
