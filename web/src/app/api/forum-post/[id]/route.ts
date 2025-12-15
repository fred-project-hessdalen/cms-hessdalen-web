import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeClient } from "@/lib/sanity/live";
import { htmlToPortableText } from "@/lib/htmlToPortableText";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const formData = await request.formData();

        const title = formData.get("title") as string;
        const body = formData.get("body") as string;
        const linksJson = formData.get("links") as string | null;

        // Validate required fields
        if (!title || !body) {
            return NextResponse.json(
                { error: "Missing required fields: title and body are required" },
                { status: 400 }
            );
        }

        // Verify the post exists and belongs to the authenticated user
        const post = await writeClient.fetch(
            `*[_type == "forumPost" && _id == $id][0]{
                _id,
                author->{_id, authUserId, email}
            }`,
            { id }
        );

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Check if user owns this post
        const isOwner = post.author.authUserId === session.user.id || 
                       post.author.email === session.user.email;

        if (!isOwner) {
            return NextResponse.json(
                { error: "Unauthorized: You can only edit your own posts" },
                { status: 403 }
            );
        }

        // Convert HTML body to Sanity block content
        const blockContent = htmlToPortableText(body);

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

        // Update the forum post
        const now = new Date().toISOString();
        const updateData = {
            title,
            body: blockContent,
            editedAt: now,
            ...(validLinks.length > 0 ? { links: validLinks } : { links: [] }),
        };

        const result = await writeClient
            .patch(id)
            .set(updateData)
            .commit();

        return NextResponse.json({
            success: true,
            _id: result._id,
            editedAt: now,
        });
    } catch (error) {
        console.error("Error updating forum post:", error);
        return NextResponse.json(
            { error: "Failed to update forum post" },
            { status: 500 }
        );
    }
}