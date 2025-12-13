import { defineType, defineField } from "sanity";

export const forumPostResponse = defineType({
    name: "forumPostResponse",
    title: "Forum Post Response",
    type: "document",
    fields: [
        defineField({
            name: "title",
            type: "string",
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
            description: "Automatically updated when the response is edited",
        }),
        defineField({
            name: "parentPost",
            title: "Parent Post",
            type: "reference",
            to: [{ type: "forumPost" }],
            description: "If this is a reply to a post",
        }),
        defineField({
            name: "replyTo",
            title: "Reply To",
            type: "reference",
            to: [{ type: "forumPostResponse" }],
            description: "If this is a reply to another response",
        }),

    ], // <-- Make sure this comma is present!
    preview: {
        select: {
            title: "title",
            createdAt: "createdAt",
            authorName: "author.name",
            parentTitle: "parentPost.title",
        },
        prepare({ title, createdAt, authorName, parentTitle }) {
            let mainTitle = title || "Untitled response";
            let dateStr = "";
            if (createdAt) {
                const d = new Date(createdAt);
                dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            }
            let firstName = authorName ? authorName.split(" ")[0] : "";
            if (dateStr || firstName) {
                mainTitle += ` (${dateStr}${firstName ? ", " + firstName : ""})`;
            }
            return {
                title: mainTitle,
                subtitle: parentTitle ? `← ${parentTitle}` : undefined,
            };
        },
    },
});