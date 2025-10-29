import { defineType, defineField } from "sanity";

export const forumPostType = defineType({
    name: "forumPostType",
    title: "Forum Post Type",
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
            name: "description",
            type: "text",
        }),
        defineField({
            name: "alternativeResponses",
            title: "Alternative Responses",
            type: "array",
            of: [
                defineField({
                    name: "response",
                    type: "object",
                    fields: [
                        defineField({ name: "label", type: "string", validation: Rule => Rule.required() }),
                        defineField({ name: "description", type: "text" }),
                    ],
                })
            ],
            description: "List of alternative responses for this post type.",
        }),
    ],
});
