import { defineType, defineField } from "sanity";
import ForumPostResponsesPreview from "../components/ForumPostResponsesPreview";

export const forumPost = defineType({
    name: "forumPost",
    title: "Forum Post",
    type: "document",
    fields: [
        defineField({
            name: "type",
            title: "Post Type",
            type: "reference",
            to: [{ type: "forumPostType" }],
            description: "Select a post type (optional)",
            // Reference fields are optional by default unless required
        }),
        defineField({
            name: "title",
            type: "string",
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "slug",
            type: "slug",
            options: {
                source: (doc) => {
                    const date = doc.createdAt && typeof doc.createdAt === "string"
                        ? doc.createdAt.split("T")[0]
                        : new Date().toISOString().split("T")[0];
                    const time = doc.createdAt && typeof doc.createdAt === "string"
                        ? doc.createdAt.split("T")[1]?.replace(/:/g, "-").split(".")[0]
                        : "";

                    return `${date}T${time}`;
                },
                maxLength: 96,
            },
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "image",
            type: "image",
            options: { hotspot: true },
        }),

        defineField({
            name: "body",
            type: "array",
            of: [{ type: "block" }, { type: "image" }],
            validation: Rule => Rule.required(),
        }),

        defineField({
            name: "links",
            title: "Links",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({ name: "label", type: "string" }), // e.g., X/Twitter, LinkedIn
                        defineField({ name: "url", type: "url" }),
                    ],
                    preview: { select: { title: "label", subtitle: "url" } },
                },
            ],
        }),

        defineField({
            name: "author",
            type: "reference",
            to: [{ type: "person" }],
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: "createdAt",
            type: "datetime",
            initialValue: () => new Date().toISOString(),
            readOnly: true,
        }),
        defineField({
            name: "editedAt",
            title: "Last Edited",
            type: "datetime",
            description: "Automatically updated when the post is edited",
        }),

        defineField({
            name: "responsesPreview",
            title: "Responses (view only)",
            type: "string",
            readOnly: true,
            components: {
                input: ForumPostResponsesPreview,
            },
        }),
    ],
});
