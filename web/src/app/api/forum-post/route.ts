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
        const postType = formData.get("postType") as string | null;
        const body = formData.get("body") as string;
        const linksJson = formData.get("links") as string | null;
        const authorId = formData.get("authorId") as string;
        const imageFile = formData.get("image") as File | null;

        // Validate required fields
        if (!title || !body || !authorId) {
            return NextResponse.json(
                { error: "Missing required fields: title, body, and author are required" },
                { status: 400 }
            );
        }

        // Verify the author belongs to the authenticated user
        const person = await writeClient.fetch(
            `*[_type == "person" && _id == $authorId && (authUserId == $userId || email == $email)][0]{_id}`,
            { authorId, userId: session.user.id, email: session.user.email }
        );

        if (!person) {
            return NextResponse.json(
                { error: "Unauthorized: Author does not match authenticated user" },
                { status: 403 }
            );
        }

        // Prepare the document
        const now = new Date().toISOString();

        // Generate slug from timestamp
        const date = now.split("T")[0];
        const time = now.split("T")[1]?.replace(/:/g, "-").split(".")[0];
        const slug = `${date}T${time}`;

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

        // Create the forum post document
        const doc = {
            _type: "forumPost",
            title,
            slug: {
                _type: "slug",
                current: slug,
            },
            body: blockContent,
            author: {
                _type: "reference",
                _ref: authorId,
            },
            createdAt: now,
            ...(postType && {
                type: {
                    _type: "reference",
                    _ref: postType,
                },
            }),
            ...(imageAsset && { image: imageAsset }),
            ...(validLinks.length > 0 && { links: validLinks }),
        };

        const result = await writeClient.create(doc);

        return NextResponse.json({
            success: true,
            _id: result._id,
            slug: slug,
        });
    } catch (error) {
        console.error("Error creating forum post:", error);
        return NextResponse.json(
            { error: "Failed to create forum post" },
            { status: 500 }
        );
    }
}
